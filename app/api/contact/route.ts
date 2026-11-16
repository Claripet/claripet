import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/helpers/clientIp";
import { contactMessageSchema } from "@/lib/validators/contact";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { stripDangerousMarkup } from "@/lib/helpers/sanitize";
import { verifyTurnstile } from "@/lib/helpers/turnstile";
import { logSecurityEvent } from "@/lib/helpers/securityLog";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 5 submissions per 10 minutes per IP — this endpoint is public/unauthenticated.
  const ip = getClientIp(req);
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

  // No .select() after the insert: reading the row back needs a SELECT policy,
  // and contact_messages only grants SELECT to admins (012), so for every
  // ordinary visitor the insert-and-return failed RLS and the form showed an
  // error. The visitor never needs the stored row anyway.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_messages").insert(input);

  if (dbError) return error("Gagal mengirim pesan. Silakan coba lagi.", 500);
  return ok({ sent: true }, 201);
});
