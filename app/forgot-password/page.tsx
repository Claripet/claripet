"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await requestPasswordReset(email);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="We've got you covered."
        lead="Resetting your password is quick and secure — check your inbox to continue."
      >
        <div className="center">
          <div className="auth-success-icon">
            <Icon name="check" size={36} strokeWidth={3} />
          </div>
          <h2 className="h2" style={{ marginBottom: 12 }}>Check your email</h2>
          <p className="muted">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to
            reset your password. The link expires in 1 hour.
          </p>
          <Link href="/login" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 28 }}>
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      lead="No worries — it happens. Enter your email and we'll send you a link to set a new one."
    >
      <div className="form-head">
        <h2 className="h2">Reset password</h2>
        <p className="muted">We&apos;ll email you a secure reset link</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {error}
        </div>
      )}

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

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading}
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>
      </form>

      <p className="auth-footer">
        Remember your password? <Link href="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
