// Nonce-based Content Security Policy for the signed-in pages (/checkout,
// /account, /admin). The site-wide policy in next.config.mjs keeps
// 'unsafe-inline' for scripts because the public pages are statically
// prerendered and a nonce needs a per-request render. These three areas are
// per-user, already pass through the auth check in middleware on every
// request, and are rendered dynamically (see their layouts), so they can carry
// a fresh nonce instead.
//
// While STRICT_CSP_ENFORCE is false the strict policy is sent as
// Content-Security-Policy-Report-Only next to the normal policy: nothing is
// blocked, the browser console lists what WOULD be blocked. After a clean real
// payment on the live site (Snap popup, card 3DS, QRIS, GoPay), set it to true
// and the browser enforces both policies, which means the stricter one wins.
//
// Keep the host lists in step with next.config.mjs.

import { gaInlineSnippet } from "@/lib/gaSnippet";

export const STRICT_CSP_ENFORCE = false;

export const STRICT_CSP_PATHS = ["/checkout", "/account", "/admin"];

export function isStrictCspPath(pathname: string): boolean {
  return STRICT_CSP_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function strictCspHeaderName(): string {
  return STRICT_CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
}

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function sha256Base64(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  let bin = "";
  for (const b of new Uint8Array(digest)) bin += String.fromCharCode(b);
  return btoa(bin);
}

let gaHashPromise: Promise<string | null> | null = null;

function gaInlineHash(): Promise<string | null> {
  if (!gaHashPromise) {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    gaHashPromise = id ? sha256Base64(gaInlineSnippet(id)) : Promise.resolve(null);
  }
  return gaHashPromise;
}

export async function buildStrictCsp(nonce: string): Promise<string> {
  const gaHash = await gaInlineHash();
  const scriptSrc = [
    "script-src 'self'",
    `'nonce-${nonce}'`,
    gaHash ? `'sha256-${gaHash}'` : "",
    "https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/gsi/client https://challenges.cloudflare.com https://www.googletagmanager.com",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
    "img-src 'self' data: https://*.supabase.co https://api.sandbox.midtrans.com https://api.midtrans.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/gsi/ https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
    "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://accounts.google.com/ https://challenges.cloudflare.com",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "report-uri /api/csp-report",
  ].join("; ");
}
