import { createBrowserClient } from "@supabase/ssr";

// `createBrowserClient` throws outright when either value is missing, and it is
// called during Next's static-generation pass too — AuthProvider builds a client
// while the root layout renders (context/AuthContext.tsx). A build without
// .env.local (CI, a clean clone) therefore crashed on every prerendered page,
// which is why the root layout used to carry `export const dynamic = "force-dynamic"`
// and nothing on the site was ever statically generated.
//
// Fall back to a syntactically valid placeholder so prerendering can complete.
// Nothing is requested during render — every Supabase call in AuthProvider runs
// from a useEffect or an event handler — and in the browser these NEXT_PUBLIC_
// values are always inlined at build time, so real credentials are used there.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function createClient() {
  // Placeholders keep the build alive but cannot authenticate anyone. If they
  // ever reach a real browser the deploy was built without its env vars, so say
  // so loudly rather than failing as a silent, permanently logged-out session.
  if (
    typeof window !== "undefined" &&
    SUPABASE_URL === "https://placeholder.supabase.co"
  ) {
    console.error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY were " +
        "missing at build time — authentication will not work in this deploy.",
    );
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
