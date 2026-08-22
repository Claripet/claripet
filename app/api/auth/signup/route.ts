import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { verifyTurnstile } from "@/lib/helpers/turnstile";
import { logSecurityEvent } from "@/lib/helpers/securityLog";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 3 requests per minute
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !(await rateLimit(`signup_${ip}`, 3, 60 * 1000))) {
    return error("Too many signup attempts. Please try again later.", 429);
  }

  const body = await req.json();
  const { email, password, full_name, turnstileToken } = signupSchema.parse(body);

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    await logSecurityEvent("bot_check_failed", { route: "signup", ip });
    return error("Bot verification failed. Please try again.", 400);
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      // Confirmation links must land on the callback route so the session
      // is exchanged; without this Supabase uses the project Site URL and
      // the code arrives on a page that cannot consume it.
      emailRedirectTo: `${new URL(req.url).origin}/api/auth/callback?next=%2F`,
    },
  });

  if (authError) {
    return error(authError.message, 400);
  }

  return ok({ user: data.user }, 201);
});
