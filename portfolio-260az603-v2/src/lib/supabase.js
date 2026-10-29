import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The public site doesn't need Supabase (projects are hardcoded), so missing
// keys must not crash it. Only the admin panel depends on this client.
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). The admin panel is disabled."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
