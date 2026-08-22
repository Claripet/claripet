"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AuthShell } from "@/components/auth/AuthShell";
import { Turnstile } from "@/components/auth/Turnstile";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await requestPasswordReset(email, turnstileToken);
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
      <AuthShell>
        <div className="center">
          <div className="auth-success-icon">
            <Icon name="check" size={36} strokeWidth={3} />
          </div>
          <h2 className="h2" style={{ marginBottom: 12 }}>Periksa email Anda</h2>
          <p className="muted">
            Jika akun untuk <strong>{email}</strong> terdaftar, kami telah mengirim
            tautan untuk mengatur ulang kata sandi Anda. Tautan ini berlaku selama 1 jam.
          </p>
          <Link href="/login" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 28 }}>
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="form-head">
        <h2 className="h2">Atur Ulang Kata Sandi</h2>
        <p className="muted">Kami akan mengirimkan tautan pengaturan ulang yang aman ke email Anda</p>
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

        <Turnstile onToken={setTurnstileToken} />

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading}
        >
          {loading ? "Mengirim tautan..." : "Kirim Tautan Reset"}
        </button>
      </form>

      <p className="auth-footer">
        Ingat kata sandi Anda? <Link href="/login">Masuk</Link>
      </p>
    </AuthShell>
  );
}
