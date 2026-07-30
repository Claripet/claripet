"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";

type Bullet = string;

/**
 * Shared full-screen split-screen shell for all auth pages
 * (login, signup, forgot/reset password). Left = brand panel + copy,
 * right = the form passed in as children. Built on the global design tokens.
 */
export function AuthShell({
  title,
  lead,
  bullets,
  children,
}: {
  title: string;
  lead: string;
  bullets?: Bullet[];
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-split">
        {/* ── Left: brand panel + copywriting ── */}
        <aside className="auth-aside">
          <div className="aside-blob blob-1" aria-hidden="true" />
          <div className="aside-blob blob-2" aria-hidden="true" />

          <div className="aside-top">
            <Link href="/" className="brand aside-brand" aria-label="ClariPet home">
              <Image src="/brand/logo-dark.png" alt="ClariPet" width={120} height={38} className="object-contain" priority />
            </Link>
          </div>

          <div className="aside-body">
            <span className="aside-paw" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="currentColor">
                <ellipse cx="20" cy="22" rx="6.5" ry="9" />
                <ellipse cx="44" cy="22" rx="6.5" ry="9" />
                <ellipse cx="10" cy="36" rx="5.5" ry="7.5" />
                <ellipse cx="54" cy="36" rx="5.5" ry="7.5" />
                <path d="M32 34c-8 0-14 6-14 13 0 5 4 8 9 8 2 0 3.5-1 5-1s3 1 5 1c5 0 9-3 9-8 0-7-6-13-14-13z" />
              </svg>
            </span>
            <h1 className="aside-title">{title}</h1>
            <p className="aside-lead">{lead}</p>

            {bullets && bullets.length > 0 && (
              <ul className="aside-points">
                {bullets.map((b) => (
                  <li key={b}>
                    <span className="point-ic"><Icon name="check" size={15} strokeWidth={3} /></span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="aside-foot">Trusted by thousands of pet parents across Indonesia</p>
        </aside>

        {/* ── Right: form area ── */}
        <section className="auth-form-side">
          <Link href="/" className="back-home">
            <Icon name="arrow-left" size={16} /> Back to home
          </Link>
          <div className="auth-form-inner">{children}</div>
        </section>
      </div>

      <style jsx global>{`
        .auth-page {
          min-height: 100vh;
          background: var(--offwhite);
          display: block;
        }
        .auth-split {
          width: 100%;
          background: #fff;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          min-height: 100vh;
        }

        /* ── Left brand panel ── */
        .auth-aside {
          position: relative;
          overflow: hidden;
          background: linear-gradient(150deg, var(--sky) 0%, var(--lavender) 55%, var(--pink) 100%);
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: var(--navy);
          isolation: isolate;
        }
        .aside-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          z-index: -1;
          pointer-events: none;
        }
        .blob-1 {
          width: 320px; height: 320px;
          top: -90px; right: -110px;
          background: radial-gradient(circle at 40% 40%, rgba(255,255,255,.55), transparent 70%);
        }
        .blob-2 {
          width: 260px; height: 260px;
          bottom: -80px; left: -70px;
          background: radial-gradient(circle at 60% 60%, rgba(255,255,255,.4), transparent 70%);
        }
        .aside-brand { display: flex; }
        .aside-body { max-width: 38ch; }
        .aside-paw {
          display: grid;
          place-items: center;
          width: 60px; height: 60px;
          border-radius: var(--r-lg);
          background: rgba(255,255,255,.55);
          backdrop-filter: blur(6px);
          color: var(--navy);
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }
        .aside-paw svg { width: 32px; height: 32px; opacity: .85; }
        .aside-title {
          font-size: clamp(26px, 3vw, 34px);
          line-height: 1.12;
          margin-bottom: 14px;
          color: var(--navy);
        }
        .aside-lead {
          font-size: 15px;
          line-height: 1.65;
          color: var(--ink);
          opacity: .85;
          margin-bottom: 26px;
        }
        .aside-points {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .aside-points li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--navy);
        }
        .point-ic {
          flex-shrink: 0;
          width: 26px; height: 26px;
          border-radius: var(--r-pill);
          background: rgba(255,255,255,.7);
          display: grid; place-items: center;
          color: var(--navy);
        }
        .aside-foot {
          font-size: 12.5px;
          color: var(--ink);
          opacity: .7;
          font-weight: 500;
        }

        /* ── Right form area ── */
        .auth-form-side {
          position: relative;
          display: grid;
          place-items: center;
          padding: 48px 40px;
        }
        .back-home {
          position: absolute;
          top: 24px;
          right: 28px;
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
        .auth-form-inner {
          width: 100%;
          max-width: 380px;
        }
        .form-head { margin-bottom: 28px; }
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

        @media (max-width: 860px) {
          .auth-split {
            grid-template-columns: 1fr;
            min-height: 100vh;
          }
          .auth-aside { display: none; }
          .auth-form-side { padding: 72px 24px 40px; align-content: center; }
          .back-home {
            top: 18px;
            left: 14px;
            right: auto;
          }
        }
      `}</style>
    </main>
  );
}
