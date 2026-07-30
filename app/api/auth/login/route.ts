import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 5 requests per minute
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !rateLimit(`login_${ip}`, 5, 60 * 1000)) {
    return error("Too many login attempts. Please try again later.", 429);
  }

  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const supabase = createClient();
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return error(authError.message, 401);
  }

  return ok({
    user: data.user,
    session: data.session,
  });
});
