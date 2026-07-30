"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";

/** Accept only relative paths to prevent open-redirect attacks. */
function safeRedirectPath(value: string | null): string {
  if (!value) return "/";
  // Must start with a single slash — reject protocol-relative (//evil.com) and absolute URLs
  return /^\/[^/\\]/.test(value) || value === "/" ? value : "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(
    searchParams.get("redirect") || 
    (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("returnTo") : null) || 
    "/"
  );
  const alertType = searchParams.get("alert");
  const { user, loading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("returnTo")) sessionStorage.removeItem("returnTo");
      router.replace(redirect);
    }
  }, [user, redirect, router]);

  if (authLoading) {
    return (
      <main className="auth-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="center">
          <div style={{ width: 40, height: 40, border: "3px solid var(--line)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spinner .6s linear infinite", margin: "0 auto 16px" }} />
          <p className="muted">Loading…</p>
        </div>
      </main>
    );
  }
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("returnTo")) sessionStorage.removeItem("returnTo");
      router.push(redirect);
      router.refresh();
    }
  };

  const signupHref = `/signup${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

  return (
    <AuthShell
      title="Merawat hewan peliharaan seharusnya tidak terasa rumit."
      lead="Sign in to track orders, save your favorite products, and let ClariPet help you care for them with ease."
      bullets={[
        "Pet Safe Formulations - Gentle and safe for pets",
        "Premium Ingredients - Carefully selected for best results",
        "Made in Indonesia - Proudly made locally with global standards",
      ]}
    >
      <div className="form-head">
        <h2 className="h2">Welcome back</h2>
        <p className="muted">Sign in to your ClariPet account</p>
      </div>

      {alertType === "checkout" && (
        <div className="auth-alert" role="alert" style={{ background: 'var(--brand-mint)', color: 'var(--navy)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
          <Icon name="info" size={18} />
          Please sign in or create an account to proceed to checkout.
        </div>
      )}

      {error && (
        <div className="auth-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {error}
        </div>
      )}

      <GoogleButton redirectPath={redirect} label="Sign in with Google" />

      <div className="auth-divider">or sign in with email</div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <div className="label-row">
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <div className="pw-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account? <Link href={signupHref}>Create one</Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="section"><div className="wrap center">Loading…</div></main>}>
      <LoginForm />
    </Suspense>
  );
}
