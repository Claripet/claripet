import { createClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validators/contact";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { stripDangerousMarkup } from "@/lib/helpers/sanitize";
import { verifyTurnstile } from "@/lib/helpers/turnstile";
import { logSecurityEvent } from "@/lib/helpers/securityLog";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 5 submissions per 10 minutes per IP — this endpoint is public/unauthenticated.
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !(await rateLimit(`contact_${ip}`, 5, 10 * 60 * 1000))) {
    return error("Too many messages sent. Please try again later.", 429);
  }

  const body = await req.json();
  const { turnstileToken, ...input } = contactMessageSchema.parse(body);

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    await logSecurityEvent("bot_check_failed", { route: "contact", ip });
    return error("Bot verification failed. Please try again.", 400);
  }

  input.name = stripDangerousMarkup(input.name);
  input.subject = stripDangerousMarkup(input.subject);
  input.message = stripDangerousMarkup(input.message);

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("contact_messages")
    .insert(input)
    .select()
    .single();

  if (dbError) return error(dbError.message, 500);
  return ok(data, 201);
});
