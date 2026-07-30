"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";

const NAV_ITEMS = [
  { href: "/account", label: "Profile", icon: "user" as const },
  { href: "/account/orders", label: "My Orders", icon: "package" as const },
  { href: "/account/saved", label: "Saved Items", icon: "heart" as const },
  { href: "/account/rewards", label: "Rewards", icon: "award" as const },
  { href: "/account/pets", label: "My Pets", icon: "dog" as const },
  { href: "/account/recently-viewed", label: "Recently Viewed", icon: "clock" as const },
  { href: "/account/addresses", label: "Addresses", icon: "pinned" as const },
];

export function AccountShell({
  title,
  children,
  maxWidth = 980,
}: {
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <main className="section">
        <div className="wrap center">
          <div className="account-loading">
            <span className="spinner" />
            Loading your account...
          </div>
        </div>
        <style jsx>{`
          .account-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: var(--text-soft);
            padding: 60px 0;
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2.5px solid var(--line);
            border-top-color: var(--navy);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  const displayName = user.profile?.full_name || user.email?.split("@")[0] || "there";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  return (
    <main>
      <PageHead title={title} />
      <div className="wrap" style={{ maxWidth, paddingBottom: 80 }}>
        <div className="account-grid">
          <aside className="account-sidebar">
            <div className="account-user card">
              <div className="account-avatar">{initial}</div>
              <div className="account-user-info">
                <div className="account-user-name">{displayName}</div>
                <div className="account-user-email">{user.email}</div>
              </div>
            </div>
            <nav className="account-nav card">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={"account-nav-item" + (isActive(item.href) ? " active" : "")}
                >
                  <Icon name={item.icon} size={18} /> {item.label}
                </Link>
              ))}
              <button onClick={handleSignOut} className="account-nav-item signout">
                <Icon name="log-out" size={18} /> Sign Out
              </button>
            </nav>
          </aside>

          <section className="account-content">{children}</section>
        </div>
      </div>

      <style jsx>{`
        .account-grid {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 28px;
          padding-top: 12px;
          align-items: start;
        }
        .account-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: sticky;
          top: 96px;
        }
        .account-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }
        .account-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--navy);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }
        .account-user-info {
          min-width: 0;
        }
        .account-user-name {
          font-weight: 600;
          color: var(--navy);
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .account-user-email {
          font-size: 12px;
          color: var(--text-soft);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .account-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px;
        }
        .account-nav :global(.account-nav-item) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: var(--r-md);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-soft);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .account-nav :global(.account-nav-item:hover) {
          background: var(--mist);
          color: var(--navy);
        }
        .account-nav :global(.account-nav-item.active) {
          background: var(--navy);
          color: #fff;
        }
        .account-nav :global(.account-nav-item.signout) {
          margin-top: 6px;
          border-top: 1px solid var(--line);
          border-radius: 0 0 var(--r-md) var(--r-md);
        }
        .account-nav :global(.account-nav-item.signout:hover) {
          background: var(--pink-50);
          color: #b04050;
        }
        @media (max-width: 760px) {
          .account-grid {
            grid-template-columns: 1fr;
          }
          .account-sidebar {
            position: static;
          }
          .account-nav {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .account-nav :global(.account-nav-item) {
            width: auto;
          }
          .account-nav :global(.account-nav-item.signout) {
            margin-top: 0;
            border-top: none;
            border-radius: var(--r-md);
          }
        }
      `}</style>
    </main>
  );
}
