// app/scan/[domain]/page.tsx
import type { Metadata } from "next";
import type { ScanResult } from "@/lib/scan-types";
import type { AllChecks } from "@/lib/checks";
import { computeSeverityCounts } from "@/lib/checks";
import Nav from "../_components/Nav";
import ResultsPage from "./_components/ResultsPage";

interface PageProps {
  params: Promise<{ domain: string }>;
}

async function getLatestScan(domain: string): Promise<ScanResult | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/scan_submissions?domain=eq.${encodeURIComponent(domain)}&order=scanned_at.desc&limit=1&select=badge,checks_passed,checks_json,claude_summary,recommendations`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json() as Array<{
      badge: string;
      checks_passed: number;
      checks_json: AllChecks;
      claude_summary: string | null;
      recommendations: string[] | null;
    }>;
    if (!rows.length) return null;
    const row = rows[0];
    return {
      company: domain.split('.')[0] ?? domain,
      industry: '',
      summary: row.claude_summary ?? '',
      agent_suggestions: [],
      badge: row.badge as ScanResult['badge'],
      score: row.checks_passed,
      checks: row.checks_json,
      recommendations: row.recommendations ?? [],
      severity_counts: computeSeverityCounts(row.checks_json),
      scan_id: null,
      isDemo: false,
    };
  } catch { return null; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const data = await getLatestScan(domain);
  if (!data) {
    return {
      title: `${domain} — Scanna din sajt | OpenSverige`,
      description: "Scanna din sajt och se hur redo du är för AI-agenter.",
    };
  }
  const badgeLabel = data.badge === 'green' ? 'REDO' : data.badge === 'yellow' ? 'DELVIS REDO' : 'INTE REDO';
  const criticalCount = data.severity_counts.critical;
  return {
    title: `${domain} — ${badgeLabel} (${data.score}/11) | OpenSverige`,
    description: `${criticalCount > 0 ? `${criticalCount} kritiska brister hittade.` : 'Fullständig AI-agent readiness-rapport.'} Se rapporten på OpenSverige.`,
    openGraph: {
      title: `${domain} — ${badgeLabel} (${data.score}/11)`,
      description: `Fullständig AI-agent readiness-rapport. ${criticalCount > 0 ? `${criticalCount} kritiska brister.` : ''}`,
      url: `https://agent.opensverige.se/scan/${domain}`,
      siteName: "OpenSverige",
    },
  };
}

export default async function ScanResultPage({ params }: PageProps) {
  const { domain } = await params;
  const initialData = await getLatestScan(domain);
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", color: "#111" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Libre+Franklin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=optional"
      />
      <Nav />
      <ResultsPage domain={domain} initialData={initialData} />
      <footer
        style={{
          padding: "14px 24px",
          borderTop: "1.5px solid #EDECE8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#706F6C",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>agent.opensverige.se</span>
        <span>opensverige.se — öppen källkod</span>
      </footer>
    </div>
  );
}
