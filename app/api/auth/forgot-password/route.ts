import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { verifyTurnstile } from "@/lib/helpers/turnstile";
import { logSecurityEvent } from "@/lib/helpers/securityLog";

/**
 * POST /api/auth/forgot-password
 *
 * Previously context/AuthContext.tsx called supabase.auth.resetPasswordForEmail
 * directly from the browser client, bypassing every app-level rate limit.
 * Routing it through this endpoint gives it the same IP-based limiting and
 * bot-check every other public auth route already has.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !(await rateLimit(`forgot_pw_${ip}`, 3, 10 * 60 * 1000))) {
    return error("Too many requests. Please try again later.", 429);
  }

  const body = await req.json();
  const { email, turnstileToken } = forgotPasswordSchema.parse(body);

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    await logSecurityEvent("bot_check_failed", { route: "forgot-password", ip });
    return error("Bot verification failed. Please try again.", 400);
  }

  const redirectTo = `${new URL(req.url).origin}/api/auth/callback?next=%2Freset-password`;

  const supabase = await createClient();
  // Deliberately ignore the specific Supabase error (e.g. "user not found")
  // in the response — surfacing it would let a caller enumerate registered
  // emails. The forgot-password page already shows a generic "if an account
  // exists..." message regardless of outcome.
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return ok({ message: "If an account exists, a reset link has been sent." });
});
