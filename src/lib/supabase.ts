import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { detectSessionInUrl: true, persistSession: true } }) : null;
  return client;
}

export function accountRedirect(): string {
  const base = document.querySelector("base")?.href ?? `${window.location.origin}/`;
  return new URL("account", base).href;
}
