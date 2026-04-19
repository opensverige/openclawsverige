import type { Tag } from "@/lib/showcase/types";

interface TagChipProps {
  tag: Tag;
  selected?: boolean;
  onClick?: () => void;
}

export function TagChip({ tag, selected = false, onClick }: TagChipProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 text-xs font-mono tracking-wide border transition-colors duration-150 cursor-pointer select-none rounded";

  const styles = selected
    ? "bg-[var(--crayfish-red)] border-[var(--crayfish-red)] text-white"
    : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-secondary)]";

  if (!onClick) {
    return (
      <span className={`${base} ${styles} cursor-default`}>{tag.name}</span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {tag.name}
    </button>
  );
}
