import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Best-effort, persistent record of security-relevant events (failed logins,
 * lockouts, CSRF/origin blocks, webhook signature failures, bot-check
 * failures) — console output alone doesn't survive past whatever log
 * retention the host gives you. Never throws: a logging failure must not
 * break the request it's observing.
 */
export async function logSecurityEvent(
  eventType: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("security_events").insert({
      event_type: eventType,
      detail,
    });
  } catch (err) {
    console.error("[security_events] failed to log", eventType, err);
  }
}
