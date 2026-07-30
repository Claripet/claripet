import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validators/auth";
import { ok, error, serverError } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 3 requests per minute
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !rateLimit(`signup_${ip}`, 3, 60 * 1000)) {
    return error("Too many signup attempts. Please try again later.", 429);
  }

  const body = await req.json();
  const { email, password, full_name } = signupSchema.parse(body);

  const supabase = createClient();
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  if (authError) {
    return error(authError.message, 400);
  }

  return ok({ user: data.user }, 201);
});
