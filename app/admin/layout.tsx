"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return (
      <main className="section">
        <div className="wrap center">Loading...</div>
      </main>
    );
  }

  // Middleware should redirect non-admins; defensive UI check
  if (!user || user.profile?.role !== "admin") {
    return (
      <main className="section">
        <div className="wrap center">
          <h2 className="h3">Access denied</h2>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/products", label: "Products", icon: "bag" },
    { href: "/admin/categories", label: "Categories", icon: "boxes" },
    { href: "/admin/orders", label: "Orders", icon: "package" },
    { href: "/admin/articles", label: "Journal", icon: "edit" },
    { href: "/admin/inventory", label: "Inventory", icon: "shield" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin">
            <span style={{ fontWeight: 700, fontSize: 20, color: "var(--navy)" }}>
              ClariPet
            </span>
            <span
              style={{
                fontSize: 11,
                background: "var(--lavender)",
                padding: "3px 8px",
                borderRadius: 6,
                marginLeft: 8,
                fontWeight: 600,
                color: "var(--navy)",
                verticalAlign: "middle",
              }}
            >
              ADMIN
            </span>
          </Link>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"admin-nav-item" + (isActive(item.href) ? " active" : "")}
            >
              <Icon name={item.icon} size={18} /> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <Link href="/" className="admin-nav-item">
            <Icon name="arrow-left" size={18} /> Back to Site
          </Link>
          <button onClick={handleSignOut} className="admin-nav-item signout">
            <Icon name="log-out" size={18} /> Sign Out
          </button>
        </div>
      </aside>
      <div className="admin-main">{children}</div>

      <style jsx>{`
        .admin-shell {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: calc(100vh - var(--nav-h));
        }
        .admin-sidebar {
          background: #fff;
          border-right: 1px solid var(--line);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
        }
        .admin-brand {
          padding: 0 8px 24px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 20px;
        }
        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        :global(.admin-nav-item) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
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
        :global(.admin-nav-item:hover) {
          background: var(--mist);
          color: var(--navy);
        }
        :global(.admin-nav-item.active) {
          background: var(--navy);
          color: #fff;
        }
        :global(.admin-nav-item.signout:hover) {
          background: var(--pink-50);
          color: #b04050;
        }
        .admin-main {
          padding: 32px 40px;
          background: var(--offwhite);
        }
        @media (max-width: 860px) {
          .admin-shell {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            border-right: none;
            border-bottom: 1px solid var(--line);
          }
          .admin-nav {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .admin-main {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
