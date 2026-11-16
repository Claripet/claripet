/**
 * The caller's IP address, for rate limiting and security logs.
 *
 * In production every request reaches the Worker through Cloudflare, which
 * sets `cf-connecting-ip` itself and overwrites any value the client sent.
 * `x-forwarded-for` is NOT safe to key on: a client can send its own, and
 * Cloudflare appends to it rather than replacing it, so its first entry is
 * whatever the attacker wrote. Keying the rate limiter on it meant a fresh
 * fake header bought a fresh request budget (seen live on /api/contact).
 *
 * Off Cloudflare (next dev, tests) there is no trustworthy header, so this
 * returns "unknown" and callers skip IP-based limiting, as before.
 */
export function getClientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  return cf || "unknown";
}
