import type { ProjectWithRelations } from "@/lib/showcase/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: ProjectWithRelations[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="py-24 text-center">
        <p
          className="text-[var(--text-muted)] text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Inga projekt matchar din sökning.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
