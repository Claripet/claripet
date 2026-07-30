"use client";

import { useState } from "react";
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

export function GoogleButton({
  redirectPath = "/",
  label = "Continue with Google",
}: {
  redirectPath?: string;
  label?: string;
}) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithGoogle(redirectPath);
    if (err) {
      setError(err);
      setLoading(false);
    }
    // On success the browser redirects to Google, so no need to reset loading.
  };

  return (
    <>
      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}
      <button
        type="button"
        className="google-btn"
        onClick={handleClick}
        disabled={loading}
      >
        <GoogleMark />
        {loading ? "Redirecting..." : label}
      </button>

      <style jsx>{`
        .google-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          font-size: 15px;
          border-radius: var(--r-pill);
          padding: 14px 26px;
          border: 1.5px solid var(--line);
          background: #fff;
          color: var(--navy);
          transition: background 0.15s var(--ease), border-color 0.15s var(--ease), transform 0.12s var(--ease);
        }
        .google-btn:hover:not(:disabled) {
          background: var(--mist);
          border-color: var(--line);
          transform: translateY(-1px);
        }
        .google-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
