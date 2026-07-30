"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

const Footer = dynamic(() => import("@/components/Footer").then((mod) => mod.Footer));
const BottomNav = dynamic(() => import("@/components/BottomNav").then((mod) => mod.BottomNav), { ssr: false });
const CartConfirmSheet = dynamic(() => import("@/components/CartConfirmSheet").then((mod) => mod.CartConfirmSheet), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/SearchOverlay").then((mod) => mod.SearchOverlay), { ssr: false });

// Routes that render full-screen without the global navbar/footer.
const BARE_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isBare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
      <BottomNav onSearchOpen={() => setSearchOpen(true)} />
      <CartConfirmSheet />
      {searchOpen && <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
