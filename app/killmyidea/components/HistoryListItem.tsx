"use client";

import type { ScoreRecord } from "@/lib/openscore/openscore";

interface HistoryListItemProps {
  item: ScoreRecord;
  isActive: boolean;
  onSelect: (item: ScoreRecord) => void;
}

const verdictLabels: Record<ScoreRecord["verdict"], string> = {
  BUILD: "BYGG",
  PIVOT: "PIVOTERA",
  KILL: "LÄGG NER",
};

const verdictClasses: Record<ScoreRecord["verdict"], string> = {
  BUILD: "killmyidea-verdict--build",
  PIVOT: "killmyidea-verdict--pivot",
  KILL: "killmyidea-verdict--kill",
};

export function HistoryListItem({ item, isActive, onSelect }: HistoryListItemProps) {
  const date = new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(item.createdAt));

  const title =
    item.idea.length > 78 ? `${item.idea.slice(0, 78).trimEnd()}...` : item.idea;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="card"
      style={{
        width: "100%",
        textAlign: "left",
        padding: "var(--sp-4)",
        background: isActive ? "var(--bg-surface)" : "var(--bg-card)",
        borderColor: isActive ? "var(--gold)" : "var(--border)",
        transition: "var(--transition)",
        cursor: "pointer",
      }}
    >
      <p className="t-body" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      <p className="t-mono stats" style={{ color: "var(--text-muted)" }}>
        {date}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
        <span className={`killmyidea-verdict ${verdictClasses[item.verdict]}`}>
          {verdictLabels[item.verdict]}
        </span>
        <span className="t-mono stats">poäng {item.totalScore}</span>
      </div>
    </button>
  );
}
