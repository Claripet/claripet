import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Anonymous Supabase client for public catalogue reads (products, categories,
 * articles).
 *
 * Deliberately does NOT go through `lib/supabase/server.ts`: that one calls
 * `cookies()`, and a single `cookies()` call anywhere in a render marks the
 * whole route dynamic. Every storefront page reads the catalogue, so routing
 * those reads through the cookie-bound client opted the entire site out of
 * static generation — `generateStaticParams` became dead code and every request
 * paid a full SSR plus a Supabase round-trip inside the Worker.
 *
 * The catalogue is identical for every visitor, so there is nothing to read
 * from a cookie. RLS grants anon SELECT on all of these tables
 * (see supabase/migrations/002_rls.sql), so the anon key is sufficient.
 */
export function createPublicClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("placeholder")) {
    throw new Error("Supabase environment variables are missing or invalid.");
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // No session to keep: this client is per-render and never authenticates.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
