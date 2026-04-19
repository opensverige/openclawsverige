import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { WebhookBodySchema } from "@/lib/showcase/validators";
import { generateUniqueSlug } from "@/lib/showcase/slugify";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret") ?? "";
  const expected = process.env.DISCORD_WEBHOOK_SECRET ?? "";

  if (!expected || !timingSafeEqual(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = WebhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { discord_message_id, source_channel, author, project } = parsed.data;
  const supabase = createServiceClient();

  // Upsert builder — Discord-data är publik profilinformation
  const { data: builder, error: builderErr } = await supabase
    .from("builders")
    .upsert(
      {
        discord_id: author.discord_id,
        discord_username: author.username,
        display_name: author.display_name ?? null,
        avatar_url: author.avatar_url ?? null,
      },
      { onConflict: "discord_id" }
    )
    .select("id")
    .single();

  if (builderErr || !builder) {
    console.error("Builder upsert failed", builderErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const slug = await generateUniqueSlug(project.title, supabase);

  const { data: inserted, error: projectErr } = await supabase
    .from("projects")
    .insert({
      slug,
      title: project.title,
      description: project.description,
      body: project.body ?? null,
      tagline: project.tagline ?? null,
      tech_stack: project.tech_stack ?? [],
      url: project.url ?? null,
      repo_url: project.repo_url ?? null,
      screenshot_url: project.screenshot_url ?? null,
      hero_image_url: project.hero_image_url ?? null,
      builder_id: builder.id,
      status: "pending",
      discord_message_id,
      source_channel,
    })
    .select("id, slug")
    .single();

  if (projectErr || !inserted) {
    console.error("Project insert failed", projectErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  // Matcha och koppla tags
  if (project.tags.length > 0) {
    const { data: matchedTags } = await supabase
      .from("tags")
      .select("id, slug")
      .in("slug", project.tags);

    if (matchedTags && matchedTags.length > 0) {
      await supabase.from("project_tags").insert(
        matchedTags.map((tag) => ({
          project_id: inserted.id,
          tag_id: tag.id,
        }))
      );
    }
  }

  return NextResponse.json({
    success: true,
    id: inserted.id,
    slug: inserted.slug,
    admin_url: "https://opensverige.se/showcase/admin",
  });
}
