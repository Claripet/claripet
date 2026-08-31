"use client";

import { useEffect } from "react";

/**
 * Landing page for the Google sign-in popup, and nothing else.
 *
 * The popup's journey ends here: Google -> Supabase -> /api/auth/callback
 * (which exchanges the PKCE code and sets the session cookies on this origin)
 * -> here. By the time this renders the user is signed in, so all that is left
 * is to tell the opener and get out of the way.
 *
 * Cookies are set for the whole origin, so the opener already has the session —
 * it just needs to be told to re-read it, which is what the message triggers.
 */
export const dynamic = "force-static";

export default function PopupDone() {
  useEffect(() => {
    const message = { type: "claripet:google-auth", ok: true };

    try {
      // targetOrigin is our own origin, never "*": this message is the signal
      // to treat the user as signed in, and must not be readable by any other
      // window that happens to be listening.
      window.opener?.postMessage(message, window.location.origin);
    } catch {
      // Opener gone (user closed the tab mid-flow) — closing is still correct.
    }

    window.close();
  }, []);

  // Shown only in the ~instant before close, or if the browser refuses to close
  // a window it did not script-open.
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p>Berhasil masuk. Anda dapat menutup jendela ini.</p>
    </main>
  );
}
