"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

/** Google "G" multicolor logo as inline SVG. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
        };
      };
    };
  }
}

export function GoogleButton({
  redirectPath = "/",
  label = "Continue with Google",
}: {
  redirectPath?: string;
  label?: string;
}) {
  const { signInWithGoogleIdToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) return;
      setError(null);
      setLoading(true);

      try {
        const { error: err } = await signInWithGoogleIdToken(response.credential);
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }

        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("returnTo")) {
          sessionStorage.removeItem("returnTo");
        }
        window.location.assign(redirectPath);
      } catch (err) {
        console.error("[google-gis] sign in failed", err);
        setError("Gagal masuk dengan Google. Silakan coba lagi.");
        setLoading(false);
      }
    },
    [redirectPath, signInWithGoogleIdToken],
  );

  useEffect(() => {
    if (!googleClientId || typeof window === "undefined") return;

    let active = true;

    const initGis = () => {
      if (!active || !window.google?.accounts?.id || !buttonContainerRef.current) return;

      const isSignUp = label.toLowerCase().includes("daftar") || label.toLowerCase().includes("sign up");

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: isSignUp ? "signup_with" : "signin_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        });

        setReady(true);
      } catch (err) {
        console.error("[google-gis] init failed", err);
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGis();
        }
      }, 100);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }

    return () => {
      active = false;
    };
  }, [googleClientId, label, handleCredential]);

  const handleManualPrompt = () => {
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.prompt();
      } catch {
        // Optional One Tap
      }
    }
  };

  return (
    <>
      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="google-auth-box">
        {/* The Google GIS official iframe mounts here */}
        <div
          ref={buttonContainerRef}
          className="google-gis-slot"
          style={{ minHeight: 44 }}
        />

        {/* Fallback button while Google SDK initializes */}
        {!ready && (
          <button
            type="button"
            className="google-btn-loading"
            onClick={handleManualPrompt}
            disabled={loading}
          >
            <GoogleMark />
            {loading ? "Menghubungkan..." : label}
          </button>
        )}

        {loading && (
          <div className="google-loading-overlay">
            <span className="spinner-sm" /> Sedang masuk...
          </div>
        )}
      </div>

      <style jsx>{`
        .google-auth-box {
          width: 100%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 48px;
        }
        .google-gis-slot {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .google-gis-slot :global(iframe) {
          margin: 0 auto !important;
        }
        .google-btn-loading {
          position: absolute;
          inset: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          font-size: 15px;
          border-radius: var(--r-pill);
          padding: 12px 24px;
          border: 1.5px solid var(--line);
          background: #fff;
          color: var(--navy);
        }
        .google-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--navy);
          border-radius: var(--r-pill);
          z-index: 10;
        }
        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid var(--line);
          border-top-color: var(--navy);
          border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
