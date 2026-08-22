// Rate limiter for Cloudflare Workers Edge and Next.js Dev/Vercel environments.
// Uses @opennextjs/cloudflare context to access Workers KV (RATE_LIMIT_KV) when in production,
// with a seamless automatic fallback to an in-memory store during local development or non-CF builds.

import { getCloudflareContext } from "@opennextjs/cloudflare";

// In-memory fallback store for local development (next dev, tests, or non-Cloudflare execution)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Read-only check: has `key` already hit `limit` in its current window?
 * Unlike rateLimit(), this never increments — used to gate an action (e.g. a
 * login attempt) BEFORE it happens, so only recording failures via a
 * separate rateLimit() call implements a failure-counted lockout instead of
 * penalizing every attempt including successful ones.
 */
export async function isRateLimited(key: string, limit: number): Promise<boolean> {
  const now = Date.now();

  try {
    const cf = getCloudflareContext();
    const kv: any = (cf?.env as any)?.RATE_LIMIT_KV;

    if (kv) {
      const data = (await kv.get(key, { type: "json" })) as
        | { count: number; resetTime: number }
        | null;
      if (!data || data.resetTime < now) return false;
      return data.count >= limit;
    }
  } catch (e) {
    // Suppress Cloudflare Context errors in dev/node environments and fall down to memory Map
  }

  const record = rateLimitStore.get(key);
  if (!record || record.resetTime < now) return false;
  return record.count >= limit;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();

  try {
    const cf = getCloudflareContext();
    const kv: any = (cf?.env as any)?.RATE_LIMIT_KV;

    if (kv) {
      const windowSec = Math.ceil(windowMs / 1000);
      const data = await kv.get(key, { type: "json" }) as { count: number; resetTime: number } | null;

      if (!data || data.resetTime < now) {
        // First request in window; set to 1 and expire slightly after window ends
        await kv.put(
          key,
          JSON.stringify({ count: 1, resetTime: now + windowMs }),
          { expirationTtl: Math.max(windowSec + 10, 60) } // Cloudflare KV requires minimum TTL of 60 seconds
        );
        return true;
      }

      if (data.count >= limit) {
        return false;
      }

      data.count += 1;
      const ttl = Math.max(Math.ceil((data.resetTime - now) / 1000) + 5, 60);
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
      return true;
    }
  } catch (e) {
    // Suppress Cloudflare Context errors in dev/node environments and fall down to memory Map
  }

  // Fallback: In-memory store (Local Dev / Tests / Standalone Node)
  if (Math.random() < 0.1) {
    for (const [k, val] of rateLimitStore.entries()) {
      if (val.resetTime < now) rateLimitStore.delete(k);
    }
  }

  const record = rateLimitStore.get(key);
  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
