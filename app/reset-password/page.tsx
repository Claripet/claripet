"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Kata sandi minimal harus 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Kata sandi tidak cocok");
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell>
        <div className="center">
          <div className="auth-success-icon">
            <Icon name="check" size={36} strokeWidth={3} />
          </div>
          <h2 className="h2" style={{ marginBottom: 12 }}>Kata sandi diperbarui</h2>
          <p className="muted">Kata sandi Anda telah berhasil diubah.</p>
          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 28 }}
            onClick={() => {
              router.push("/login");
              router.refresh();
            }}
          >
            Lanjut ke Halaman Masuk
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="form-head">
        <h2 className="h2">Kata Sandi Baru</h2>
        <p className="muted">Masukkan dan konfirmasi kata sandi baru Anda</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <Icon name="alert-circle" size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">Kata Sandi Baru</label>
          <div className="pw-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              autoFocus
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

        <div className="form-group">
          <label htmlFor="confirm">Konfirmasi Kata Sandi</label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Masukkan ulang kata sandi Anda"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading}
        >
          {loading ? "Memperbarui..." : "Perbarui Kata Sandi"}
        </button>
      </form>

      <p className="auth-footer">
        <Link href="/login">Kembali ke halaman masuk</Link>
      </p>
    </AuthShell>
  );
}
