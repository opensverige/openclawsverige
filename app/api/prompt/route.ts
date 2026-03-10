import { NextResponse } from "next/server";

import { getActivePromptTemplate } from "@/lib/openscore/prompt-config";
import { getSupabaseAdminClient } from "@/lib/openscore/server-clients";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const template = await getActivePromptTemplate(supabase);

    if (!template) {
      return NextResponse.json(
        { error: "Ingen aktiv prompt finns i databasen ännu." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        prompt: template.prompt_text,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Kunde inte läsa prompt från databasen." },
      { status: 500 },
    );
  }
}
