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
