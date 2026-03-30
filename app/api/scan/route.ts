// app/api/scan/route.ts
import { NextRequest } from "next/server";
import {
  analyzeWithClaude,
  buildDemoAnalysis,
  type LiveChecks,
  type ScanAnalysis,
} from "@/lib/claude";

const AI_AGENTS = [
  "gptbot",
  "claudebot",
  "anthropic-ai",
  "ccbot",
  "google-extended",
  "omgilibot",
];

async function fetchSafe(
  url: string
): Promise<{ status: number; body: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = await res.text().then((t) => t.slice(0, 10_000));
    return { status: res.status, body };
  } catch {
    return null;
  }
}

function parseRobots(body: string): boolean {
  const lines = body.toLowerCase().split("\n");
  let currentUAs: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("user-agent:")) {
      currentUAs = [line.replace("user-agent:", "").trim()];
    } else if (line.startsWith("disallow:")) {
      const path = line.replace("disallow:", "").trim();
      if (
        path === "/" &&
        currentUAs.some((ua) => AI_AGENTS.includes(ua) || ua === "*")
      ) {
        return false;
      }
    }
  }
  return true;
}

async function runLiveChecks(domain: string): Promise<LiveChecks> {
  const base = `https://${domain}`;
  const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
    fetchSafe(`${base}/robots.txt`),
    fetchSafe(`${base}/sitemap.xml`),
    fetchSafe(`${base}/llms.txt`),
  ]);

  return {
    robots:
      robotsRes?.status === 200 ? parseRobots(robotsRes.body) : false,
    sitemap: sitemapRes?.status === 200,
    llms: llmsRes?.status === 200,
  };
}

async function saveToSupabase(
  domain: string,
  analysis: ScanAnalysis,
  checks: LiveChecks,
  isDemo: boolean
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/rest/v1/scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        domain,
        status: analysis.status,
        industry: analysis.industry,
        findings: analysis.findings,
        next_steps: analysis.next_steps,
        technical_checks: checks,
        is_demo: isDemo,
      }),
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // Silent — table may not exist yet
  }
}

export async function POST(req: NextRequest) {
  let rawDomain: string;
  try {
    const body = await req.json();
    rawDomain = String(body.domain ?? "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    !rawDomain ||
    !/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(rawDomain)
  ) {
    return Response.json({ error: "Ogiltig domän" }, { status: 400 });
  }

  const checks = await runLiveChecks(rawDomain);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let analysis = apiKey
    ? await analyzeWithClaude(rawDomain, checks, apiKey)
    : null;
  const isDemo = !analysis;
  if (!analysis) analysis = buildDemoAnalysis(rawDomain, checks);

  // Fire-and-forget — do not await
  saveToSupabase(rawDomain, analysis, checks, isDemo);

  return Response.json({ ...analysis, isDemo, checks });
}
