import "server-only";

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getSupabaseAdminClient() {
  const url = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: getRequiredEnv("OPENAI_API_KEY"),
  });
}
