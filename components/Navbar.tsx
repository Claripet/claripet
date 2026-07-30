"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/data/categories";

const SearchOverlay = dynamic(
  () => import("@/components/SearchOverlay").then((mod) => mod.SearchOverlay),
  { ssr: false },
);

const NAV_ITEMS = [
  { label: "Shop", href: "/shop" },
  { label: "Pet Care Journal", href: "/journal" },
  { label: "About Us", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const shopRef = useRef<HTMLDivElement | null>(null);
  const shopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenu(false);
    setAccount(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccount(false);
      }
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        setAccount(false);
        setShopOpen(false);
        setSearch(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Hover open/close with a small close delay so moving the cursor from the
  // trigger to the menu doesn't dismiss it.
  const openShop = () => {
    if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
    setShopOpen(true);
  };
  const closeShopSoon = () => {
    if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
    shopCloseTimer.current = setTimeout(() => setShopOpen(false), 140);
  };

  const handleSignOut = async () => {
    await signOut();
    setAccount(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  useEffect(() => {
    if (menu || search) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, search]);

  return (
    <header className={"nav" + (scrolled ? " scrolled" : "") + (menu ? " menu-open" : "")}>
      <div className="wrap nav-inner">
        <Link className="brand" href="/" aria-label="ClariPet home">
          <Image src="/brand/logo-dark.png" alt="ClariPet" width={80} height={26} className="object-contain" priority />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {NAV_ITEMS.map((n) =>
            n.href === "/shop" ? (
              <div
                key={n.href}
                className="nav-dropdown"
                ref={shopRef}
                onMouseEnter={openShop}
                onMouseLeave={closeShopSoon}
              >
                <Link
                  className={"nav-link" + (isActive(n.href) ? " active" : "")}
                  href={n.href}
                  aria-haspopup="true"
                  aria-expanded={shopOpen}
                  onClick={() => setShopOpen(false)}
                >
                  {n.label}
                  <Icon name="chevDown" size={15} />
                </Link>
                {shopOpen && (
                  <div className="shop-menu" role="menu">
                    <Link href="/shop" className="shop-menu-link" role="menuitem">
                      All Products
                    </Link>
                    <div className="shop-menu-sep" />
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop/${c.slug}`}
                        className="shop-menu-link"
                        role="menuitem"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={n.href} className={"nav-link" + (isActive(n.href) ? " active" : "")} href={n.href}>
                {n.label}
              </Link>
            ),
          )}
        </nav>
          <div className="nav-actions">
            <button className="icon-btn" aria-label="Search" onClick={() => setSearch(true)}>
              <Icon name="search" size={21} />
            </button>
            <div className="account-wrap desktop-only" ref={accountRef}>
              <button
                className="icon-btn"
                aria-label="Account"
                aria-expanded={account}
                onClick={() => setAccount((v) => !v)}
              >
                <Icon name="user" size={21} />
              </button>
              {account && (
                <div className="account-menu wide">
                  {user ? (
                    <>
                      <div className="account-head">
                        <div className="account-name">
                          {user.profile?.full_name || "Account"}
                        </div>
                        <div className="account-email">{user.email}</div>
                      </div>
                      <div className="account-grid">
                        <div className="account-column">
                          <Link href="/account" className="account-link">
                            <Icon name="user" size={17} /> Profile
                          </Link>
                          <Link href="/account/saved" className="account-link">
                            <Icon name="heart" size={17} /> Saved Items
                          </Link>
                          <Link href="/account/pets" className="account-link">
                            <Icon name="paw" size={17} /> My Pets
                          </Link>
                          <Link href="/account/addresses" className="account-link">
                            <Icon name="pinned" size={17} /> Addresses
                          </Link>
                        </div>
                        <div className="account-column">
                          <Link href="/account/orders" className="account-link">
                            <Icon name="package" size={17} /> My Orders
                          </Link>
                          <Link href="/account/rewards" className="account-link">
                            <Icon name="award" size={17} /> Rewards
                          </Link>
                          <Link href="/account/recently-viewed" className="account-link">
                            <Icon name="clock" size={17} /> Recently Viewed
                          </Link>
                          <button onClick={handleSignOut} className="account-link signout">
                            <Icon name="log-out" size={17} /> Sign Out
                          </button>
                        </div>
                      </div>
                      {user.profile?.role === "admin" && (
                        <Link href="/admin" className="account-link admin-link" style={{ marginTop: 8, gridColumn: 'span 2', justifyContent: 'center', background: 'var(--mist)' }}>
                          <Icon name="dashboard" size={17} /> Admin Dashboard
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="account-link">
                        Sign In
                      </Link>
                      <Link href="/signup" className="account-link">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link className="icon-btn" aria-label={`Cart with ${count} items`} href="/cart">
              <Icon name="cart" size={21} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            <button
              className="icon-btn hamburger mobile-only"
              aria-label="Menu"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              onClick={() => setMenu(true)}
            >
              <Icon name="menu" size={21} />
            </button>
          </div>
      </div>

      {mounted && createPortal(
        <div id="mobile-menu" className={"mobile-menu" + (menu ? " open" : "")} aria-hidden={!menu}>
          <div className="scrim" onClick={() => setMenu(false)} />
          <div className="panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="panel-header">
              <Link className="brand" href="/" onClick={() => setMenu(false)} aria-label="ClariPet home">
                <Image src="/brand/logo-dark.png" alt="ClariPet" width={80} height={26} className="object-contain" />
              </Link>
              <button
                className="icon-btn"
                aria-label="Close menu"
                onClick={() => setMenu(false)}
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            <div className="panel-content">
              {user && (
                <div className="mobile-account-head">
                  <div className="mobile-account-avatar">
                    <Icon name="user" size={22} />
                  </div>
                  <div>
                    <div className="mobile-account-name">{user.profile?.full_name || "Account"}</div>
                    <div className="mobile-account-email">{user.email}</div>
                  </div>
                </div>
              )}
              <div className="mobile-nav-section-label">Browse</div>
              {NAV_ITEMS.map((n) => (
                <Link key={n.href} href={n.href} className="mobile-nav-link" onClick={() => setMenu(false)}>
                  {n.label}
                  <Icon name="arrowRight" size={17} />
                </Link>
              ))}
              <div className="mobile-nav-sep" />
              {user ? (
                <>
                  <div className="mobile-nav-section-label">Account</div>
                  <Link href="/account" className="mobile-nav-link" onClick={() => setMenu(false)}>
                    <Icon name="user" size={19} /> Profile
                  </Link>
                  <Link href="/account/orders" className="mobile-nav-link" onClick={() => setMenu(false)}>
                    <Icon name="package" size={19} /> My Orders
                  </Link>
                  <Link href="/account/saved" className="mobile-nav-link" onClick={() => setMenu(false)}>
                    <Icon name="heart" size={19} /> Saved Items
                  </Link>
                  <Link href="/account/pets" className="mobile-nav-link" onClick={() => setMenu(false)}>
                    <Icon name="paw" size={19} /> My Pets
                  </Link>
                  <Link href="/account/addresses" className="mobile-nav-link" onClick={() => setMenu(false)}>
                    <Icon name="pinned" size={19} /> Addresses
                  </Link>
                  {user.profile?.role === "admin" && (
                    <Link href="/admin" className="mobile-nav-link" onClick={() => setMenu(false)}>
                      <Icon name="dashboard" size={19} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="mobile-nav-link signout-btn"
                  >
                    <Icon name="log-out" size={19} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="mobile-auth-actions">
                  <Link href="/login" className="btn btn-outline" onClick={() => setMenu(false)} style={{ width: '100%', textAlign: 'center', padding: '14px' }}>
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn btn-primary" onClick={() => setMenu(false)} style={{ width: '100%', textAlign: 'center', padding: '14px' }}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      {search && <SearchOverlay open={search} onClose={() => setSearch(false)} />}
    </header>
  );
}
