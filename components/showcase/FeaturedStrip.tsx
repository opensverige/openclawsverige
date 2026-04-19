import Link from "next/link";
import type { ProjectWithRelations } from "@/lib/showcase/types";

interface FeaturedStripProps {
  projects: ProjectWithRelations[];
}

const display = { fontFamily: "var(--font-display)" };
const mono = { fontFamily: "var(--font-mono)" };
const body = { fontFamily: "var(--font-body)" };

const stageLabels: Record<string, string> = {
  idea: "Idé",
  building: "Under bygge",
  shipped: "Skickat",
  live: "Live",
};

export function FeaturedStrip({ projects }: FeaturedStripProps) {
  if (projects.length === 0) return null;
  const cards = projects.slice(0, 3);

  return (
    <section className="mb-14" aria-label="Från communityn">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="inline-block w-1.5 h-1.5 bg-[var(--crayfish-red)]"
          aria-hidden
        />
        <span
          className="text-[11px] uppercase tracking-[0.14em] text-[var(--crayfish-red)]"
          style={mono}
        >
          Från communityn
        </span>
        <span
          className="h-px flex-1 bg-[var(--border)]"
          aria-hidden
        />
        <span
          className="text-[11px] text-[var(--text-muted)] hidden sm:inline"
          style={mono}
        >
          Projekt som communityn snackar om just nu
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-[var(--border)]">
        {cards.map((project, i) => (
          <FeaturedCard
            key={project.id}
            project={project}
            isLast={i === cards.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({
  project,
  isLast,
}: {
  project: ProjectWithRelations;
  isLast: boolean;
}) {
  const builder = project.builders;
  const username = builder?.discord_username ?? "okand";
  const tags = project.project_tags.map((pt) => pt.tags);
  const domain = tags.find((t) => t.category === "domain");
  const stage = tags.find((t) => t.category === "stage");
  const eyebrow = [domain?.name, stage ? stageLabels[stage.slug] ?? stage.name : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/showcase/p/${project.slug}`}
      className={`group relative flex flex-col px-6 py-10 sm:px-8 sm:py-12 min-h-[320px] transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--bg-card)] ${
        isLast ? "" : "md:border-r border-[var(--border)]"
      } border-b md:border-b-0 last:border-b-0`}
    >
      {eyebrow && (
        <span
          className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] mb-8"
          style={mono}
        >
          {eyebrow}
        </span>
      )}

      <h3
        className="text-[40px] sm:text-[44px] leading-[0.98] text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors mb-5"
        style={{ ...display, fontWeight: 400, letterSpacing: "-0.01em" }}
      >
        {project.title}
      </h3>

      {project.tagline && (
        <p
          className="text-[16px] leading-[1.5] text-[var(--text-secondary)] line-clamp-3 mb-auto"
          style={body}
        >
          {project.tagline}
        </p>
      )}

      <div className="mt-8 pt-4 border-t border-[var(--border)]">
        <span className="text-[12px]" style={mono}>
          <span className="text-[var(--gold)]">@</span>
          <span className="text-[var(--text-muted)]">{username}</span>
        </span>
      </div>
    </Link>
  );
}
