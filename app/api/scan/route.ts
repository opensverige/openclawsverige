// app/api/scan/route.ts
import { NextRequest } from "next/server";
import {
  analyzeWithClaude,
  buildDemoAnalysis,
  type LiveChecks,
  type BuilderProbeData,
} from "@/lib/claude";
import {
  checkRobots, checkSitemap, checkLlms,
  complianceChecks, builderHardcoded,
  checkApiExists, checkOpenApiSpec, checkApiDocs,
  calculateBadge, getTopRecommendations,
  BUILDER_PATHS,
  type AllChecks, type ProbeResult,
} from "@/lib/checks";

const AI_AGENTS = ["gptbot", "claudebot", "anthropic-ai", "ccbot", "google-extended", "omgilibot"];

function parseRobots(body: string): boolean {
  const lines = body.toLowerCase().split("\n");
  let groupUAs: string[] = [];
  let inGroup = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("user-agent:")) {
      const ua = line.replace("user-agent:", "").trim();
      if (!inGroup) { groupUAs = [ua]; inGroup = true; }
      else { groupUAs.push(ua); }
    } else if (line.startsWith("disallow:")) {
      const path = line.replace("disallow:", "").trim();
      if (path === "/" && groupUAs.some(ua => AI_AGENTS.includes(ua) || ua === "*")) return false;
      inGroup = false;
    } else if (line === "") { groupUAs = []; inGroup = false; }
  }
  return true;
}

async function fetchSafe(url: string): Promise<{ status: number; body: string; contentType: string | null } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = (await res.text()).slice(0, 15_000);
    return { status: res.status, body, contentType: res.headers.get("content-type") };
  } catch { return null; }
}

async function runAllChecks(domain: string): Promise<{ checks: AllChecks; liveChecks: LiveChecks; builderData: BuilderProbeData }> {
  const base = `https://${domain}`;

  // Build all probe URLs: 3 discovery + 12 builder paths + 2 subdomains = 17 total
  const builderUrls = [
    ...BUILDER_PATHS.map(p => `${base}${p}`),
    `https://developer.${domain}`,
    `https://api.${domain}`,
  ];

  // Run all fetches in parallel
  const [robotsRes, sitemapRes, llmsRes, ...builderResults] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/llms.txt`),
    ...builderUrls.map(url => fetchSafe(url).then(r => ({ url, ...r ?? { status: 0, body: "", contentType: null } } as ProbeResult))),
  ]);

  // Discovery
  const robotsAllowed = robotsRes?.status === 200 ? parseRobots(robotsRes.body) : false;
  const liveChecks: LiveChecks = {
    robots: robotsAllowed,
    sitemap: sitemapRes?.status === 200,
    llms: llmsRes?.status === 200,
  };

  // Compliance (hardcoded)
  const [privacyCheck, cookieCheck, aiMarkingCheck] = complianceChecks();

  // Builder (live)
  const probeResults = builderResults as ProbeResult[];
  const apiExistsCheck = checkApiExists(probeResults);
  const openApiCheck = checkOpenApiSpec(probeResults);
  const apiDocsCheck = checkApiDocs(probeResults);
  const [mcpCheck, sandboxCheck] = builderHardcoded();

  const checks: AllChecks = {
    robots_ok: checkRobots(robotsAllowed),
    sitemap_exists: checkSitemap(sitemapRes?.status ?? 0),
    llms_txt: checkLlms(llmsRes?.status ?? 0),
    privacy_automation: privacyCheck,
    cookie_bot_handling: cookieCheck,
    ai_content_marking: aiMarkingCheck,
    api_exists: apiExistsCheck,
    openapi_spec: openApiCheck,
    api_docs: apiDocsCheck,
    mcp_server: mcpCheck,
    sandbox_available: sandboxCheck,
  };

  // Builder probe summary for Claude
  const apiPathsFound = probeResults
    .filter(p => [200, 301, 302].includes(p.status))
    .map(p => { try { return new URL(p.url).pathname; } catch { return p.url; } });

  let developerPortalUrl: string | undefined;
  const devHit = probeResults.find(p =>
    p.status === 200 && (p.url.includes('/developer') || p.url.startsWith(`https://developer.`))
  );
  if (devHit) developerPortalUrl = devHit.url;

  const builderData: BuilderProbeData = {
    apiPathsFound,
    openApiSpecFound: openApiCheck.pass,
    developerPortalUrl,
  };

  return { checks, liveChecks, builderData };
}

async function getIpHash(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkRateLimit(ipHash: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return true; // No Supabase → allow

  try {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?select=id&ip_hash=eq.${ipHash}&scanned_at=gte.${oneMinuteAgo}&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3_000) }
    );
    if (!res.ok) return true;
    const rows = await res.json() as unknown[];
    return rows.length === 0; // true = allowed
  } catch { return true; }
}

async function saveToSupabase(
  domain: string,
  checks: AllChecks,
  badge: string,
  score: number,
  summary: string,
  recommendations: string[],
  ipHash: string
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const discovery = [checks.robots_ok, checks.sitemap_exists, checks.llms_txt];
  const compliance = [checks.privacy_automation, checks.cookie_bot_handling, checks.ai_content_marking];
  const builder = [checks.api_exists, checks.openapi_spec, checks.api_docs, checks.mcp_server, checks.sandbox_available];

  try {
    const res = await fetch(`${url}/rest/v1/scan_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        domain,
        badge,
        checks_passed: score,
        checks_total: 11,
        discovery_passed: discovery.filter(c => c.pass).length,
        compliance_passed: compliance.filter(c => c.pass).length,
        builder_passed: builder.filter(c => c.pass).length,
        has_robots: checks.robots_ok.pass,
        has_sitemap: checks.sitemap_exists.pass,
        has_llms_txt: checks.llms_txt.pass,
        has_api: checks.api_exists.pass,
        has_openapi_spec: checks.openapi_spec.pass,
        has_api_docs: checks.api_docs.pass,
        checks_json: checks,
        claude_summary: summary,
        recommendations,
        ip_hash: ipHash,
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const rows = await res.json() as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  let rawDomain: string;
  try {
    const body = await req.json();
    rawDomain = String(body.domain ?? "")
      .trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!rawDomain || rawDomain.length > 253 || !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(rawDomain)) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }
  const privateTLDs = [".local", ".internal", ".localdomain", ".localhost"];
  if (privateTLDs.some(tld => rawDomain.endsWith(tld))) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }

  const ipHash = await getIpHash(req);
  const allowed = await checkRateLimit(ipHash);
  if (!allowed) {
    return Response.json({ error: "För många scanningar. Vänta en minut." }, { status: 429 });
  }

  const { checks, liveChecks, builderData } = await runAllChecks(rawDomain);
  const { badge, score } = calculateBadge(checks);
  const recommendations = getTopRecommendations(checks);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let analysis = apiKey
    ? await analyzeWithClaude(rawDomain, liveChecks, builderData, apiKey)
    : null;
  const isDemo = !analysis;
  if (!analysis) analysis = buildDemoAnalysis(rawDomain);

  const scanId = await saveToSupabase(
    rawDomain, checks, badge, score, analysis.summary, recommendations, ipHash
  ).catch(() => null);

  return Response.json({
    company: analysis.company,
    industry: analysis.industry,
    summary: analysis.summary,
    badge,
    score,
    checks,
    recommendations,
    scan_id: scanId,
    isDemo,
  });
}
