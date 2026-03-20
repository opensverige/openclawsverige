import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

type EnrichedRadar = {
  generated_at?: string;
  frameworks: Array<{
    id: string;
    name: string;
    maturity?: number;
    maturity_label?: string;
    risk?: string;
    risk_label?: string;
    github_stats?: {
      stars?: number;
      last_push?: string;
      language?: string;
    };
    github_url?: string;
  }>;
};

export default async function RadarPage() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "radar",
    "data",
    "enriched.json",
  );

  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw) as EnrichedRadar;
  const frameworks = data.frameworks ?? [];

  const radarUrl = absoluteUrl("/radar");

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Agent Radar — AI Agent Framework Comparison",
    description:
      "Jämförelse av AI-agentramverk efter mognad, risk och GitHub-aktivitet. Uppdateras baserat på GitHub-data.",
    url: radarUrl,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    inLanguage: "sv",
    temporalCoverage: data.generated_at ? data.generated_at.slice(0, 10) : "2026-01-01",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Agent Radar framework list",
    itemListElement: frameworks.slice(0, 30).map((fw, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: fw.name,
        ...(fw.github_url ? { url: fw.github_url } : {}),
      },
    })),
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@id": absoluteUrl("/"), name: "Hem" },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@id": radarUrl, name: "Agent Radar" },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsSchema),
        }}
      />

      <div className="page">
        <div className="site-sections section">
          <div className="label">radar</div>
          <h1>Agent Radar</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 10 }}>
            En crawlbar sammanfattning av ramverken här i HTML. Full interaktiv
            vy finns i{" "}
            <Link href="/radar/index.html" className="text-[var(--gold)]">
              /radar/index.html
            </Link>
            .
          </p>

          <p style={{ color: "var(--text-secondary)" }}>
            English: AI agent frameworks comparison by maturity, risk, and GitHub activity.
          </p>

          {frameworks.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <h3>Inga data att visa</h3>
              <p>Radarn misslyckades att läsa `enriched.json`.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border)" }}>
                      Framework
                    </th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border)" }}>
                      Mognad
                    </th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border)" }}>
                      Risk
                    </th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border)" }}>
                      Stars
                    </th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--border)" }}>
                      Senaste push
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {frameworks.slice(0, 30).map((fw) => (
                    <tr key={fw.id}>
                      <td style={{ padding: 8, borderBottom: "1px solid var(--bg-card)" }}>
                        {fw.github_url ? (
                          <a
                            href={fw.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--gold)", textDecoration: "none" }}
                          >
                            {fw.name}
                          </a>
                        ) : (
                          fw.name
                        )}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid var(--bg-card)" }}>
                        {fw.maturity_label ?? fw.maturity ?? "—"}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid var(--bg-card)" }}>
                        {fw.risk_label ?? fw.risk ?? "—"}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid var(--bg-card)" }}>
                        {fw.github_stats?.stars ?? "—"}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid var(--bg-card)" }}>
                        {fw.github_stats?.last_push
                          ? fw.github_stats.last_push.slice(0, 10)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
