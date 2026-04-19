import { slugify as baseSlugify } from "@/lib/slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateUniqueSlug(
  title: string,
  supabase: SupabaseClient
): Promise<string> {
  const base = baseSlugify(title).slice(0, 60);
  let slug = base;
  let i = 2;

  for (;;) {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i}`;
    i++;
  }
}
