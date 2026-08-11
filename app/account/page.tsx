"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";

type Banner = { type: "success" | "error"; text: string } | null;

export default function AccountPage() {
  return (
    <AccountShell title="My Account">
      <ProfileSection />
      <PasswordSection />
    </AccountShell>
  );
}

function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  useEffect(() => {
    setFullName(user?.profile?.full_name ?? "");
    setPhone(user?.profile?.phone ?? "");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName.trim(), phone: phone.trim() }),
    });
    const json = await res.json();

    if (json.success) {
      await refreshUser();
      setBanner({ type: "success", text: "Profil berhasil diperbarui." });
    } else {
      setBanner({ type: "error", text: json.error ?? "Gagal memperbarui profil." });
    }
    setSaving(false);
  };

  return (
    <div className="card panel">
      <div className="panel-head">
        <Icon name="user" size={20} />
        <div>
          <h2 className="panel-title">Pengaturan Profil</h2>
          <p className="panel-sub">Perbarui informasi pribadi Anda</p>
        </div>
      </div>

      {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email ?? ""} disabled />
          <span className="hint">Email tidak dapat diubah</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama Anda"
              required
            />
          </div>
          <div className="form-group">
            <label>Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="cth. 081234567890"
            />
          </div>
        </div>

        <button className="btn btn-primary" disabled={saving} type="submit">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      <style jsx>{`
        .panel {
          padding: 28px;
          margin-bottom: 24px;
        }
        .panel-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
          color: var(--navy);
        }
        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
        }
        .panel-sub {
          font-size: 13px;
          color: var(--text-soft);
          margin: 2px 0 0;
        }
        .banner {
          padding: 12px 16px;
          border-radius: var(--r-md);
          margin-bottom: 18px;
          font-size: 14px;
        }
        .banner.success {
          background: var(--sage-50);
          color: var(--navy);
        }
        .banner.error {
          background: var(--pink-50);
          color: #b04050;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: flex-start;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          width: 100%;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
          width: 100%;
        }
        .form-group label {
          font-weight: 500;
          font-size: 14px;
          color: var(--navy);
        }
        .form-group input {
          padding: 12px 16px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .form-group input:focus {
          border-color: var(--navy);
        }
        .form-group input:disabled {
          background: var(--mist);
          color: var(--text-soft);
        }
        .hint {
          font-size: 12px;
          color: var(--text-soft);
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function PasswordSection() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    if (newPassword.length < 6) {
      setBanner({ type: "error", text: "Kata sandi baru minimal harus 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setBanner({ type: "error", text: "Kata sandi baru tidak cocok." });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Verify current password before allowing the change
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPassword,
    });

    if (verifyError) {
      setBanner({ type: "error", text: "Kata sandi saat ini salah." });
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setBanner({ type: "error", text: updateError.message });
    } else {
      setBanner({ type: "success", text: "Kata sandi berhasil diubah." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  };

  return (
    <div className="card panel">
      <div className="panel-head">
        <Icon name="shield" size={20} />
        <div>
          <h2 className="panel-title">Ubah Kata Sandi</h2>
          <p className="panel-sub">Jaga keamanan akun Anda dengan kata sandi yang kuat</p>
        </div>
      </div>

      {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

      <form onSubmit={handleChangePassword}>
        <div className="form-group">
          <label>Kata Sandi Saat Ini</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
        </div>

        <button className="btn btn-primary" disabled={saving} type="submit">
          {saving ? "Memperbarui..." : "Perbarui Kata Sandi"}
        </button>
      </form>

      <style jsx>{`
        .panel {
          padding: 28px;
        }
        .panel-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
          color: var(--navy);
        }
        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
        }
        .panel-sub {
          font-size: 13px;
          color: var(--text-soft);
          margin: 2px 0 0;
        }
        .banner {
          padding: 12px 16px;
          border-radius: var(--r-md);
          margin-bottom: 18px;
          font-size: 14px;
        }
        .banner.success {
          background: var(--sage-50);
          color: var(--navy);
        }
        .banner.error {
          background: var(--pink-50);
          color: #b04050;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: flex-start;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          width: 100%;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
          width: 100%;
        }
        .form-group label {
          font-weight: 500;
          font-size: 14px;
          color: var(--navy);
        }
        .form-group input {
          padding: 12px 16px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .form-group input:focus {
          border-color: var(--navy);
        }
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
