import { NextResponse } from "next/server";

import { mapDbRowToScoreRecord, type IdeaScoreDbRow } from "@/lib/openscore/openscore";
import { getSupabaseAdminClient } from "@/lib/openscore/server-clients";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("openscore_idea_scores")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    const items = (data ?? [])
      .map((row) => {
        try {
          return mapDbRowToScoreRecord(row as IdeaScoreDbRow);
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "kunde inte hämta historik" }, { status: 500 });
  }
}
