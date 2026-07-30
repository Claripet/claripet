// In-memory rate limiter for Edge/Serverless environments.
// For multi-instance deployments, use Upstash Redis, but this provides excellent
// baseline protection on platforms like Vercel/Cloudflare.

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up expired records randomly (10% chance) to prevent memory leaks
  if (Math.random() < 0.1) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (val.resetTime < now) rateLimitStore.delete(key);
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Blocked
  }

  record.count++;
  return true; // Allowed
}