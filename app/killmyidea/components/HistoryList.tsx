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
    <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-100">Tidigare idéer</h2>

      {isLoading ? <p className="text-sm text-zinc-500">Laddar historik...</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {!isLoading && items.length === 0 ? (
        <p className="text-sm text-zinc-500">Inga sparade idéer</p>
      ) : null}

      <div className="space-y-2">
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
