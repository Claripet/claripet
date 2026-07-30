"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

/**
 * Mobile-only bottom navigation bar.
 * Tabs: Home, Shop, Search (opens SearchOverlay), Cart (with badge), Account.
 * Hides on scroll-down, shows on scroll-up for maximum content space.
 * Hidden on auth pages.
 */

const HIDE_ON = ["/login", "/signup", "/forgot-password", "/reset-password", "/admin", "/checkout", "/cart"];

// Routes where pages have their own sticky bottom bar
const HIDE_PREFIXES = ["/product/"];

export function BottomNav({ onSearchOpen }: { onSearchOpen: () => void }) {
  const pathname = usePathname();
  const { count } = useCart();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  const isHidden = HIDE_ON.some((r) => pathname === r || pathname.startsWith(`${r}/`)) || HIDE_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 50) {
        setVisible(true);
      } else if (y > lastY.current + 8) {
        setVisible(false);
      } else if (y < lastY.current - 8) {
        setVisible(true);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isHidden) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav
      className={"bottom-nav" + (visible ? "" : " hidden")}
      aria-label="Mobile navigation"
    >
      <Link href="/" className={"bnav-item" + (pathname === "/" ? " active" : "")}>
        <Icon name="home" size={22} />
        <span>Home</span>
      </Link>
      <Link href="/shop" className={"bnav-item" + (isActive("/shop") ? " active" : "")}>
        <Icon name="grid" size={22} />
        <span>Shop</span>
      </Link>
      <button className="bnav-item" onClick={onSearchOpen} aria-label="Search products">
        <Icon name="search" size={22} />
        <span>Search</span>
      </button>
      <Link
        href="/cart"
        className={"bnav-item" + (isActive("/cart") || isActive("/checkout") ? " active" : "")}
      >
        <div className="bnav-cart-wrap">
          <Icon name="cart" size={22} />
          {count > 0 && <span className="bnav-badge">{count}</span>}
        </div>
        <span>Cart</span>
      </Link>
      <Link href="/account" className={"bnav-item" + (isActive("/account") ? " active" : "")}>
        <Icon name="user" size={22} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
