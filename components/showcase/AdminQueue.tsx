"use client";

import { useState } from "react";
import type { ProjectWithRelations, Tag } from "@/lib/showcase/types";
import { AdminQueueItem } from "./AdminQueueItem";

interface AdminQueueProps {
  initialProjects: ProjectWithRelations[];
  allTags: Tag[];
}

export function AdminQueue({ initialProjects, allTags }: AdminQueueProps) {
  const [projects, setProjects] = useState(initialProjects);

  function removeProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (projects.length === 0) {
    return (
      <div className="py-16 text-center">
        <p
          className="text-[var(--text-muted)] text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Kön är tom. Inga projekt väntar på granskning.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) => (
        <AdminQueueItem
          key={project.id}
          project={project}
          allTags={allTags}
          onApproved={removeProject}
          onRejected={removeProject}
        />
      ))}
    </div>
  );
}
