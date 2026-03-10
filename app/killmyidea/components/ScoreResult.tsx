"use client";

import ScoreCelebrationCanvas from "@/app/killmyidea/components/ScoreCelebrationCanvas";
import type { ScoreRecord } from "@/lib/openscore/openscore";

interface ScoreResultProps {
  record: ScoreRecord;
  showSavedNotice?: boolean;
}

const verdictLabels: Record<ScoreRecord["verdict"], string> = {
  BUILD: "BYGG",
  PIVOT: "PIVOTERA",
  KILL: "LÄGG NER",
};

const verdictLines: Record<ScoreRecord["verdict"], string> = {
  BUILD: "Bygg vidare.",
  PIVOT: "Vrid innan du bygger.",
  KILL: "Lägg ner nu.",
};

const verdictClasses: Record<ScoreRecord["verdict"], string> = {
  BUILD: "killmyidea-verdict--build",
  PIVOT: "killmyidea-verdict--pivot",
  KILL: "killmyidea-verdict--kill",
};

export function ScoreResult({ record, showSavedNotice = false }: ScoreResultProps) {
  const risks = record.result.top_risks.slice(0, 3);
  const isCelebrating = record.totalScore >= 70;

  return (
    <section className="section">
      <div className="card killmyidea-score-hero">
        <div className="killmyidea-score-glow" />
        {isCelebrating ? (
          <div className="killmyidea-score-canvas" aria-hidden="true">
            <ScoreCelebrationCanvas isActive />
          </div>
        ) : null}

        <div className="label">Dom</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "var(--sp-3)",
          }}
        >
          <div className="t-display">
            <span className="t-display t-display--gold">{record.totalScore}</span>
            <span className="t-display t-display--sm">/100</span>
          </div>
          <span className={`killmyidea-verdict ${verdictClasses[record.verdict]}`}>
            {verdictLabels[record.verdict]}
          </span>
        </div>
        <div className="t-heading" style={{ marginTop: "var(--sp-2)" }}>
          {verdictLines[record.verdict]}
        </div>
        {showSavedNotice ? (
          <div className="t-mono stats" style={{ color: "var(--text-muted)" }}>
            Sparad i historiken.
          </div>
        ) : null}
      </div>

      <div className="grid-2">
        <BreakdownCard label="Säkerhet" value={`${record.confidenceScore}/10`} />
        <BreakdownCard label="Orättvis fördel" value={`${record.unfairAdvantageScore}/5`} />
        <BreakdownCard label="Dödssignaler" value={`${record.killSignalCount}`} />
        <BreakdownCard label="Total" value={`${record.totalScore}/100`} />
      </div>

      <div className="card">
        <div className="label">Brutal sammanfattning</div>
        <p className="t-body">{record.brutalSummary}</p>
      </div>

      <div className="card">
        <div className="label">Din inmatning</div>
        <p className="t-body" style={{ whiteSpace: "pre-wrap" }}>
          {record.submittedInput.idea}
        </p>
      </div>

      <details className="killmyidea-accordion">
        <summary>Visa risker och varför det faller</summary>
        {risks.length > 0 ? (
          <div style={{ marginTop: "var(--sp-3)" }}>
            <p className="t-heading">Topp 3 risker</p>
            <ul style={{ marginTop: "var(--sp-2)" }}>
              {risks.map((risk, index) => (
                <li key={`${risk.risk}-${index}`} style={{ marginBottom: "var(--sp-2)" }}>
                  <div className="t-body">{risk.risk}</div>
                  <div className="t-mono stats">
                    sannolikhet {risk.probability}% | effekt {risk.impact}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div style={{ marginTop: "var(--sp-4)" }}>
          <p className="t-heading">Varför detta faller</p>
          <p className="t-body">Detta kommer misslyckas eftersom: {record.failureReason}</p>
        </div>

        <div style={{ marginTop: "var(--sp-4)" }}>
          <div className="grid-2">
            <InfoList title="Det som fungerar" items={record.result.strengths} />
            <InfoList title="Det som bryter" items={record.result.weaknesses} />
          </div>
        </div>

        {record.result.kill_signals.length > 0 ? (
          <div style={{ marginTop: "var(--sp-4)" }}>
            <InfoList title="Dödssignaler" items={record.result.kill_signals} />
          </div>
        ) : null}
      </details>

      {record.research ? (
        <details className="killmyidea-accordion">
          <summary>Visa research</summary>
          <div style={{ marginTop: "var(--sp-3)" }}>
            <p className="t-heading">Research ({record.research.model})</p>
            <p className="t-body" style={{ whiteSpace: "pre-wrap" }}>
              {record.research.output}
            </p>
          </div>

          {record.research.sources.length > 0 ? (
            <div style={{ marginTop: "var(--sp-4)" }}>
              <p className="t-heading">Källor ({record.research.sourceCount})</p>
              <ul className="format-list">
                {record.research.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="brand-link">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {record.research.actions.length > 0 ? (
            <div style={{ marginTop: "var(--sp-4)" }}>
              <p className="t-heading">Researchspår ({record.research.actions.length})</p>
              <ul className="format-list">
                {record.research.actions.map((action, index) => (
                  <li key={`${action.type}-${action.url ?? action.query ?? index}`}>
                    {formatResearchAction(action)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
      ) : null}

      <details className="killmyidea-accordion">
        <summary>Visa rå analys</summary>
        <div style={{ marginTop: "var(--sp-3)" }}>
          <ReasoningLine label="Byggrealism" value={record.result.build_realism} />
          <ReasoningLine label="Behovets styrka" value={record.result.need_severity} />
          <ReasoningLine label="Intäktsrealitet" value={record.result.monetization_reality} />
          <ReasoningLine label="Differentiering" value={record.result.differentiation} />
        </div>
      </details>
    </section>
  );
}

function BreakdownCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: "var(--sp-4)" }}>
      <div className="label">{label}</div>
      <div className="t-mono stats">{value}</div>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="t-heading">{title}</p>
      <ul className="format-list">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReasoningLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "var(--sp-3)" }}>
      <p className="label">{label}</p>
      <p className="t-body">{value}</p>
    </div>
  );
}

function formatResearchAction(action: {
  type: string;
  status: string;
  query: string | null;
  url: string | null;
  pattern: string | null;
}): string {
  const detail = action.query ?? action.url ?? action.pattern ?? "utan detalj";
  return `${action.type} (${action.status}): ${detail}`;
}
