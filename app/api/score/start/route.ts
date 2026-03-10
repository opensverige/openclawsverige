import { NextResponse } from "next/server";

import { assertIdeaInput } from "@/lib/openscore/openscore";
import { getSupabaseAdminClient } from "@/lib/openscore/server-clients";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const authorizationHeader = request.headers.get("authorization");
    const token = authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.slice(7).trim()
      : null;

    if (!token) {
      return NextResponse.json({ error: "du måste vara inloggad" }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "du måste vara inloggad" }, { status: 401 });
    }

    const payload = await request.json();
    const input = assertIdeaInput(payload);

    const initialEvents = [
      `Idé mottagen: ${new Date().toISOString()}`,
      "Köad för research",
    ];

    const { data, error } = await supabase
      .from("openscore_score_jobs")
      .insert({
        user_id: user.id,
        idea: input.idea,
        status: "queued",
        status_message: "Köad för research...",
        progress_events: initialEvents,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw error ?? new Error("missing job id");
    }

    return NextResponse.json({ jobId: data.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "kunde inte starta körningen" }, { status: 400 });
  }
}
