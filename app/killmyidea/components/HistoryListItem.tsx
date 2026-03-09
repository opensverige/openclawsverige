"use client";

import type { ScoreRecord } from "@/lib/openscore/openscore";

interface HistoryListItemProps {
  item: ScoreRecord;
  isActive: boolean;
  onSelect: (item: ScoreRecord) => void;
}

const verdictStyles: Record<ScoreRecord["verdict"], string> = {
  BUILD: "text-emerald-300",
  PIVOT: "text-amber-300",
  KILL: "text-red-300",
};

const verdictLabels: Record<ScoreRecord["verdict"], string> = {
  BUILD: "BYGG",
  PIVOT: "PIVOTERA",
  KILL: "LÄGG NER",
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
      className={`w-full rounded-xl border p-3 text-left transition ${
        isActive
          ? "border-zinc-400 bg-zinc-900"
          : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-600"
      }`}
    >
      <p className="text-sm font-medium text-zinc-100">{title}</p>
      <p className="mt-2 text-xs text-zinc-500">{date}</p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className={`font-semibold ${verdictStyles[item.verdict]}`}>
          {verdictLabels[item.verdict]}
        </span>
        <span className="text-zinc-400">poäng {item.totalScore}</span>
      </div>
    </button>
  );
}
