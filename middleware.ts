import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const IS_CONFIGURED =
  SUPABASE_URL.length > 10 && !SUPABASE_URL.includes("placeholder");

// /checkout belongs here: POST /api/orders calls requireUser(), so a guest who
// fills in the whole address form and picks a courier — burning a paid
// RajaOngkir quote on the way — only discovers they are signed out when the pay
// button throws a raw English "Unauthorized" alert. Gating the page sends them
// to /login?redirect=/checkout and back, before any of that work is wasted.
const PROTECTED_PATHS = ["/account", "/admin", "/checkout"];
const CALLBACK_PATH = "/api/auth/callback";

/**
 * True when this request is an OAuth / email-link landing carrying a PKCE code.
 *
 * Supabase falls back to the project's Site URL when the `redirectTo` we asked
 * for is not in the dashboard allow-list, so the code can arrive on ANY path
 * (typically `/?code=...`) instead of our callback route. We detect that here
 * and forward it so the session is still exchanged.
 *
 * The PKCE verifier cookie is required as corroboration: `?code=` is also a
 * plausible query name for coupons/discounts, and we must not hijack those.
 */
function isStrayAuthCode(request: NextRequest): boolean {
  if (!request.nextUrl.searchParams.has("code")) return false;
  if (request.nextUrl.pathname === CALLBACK_PATH) return false;
  return request.cookies
    .getAll()
    .some((c) => c.name.endsWith("-auth-token-code-verifier"));
}

export async function middleware(request: NextRequest) {
  // 0. www -> apex. Both hostnames point at this same Worker (two Cloudflare
  //    Custom Domain routes), so www would otherwise serve every page as a
  //    live duplicate of the apex — which is what SITE_URL, the sitemap and
  //    every canonical/JSON-LD url already assume is the one true host.
  //    Runs before the Supabase gate below so it also applies when Supabase
  //    isn't configured (e.g. a preview deploy).
  if (request.nextUrl.hostname === "www.claripetcare.com") {
    const url = request.nextUrl.clone();
    url.hostname = "claripetcare.com";
    return NextResponse.redirect(url, 308);
  }

  // If Supabase is not configured, pass through
  if (!IS_CONFIGURED) return NextResponse.next({ request });

  // 1. Rescue a stray auth code: send it to the callback, remembering where
  //    the user was meant to land (the path they arrived on, minus `code`).
  if (isStrayAuthCode(request)) {
    const stripped = request.nextUrl.clone();
    stripped.searchParams.delete("code");
    const nextPath = `${stripped.pathname}${stripped.search}`;

    const callback = request.nextUrl.clone();
    callback.pathname = CALLBACK_PATH;
    callback.search = "";
    callback.searchParams.set("code", request.nextUrl.searchParams.get("code")!);
    callback.searchParams.set("next", nextPath);
    return NextResponse.redirect(callback);
  }

  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  // 2. Public pages need no session check — skip the Supabase round-trip.
  //    The browser client refreshes sessions on its own for client-side state.
  if (!isProtected) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — IMPORTANT: do not remove this line
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes: redirect to / if user is not admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  /*
   * Runs on every page request so a stray `?code=` can be rescued wherever
   * Supabase drops it. Static assets, image optimisation and API routes are
   * excluded — the callback route handles its own exchange.
   */
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
