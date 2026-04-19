import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import type { ProjectWithRelations, Tag } from "@/lib/showcase/types";
import { AdminQueue } from "@/components/showcase/AdminQueue";

export const metadata: Metadata = { title: "Admin — Showcase" };
export const dynamic = "force-dynamic";

async function getPendingProjects(): Promise<ProjectWithRelations[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("projects")
    .select("*, builders(*), project_tags(tags(*))")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (data ?? []) as ProjectWithRelations[];
}

async function getAllTags(): Promise<Tag[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Tag[];
}

export default async function AdminPage() {
  const [projects, allTags] = await Promise.all([
    getPendingProjects(),
    getAllTags(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p
              className="text-xs tracking-widest uppercase text-[var(--text-muted)] mb-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Showcase / Admin
            </p>
            <h1
              className="text-2xl font-medium text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Väntande projekt
            </h1>
          </div>
          <span
            className="text-xs text-[var(--text-muted)] px-3 py-1 border border-[var(--border)] rounded"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {projects.length} i kön
          </span>
        </div>

        <AdminQueue initialProjects={projects} allTags={allTags} />
      </div>
    </main>
  );
}
