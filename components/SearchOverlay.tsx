"use client";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import type { Product } from "@/lib/types";

// FIXED: mobile search — auto-focus, input attrs, clear button, tap targets, dvh
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/products?limit=100")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setProducts(json.data.products);
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ("");
      // 100ms timeout required on iOS Safari to let the overlay finish rendering
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = q.trim()
    ? products.filter((p) =>
        `${p.name} ${p.subtitle || ""} ${p.categoryName || ""}`.toLowerCase().includes(q.toLowerCase()),
      )
    : products.filter((p) => p.bestSeller);

  // Eliminate dummy colourful placeholder photos completely from the UI
  // and force the app to display only real photos, if any are available.
  const displayImage = (p: Product) => {
     if (p.images && p.images.length > 0 && p.images[0].url) return p.images[0];
     return null;
  }

  const goTo = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  return (
    <div className={"search-overlay" + (open ? " open" : "")} onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()}>
          <div className="search-field">
          <Icon name="search" className="muted" size={20} />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Products..."
            aria-label="Search products"
          />
          <button className="icon-btn" aria-label="Close search" onClick={onClose} style={{ marginLeft: 'auto' }}>
            <Icon name="close" size={21} />
          </button>
        </div>
        <div className="search-results">
          {!q.trim() && (
            <div
              className="search-empty"
              style={{
                padding: "14px 12px 4px",
                textAlign: "left",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".06em",
                textTransform: "uppercase",
              }}
            >
              Popular products
            </div>
          )}
          {results.length === 0 && <div className="search-empty">No products match “{q}”.</div>}
          {results.map((p) => (
            <div key={p.slug} className="search-result" onClick={() => goTo(p.slug)} role="link" tabIndex={0}>
              <div className="thumb">
                {displayImage(p) ? (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image src={displayImage(p)!.url} alt={displayImage(p)!.alt || p.name} fill style={{ objectFit: "cover" }} sizes="64px" />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="image" size={20} className="muted" />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>{p.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {p.categoryName} · {formatPrice(p.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
