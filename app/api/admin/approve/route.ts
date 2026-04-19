import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ApproveSchema } from "@/lib/showcase/validators";

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApproveSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  const supabase = createServiceClient();
  const {
    id,
    screenshot_url,
    hero_image_url,
    url,
    repo_url,
    tagline,
    body,
    tech_stack,
    tag_slugs,
    featured,
    featured_order,
  } = parsed.data;

  const update: Record<string, unknown> = {
    status: "published",
    published_at: new Date().toISOString(),
  };
  if (screenshot_url !== undefined) update.screenshot_url = screenshot_url;
  if (hero_image_url !== undefined) update.hero_image_url = hero_image_url;
  if (url !== undefined) update.url = url;
  if (repo_url !== undefined) update.repo_url = repo_url;
  if (tagline !== undefined) update.tagline = tagline;
  if (body !== undefined) update.body = body;
  if (tech_stack !== undefined) update.tech_stack = tech_stack;
  if (featured !== undefined) update.featured = featured;
  if (featured_order !== undefined) update.featured_order = featured_order;

  const { error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    console.error("Approve failed", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  // Reconcile tags if admin provided an explicit tag_slugs list.
  if (tag_slugs !== undefined) {
    await supabase.from("project_tags").delete().eq("project_id", id);
    if (tag_slugs.length > 0) {
      const { data: matched } = await supabase
        .from("tags")
        .select("id")
        .in("slug", tag_slugs);
      if (matched && matched.length > 0) {
        await supabase
          .from("project_tags")
          .insert(matched.map((t) => ({ project_id: id, tag_id: t.id })));
      }
    }
  }

  return NextResponse.json({ success: true });
}
