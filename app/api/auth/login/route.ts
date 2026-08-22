import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit, isRateLimited } from "@/lib/helpers/rateLimit";
import { verifyTurnstile } from "@/lib/helpers/turnstile";
import { logSecurityEvent } from "@/lib/helpers/securityLog";

// Account lockout: 5 failed attempts against one email locks it for 15
// minutes. Checked via isRateLimited() (read-only) before every attempt so a
// successful sign-in never itself counts as a "use" of the budget; only a
// failed attempt below calls rateLimit() to actually record one.
const LOCKOUT_LIMIT = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 5 requests per minute per IP
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !(await rateLimit(`login_${ip}`, 5, 60 * 1000))) {
    return error("Too many login attempts. Please try again later.", 429);
  }

  const body = await req.json();
  const { email, password, turnstileToken } = loginSchema.parse(body);
  const emailKey = `login_email_${email.trim().toLowerCase()}`;

  if (await isRateLimited(emailKey, LOCKOUT_LIMIT)) {
    await logSecurityEvent("account_lockout_blocked", { email, ip });
    return error("Too many failed attempts on this account. Please try again later.", 429);
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    await logSecurityEvent("bot_check_failed", { route: "login", ip });
    return error("Bot verification failed. Please try again.", 400);
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    await rateLimit(emailKey, LOCKOUT_LIMIT, LOCKOUT_WINDOW_MS);
    await logSecurityEvent("login_failed", { email, ip });
    return error(authError.message, 401);
  }

  return ok({
    user: data.user,
    session: data.session,
  });
});
