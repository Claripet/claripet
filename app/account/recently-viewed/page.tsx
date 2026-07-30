"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function RecentlyViewedPage() {
  return (
    <AccountShell title="Recently Viewed">
      <RecentList />
    </AccountShell>
  );
}

function RecentList() {
  const { user, loading: authLoading } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Step 1: fetch the ordered slug list
    const rRes = await fetch("/api/recently-viewed");
    const r = await rRes.json();
    const slugList: string[] = r.success ? r.data : [];
    setSlugs(slugList);

    // Step 2: fetch only those specific products (not the entire catalogue)
    if (slugList.length > 0) {
      const pRes = await fetch(`/api/products?slugs=${encodeURIComponent(slugList.join(","))}`);
      const p = await pRes.json();
      if (p.success) setProducts(p.data.products);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user, load]);

  if (loading) return <p className="muted">Loading…</p>;

  const items = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="ec"><Icon name="clock" size={32} /></div>
        <h3 className="h3" style={{ marginBottom: 8 }}>Nothing here yet</h3>
        <p className="muted" style={{ marginBottom: 18 }}>
          Products you view will appear here so you can find them again easily.
        </p>
        <Link href="/shop" className="btn btn-primary">Start browsing</Link>
      </div>
    );
  }

  return (
    <div className="prod-grid">
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
