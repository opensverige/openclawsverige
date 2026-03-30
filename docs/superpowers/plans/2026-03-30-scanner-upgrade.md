# Agent Readiness Scanner — Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing 3-check scanner to 11 deterministic checks across 3 categories, add a score badge, Supabase data capture, deep-analysis intent signal, and migrated votes.

**Architecture:** All 11 checks run server-side in `app/api/scan/route.ts`; check logic lives in `lib/checks.ts`; Claude Sonnet produces only a 3-sentence summary (badge/score/recommendations are computed deterministically). Supabase stores every scan result and votes via raw REST fetch (no SDK). A new `app/api/votes/route.ts` replaces localStorage for the integration vote widget.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Supabase (raw REST), Claude Sonnet API

---

## File Map

| Status | File | What changes |
|--------|------|-------------|
| MODIFY | `app/api/probe/route.ts` | Refactor GET → POST batch, remove path allowlist |
| CREATE | `lib/checks.ts` | All 11 check types + logic, badge calc, recommendations |
| MODIFY | `lib/claude.ts` | Types simplified (Claude → summary only), updated prompt |
| MODIFY | `app/api/scan/route.ts` | 14 builder probes, new check logic, rate limit, new Supabase schema |
| CREATE | `app/api/scan/[id]/route.ts` | PATCH wants_deep_scan = true |
| CREATE | `app/api/votes/route.ts` | GET counts + POST vote (replaces localStorage) |
| MODIFY | `app/scan/_components/ScannerSection.tsx` | Full result UI: badge+score, 3 categories, top3, deep-analysis btn, updated share |
| MODIFY | `app/scan/_components/IntegrationVote.tsx` | Migrate from localStorage to `/api/votes` |

Supabase tables created in Task 1 before any code changes.

---

## Task 1: Supabase — Create Tables

**Files:** Supabase only (no code files changed)

- [ ] **Step 1: Apply scan_submissions migration**

Use the Supabase MCP tool `mcp__claude_ai_Supabase__apply_migration` with project ref `lenelhluvepajmuueard` and this SQL:

```sql
CREATE TABLE scan_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  badge TEXT NOT NULL CHECK (badge IN ('green','yellow','red')),
  checks_passed INTEGER NOT NULL,
  checks_total INTEGER NOT NULL DEFAULT 11,
  discovery_passed INTEGER NOT NULL DEFAULT 0,
  compliance_passed INTEGER NOT NULL DEFAULT 0,
  builder_passed INTEGER NOT NULL DEFAULT 0,
  has_robots BOOLEAN,
  has_sitemap BOOLEAN,
  has_llms_txt BOOLEAN,
  has_api BOOLEAN,
  has_openapi_spec BOOLEAN,
  has_api_docs BOOLEAN,
  checks_json JSONB NOT NULL DEFAULT '{}',
  claude_summary TEXT,
  recommendations TEXT[],
  wants_deep_scan BOOLEAN DEFAULT false,
  ip_hash TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scan_domain ON scan_submissions (domain, scanned_at DESC);
CREATE INDEX idx_scan_deep ON scan_submissions (wants_deep_scan) WHERE wants_deep_scan = true;
CREATE INDEX idx_scan_ip_rate ON scan_submissions (ip_hash, scanned_at DESC);

ALTER TABLE scan_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert scans" ON scan_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads scans" ON scan_submissions FOR SELECT USING (auth.role() = 'service_role');
```

- [ ] **Step 2: Apply system_votes migration**

Same tool, same project, this SQL:

```sql
CREATE TABLE system_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(system_name, ip_hash)
);

CREATE INDEX idx_votes_system ON system_votes (system_name);

ALTER TABLE system_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can vote" ON system_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read votes" ON system_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can delete own vote" ON system_votes FOR DELETE USING (true);
```

- [ ] **Step 3: Verify tables exist**

Use `mcp__claude_ai_Supabase__list_tables` with project ref `lenelhluvepajmuueard`. Expected: both `scan_submissions` and `system_votes` visible.

- [ ] **Step 4: Test insert into scan_submissions**

Use `mcp__claude_ai_Supabase__execute_sql` with:
```sql
INSERT INTO scan_submissions (domain, badge, checks_passed, checks_json)
VALUES ('test.se', 'red', 1, '{}')
RETURNING id;
```
Expected: returns a UUID row. Then delete it:
```sql
DELETE FROM scan_submissions WHERE domain = 'test.se';
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(supabase): add scan_submissions and system_votes tables with RLS"
```

---

## Task 2: lib/checks.ts — Check Types and Logic

**Files:**
- Create: `lib/checks.ts`

- [ ] **Step 1: Create lib/checks.ts with all types and logic**

```typescript
// lib/checks.ts

export type CheckId =
  | 'robots_ok' | 'sitemap_exists' | 'llms_txt'
  | 'privacy_automation' | 'cookie_bot_handling' | 'ai_content_marking'
  | 'api_exists' | 'openapi_spec' | 'api_docs'
  | 'mcp_server' | 'sandbox_available';

export type CheckCategory = 'discovery' | 'compliance' | 'builder';
export type ScanBadge = 'green' | 'yellow' | 'red';

export interface CheckResult {
  id: CheckId;
  pass: boolean;
  label: string;
  detail?: string;
  path?: string;
  category: CheckCategory;
  hardcoded?: boolean;
}

export interface AllChecks {
  robots_ok: CheckResult;
  sitemap_exists: CheckResult;
  llms_txt: CheckResult;
  privacy_automation: CheckResult;
  cookie_bot_handling: CheckResult;
  ai_content_marking: CheckResult;
  api_exists: CheckResult;
  openapi_spec: CheckResult;
  api_docs: CheckResult;
  mcp_server: CheckResult;
  sandbox_available: CheckResult;
}

export interface ProbeResult {
  url: string;
  status: number;
  contentType: string | null;
  body: string;
  error?: string;
}

// Paths to probe for builder checks (relative to domain root)
export const BUILDER_PATHS = [
  '/api', '/api/v1', '/api/docs', '/developer', '/developers',
  '/docs', '/docs/api', '/openapi.json', '/openapi.yaml',
  '/swagger.json', '/swagger.yaml', '/api-docs',
] as const;

const OPENAPI_PATHS = new Set(['/openapi.json', '/openapi.yaml', '/swagger.json', '/swagger.yaml']);
const API_DOC_PATHS = new Set(['/developer', '/developers', '/docs', '/api/docs', '/api-docs']);

// ── Discovery ─────────────────────────────────────────────

export function checkRobots(allowed: boolean): CheckResult {
  return {
    id: 'robots_ok',
    pass: allowed,
    label: allowed
      ? 'Sajten tillåter AI-agenter (robots.txt)'
      : 'Sajten blockerar AI-agenter eller saknar robots.txt',
    category: 'discovery',
  };
}

export function checkSitemap(status: number): CheckResult {
  const pass = status === 200;
  return {
    id: 'sitemap_exists',
    pass,
    label: pass
      ? 'Sitemap finns — agenter kan navigera'
      : 'Ingen sitemap — agenter kan inte navigera sajten',
    category: 'discovery',
  };
}

export function checkLlms(status: number): CheckResult {
  const pass = status === 200;
  return {
    id: 'llms_txt',
    pass,
    label: pass
      ? 'llms.txt finns — agenter vet vad du erbjuder'
      : 'Ingen llms.txt — agenter vet inte vad du erbjuder',
    category: 'discovery',
  };
}

// ── Compliance (always fail) ───────────────────────────────

export function complianceChecks(): [CheckResult, CheckResult, CheckResult] {
  return [
    {
      id: 'privacy_automation',
      pass: false,
      label: 'Integritetspolicyn saknar info om automatiserad behandling',
      detail: 'GDPR Art. 22 — individer ska informeras om automatiserade beslut',
      category: 'compliance',
      hardcoded: true,
    },
    {
      id: 'cookie_bot_handling',
      pass: false,
      label: 'Cookiehantering kräver mänsklig consent — blockerar agenter',
      detail: 'Consent-banners är byggda för människor, inte AI-agenter',
      category: 'compliance',
      hardcoded: true,
    },
    {
      id: 'ai_content_marking',
      pass: false,
      label: 'AI-genererat innehåll inte märkt enligt EU AI Act',
      detail: 'EU AI Act Art. 50(2) — maskinläsbar märkning krävs från aug 2026',
      category: 'compliance',
      hardcoded: true,
    },
  ];
}

// ── Builder (live probes) ──────────────────────────────────

export function checkApiExists(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p => [200, 301, 302].includes(p.status));
  let path: string | undefined;
  try { path = hit ? new URL(hit.url).pathname : undefined; } catch { path = undefined; }
  return {
    id: 'api_exists',
    pass: !!hit,
    label: hit
      ? `Publikt API hittat (${path ?? hit.url})`
      : 'Inget publikt API hittat',
    path,
    category: 'builder',
  };
}

export function checkOpenApiSpec(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p => {
    if (p.status !== 200) return false;
    try {
      if (!OPENAPI_PATHS.has(new URL(p.url).pathname)) return false;
    } catch { return false; }
    const body = p.body.toLowerCase();
    return body.includes('openapi') || body.includes('swagger');
  });
  return {
    id: 'openapi_spec',
    pass: !!hit,
    label: hit
      ? 'OpenAPI-spec hittad — agenter kan mappa ditt API'
      : 'Ingen OpenAPI-spec — agenter kan inte mappa ditt API automatiskt',
    category: 'builder',
  };
}

export function checkApiDocs(probes: ProbeResult[]): CheckResult {
  const hit = probes.find(p => {
    if (p.status !== 200) return false;
    try {
      if (!API_DOC_PATHS.has(new URL(p.url).pathname)) return false;
    } catch { return false; }
    const ct = p.contentType?.toLowerCase() ?? '';
    if (!ct.includes('text/html')) return false;
    const body = p.body.toLowerCase();
    return body.includes('api') || body.includes('documentation') || body.includes('developer');
  });
  return {
    id: 'api_docs',
    pass: !!hit,
    label: hit
      ? 'API-dokumentation tillgänglig'
      : 'Ingen API-dokumentation hittad',
    category: 'builder',
  };
}

// ── Builder (hardcoded fails) ─────────────────────────────

export function builderHardcoded(): [CheckResult, CheckResult] {
  return [
    {
      id: 'mcp_server',
      pass: false,
      label: 'Ingen MCP-server hittad',
      detail: 'MCP låter agenter koppla in sig direkt i ditt system',
      category: 'builder',
      hardcoded: true,
    },
    {
      id: 'sandbox_available',
      pass: false,
      label: 'Ingen sandbox/testmiljö identifierad',
      detail: 'Builders behöver testa utan att påverka produktionsdata',
      category: 'builder',
      hardcoded: true,
    },
  ];
}

// ── Badge and score ───────────────────────────────────────

export function calculateBadge(checks: AllChecks): { badge: ScanBadge; score: number } {
  const score = Object.values(checks).filter(c => c.pass).length;
  const badge: ScanBadge = score >= 8 ? 'green' : score >= 4 ? 'yellow' : 'red';
  return { badge, score };
}

// ── Top recommendations ───────────────────────────────────

const RECOMMENDATION_MAP: Record<CheckId, string> = {
  llms_txt: 'Lägg till /llms.txt som beskriver ditt API och dina tjänster för AI-agenter.',
  privacy_automation: 'Uppdatera integritetspolicyn med info om automatiserad behandling (GDPR Art. 22).',
  mcp_server: 'Publicera en MCP-server så att AI-agenter kan koppla in sig direkt i ditt system.',
  openapi_spec: 'Publicera en OpenAPI-spec så agenter och builders kan mappa ditt API automatiskt.',
  api_exists: 'Skapa ett publikt API — utan det kan ingen agent interagera med ditt system.',
  cookie_bot_handling: 'Se över hur din cookielösning hanterar icke-mänskliga besökare.',
  ai_content_marking: 'Förbered för EU AI Act — märk AI-genererat innehåll maskinläsbart (Art. 50).',
  sandbox_available: 'Erbjud en sandbox/testmiljö så builders kan testa utan att påverka produktionsdata.',
  robots_ok: 'Se till att robots.txt inte blockerar AI-agenter som GPTBot och ClaudeBot.',
  sitemap_exists: 'Lägg till sitemap.xml så agenter kan navigera din sajt.',
  api_docs: 'Publicera API-dokumentation — utan docs kan ingen bygga mot ditt system.',
};

const RECOMMENDATION_PRIORITY: CheckId[] = [
  'llms_txt', 'privacy_automation', 'mcp_server', 'openapi_spec',
  'api_exists', 'cookie_bot_handling', 'ai_content_marking',
  'sandbox_available', 'robots_ok', 'sitemap_exists', 'api_docs',
];

export function getTopRecommendations(checks: AllChecks, count = 3): string[] {
  return RECOMMENDATION_PRIORITY
    .filter(id => !checks[id].pass)
    .slice(0, count)
    .map(id => RECOMMENDATION_MAP[id]);
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/checks.ts
git commit -m "feat(checks): add lib/checks.ts with 11 deterministic checks, badge calc, and recommendations"
```

---

## Task 3: lib/claude.ts — Simplify Types and Update Prompt

**Files:**
- Modify: `lib/claude.ts`

Claude no longer produces `status`, `findings`, or `next_steps` — those are computed deterministically. Claude only returns `company`, `industry`, `summary` (max 3 sentences).

- [ ] **Step 1: Replace lib/claude.ts entirely**

```typescript
// lib/claude.ts

export interface ClaudeAnalysis {
  company: string;
  industry: string;
  summary: string;
}

export interface LiveChecks {
  robots: boolean;
  sitemap: boolean;
  llms: boolean;
}

export interface BuilderProbeData {
  apiPathsFound: string[];      // paths that returned 200/301/302
  openApiSpecFound: boolean;
  developerPortalUrl?: string;
}

const SYSTEM_PROMPT = `Du är en AI-agent-readiness-rådgivare för svenska företag.
Du analyserar webbplatser ur tre perspektiv:
1. Kan AI-agenter hitta och läsa sajten? (discovery)
2. Är sajten förberedd för GDPR och EU AI Act? (compliance)
3. Kan en utvecklare bygga en AI-agent mot sajten? (builder)

Svara BARA med valid JSON, ingen markdown, inga backticks. Svara på svenska med korrekta äöå.

Format:
{
  "company": "företagsnamn baserat på domän",
  "industry": "kort branschbeskrivning (max 4 ord)",
  "summary": "Exakt 2–3 meningar om denna specifika sajts situation. Nämn domännamnet. Var konkret — nämn inte saker du inte har data om. Aldrig säljig. Skriv INTE generellt om AI."
}`;

export async function analyzeWithClaude(
  domain: string,
  checks: LiveChecks,
  builder: BuilderProbeData,
  apiKey: string
): Promise<ClaudeAnalysis | null> {
  const discoveryText = [
    `robots.txt: ${checks.robots ? 'tillåter AI-agenter' : 'blockerar eller saknar AI-agenter'}`,
    `sitemap.xml: ${checks.sitemap ? 'finns' : 'saknas'}`,
    `llms.txt: ${checks.llms ? 'finns' : 'saknas'}`,
  ].join('\n');

  const builderText = builder.apiPathsFound.length > 0
    ? `API-endpoints som svarade (200/301/302): ${builder.apiPathsFound.join(', ')}`
    : 'Inga API-endpoints hittade';

  const openApiText = builder.openApiSpecFound
    ? 'OpenAPI-spec hittad'
    : 'Ingen OpenAPI-spec hittad';

  const portalText = builder.developerPortalUrl
    ? `Developer-portal: ${builder.developerPortalUrl}`
    : 'Ingen developer-portal hittad';

  const userContent = `Analysera domän: ${domain}

DISCOVERY:
${discoveryText}

BUILDER:
${builderText}
${openApiText}
${portalText}

COMPLIANCE:
Du har inte analyserat deras faktiska policies. Kommentera kort vad svenska företag generellt bör tänka på kring GDPR Art. 22 och EU AI Act Art. 50 — men nämn tydligt att du inte granskat deras specifika policy.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as ClaudeAnalysis;
  } catch {
    return null;
  }
}

export function buildDemoAnalysis(domain: string): ClaudeAnalysis {
  const slug = domain.split('.')[0] ?? domain;
  const company = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  return {
    company,
    industry: 'Okänd bransch',
    summary: `${company} har scannats men ingen AI-analys är tillgänglig i demo-läge. Tekniska checks ovan är riktiga och baserade på live-data. Lägg till ANTHROPIC_API_KEY i Vercel för AI-analys.`,
  };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: errors about `ScanAnalysis`, `ScanStatus`, `LiveChecks` (still used in scan route + ScannerSection — will be fixed in Task 5 and 8).

- [ ] **Step 3: Note the errors — do NOT fix yet**

The type errors from scan/route.ts and ScannerSection.tsx are expected. They'll be fixed in Tasks 5 and 8. Commit the change as-is — the build will be broken until Task 5 completes.

- [ ] **Step 4: Commit**

```bash
git add lib/claude.ts
git commit -m "feat(claude): simplify to summary-only, add BuilderProbeData, update 3-perspective prompt"
```

---

## Task 4: app/api/probe/route.ts — POST Batch Refactor

**Files:**
- Modify: `app/api/probe/route.ts`

The probe route becomes a POST endpoint that accepts an array of URLs and probes them all in parallel. SSRF protection stays (but no path allowlist — builder paths like `/openapi.json` must be allowed).

- [ ] **Step 1: Replace app/api/probe/route.ts**

```typescript
import { NextRequest } from "next/server";

export interface ProbeResult {
  url: string;
  status: number;
  contentType: string | null;
  body: string;
  error?: string;
}

const MAX_URLS = 20;
const BODY_LIMIT = 15_000;

function isValidPublicUrl(raw: string): boolean {
  let parsed: URL;
  try { parsed = new URL(raw); } catch { return false; }
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const host = parsed.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(host)) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  const parts = host.split(".");
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 10) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 169 && b === 254) return false;
  }
  return true;
}

async function probeOne(url: string): Promise<ProbeResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OpenSverige-Scanner/1.0 (https://opensverige.se/scan)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const body = (await res.text()).slice(0, BODY_LIMIT);
    return { url, status: res.status, contentType: res.headers.get("content-type"), body };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return { url, status: 0, contentType: null, body: "", error: isTimeout ? "timeout" : "fetch_failed" };
  }
}

export async function POST(req: NextRequest) {
  let urls: unknown;
  try { ({ urls } = await req.json()); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    return Response.json({ error: "urls must be a non-empty array" }, { status: 400 });
  }
  if (urls.length > MAX_URLS) {
    return Response.json({ error: `Max ${MAX_URLS} URLs per request` }, { status: 400 });
  }

  const validUrls = (urls as unknown[]).filter(u => typeof u === "string" && isValidPublicUrl(u)) as string[];
  const probes = await Promise.all(validUrls.map(probeOne));
  return Response.json({ probes });
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: same errors as Task 3 (scan route + ScannerSection) — that's fine.

- [ ] **Step 3: Commit**

```bash
git add app/api/probe/route.ts
git commit -m "feat(probe): refactor to POST batch endpoint supporting up to 20 URLs with SSRF protection"
```

---

## Task 5: app/api/scan/route.ts — Full Update

**Files:**
- Modify: `app/api/scan/route.ts`

This task wires everything together: builder probes, new check logic, new response shape, updated Supabase save, rate limiting. This also fixes the type errors from Tasks 3–4.

- [ ] **Step 1: Replace app/api/scan/route.ts**

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: errors only in `ScannerSection.tsx` (still uses old types) — scan route itself should be clean.

- [ ] **Step 3: Verify scan works manually**

Run `npm run dev`. Open `http://localhost:3005/scan`. Scan `fortnox.se`.
Expected: no 500 error — the API returns a response (may be partial UI until Task 8).

- [ ] **Step 4: Commit**

```bash
git add app/api/scan/route.ts
git commit -m "feat(scan): expand to 14 builder probes, 11 deterministic checks, rate limiting, new Supabase schema"
```

---

## Task 6: app/api/scan/[id]/route.ts — Deep Scan Intent

**Files:**
- Create: `app/api/scan/[id]/route.ts`

PATCH endpoint that sets `wants_deep_scan = true` on a scan submission.

- [ ] **Step 1: Create app/api/scan/[id]/route.ts**

```typescript
// app/api/scan/[id]/route.ts
import { NextRequest } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ wants_deep_scan: true }),
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!res.ok) return Response.json({ error: "Update failed" }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Network error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: same ScannerSection errors only.

- [ ] **Step 3: Commit**

```bash
git add app/api/scan/[id]/route.ts
git commit -m "feat(scan): add PATCH /api/scan/[id] to register deep-scan interest"
```

---

## Task 7: app/api/votes/route.ts — Server-Side Votes

**Files:**
- Create: `app/api/votes/route.ts`

GET returns vote counts for all systems. POST adds/removes a vote for the calling IP.

The valid system IDs are: `fortnox`, `visma`, `bankid`, `skatteverket`, `bolagsverket`, `swish`, `bankgirot`.

- [ ] **Step 1: Create app/api/votes/route.ts**

```typescript
// app/api/votes/route.ts
import { NextRequest } from "next/server";

const VALID_SYSTEMS = new Set([
  "fortnox", "visma", "bankid", "skatteverket",
  "bolagsverket", "swish", "bankgirot",
]);

async function getIpHash(req: NextRequest): Promise<string> {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// GET /api/votes → { counts: Record<string, number>, userVotes: string[] }
export async function GET(req: NextRequest) {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_ANON_KEY;
  if (!supaUrl || !anonKey) {
    // Fallback: return zeros
    const counts = Object.fromEntries([...VALID_SYSTEMS].map(s => [s, 0]));
    return Response.json({ counts, userVotes: [] });
  }

  const ipHash = await getIpHash(req);

  try {
    // Get all vote counts grouped by system_name
    const [countsRes, userRes] = await Promise.all([
      fetch(`${supaUrl}/rest/v1/system_votes?select=system_name&order=system_name`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(5_000),
      }),
      fetch(`${supaUrl}/rest/v1/system_votes?select=system_name&ip_hash=eq.${ipHash}`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(5_000),
      }),
    ]);

    const allVotes = countsRes.ok ? (await countsRes.json() as Array<{ system_name: string }>) : [];
    const userVotesRows = userRes.ok ? (await userRes.json() as Array<{ system_name: string }>) : [];

    const counts: Record<string, number> = Object.fromEntries([...VALID_SYSTEMS].map(s => [s, 0]));
    for (const row of allVotes) {
      if (row.system_name in counts) counts[row.system_name]++;
    }
    const userVotes = userVotesRows.map(r => r.system_name).filter(s => VALID_SYSTEMS.has(s));

    return Response.json({ counts, userVotes });
  } catch {
    const counts = Object.fromEntries([...VALID_SYSTEMS].map(s => [s, 0]));
    return Response.json({ counts, userVotes: [] });
  }
}

// POST /api/votes → { system: string } → toggles vote
export async function POST(req: NextRequest) {
  let system: string;
  try { ({ system } = await req.json()); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!VALID_SYSTEMS.has(system)) {
    return Response.json({ error: "Invalid system" }, { status: 400 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !serviceKey) {
    return Response.json({ ok: true, voted: true }); // Graceful fallback
  }

  const ipHash = await getIpHash(req);

  try {
    // Check if already voted
    const checkRes = await fetch(
      `${supaUrl}/rest/v1/system_votes?system_name=eq.${system}&ip_hash=eq.${ipHash}&select=id`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, signal: AbortSignal.timeout(3_000) }
    );
    const existing = checkRes.ok ? (await checkRes.json() as Array<{ id: string }>) : [];

    if (existing.length > 0) {
      // Toggle off — delete
      await fetch(
        `${supaUrl}/rest/v1/system_votes?system_name=eq.${system}&ip_hash=eq.${ipHash}`,
        { method: "DELETE", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, signal: AbortSignal.timeout(3_000) }
      );
      return Response.json({ ok: true, voted: false });
    } else {
      // Toggle on — insert
      await fetch(`${supaUrl}/rest/v1/system_votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({ system_name: system, ip_hash: ipHash }),
        signal: AbortSignal.timeout(3_000),
      });
      return Response.json({ ok: true, voted: true });
    }
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: ScannerSection errors only.

- [ ] **Step 3: Commit**

```bash
git add app/api/votes/route.ts
git commit -m "feat(votes): add GET/POST /api/votes with Supabase backend and IP-based deduplication"
```

---

## Task 8: ScannerSection.tsx — Full Result UI Overhaul

**Files:**
- Modify: `app/scan/_components/ScannerSection.tsx`

This is the largest task. The component needs:
1. Updated types (`ScanResponse` matches new API)
2. Updated scan steps (3 categories: Tillgänglighet → Compliance → Byggbarhet)
3. New result UI: score badge, 3 category sections, top 3 recs, updated share, deep-analysis btn, disclaimer

- [ ] **Step 1: Replace ScannerSection.tsx entirely**

```typescript
// app/scan/_components/ScannerSection.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import type { AllChecks, ScanBadge, CheckCategory } from "@/lib/checks";

interface ScanResponse {
  company: string;
  industry: string;
  summary: string;
  badge: ScanBadge;
  score: number;
  checks: AllChecks;
  recommendations: string[];
  scan_id: string | null;
  isDemo: boolean;
}

type ScanState = "idle" | "scanning" | "result_summary" | "result_full";

const SCAN_STEPS = [
  "Kan agenter hitta dig?",
  "Är du lagligt redo?",
  "Kan en dev bygga mot dig?",
];

const DEMO_CHIPS = ["fortnox.se", "visma.net", "bokio.se", "spotify.com"];

const BADGE_CFG: Record<ScanBadge, { label: string; dot: string; bg: string; border: string; text: string }> = {
  green:  { label: "REDO",        dot: "#4ade80", bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  yellow: { label: "DELVIS REDO", dot: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  red:    { label: "INTE REDO",   dot: "#ef4444", bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
};

const BADGE_EMOJI: Record<ScanBadge, string> = { green: "🟢", yellow: "🟡", red: "🔴" };

const CATEGORY_LABELS: Record<CheckCategory, string> = {
  discovery:  "Kan agenter hitta dig?",
  compliance: "Är du lagligt redo?",
  builder:    "Kan en dev bygga mot dig?",
};

const CATEGORIES: CheckCategory[] = ["discovery", "compliance", "builder"];

// Fonts loaded via <link> in page.tsx — hoisted to <head> by Next.js for optimal loading
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::selection { background: #c4391a22; }
  @keyframes ss-spin { to { transform: rotate(360deg); } }
  @keyframes ss-fadeup {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ss-checkin {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  .ss-btn {
    transition: opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ss-btn:hover { opacity: 0.82; }
  .ss-btn:active { transform: scale(0.97); }
  .ss-chip {
    transition: border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ss-chip:hover { border-color: #c4391a55 !important; color: #111 !important; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
}

function isValidDomain(d: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(d);
}

export default function ScannerSection() {
  const [state, setState] = useState<ScanState>("idle");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shared, setShared] = useState(false);
  const [deepSent, setDeepSent] = useState(false);
  const rafRef = useRef<number>(0);

  const startProgressAnim = useCallback((ms: number) => {
    const start = Date.now();
    let frameId = 0;
    const tick = () => {
      const p = Math.min(88, ((Date.now() - start) / ms) * 88);
      setProgress(p);
      if (Date.now() - start < ms) {
        frameId = requestAnimationFrame(tick);
        rafRef.current = frameId;
      }
    };
    frameId = requestAnimationFrame(tick);
    rafRef.current = frameId;
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function runScan(rawInput: string) {
    const d = cleanDomain(rawInput);
    if (!isValidDomain(d)) return;

    setDomain(d);
    setState("scanning");
    setScanStep(0);
    setProgress(0);
    setResult(null);
    setShared(false);
    setDeepSent(false);

    // Timing: step 0→1 at 1s (discovery done), step 1→2 at 2s (compliance instant), step 2 until result
    const timers = [
      setTimeout(() => setScanStep(1), 1000),
      setTimeout(() => setScanStep(2), 2000),
    ];
    const stopAnim = startProgressAnim(4000);
    const start = Date.now();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      // Minimum 3.5s scanning feel
      const elapsed = Date.now() - start;
      if (elapsed < 3500) await new Promise(r => setTimeout(r, 3500 - elapsed));

      stopAnim();
      timers.forEach(clearTimeout);

      if (res.ok) {
        const data: ScanResponse = await res.json();
        setProgress(100);
        setTimeout(() => {
          setResult(data);
          setState("result_summary");
        }, 200);
      } else {
        setState("idle");
      }
    } catch {
      timers.forEach(clearTimeout);
      stopAnim();
      setState("idle");
    }
  }

  function handleShare() {
    if (!result) return;
    const cfg = BADGE_CFG[result.badge];
    const allChecks = Object.values(result.checks);
    const discovery = allChecks.filter(c => c.category === "discovery");
    const compliance = allChecks.filter(c => c.category === "compliance");
    const builder = allChecks.filter(c => c.category === "builder");

    const shareText = [
      `${domain} fick ${BADGE_EMOJI[result.badge]} ${cfg.label} (${result.score}/11) på AI-agent readiness.`,
      "",
      `${discovery.filter(c => c.pass).length} av ${discovery.length} discovery-checks ✓`,
      `${compliance.filter(c => c.pass).length} av ${compliance.length} compliance-checks ${compliance.every(c => !c.pass) ? "✗" : "✓"}`,
      `${builder.filter(c => c.pass).length} av ${builder.length} builder-checks ✓`,
      "",
      "Testa din sajt → agent.opensverige.se/scan",
      "",
      "#opensverige #aiagenter",
    ].join("\n");

    const shareUrl = "https://agent.opensverige.se/scan";
    if (navigator.share) {
      navigator.share({ title: `${domain} — AI-beredskap`, text: shareText, url: shareUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => setShared(true)).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = shareText;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand("copy"); setShared(true); } catch {}
      document.body.removeChild(ta);
    }
  }

  async function handleDeepScan() {
    if (!result?.scan_id || deepSent) return;
    setDeepSent(true);
    try {
      await fetch(`/api/scan/${result.scan_id}`, { method: "PATCH" });
    } catch { /* silent */ }
  }

  function handleReset() {
    setState("idle");
    setUrl("");
    setResult(null);
    setDomain("");
    setShared(false);
    setDeepSent(false);
  }

  const inputDomain = cleanDomain(url);
  const canSubmit = isValidDomain(inputDomain);

  // ── IDLE ──────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ padding: "56px 24px 64px", maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#c4391a", letterSpacing: 3, marginBottom: 16, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            AGENT READINESS SCANNER
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,7vw,52px)", fontWeight: 400, lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 14, animation: "ss-fadeup 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both" }}>
            Hur agent-redo<br />är ditt företag?
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, maxWidth: 420, marginBottom: 28, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.10s both" }}>
            Vi scannar din sajt och visar vad AI-agenter ser — 11 checks. Gratis. Öppet.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, animation: "ss-fadeup 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.14s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "#FDFCF9", border: "2px solid #ddd", borderRadius: 12, padding: "12px 14px" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#706F6C", flexShrink: 0 }}>https://</span>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && canSubmit && runScan(url)}
                placeholder="dittforetag.se"
                aria-label="Domännamn att scanna"
                autoComplete="url"
                spellCheck={false}
                style={{ background: "none", border: "none", outline: "none", color: "#111", fontFamily: "'JetBrains Mono', monospace", fontSize: 15, flex: 1, caretColor: "#c4391a", fontWeight: 500 }}
              />
            </div>
            <button
              type="button"
              onClick={() => runScan(url)}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: canSubmit ? "#fff" : "#555", background: canSubmit ? "#c4391a" : "#ccc", padding: "12px 22px", borderRadius: 8, border: "none", cursor: canSubmit ? "pointer" : "default", whiteSpace: "nowrap", transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)", minHeight: 44 }}
            >
              Scanna →
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 36, marginTop: 8, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both" }}>
            <span style={{ fontSize: 11, color: "#706F6C", alignSelf: "center" }}>Prova:</span>
            {DEMO_CHIPS.map(chip => (
              <button key={chip} type="button" onClick={() => runScan(chip)} aria-label={`Scanna ${chip}`} className="ss-chip"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#666", background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 8, padding: "0 10px", cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>
                {chip}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65, maxWidth: 460, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both" }}>
            AI-agenter börjar interagera med företagssajter. GDPR, EU AI Act och svenska lagar ställer krav på hur. Vi kollar om du är redo.
          </p>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────
  if (state === "scanning") {
    return (
      <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
        <style>{CSS}</style>
        <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
          Skannar {domain}, vänta...
        </div>
        <div style={{ padding: "64px 24px", maxWidth: 580, margin: "0 auto", animation: "ss-fadeup 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "#666", marginBottom: 32 }}>
            Kollar{" "}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#111", fontWeight: 600 }}>{domain}</span>
            ...
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
            {SCAN_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i < scanStep ? (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#16a34a", fontWeight: 700, animation: "ss-checkin 0.2s cubic-bezier(0.16, 1, 0.3, 1) both" }}>✓</span>
                  ) : i === scanStep ? (
                    <div style={{ width: 14, height: 14, border: "2px solid #c4391a", borderTopColor: "transparent", borderRadius: "50%", animation: "ss-spin 0.7s linear infinite" }} />
                  ) : (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#ddd" }}>◌</span>
                  )}
                </div>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: i <= scanStep ? "#111" : "#706F6C", fontWeight: i === scanStep ? 600 : 400, transition: "color 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Skannar"
            style={{ height: 3, background: "#EDECE8", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#c4391a", width: `${progress}%`, transition: "width 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────
  if (!result) return null;
  const cfg = BADGE_CFG[result.badge];

  return (
    <div style={{ color: "#111", fontFamily: "'Libre Franklin', sans-serif" }}>
      <style>{CSS}</style>
      <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        Skanning klar. {domain} fick {cfg.label} med {result.score} av 11 checks.
      </div>
      <div style={{ padding: "40px 24px 48px", maxWidth: 580, margin: "0 auto", animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>

        {/* DEMO banner */}
        {result.isDemo && (
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#92400e", letterSpacing: 1, flexShrink: 0 }}>DEMO</span>
            <span style={{ fontSize: 12, color: "#706F6C", lineHeight: 1.5 }}>
              Tekniska checks är riktiga. Analystexten är generisk tills{" "}
              <code>ANTHROPIC_API_KEY</code> läggs till i Vercel.
            </span>
          </div>
        )}

        {/* Domain label */}
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "#666", marginBottom: 16 }}>
          Resultat för{" "}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#111", fontWeight: 600 }}>{domain}</span>
        </div>

        {/* Score badge — prominent, always visible */}
        <div style={{ background: cfg.bg, border: `2px solid ${cfg.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, fontWeight: 400, color: cfg.text }}>
              {cfg.label}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: cfg.text, marginLeft: "auto" }}>
              {result.score} / 11
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.55 }}>{result.summary}</p>
        </div>

        {/* Progressive disclosure */}
        {state === "result_summary" && (
          <button type="button" onClick={() => setState("result_full")} aria-expanded={false} aria-label="Visa detaljerade checks och rekommendationer" className="ss-btn"
            style={{ width: "100%", padding: "12px 14px", background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
            <span>Visa detaljer</span>
            <span style={{ color: "#c4391a" }}>↓</span>
          </button>
        )}

        {state === "result_full" && (
          <div style={{ animation: "ss-fadeup 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}>

            {/* Three category sections */}
            <div style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, padding: "16px 20px", marginBottom: 12, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
              {CATEGORIES.map((cat, catIdx) => {
                const catChecks = Object.values(result.checks).filter(c => c.category === cat);
                return (
                  <div key={cat} style={{ marginBottom: catIdx < CATEGORIES.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#706F6C", letterSpacing: 1.5 }}>
                        {CATEGORY_LABELS[cat].toUpperCase()}
                      </div>
                      {cat === "compliance" && (
                        <span style={{ fontSize: 10, color: "#706F6C", fontStyle: "italic" }}>Generella observationer</span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {catChecks.map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: c.pass ? "#16a34a" : (c.hardcoded ? "#706F6C" : "#ef4444"), fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                            {c.pass ? "✓" : "✗"}
                          </span>
                          <div>
                            <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{c.label}</span>
                            {c.detail && !c.pass && (
                              <div style={{ fontSize: 11, color: "#706F6C", marginTop: 2 }}>{c.detail}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top 3 recommendations */}
            {result.recommendations.length > 0 && (
              <div style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, padding: "16px 20px", marginBottom: 12, animation: "ss-fadeup 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#706F6C", letterSpacing: 1.5, marginBottom: 12 }}>
                  TOPP 3 ATT FIXA
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#c4391a", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: "#444", lineHeight: 1.55 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, animation: "ss-fadeup 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.10s both" }}>
              <button type="button" onClick={handleShare} className="ss-btn"
                style={{ flex: 1, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", background: "#111", border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", textAlign: "center", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {shared ? "Kopierat ✓" : "Dela resultat →"}
              </button>
              <a href="https://discord.gg/CSphbTk8En" className="ss-btn"
                style={{ flex: 1, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: "#fff", background: "#c4391a", borderRadius: 8, padding: "11px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44 }}>
                Gå med i Discord →
              </a>
            </div>

            {/* Deep analysis */}
            <div style={{ background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 12, padding: "16px 20px", marginBottom: 16, animation: "ss-fadeup 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.13s both" }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, fontWeight: 400, marginBottom: 6 }}>
                Vill du ha en djupare analys?
              </div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 14 }}>
                Vi bygger en fullständig scanner med compliance-granskning och API-audit.
              </p>
              <button type="button" onClick={handleDeepScan} disabled={deepSent} className="ss-btn"
                style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: deepSent ? "#16a34a" : "#fff", background: deepSent ? "#f0fdf4" : "#111", border: deepSent ? "1.5px solid #bbf7d0" : "none", borderRadius: 8, padding: "10px 20px", cursor: deepSent ? "default" : "pointer", minHeight: 44, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                {deepSent ? "✓ Tack! Vi hör av oss." : "Ja, jag vill ha det →"}
              </button>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: 11, color: "#706F6C", lineHeight: 1.65, marginBottom: 16, animation: "ss-fadeup 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both" }}>
              ⚖ Det här är en teknisk observation, inte juridisk rådgivning. Compliance-resultaten är generella och baseras inte på en granskning av era specifika policies. Kontakta en jurist för en fullständig compliance-bedömning.
            </p>

            <button type="button" onClick={handleReset} className="ss-btn"
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, color: "#666", background: "#FDFCF9", border: "1.5px solid #EDECE8", borderRadius: 8, padding: "10px 16px", cursor: "pointer", minHeight: 44 }}>
              ← Scanna en till
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check — expect clean**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Manual verify**

Run `npm run dev`. Open `http://localhost:3005/scan`. Scan `fortnox.se`.
Expected:
- Scan animation shows 3 steps: "Kan agenter hitta dig?" → "Är du lagligt redo?" → "Kan en dev bygga mot dig?"
- Result shows badge with X/11 score
- "Visa detaljer" expands to show 3 category sections, top 3 recs, share/Discord buttons, deep-analysis panel, disclaimer

- [ ] **Step 4: Commit**

```bash
git add app/scan/_components/ScannerSection.tsx
git commit -m "feat(scanner): full result UI — score badge X/11, 3 category sections, top 3 recs, deep-analysis btn"
```

---

## Task 9: IntegrationVote.tsx — Migrate to Supabase Votes

**Files:**
- Modify: `app/scan/_components/IntegrationVote.tsx`

Replace localStorage read/write with calls to `/api/votes`. The component loads counts on mount, and toggles call POST.

- [ ] **Step 1: Replace IntegrationVote.tsx**

```typescript
// app/scan/_components/IntegrationVote.tsx
"use client";

import { useState, useEffect } from "react";

const SYSTEMS = [
  { id: "fortnox",      name: "Fortnox",      desc: "Fakturering, bokföring" },
  { id: "visma",        name: "Visma",        desc: "eEkonomi, lön" },
  { id: "bankid",       name: "BankID",       desc: "Identitetsverifiering" },
  { id: "skatteverket", name: "Skatteverket", desc: "Moms, deklaration" },
  { id: "bolagsverket", name: "Bolagsverket", desc: "Företagsinfo" },
  { id: "swish",        name: "Swish",        desc: "Betalningar" },
  { id: "bankgirot",    name: "Bankgirot",    desc: "Betalfiler" },
] as const;

type SystemId = (typeof SYSTEMS)[number]["id"];

const ZERO_COUNTS: Record<SystemId, number> = Object.fromEntries(
  SYSTEMS.map(s => [s.id, 0])
) as Record<SystemId, number>;

export default function IntegrationVote() {
  const [counts, setCounts] = useState<Record<SystemId, number>>(ZERO_COUNTS);
  const [userVotes, setUserVotes] = useState<Set<SystemId>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<SystemId | null>(null);

  useEffect(() => {
    fetch("/api/votes")
      .then(r => r.ok ? r.json() : null)
      .then((data: { counts: Record<SystemId, number>; userVotes: SystemId[] } | null) => {
        if (data) {
          setCounts(prev => ({ ...prev, ...data.counts }));
          setUserVotes(new Set(data.userVotes));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggle(id: SystemId) {
    if (pending) return; // debounce concurrent clicks
    setPending(id);

    // Optimistic update
    const wasVoted = userVotes.has(id);
    setCounts(prev => ({ ...prev, [id]: Math.max(0, prev[id] + (wasVoted ? -1 : 1)) }));
    setUserVotes(prev => { const next = new Set(prev); wasVoted ? next.delete(id) : next.add(id); return next; });

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: id }),
      });
      if (!res.ok) {
        // Revert optimistic update on error
        setCounts(prev => ({ ...prev, [id]: Math.max(0, prev[id] + (wasVoted ? 1 : -1)) }));
        setUserVotes(prev => { const next = new Set(prev); wasVoted ? next.add(id) : next.delete(id); return next; });
      }
    } catch {
      // Revert on network error
      setCounts(prev => ({ ...prev, [id]: Math.max(0, prev[id] + (wasVoted ? 1 : -1)) }));
      setUserVotes(prev => { const next = new Set(prev); wasVoted ? next.add(id) : next.delete(id); return next; });
    } finally {
      setPending(null);
    }
  }

  const sorted = [...SYSTEMS]
    .map(s => ({ ...s, count: counts[s.id] }))
    .sort((a, b) => b.count - a.count);

  const topCount = Math.max(1, sorted[0]?.count ?? 1);

  return (
    <section style={{ padding: "64px 24px 32px", maxWidth: 580, margin: "0 auto", fontFamily: "'Libre Franklin', sans-serif" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: "#c4391a", letterSpacing: 3, marginBottom: 6 }}>
        VILKA SYSTEM BEHÖVER AGENTER?
      </div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 400, letterSpacing: -0.3, marginBottom: 6 }}>
        Rösta. Builders bygger det som efterfrågas mest.
      </h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        {loading ? "Laddar röster..." : "Klicka på systemet du använder."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map(sys => {
          const voted = userVotes.has(sys.id);
          const barW = Math.max(6, Math.round((sys.count / topCount) * 100));
          return (
            <button
              key={sys.id}
              type="button"
              onClick={() => toggle(sys.id)}
              disabled={pending === sys.id}
              aria-pressed={voted}
              aria-label={`${voted ? "Ta bort röst för" : "Rösta för"} ${sys.name}`}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#FDFCF9",
                border: voted ? "1.5px solid #c4391a44" : "1.5px solid #EDECE8",
                borderRadius: 12, padding: "10px 14px",
                position: "relative", overflow: "hidden",
                cursor: pending ? "default" : "pointer",
                textAlign: "left", width: "100%",
                transition: "border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                minHeight: 44, opacity: pending === sys.id ? 0.6 : 1,
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barW}%`, background: voted ? "#c4391a08" : "#F8F7F4", transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: voted ? "#c4391a" : "#666", minWidth: 38, zIndex: 1, position: "relative", transition: "color 0.15s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <span style={{ fontSize: 9 }}>▲</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800 }}>{sys.count}</span>
              </div>
              <div style={{ flex: 1, zIndex: 1, position: "relative" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{sys.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{sys.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 3: Manual verify**

Open `http://localhost:3005/scan`. Scroll to vote section.
Expected:
- Shows "Laddar röster..." briefly, then "Klicka på systemet du använder."
- Voting a system updates count immediately (optimistic)
- Refreshing the page shows persisted server-side counts
- Voting the same system again removes the vote (toggle)

- [ ] **Step 4: Commit**

```bash
git add app/scan/_components/IntegrationVote.tsx
git commit -m "feat(votes): migrate IntegrationVote from localStorage to /api/votes with optimistic updates"
```

---

## Self-Review Checklist

### Spec coverage

| PRD Section | Task |
|-------------|------|
| §1 Builder checks (12 URLs + 3 new checks) | Task 2, 5 |
| §2 Compliance checks (3 hardcoded fails) | Task 2 |
| §3 Badge system X/11 | Task 2, 8 |
| §4 Three categories in UI | Task 8 |
| §5 Top 3 recommendations | Task 2, 8 |
| §6 Supabase data capture | Task 1, 5 |
| §7 Updated Claude prompt (3 perspectives) | Task 3 |
| §8 Dela-knapp with updated share text | Task 8 |
| §9 "Djupare analys"-button | Task 6, 8 |
| §10 Legal disclaimer | Task 8 |
| §11 Updated proxy route | Task 4 |
| §12 Scanning animation (3 categories, updated timing) | Task 8 |
| §13 Implementation order | All tasks |
| Votes migrate to Supabase | Task 1, 7, 9 |
| Rate limiting 1 scan/min/IP | Task 5 |

All PRD requirements covered.

### Type consistency check

- `AllChecks` defined in `lib/checks.ts`, used in `app/api/scan/route.ts` and `ScannerSection.tsx` — consistent
- `ScanBadge = 'green' | 'yellow' | 'red'` used everywhere — consistent
- `ClaudeAnalysis` (company, industry, summary) returned by Claude functions — consistent with scan route usage
- `ScanResponse` in ScannerSection matches what `app/api/scan/route.ts` returns — consistent
- `ProbeResult` imported from `lib/checks.ts` in scan route — consistent
- Vote API response `{ counts, userVotes }` matches IntegrationVote component consumption — consistent

### No placeholders

All steps include complete code. No TBDs.
