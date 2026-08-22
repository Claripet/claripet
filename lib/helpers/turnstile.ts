/**
 * Server-side verification for Cloudflare Turnstile (bot protection on
 * login/signup/contact/forgot-password).
 *
 * TURNSTILE_SECRET_KEY is optional on purpose: local dev and any deploy
 * that hasn't provisioned a Turnstile site yet must keep working, so an
 * unset secret skips verification (logged once) rather than locking every
 * form. Set it in production to actually enforce the check.
 */
export async function verifyTurnstile(token: string | null | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping bot-check verification");
    return true;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification request failed", err);
    return false;
  }
}
