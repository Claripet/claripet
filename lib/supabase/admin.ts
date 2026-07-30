import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with service-role key.
 * Bypasses RLS — use only in trusted server code (API routes, server actions).
 * NEVER expose this client or its key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes("placeholder")) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createSupabaseClient(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
