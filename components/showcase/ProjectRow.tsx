import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProjectWithRelations } from "@/lib/showcase/types";

interface ProjectRowProps {
  project: ProjectWithRelations;
}

export function ProjectRow({ project }: ProjectRowProps) {
  const builder = project.builders;
  const tags = project.project_tags.map((pt) => pt.tags);
  const builderName =
    builder?.display_name ?? builder?.discord_username ?? "okänd";
  const domain = tags.find((t) => t.category === "domain");

  return (
    <Link
      href={`/showcase/p/${project.slug}`}
      className="group flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-b-0 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--text-muted)]"
    >
      <div className="relative shrink-0 w-12 h-12 bg-[var(--bg-surface)] rounded overflow-hidden border border-[var(--border)]">
        {project.screenshot_url ? (
          <Image
            src={project.screenshot_url}
            alt={project.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[15px] text-[var(--text-primary)] truncate group-hover:text-[var(--gold)] transition-colors"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          {project.title}
        </p>
        <p
          className="text-[12px] text-[var(--text-muted)] truncate"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          @{builderName}
          {domain && <> · {domain.name}</>}
        </p>
      </div>

      <ArrowUpRight
        size={14}
        className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--crayfish-red)] transition-colors"
      />
    </Link>
  );
}
