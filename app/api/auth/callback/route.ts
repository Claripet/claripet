import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth / email-confirmation callback.
 * Supabase redirects here with a ?code=... parameter.
 *
 * Security: the `next` parameter is validated to be a same-origin relative
 * path to prevent open-redirect attacks (e.g. ?next=https://evil.com).
 */

/** Accept only relative paths that start with / and contain no protocol. */
function isSafeRedirectPath(value: string): boolean {
  // Must start with a single slash (not //host or protocol://)
  return /^\/[^/\\]/.test(value) || value === "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";

  // Sanitise: fall back to "/" if the value is not a safe relative path
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
