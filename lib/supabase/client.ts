import { createBrowserClient } from "@supabase/ssr";

// `createBrowserClient` throws outright when either value is missing, and it is
// called during Next's static-generation pass too — AuthProvider builds a client
// while the root layout renders (context/AuthContext.tsx). A build without
// .env.local (CI, a clean clone) therefore crashed on every prerendered page,
// which is why the root layout used to carry `export const dynamic = "force-dynamic"`
// and nothing on the site was ever statically generated.
//
// Fall back to a syntactically valid placeholder so prerendering can complete in
// development and in test runs. Nothing is requested during render — every
// Supabase call in AuthProvider runs from a useEffect or an event handler.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// A production build that falls back to the placeholder inlines it into the
// client bundle, and the browser then sends people to
// https://placeholder.supabase.co/auth/v1/authorize — sign-in dies on DNS with
// nothing but a console message to explain it. These values cannot be corrected
// after the fact: `NEXT_PUBLIC_*` is substituted at compile time, so the only
// fix is a rebuild. Break the build instead of shipping that artifact.
//
// `next dev`, `vitest` and a clean clone keep the placeholder and stay runnable;
// only `next build` (which sets NODE_ENV=production) is gated. On Cloudflare
// Workers Builds these must be set as *build* variables — a wrangler.jsonc
// `var` or a runtime secret arrives long after the substitution has happened.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  throw new Error(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are " +
      "missing from the build environment. They are inlined at compile time, " +
      "so a build without them ships a site where authentication can never " +
      "work. Set them as build-time variables (Cloudflare: Settings → Build → " +
      "Variables and Secrets) and rebuild.",
  );
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
