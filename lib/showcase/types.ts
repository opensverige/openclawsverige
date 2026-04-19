export type ProjectStatus = "pending" | "published" | "archived";
export type TagCategory = "domain" | "tech" | "stage";

export interface Builder {
  id: string;
  discord_id: string;
  discord_username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  category: TagCategory;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string | null;
  tagline: string | null;
  tech_stack: string[];
  url: string | null;
  repo_url: string | null;
  screenshot_url: string | null;
  hero_image_url: string | null;
  builder_id: string | null;
  featured: boolean;
  featured_order: number | null;
  status: ProjectStatus;
  discord_message_id: string | null;
  source_channel: string | null;
  created_at: string;
  published_at: string | null;
}

export interface ProjectWithRelations extends Project {
  builders: Builder | null;
  project_tags: { tags: Tag }[];
}

export interface GalleryFilters {
  q?: string;
  tags?: string[];
  page?: number;
}

export const PAGE_SIZE = 24;
