import type { ScoreRecord } from "@/lib/openscore/openscore";

interface ScoreResultProps {
  record: ScoreRecord;
  showSavedNotice?: boolean;
}

const verdictStyles: Record<ScoreRecord["verdict"], string> = {
  BUILD: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  PIVOT: "border-amber-500/50 bg-amber-500/20 text-amber-300",
  KILL: "border-red-500/50 bg-red-500/20 text-red-300",
};

const verdictLabels: Record<ScoreRecord["verdict"], string> = {
  BUILD: "BYGG",
  PIVOT: "PIVOTERA",
  KILL: "LÄGG NER",
};

export function ScoreResult({ record, showSavedNotice = false }: ScoreResultProps) {
  const risks = record.result.top_risks.slice(0, 3);

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Dom</p>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-semibold tracking-tight text-zinc-100">
              {record.totalScore}
              <span className="ml-1 text-base font-medium text-zinc-500">/100</span>
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${verdictStyles[record.verdict]}`}
            >
              {verdictLabels[record.verdict]}
            </span>
          </div>
        </div>
      </div>

      {showSavedNotice ? (
        <p className="text-xs text-zinc-400">Sparad i historiken.</p>
      ) : null}

      <div className="grid grid-cols-3 gap-3 text-sm">
        <MetricCard label="Säkerhet" value={`${record.confidenceScore}/10`} />
        <MetricCard label="Orättvis fördel" value={`${record.unfairAdvantageScore}/5`} />
        <MetricCard label="Dödssignaler" value={`${record.killSignalCount}`} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Din inmatning</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {record.submittedInput.idea}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Brutal sammanfattning</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">{record.brutalSummary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoList title="Det som fungerar" items={record.result.strengths} />
        <InfoList title="Det som bryter" items={record.result.weaknesses} />
      </div>

      <section className="space-y-2">
        <p className="text-sm font-semibold text-zinc-100">Topp 3 risker</p>
        <ul className="space-y-2">
          {risks.map((risk, index) => (
            <li
              key={`${risk.risk}-${index}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
            >
              <p className="text-sm text-zinc-100">{risk.risk}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                sannolikhet {risk.probability}% | effekt {risk.impact}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <InfoList title="Dödssignaler" items={record.result.kill_signals} />

      <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-200">Varför detta faller</p>
        <p className="mt-2 text-sm leading-relaxed text-red-100">
          detta kommer misslyckas eftersom: {record.failureReason}
        </p>
      </section>

      {record.research ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-sm font-semibold text-zinc-100">
            Research ({record.research.model})
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {record.research.output}
          </p>

          {record.research.sources.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Källor ({record.research.sourceCount})
              </p>
              <ul className="space-y-1">
                {record.research.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-300 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-100"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {record.research.actions.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Researchspår ({record.research.actions.length})
              </p>
              <ul className="space-y-1">
                {record.research.actions.map((action, index) => (
                  <li
                    key={`${action.type}-${action.url ?? action.query ?? index}`}
                    className="text-xs text-zinc-300"
                  >
                    {formatResearchAction(action)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
        <summary className="cursor-pointer font-medium text-zinc-200">
          Rå analys
        </summary>
        <div className="mt-3 space-y-3">
          <ReasoningLine label="Byggrealism" value={record.result.build_realism} />
          <ReasoningLine label="Behovets styrka" value={record.result.need_severity} />
          <ReasoningLine
            label="Intäktsrealitet"
            value={record.result.monetization_reality}
          />
          <ReasoningLine label="Differentiering" value={record.result.differentiation} />
        </div>
      </details>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-sm font-semibold text-zinc-100">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-zinc-300">
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ReasoningLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value}</p>
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
