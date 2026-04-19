import { Suspense } from "react";
import type { Metadata } from "next";
import { createAnonServerClient } from "@/lib/supabase/server";
import type { ProjectWithRelations, Tag } from "@/lib/showcase/types";
import { PAGE_SIZE } from "@/lib/showcase/types";
import { ProjectGrid } from "@/components/showcase/ProjectGrid";
import { ProjectFilters } from "@/components/showcase/ProjectFilters";
import { FeaturedStrip } from "@/components/showcase/FeaturedStrip";

export const metadata: Metadata = {
  title: "Showcase — OpenSverige",
  description: "Projekt byggda av OpenSverige-communityn.",
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ q?: string; tags?: string; page?: string }>;
}

async function fetchData(q: string, tagSlugs: string[], page: number) {
  const supabase = createAnonServerClient();

  const allTagsRes = await supabase
    .from("tags")
    .select("*")
    .order("category")
    .order("name");
  const allTags: Tag[] = allTagsRes.data ?? [];

  // "Från communityn" strip — admin-curated, requires tagline for text-only card.
  const featuredRes = await supabase
    .from("projects")
    .select("*, builders(*), project_tags(tags(*))")
    .eq("status", "published")
    .eq("featured", true)
    .not("tagline", "is", null)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false })
    .limit(3);
  const featured: ProjectWithRelations[] =
    (featuredRes.data as ProjectWithRelations[] | null) ?? [];

  let projectsQuery = supabase
    .from("projects")
    .select(
      "*, builders(*), project_tags(tags(*))",
      { count: "exact" }
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (q) {
    projectsQuery = projectsQuery.or(
      `title.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  if (tagSlugs.length > 0) {
    const tagRes = await supabase
      .from("tags")
      .select("id")
      .in("slug", tagSlugs);
    const tagIds = (tagRes.data ?? []).map((t) => t.id);

    if (tagIds.length > 0) {
      const ptRes = await supabase
        .from("project_tags")
        .select("project_id")
        .in("tag_id", tagIds);
      const projectIds = [...new Set((ptRes.data ?? []).map((r) => r.project_id))];
      projectsQuery = projectsQuery.in("id", projectIds);
    }
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  projectsQuery = projectsQuery.range(from, to);

  const { data, count } = await projectsQuery;

  return {
    projects: (data ?? []) as ProjectWithRelations[],
    total: count ?? 0,
    allTags,
    featured,
  };
}

export default async function ShowcasePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const tagSlugs = params.tags ? params.tags.split(",").filter(Boolean) : [];
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const { projects, total, allTags, featured } = await fetchData(
    q,
    tagSlugs,
    page
  );
  // Don't duplicate featured in grid if they'd appear there too — only hide on "clean" view.
  const isCleanView = !q && tagSlugs.length === 0 && page === 1;
  const featuredIds = new Set(featured.map((p) => p.id));
  const gridProjects = isCleanView
    ? projects.filter((p) => !featuredIds.has(p.id))
    : projects;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-[var(--bg-deep)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="mb-8">
          <p
            className="text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Community
          </p>
          <h1
            className="text-3xl sm:text-4xl font-medium text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Vad bygger vi?
          </h1>
          <p
            className="mt-2 text-sm text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Projekt byggda av OpenSverige-communityn. Submitta ditt via Discord.
          </p>
        </div>

        {isCleanView && featured.length > 0 && (
          <FeaturedStrip projects={featured} />
        )}

        <Suspense>
          <ProjectFilters
            allTags={allTags}
            currentQ={q}
            currentTags={tagSlugs}
            total={total}
          />
        </Suspense>

        <ProjectGrid projects={gridProjects} />

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const sp = new URLSearchParams();
              if (q) sp.set("q", q);
              if (tagSlugs.length) sp.set("tags", tagSlugs.join(","));
              if (p > 1) sp.set("page", String(p));
              return (
                <a
                  key={p}
                  href={`/showcase?${sp.toString()}`}
                  className={`w-8 h-8 flex items-center justify-center text-xs rounded border transition-colors ${
                    p === page
                      ? "bg-[var(--crayfish-red)] border-[var(--crayfish-red)] text-white"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
