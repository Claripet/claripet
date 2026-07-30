/**
 * Canonical base URL for the site.
 *
 * Set NEXT_PUBLIC_SITE_URL in the production environment to the real domain
 * (e.g. https://www.claripet.com) before going live. The localhost fallback is
 * intentionally only for local development and must not reach production —
 * canonical URLs, sitemap entries, and JSON-LD `url` fields all derive from it.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  // Canonical URLs, sitemap entries, robots.txt and JSON-LD all derive from
  // SITE_URL — falling back to localhost in production silently breaks SEO.
  console.warn(
    "[ClariPet] NEXT_PUBLIC_SITE_URL is not set — canonical/SEO URLs will point to http://localhost:3000",
  );
}
