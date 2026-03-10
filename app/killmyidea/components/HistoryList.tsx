"use client";

import type { ScoreRecord } from "@/lib/openscore/openscore";

import { HistoryListItem } from "@/app/killmyidea/components/HistoryListItem";

interface HistoryListProps {
  items: ScoreRecord[];
  activeId: string | null;
  isLoading: boolean;
  error: string | null;
  onSelect: (item: ScoreRecord) => void;
}

export function HistoryList({
  items,
  activeId,
  isLoading,
  error,
  onSelect,
}: HistoryListProps) {
  return (
    <section className="card">
      <div className="label">Historik</div>
      <h2 className="t-heading">Tidigare idéer</h2>

      {isLoading ? <p className="t-body">Laddar historik...</p> : null}
      {error ? (
        <p className="t-body" style={{ color: "var(--crayfish-light)" }}>
          {error}
        </p>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <p className="t-body">Inga sparade idéer</p>
      ) : null}

      <div
        style={{
          marginTop: "var(--sp-4)",
          display: "grid",
          gap: "var(--sp-3)",
        }}
      >
        {items.map((item) => (
          <HistoryListItem
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
