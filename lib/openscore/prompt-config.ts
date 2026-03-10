import type { SupabaseClient } from "@supabase/supabase-js";

export interface PromptTemplateRow {
  prompt_name: string;
  prompt_text: string;
  updated_at: string;
}

export async function getActivePromptTemplate(
  supabase: SupabaseClient,
): Promise<PromptTemplateRow | null> {
  const { data, error } = await supabase
    .from("openscore_prompt_templates")
    .select("prompt_name, prompt_text, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return data as PromptTemplateRow;
}

export function composePromptFromTemplate(
  template: string,
  idea: string,
): string {
  const trimmedTemplate = template.trim();
  const trimmedIdea = idea.trim();

  if (!trimmedTemplate) {
    throw new Error("empty prompt template");
  }

  if (trimmedTemplate.includes("{{IDEA}}")) {
    return trimmedTemplate.replaceAll("{{IDEA}}", trimmedIdea);
  }

  return `${trimmedTemplate}\n\nIdé att utvärdera:\n${trimmedIdea}`;
}
