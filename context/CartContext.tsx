"use client";

import {
  createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";
import { PRODUCTS } from "@/data/products";
import { mapDBProductToProduct } from "@/lib/data/mapProduct";
import { useAuth } from "@/context/AuthContext";

interface DetailedItem extends CartItem {
  product: Product;
}

interface CartContextValue {
  items: CartItem[];
  detailed: DetailedItem[];
  count: number;
  subtotal: number;
  toast: string | null;
  lastAdded: { product: Product; qty: number; size: string } | null;
  dismissLastAdded: () => void;
  add: (slug: string, size?: string, qty?: number, product?: Product) => void;
  updateQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  showToastMsg: (msg: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "claripet_cart";

// Seed the product cache with the bundled static products so they resolve
// instantly; DB-only products (e.g. added via admin) are fetched on demand.
const seedProducts = (): Record<string, Product> => {
  const map: Record<string, Product> = {};
  for (const p of PRODUCTS) map[p.slug] = p;
  return map;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<{ product: Product; qty: number; size: string } | null>(null);
  const lastAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Resolved product details keyed by slug. Seeded with static products and
  // filled in from the DB for products that aren't bundled (e.g. admin-added).
  const [products, setProducts] = useState<Record<string, Product>>(seedProducts);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergedRef = useRef(false);
  // Tracks slugs currently being fetched to avoid duplicate requests
  const fetchingRef = useRef(new Set<string>());
  // Maps `${slug}|${size}` to the DB cart_items id so updates don't refetch the cart
  const serverIds = useRef(new Map<string, number>());

  const itemKey = (slug: string, size: string) => `${slug}|${size}`;

  // Fetch a single product from the DB API and cache it. Used for slugs that
  // aren't in the static seed (e.g. products created via the admin dashboard).
  const ensureProduct = useCallback(
    async (slug: string): Promise<Product | undefined> => {
      if (!slug) return undefined;
      if (products[slug]) return products[slug];
      if (fetchingRef.current.has(slug)) return undefined;
      fetchingRef.current.add(slug);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) return undefined;
        const json = await res.json();
        if (!json.success || !json.data) return undefined;
        const product = mapDBProductToProduct(json.data);
        setProducts((prev) => ({ ...prev, [product.slug]: product }));
        return product;
      } catch {
        return undefined;
      } finally {
        fetchingRef.current.delete(slug);
      }
    },
    [products],
  );

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist guest cart to localStorage (only when not logged in)
  useEffect(() => {
    if (hydrated && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated, user]);

  // Resolve product details for any cart item whose product isn't cached yet
  // (e.g. a DB-only product restored from localStorage or the server cart).
  useEffect(() => {
    for (const item of items) {
      if (item.slug && !products[item.slug]) {
        void ensureProduct(item.slug);
      }
    }
  }, [items, products, ensureProduct]);

  // Fetch DB cart helper
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success) return;
      serverIds.current.clear();
      const serverItems: CartItem[] = (json.data as any[]).map((row) => {
        const slug = row.product?.slug ?? "";
        const size = row.size?.label ?? "";
        if (slug && size) serverIds.current.set(itemKey(slug, size), row.id);
        return { slug, size, qty: row.qty };
      });
      setItems(serverItems.filter((i) => i.slug && i.size));
    } catch {
      /* ignore */
    }
  }, []);

  // Resolve a DB cart item id from the local map, refetching once as fallback
  const resolveServerId = useCallback(
    async (slug: string, size: string): Promise<number | undefined> => {
      const key = itemKey(slug, size);
      const known = serverIds.current.get(key);
      if (known) return known;
      try {
        const res = await fetch("/api/cart");
        const json = await res.json();
        if (!json.success) return undefined;
        for (const row of json.data as any[]) {
          const s = row.product?.slug;
          const sz = row.size?.label;
          if (s && sz) serverIds.current.set(itemKey(s, sz), row.id);
        }
        return serverIds.current.get(key);
      } catch {
        return undefined;
      }
    },
    [],
  );

  // On login: merge guest cart into DB, then load server cart
  useEffect(() => {
    if (authLoading || !hydrated) return;

    if (user && !mergedRef.current) {
      mergedRef.current = true;
      (async () => {
        try {
          let guest: CartItem[] = [];
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) guest = JSON.parse(raw) as CartItem[];
          } catch {
            /* ignore */
          }

          if (guest.length > 0) {
            await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: guest }),
            });
            localStorage.removeItem(STORAGE_KEY);
          }
          await fetchServerCart();
        } catch {
          /* ignore */
        }
      })();
    }

    // On logout reset the merge guard
    if (!user) {
      mergedRef.current = false;
    }
  }, [user, authLoading, hydrated, fetchServerCart]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const add = useCallback(
    (slug: string, size?: string, qty = 1, product?: Product) => {
      // Cache the product if the caller provided it (e.g. from the shop grid)
      if (product) {
        setProducts((prev) => (prev[product.slug] ? prev : { ...prev, [product.slug]: product }));
      }

      const known = product ?? products[slug];
      const sz = size ?? (known ? known.sizes[0] ?? "" : "");

      const applyAdd = (resolvedSize: string, resolved?: Product) => {
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.slug === slug && i.size === resolvedSize);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return next;
          }
          return [...prev, { slug, size: resolvedSize, qty }];
        });
        if (resolved) showToast(`${resolved.name} added to cart`);
        if (resolved) {
          if (lastAddedTimer.current) clearTimeout(lastAddedTimer.current);
          setLastAdded({ product: resolved, qty, size: resolvedSize });
          lastAddedTimer.current = setTimeout(() => setLastAdded(null), 8000);
        }

        // Sync to DB if logged in; remember the row id for later updates
        if (user && resolvedSize) {
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_slug: slug, size_label: resolvedSize, qty }),
          })
            .then(async (res) => {
              const json = await res.json();
              if (json.success && json.data?.id) {
                serverIds.current.set(itemKey(slug, resolvedSize), json.data.id);
              }
            })
            .catch(() => {});
        }
      };

      if (known) {
        applyAdd(sz, known);
      } else {
        // Product not cached (DB-only). Fetch it so we get a valid size + name.
        void ensureProduct(slug).then((fetched) => {
          const resolvedSize = size ?? (fetched ? fetched.sizes[0] ?? "" : "");
          applyAdd(resolvedSize, fetched);
        });
      }
    },
    [showToast, user, products, ensureProduct],
  );

  const updateQty = useCallback(
    (slug: string, size: string, qty: number) => {
      const safeQty = Math.max(1, qty);
      setItems((prev) =>
        prev.map((i) => (i.slug === slug && i.size === size ? { ...i, qty: safeQty } : i)),
      );

      if (user) {
        (async () => {
          try {
            const id = await resolveServerId(slug, size);
            if (id) {
              await fetch(`/api/cart/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qty: safeQty }),
              });
            }
          } catch {
            /* ignore */
          }
        })();
      }
    },
    [user, resolveServerId],
  );

  const remove = useCallback(
    (slug: string, size: string) => {
      setItems((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)));

      if (user) {
        (async () => {
          try {
            const id = await resolveServerId(slug, size);
            if (id) {
              await fetch(`/api/cart/${id}`, { method: "DELETE" });
              serverIds.current.delete(itemKey(slug, size));
            }
          } catch {
            /* ignore */
          }
        })();
      }
    },
    [user, resolveServerId],
  );

  const clear = useCallback(() => {
    setItems([]);
    serverIds.current.clear();
    if (user) {
      fetch("/api/cart", { method: "DELETE" }).catch(() => {});
    }
  }, [user]);

  // Memoised so these values only recompute when items or products change,
  // not on every render triggered by context consumers.
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const detailed: DetailedItem[] = useMemo(
    () =>
      items
        .map((i) => ({ ...i, product: products[i.slug] }))
        .filter((i): i is DetailedItem => Boolean(i.product)),
    [items, products],
  );
  const subtotal = useMemo(
    () => detailed.reduce((s, i) => s + i.product.price * i.qty, 0),
    [detailed],
  );

  const showToastMsg = useCallback((msg: string) => {
    showToast(msg);
  }, [showToast]);

  const dismissLastAdded = useCallback(() => {
    setLastAdded(null);
    if (lastAddedTimer.current) clearTimeout(lastAddedTimer.current);
  }, []);

  return (
    <CartContext.Provider
      value={{ items, detailed, count, subtotal, toast, lastAdded, dismissLastAdded, add, updateQty, remove, clear, showToastMsg }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
export const SHIPPING_FEE = 20000;
