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
  return /^\/[^/\\]/.test(value) || value === "/" ? value : "/";
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  const { user, loading: authLoading, signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  if (authLoading) {
    return (
      <main className="auth-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="center">
          <div style={{ width: 40, height: 40, border: "3px solid var(--line)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spinner .6s linear infinite", margin: "0 auto 16px" }} />
          <p className="muted">Memuat…</p>
        </div>
      </main>
    );
  }
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter");
      setLoading(false);
      return;
    }

    const { error: err } = await signUp(email, password, fullName);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthShell>
        <div className="center">
          <div className="auth-success-icon">
            <Icon name="check" size={36} strokeWidth={3} />
          </div>
          <h2 className="h2" style={{ marginBottom: 12 }}>Periksa email Anda</h2>
          <p className="muted">
            Kami telah mengirim tautan konfirmasi ke <strong>{email}</strong>. Klik
            tautan tersebut untuk mengaktifkan akun Anda.
          </p>
          <Link href="/login" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 28 }}>
            Ke Halaman Masuk
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="form-head">
        <h2 className="h2">Buat akun</h2>
        <p className="muted">Bergabunglah dengan keluarga ClariPet</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {error}
        </div>
      )}

      <GoogleButton redirectPath={redirect} label="Daftar dengan Google" />

      <div className="auth-divider">atau daftar dengan email</div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="fullName">Nama Lengkap</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Anda"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Kata Sandi</label>
          <div className="pw-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
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
          {loading ? "Membuat akun..." : "Buat Akun"}
        </button>
      </form>

      <p className="auth-footer">
        Sudah punya akun?{" "}
        <Link href={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>Masuk</Link>
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="section"><div className="wrap center">Memuat…</div></main>}>
      <SignupForm />
    </Suspense>
  );
}
