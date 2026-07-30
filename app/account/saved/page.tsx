"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";

export default function SavedPage() {
  return (
    <AccountShell title="Saved Items">
      <SavedList />
    </AccountShell>
  );
}

function SavedList() {
  const { slugs, remove, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      if (wishlistLoading) return;
      if (slugs.length === 0) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const pRes = await fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`);
        const p = await pRes.json();
        if (mounted && p.success) {
          setProducts(p.data.products);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProducts();
    return () => { mounted = false; };
  }, [slugs, wishlistLoading]);

  if (wishlistLoading || loading) return <p className="muted">Loading your saved items…</p>;

  const saved = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (saved.length === 0) {
    return (
      <div className="empty-state">
        <div className="ec"><Icon name="heart" size={32} /></div>
        <h3 className="h3" style={{ marginBottom: 8 }}>No saved items yet</h3>
        <p className="muted" style={{ marginBottom: 18 }}>
          Tap the heart on any product to save it here for later.
        </p>
        <Link href="/shop" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="prod-grid prod-grid-vertical">
      {saved.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
