import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAnonServerClient } from "@/lib/supabase/server";
import type { ProjectWithRelations } from "@/lib/showcase/types";
import { ProjectDetail } from "@/components/showcase/ProjectDetail";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://opensverige.se";

async function getProject(slug: string): Promise<ProjectWithRelations | null> {
  const supabase = createAnonServerClient();
  const { data } = await supabase
    .from("projects")
    .select("*, builders(*), project_tags(tags(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as ProjectWithRelations | null;
}

async function getRelated(excludeId: string): Promise<ProjectWithRelations[]> {
  const supabase = createAnonServerClient();
  const { data } = await supabase
    .from("projects")
    .select("*, builders(*), project_tags(tags(*))")
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data ?? []) as ProjectWithRelations[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const builder = project.builders;
  const builderName = builder?.display_name ?? builder?.discord_username;
  const ogImage = project.hero_image_url ?? project.screenshot_url;

  return {
    title: `${project.title} — OpenSverige Showcase`,
    description: (project.tagline ?? project.description).slice(0, 160),
    openGraph: {
      title: project.title,
      description: (project.tagline ?? project.description).slice(0, 160),
      url: `${SITE_URL}/showcase/p/${project.slug}`,
      ...(ogImage && { images: [ogImage] }),
      ...(builderName && { authors: [builderName] }),
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const related = await getRelated(project.id);
  const canonicalUrl = `${SITE_URL}/showcase/p/${project.slug}`;

  return (
    <ProjectDetail
      project={project}
      related={related}
      canonicalUrl={canonicalUrl}
    />
  );
}
