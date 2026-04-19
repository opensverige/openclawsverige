import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Service role — bypasses RLS. Använd BARA i server-komponenter och API-routes.
// Exponera aldrig SUPABASE_SERVICE_ROLE_KEY till klienten.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Anon-klient för server-side SSR av publik data (RLS filtrerar automatiskt)
export function createAnonServerClient() {
  const key = process.env.NEXT_PUBLIC_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}
