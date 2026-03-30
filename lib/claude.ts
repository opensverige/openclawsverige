// lib/claude.ts
import type { AgentSuggestion } from './scan-types';
import { DEFAULT_AGENT_SUGGESTIONS } from './scan-types';

export interface ClaudeAnalysis {
  company: string;
  industry: string;
  summary: string;
  agent_suggestions: AgentSuggestion[];
}

export interface LiveChecks {
  robots: boolean;
  sitemap: boolean;
  llms: boolean;
}

export interface BuilderProbeData {
  apiPathsFound: string[];
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
  "summary": "Exakt 2–3 meningar om denna specifika sajts situation. Nämn domännamnet. Var konkret — nämn inte saker du inte har data om. Aldrig säljig. Skriv INTE generellt om AI.",
  "agent_suggestions": [
    {
      "name": "Agent-namn (max 3 ord)",
      "description": "En mening om vad den gör.",
      "relevance": "En mening om varför den är relevant för just denna sajt/bransch."
    }
  ]
}

agent_suggestions: föreslå exakt 3 agent-typer relevanta för detta företags bransch och produkter.
Var specifik — "Faktura-agent för Fortnox", inte "Automation-agent".`;

export async function analyzeWithClaude(
  domain: string,
  checks: LiveChecks,
  builder: BuilderProbeData,
  apiKey: string,
  firecrawlMarkdown?: string,
): Promise<ClaudeAnalysis | null> {
  const discoveryText = [
    `robots.txt: ${checks.robots ? 'tillåter AI-agenter' : 'blockerar eller saknar AI-agenter'}`,
    `sitemap.xml: ${checks.sitemap ? 'finns' : 'saknas'}`,
    `llms.txt: ${checks.llms ? 'finns' : 'saknas'}`,
  ].join('\n');

  const builderText = builder.apiPathsFound.length > 0
    ? `API-endpoints som svarade (200): ${builder.apiPathsFound.join(', ')}`
    : 'Inga API-endpoints hittade';

  const openApiText = builder.openApiSpecFound ? 'OpenAPI-spec hittad' : 'Ingen OpenAPI-spec hittad';
  const portalText = builder.developerPortalUrl
    ? `Developer-portal: ${builder.developerPortalUrl}`
    : 'Ingen developer-portal hittad';

  const siteContentSection = firecrawlMarkdown
    ? `\nSAJT-CONTENT (markdown, max 8000 tecken):\n${firecrawlMarkdown.slice(0, 8000)}\n`
    : '';

  const userContent = `Analysera domän: ${domain}
${siteContentSection}
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
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as ClaudeAnalysis;
    // Ensure agent_suggestions is always an array
    if (!Array.isArray(parsed.agent_suggestions)) {
      parsed.agent_suggestions = DEFAULT_AGENT_SUGGESTIONS;
    }
    return parsed;
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
    agent_suggestions: DEFAULT_AGENT_SUGGESTIONS,
  };
}
