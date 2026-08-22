import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * OAuth / email-confirmation callback.
 *
 * Supabase redirects here with either:
 *   ?code=...                 — PKCE flow (Google sign-in, password recovery)
 *   ?token_hash=...&type=...  — email link flow (signup confirm, magic link)
 *   ?error=...                — the provider or Supabase rejected the attempt
 *
 * Security: the `next` parameter is validated to be a same-origin relative
 * path to prevent open-redirect attacks (e.g. ?next=https://evil.com).
 */

/** Accept only relative paths that start with / and contain no protocol. */
function isSafeRedirectPath(value: string): boolean {
  // Must start with a single slash (not //host or protocol://)
  return /^\/[^/\\]/.test(value) || value === "/";
}

/**
 * The public base URL to redirect back to.
 *
 * Behind a proxy (Vercel, nginx) `request.url` carries the internal host, which
 * would bounce the user to an unreachable address, so the forwarded host wins.
 */
function resolveBaseUrl(request: NextRequest, requestOrigin: string): string {
  if (process.env.NODE_ENV === "development") return requestOrigin;
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const base = resolveBaseUrl(request, origin);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  const rawNext = searchParams.get("next") ?? "/";

  // Sanitise: fall back to "/" if the value is not a safe relative path
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/";

  const failure = (reason: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(reason)}`);

  // The provider (or Supabase) already rejected this attempt — surface why.
  if (providerError) return failure(providerError);

  if (!code && !tokenHash) {
    return failure("Missing authentication code. Please sign in again.");
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failure(error.message);
    return NextResponse.redirect(`${base}${next}`);
  }

  const { error } = await supabase.auth.verifyOtp({
    type: type ?? "email",
    token_hash: tokenHash!,
  });
  if (error) return failure(error.message);
  return NextResponse.redirect(`${base}${next}`);
}
