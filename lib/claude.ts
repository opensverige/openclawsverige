// lib/claude.ts

export type ScanStatus = "REDO" | "DELVIS_REDO" | "INTE_REDO";

export interface Finding {
  check: string;
  pass: boolean;
}

export interface ScanAnalysis {
  company: string;
  industry: string;
  status: ScanStatus;
  summary: string;
  findings: Finding[];
  next_steps: string[];
}

export interface LiveChecks {
  robots: boolean;
  sitemap: boolean;
  llms: boolean;
}

const SYSTEM_PROMPT = `Du är en AI-readiness analytiker för svenska företag. Du får tekniska scan-resultat för en sajt och ska generera en rapport.

Svara BARA med valid JSON, ingen markdown, inga backticks. Svara på svenska med korrekta äöå.

Format:
{
  "company": "företagsnamn baserat på domän",
  "industry": "kort branschbeskrivning (max 4 ord)",
  "status": "REDO|DELVIS_REDO|INTE_REDO",
  "summary": "En mening som sammanfattar statusen för detta specifika företag",
  "findings": [
    {"check": "beskrivning av vad som hittades", "pass": true}
  ],
  "next_steps": [
    "konkret åtgärd"
  ]
}

Basera din bedömning på de tekniska check-resultaten. Var ärlig men konstruktiv.

Bedöm:
- Kan AI-agenter crawla sajten? (robots.txt tillåter GPTBot, ClaudeBot, Anthropic-AI)
- Finns en sitemap som agenter kan följa?
- Finns llms.txt med specifika AI-instruktioner?
- Följer sajten GDPR Art. 22 om automatiserat beslutsfattande?
- Är sajten förberedd för EU AI Act (ikraft aug 2026)?
- Blockerar cookie-walls agenter?
- Bör AI-genererat innehåll märkas enligt EU AI Act Art. 50?

Ge 3-5 findings och 2-4 nästa steg. Anpassa analystexten till den gissade branschen.`;

export async function analyzeWithClaude(
  domain: string,
  checks: LiveChecks,
  apiKey: string
): Promise<ScanAnalysis | null> {
  const checksText = [
    `robots.txt: ${checks.robots ? "finns och tillåter AI-agenter" : "saknas eller blockerar AI-agenter"}`,
    `sitemap.xml: ${checks.sitemap ? "finns" : "saknas"}`,
    `llms.txt: ${checks.llms ? "finns" : "saknas"}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analysera domän: ${domain}\n\nTekniska check-resultat:\n${checksText}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(cleaned) as ScanAnalysis;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export function buildDemoAnalysis(domain: string, checks: LiveChecks): ScanAnalysis {
  const passCount = [checks.robots, checks.sitemap, checks.llms].filter(Boolean).length;
  // "REDO" is intentionally never assigned: compliance checks (GDPR Art. 22, EU AI Act Art. 50)
  // always fail in demo mode, so max 3 of 7 checks can pass — insufficient for full readiness.
  const status: ScanStatus = passCount >= 2 ? "DELVIS_REDO" : "INTE_REDO";

  const slug = domain.split(".")[0] || domain;
  const company = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  const findings: Finding[] = [
    {
      check: checks.robots
        ? "Sajten tillåter AI-agenter att läsa den"
        : "Sajten blockerar eller saknar instruktioner för AI-agenter",
      pass: checks.robots,
    },
    {
      check: checks.sitemap
        ? "Sajten har en sitemap som agenter kan följa"
        : "Ingen sitemap hittad — agenter kan inte navigera sajten",
      pass: checks.sitemap,
    },
    {
      check: checks.llms
        ? "Sajten har specifika instruktioner för AI (llms.txt)"
        : "Saknar llms.txt — agenter vet inte hur de ska interagera",
      pass: checks.llms,
    },
    {
      check: "Integritetspolicyn saknar info om automatiserad behandling (GDPR Art. 22)",
      pass: false,
    },
    {
      check: "AI-genererat innehåll är inte märkt enligt EU AI Act Art. 50",
      pass: false,
    },
  ];

  const next_steps: string[] = [
    "Uppdatera din integritetspolicy med info om automatiserad behandling enligt GDPR Art. 22.",
    "Förbered för EU AI Act — märk AI-genererat innehåll på din sajt.",
    ...(!checks.llms
      ? ["Lägg till en /llms.txt-fil som berättar för AI-agenter vad din sajt erbjuder."]
      : []),
    ...(!checks.robots
      ? ["Se till att din robots.txt tillåter AI-agenter som GPTBot och ClaudeBot."]
      : []),
    ...(!checks.sitemap
      ? ["Lägg till en sitemap.xml så att agenter kan navigera din sajt."]
      : []),
  ].slice(0, 4);

  return {
    company,
    industry: "Okänd bransch",
    status,
    summary:
      status === "INTE_REDO"
        ? `${company} saknar de tekniska grunderna för att AI-agenter ska kunna interagera korrekt.`
        : `${company} har grunderna på plats men saknar viktiga compliance-anpassningar för AI-agenter.`,
    findings,
    next_steps,
  };
}
