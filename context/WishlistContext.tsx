"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextValue {
  slugs: string[];
  add: (slug: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  toggle: (slug: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSlugs([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setSlugs(data.success ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      load();
    }
  }, [authLoading, load]);

  const add = async (slug: string) => {
    if (!user) return; // Could optionally show a toast to login
    setSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_slug: slug }),
      });
    } catch (err) {
      console.error(err);
      // Rollback on failure could be implemented here
      setSlugs((prev) => prev.filter((s) => s !== slug));
    }
  };

  const remove = async (slug: string) => {
    if (!user) return;
    setSlugs((prev) => prev.filter((s) => s !== slug));
    try {
      await fetch(`/api/wishlist?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
      // Rollback
      setSlugs((prev) => [...prev, slug]);
    }
  };

  const toggle = async (slug: string) => {
    if (slugs.includes(slug)) {
      await remove(slug);
    } else {
      await add(slug);
    }
  };

  return (
    <WishlistContext.Provider value={{ slugs, add, remove, toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
