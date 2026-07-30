"use client";

import { useMemo, useState, useCallback } from "react";
import type { Product, Category } from "@/lib/types";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

const TRUST = [
  { icon: "shield", t: "Pet Safe", d: "Always safe and gentle" },
  { icon: "droplet", t: "Alcohol Free", d: "No harsh chemicals" },
  { icon: "pin", t: "Made in Indonesia", d: "With love and care" },
];

/** Counts every option so each checkbox can show how many products it holds. */
function tally(products: Product[], pick: (p: Product) => string[]) {
  const counts = new Map<string, number>();
  for (const p of products) for (const v of pick(p)) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function AllProductsBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [petTypes, setPetTypes] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const priceCap = useMemo(
    () => Math.max(0, ...products.map((p) => p.price)),
    [products],
  );
  const [maxPrice, setMaxPrice] = useState<number>(priceCap);

  const petFacet = useMemo(() => tally(products, (p) => p.petType ?? []), [products]);
  const concernFacet = useMemo(() => tally(products, (p) => p.concern ?? []), [products]);
  // Derived from the products themselves, not the category list: the DB and the
  // static catalogue use different slugs, so matching against `categories`
  // silently drops every product whose slug isn't in that list.
  const collectionFacet = useMemo(() => {
    const counts = new Map<string, { label: string; n: number }>();
    for (const p of products) {
      if (!p.category) continue;
      const known = categories.find((c) => c.slug === p.category);
      const label = known?.name ?? p.categoryName ?? p.category;
      const row = counts.get(p.category) ?? { label, n: 0 };
      row.n += 1;
      counts.set(p.category, row);
    }
    return [...counts.entries()]
      .map(([slug, { label, n }]) => [label, n, slug] as const)
      .sort((a, b) => b[1] - a[1]);
  }, [products, categories]);

  const toggle = useCallback(
    (arr: string[], set: (v: string[]) => void, val: string) =>
      set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]),
    [],
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (petTypes.length && !(p.petType ?? []).some((t) => petTypes.includes(t))) return false;
        if (concerns.length && !(p.concern ?? []).some((c) => concerns.includes(c))) return false;
        if (collections.length && !collections.includes(p.category)) return false;
        if (p.price > maxPrice) return false;
        return true;
      }),
    [products, petTypes, concerns, collections, maxPrice],
  );

  const activeCount =
    petTypes.length + concerns.length + collections.length + (maxPrice < priceCap ? 1 : 0);

  const clearAll = useCallback(() => {
    setPetTypes([]);
    setConcerns([]);
    setCollections([]);
    setMaxPrice(priceCap);
  }, [priceCap]);

  const group = (
    title: string,
    facet: readonly (readonly [string, number, string?])[],
    selected: string[],
    set: (v: string[]) => void,
  ) =>
    facet.length > 0 && (
      <div className="filter-group">
        <div className="filter-group-title">{title}</div>
        {facet.map(([label, count, value]) => {
          const v = value ?? label;
          return (
            <label key={v} className="filter-check">
              <input
                type="checkbox"
                checked={selected.includes(v)}
                onChange={() => toggle(selected, set, v)}
              />
              <span>{label}</span>
              <em className="filter-count">({count})</em>
            </label>
          );
        })}
      </div>
    );

  return (
    <div className="collection-layout shop-all-layout">
      <button
        type="button"
        className="filter-toggle btn btn-secondary"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <Icon name="settings" size={18} /> Filters{activeCount ? ` (${activeCount})` : ""}
      </button>

      {mobileOpen && (
        <div className="filter-scrim open" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Always in the DOM: a persistent sidebar on desktop, a drawer on mobile. */}
      <aside className={"filter-panel shop-filter-panel" + (mobileOpen ? " open" : "")}>
        <div className="filter-panel-head">
          <h3 className="h3" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="settings" size={16} /> FILTER
          </h3>
          {activeCount > 0 && (
            <button type="button" className="filter-clear" onClick={clearAll}>
              Clear all
            </button>
          )}
          <button
            type="button"
            className="filter-close mobile-only"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="filter-panel-body">
          {group("Pet Type", petFacet, petTypes, setPetTypes)}
          {group("Concern", concernFacet, concerns, setConcerns)}
          {group("Collection", collectionFacet, collections, setCollections)}

          <div className="filter-group">
            <div className="filter-group-title">Price Range</div>
            <input
              className="filter-range"
              type="range"
              min={0}
              max={priceCap}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label={`Maximum price, currently ${formatPrice(maxPrice)}`}
            />
            <div className="filter-range-labels">
              <span>{formatPrice(0)}</span>
              <span>
                {formatPrice(maxPrice)}
                {maxPrice >= priceCap ? "+" : ""}
              </span>
            </div>
          </div>

          <ul className="filter-trust">
            {TRUST.map((t) => (
              <li key={t.t}>
                <span className="filter-trust-ic">
                  <Icon name={t.icon} size={18} />
                </span>
                <span>
                  <strong>{t.t}</strong>
                  <em>{t.d}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="collection-main">
        <div className="sec-head" style={{ marginBottom: 18 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Everything in one place
            </div>
            <h2 className="h2">All Products</h2>
          </div>
          <span className="muted" style={{ fontSize: 14 }}>
            {filtered.length} of {products.length} products
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="prod-grid prod-grid-vertical">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="center" style={{ padding: "56px 0" }}>
            <p className="lead" style={{ marginBottom: 16 }}>No products match your filters.</p>
            <button type="button" className="btn btn-secondary" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
