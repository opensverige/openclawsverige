import Link from "next/link";
import Image from "next/image";
import type { ProjectWithRelations } from "@/lib/showcase/types";
import { TagChip } from "./TagChip";

interface ProjectCardProps {
  project: ProjectWithRelations;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const builder = project.builders;
  const tags = project.project_tags.map((pt) => pt.tags);
  const builderName =
    builder?.display_name ?? builder?.discord_username ?? "okänd";

  return (
    <Link
      href={`/showcase/p/${project.slug}`}
      className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--crayfish-red)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--gold)] focus-visible:outline-offset-2"
    >
      <div className="relative w-full aspect-video bg-[var(--bg-surface)] overflow-hidden">
        {project.screenshot_url ? (
          <Image
            src={project.screenshot_url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-xs text-[var(--text-muted)] tracking-widest uppercase">
              ingen bild
            </span>
          </div>
        )}
        {/* Luminance normalization — evens out bright vs dark screenshots */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-[#0a0a0a]/[0.08] ring-1 ring-inset ring-white/[0.04]"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3
          className="text-base font-medium leading-snug text-[var(--text-primary)] line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {project.title}
        </h3>

        <p
          className="text-xs text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {builderName}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 4).map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
