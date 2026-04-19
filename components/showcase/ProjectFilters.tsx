"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import type { Tag } from "@/lib/showcase/types";

interface ProjectFiltersProps {
  allTags: Tag[];
  currentQ: string;
  currentTags: string[];
  total: number;
}

const mono = { fontFamily: "var(--font-mono)" };

export function ProjectFilters({
  allTags,
  currentQ,
  currentTags,
  total,
}: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [techOpen, setTechOpen] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    updateParams({ q: e.target.value || null });
  }

  function toggleTag(slug: string) {
    const next = currentTags.includes(slug)
      ? currentTags.filter((t) => t !== slug)
      : [...currentTags, slug];
    updateParams({ tags: next });
  }

  function clearAll() {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  useEffect(() => {
    if (!techOpen) return;
    function onClick(e: MouseEvent) {
      if (techRef.current && !techRef.current.contains(e.target as Node)) {
        setTechOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTechOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [techOpen]);

  const domainTags = allTags.filter((t) => t.category === "domain");
  const stageTags = allTags.filter((t) => t.category === "stage");
  const techTags = allTags.filter((t) => t.category === "tech");
  const activeTechCount = techTags.filter((t) =>
    currentTags.includes(t.slug)
  ).length;

  const hasFilters = currentQ || currentTags.length > 0;

  const chipCls = (active: boolean) =>
    `px-2.5 py-1 text-[12px] rounded-full border transition-colors duration-150 ${
      active
        ? "bg-[var(--crayfish-red)] border-[var(--crayfish-red)] text-white"
        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="search"
            value={currentQ}
            onChange={handleSearch}
            placeholder="Sök projekt..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>
        <span
          className="text-xs text-[var(--text-muted)] shrink-0"
          style={mono}
        >
          {total} projekt
        </span>
      </div>

      {(domainTags.length > 0 || stageTags.length > 0) && (
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-2"
          style={mono}
        >
          {domainTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.slug)}
              className={chipCls(currentTags.includes(tag.slug))}
            >
              {tag.name}
            </button>
          ))}

          {stageTags.length > 0 && (
            <span
              className="mx-1 h-4 w-px bg-[var(--border)]"
              aria-hidden
            />
          )}

          {stageTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.slug)}
              className={chipCls(currentTags.includes(tag.slug))}
            >
              {tag.name}
            </button>
          ))}

          {techTags.length > 0 && (
            <div className="relative ml-1" ref={techRef}>
              <button
                type="button"
                onClick={() => setTechOpen((o) => !o)}
                aria-expanded={techOpen}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded-full border transition-colors duration-150 ${
                  activeTechCount > 0 || techOpen
                    ? "border-[var(--text-muted)] text-[var(--text-primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Tech
                {activeTechCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] bg-[var(--crayfish-red)] text-white rounded-full">
                    {activeTechCount}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${techOpen ? "rotate-180" : ""}`}
                />
              </button>

              {techOpen && (
                <div
                  role="dialog"
                  aria-label="Filtrera p\u00e5 tech"
                  className="absolute left-0 top-full mt-2 w-[min(360px,calc(100vw-2rem))] bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-xl z-30 p-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {techTags.map((tag) => {
                      const active = currentTags.includes(tag.slug);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.slug)}
                          className={chipCls(active)}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <X size={12} />
              Rensa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
