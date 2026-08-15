"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";

/**
 * Shared centered-card shell for all auth pages
 * (login, signup, forgot/reset password). Built on the global design tokens.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <Link href="/" className="back-home">
        <Icon name="arrow-left" size={16} /> Back to home
      </Link>

      <div className="auth-center">
        <Link href="/" className="auth-logo-link" aria-label="ClariPet home">
          <Image src="/brand/logo-dark.png" alt="ClariPet" width={128} height={41} className="object-contain" priority />
        </Link>

        <div className="auth-card">{children}</div>
      </div>

      <style jsx global>{`
        .auth-page {
          position: relative;
          min-height: 100vh;
          background: var(--page);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 40px;
        }
        .auth-center {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .auth-logo-link {
          display: inline-flex;
          margin-bottom: 28px;
        }
        .auth-card {
          width: 100%;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: var(--r-lg);
          box-shadow: var(--shadow-md);
          padding: 36px 32px;
        }
        .back-home {
          position: absolute;
          top: 24px;
          left: 28px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-soft);
          padding: 8px 14px;
          border-radius: var(--r-pill);
          transition: color .2s, background .2s;
        }
        .back-home:hover { color: var(--navy); background: var(--mist); }
        .form-head { margin-bottom: 28px; text-align: center; }
        .form-head h2 { margin-bottom: 8px; }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--pink-50);
          color: #b04050;
          padding: 14px 18px;
          border-radius: var(--r-md);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .auth-success {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--sage-50);
          color: #2f6b46;
          padding: 14px 18px;
          border-radius: var(--r-md);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .auth-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-form .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .auth-form .form-group label {
          font-weight: 500;
          font-size: 14px;
          color: var(--navy);
        }
        .forgot-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-soft);
        }
        .forgot-link:hover { color: var(--navy); }
        .auth-form .form-group input {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          font-family: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-form .form-group input:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(27, 42, 74, 0.08);
        }
        .pw-wrap { position: relative; }
        .pw-wrap input { padding-right: 48px !important; }
        .pw-toggle {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px; height: 36px;
          display: grid; place-items: center;
          border: none;
          background: none;
          color: var(--text-faint);
          border-radius: var(--r-pill);
          transition: color .2s, background .2s;
        }
        .pw-toggle:hover { color: var(--navy); background: var(--mist); }
        .auth-form button[type="submit"] { margin-top: 4px; }
        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-soft);
        }
        .auth-footer a { color: var(--navy); font-weight: 600; }
        .auth-footer a:hover { text-decoration: underline; }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 20px 0;
          color: var(--text-faint);
          font-size: 13px;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .auth-success-icon {
          width: 72px; height: 72px;
          border-radius: var(--r-pill);
          background: var(--sage);
          color: var(--navy);
          display: grid; place-items: center;
          margin: 0 auto 22px;
        }

        @media (max-width: 480px) {
          .auth-page { padding: 72px 16px 32px; }
          .auth-card { padding: 28px 22px; }
          .back-home { top: 18px; left: 14px; }
        }
      `}</style>
    </main>
  );
}
