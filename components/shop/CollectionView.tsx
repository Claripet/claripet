"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import { ProductCard } from "@/components/ProductCard";
import { BannerDecor } from "@/components/BannerDecor";
import { getCategoryBanner } from "@/lib/categoryArt";

type SortKey = "featured" | "price-low" | "price-high" | "rating";

const PRICE_BUCKETS = [
  { id: "u100", label: "Under Rp 100.000", test: (p: number) => p < 100_000 },
  { id: "100-200", label: "Rp 100.000 – 200.000", test: (p: number) => p >= 100_000 && p <= 200_000 },
  { id: "o200", label: "Over Rp 200.000", test: (p: number) => p > 200_000 },
];

const RATINGS = [
  { id: "4.5", label: "4.5 & up", min: 4.5 },
  { id: "4.0", label: "4.0 & up", min: 4.0 },
];

function uniqueFacet(products: Product[], pick: (p: Product) => string[] | undefined): string[] {
  const set = new Set<string>();
  for (const p of products) (pick(p) ?? []).forEach((v) => set.add(v));
  return Array.from(set).sort();
}

export function CollectionView({
  products,
  category,
  categories,
}: {
  products: Product[];
  category: Category;
  categories: Category[];
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [prices, setPrices] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [bestOnly, setBestOnly] = useState(false);
  const [petTypes, setPetTypes] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const petTypeFacet = useMemo(() => uniqueFacet(products, (p) => p.petType), [products]);
  const concernFacet = useMemo(() => uniqueFacet(products, (p) => p.concern), [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (prices.length && !PRICE_BUCKETS.some((b) => prices.includes(b.id) && b.test(p.price))) return false;
      if (minRating !== null && p.rating < minRating) return false;
      if (bestOnly && !p.bestSeller) return false;
      if (petTypes.length && !(p.petType ?? []).some((t) => petTypes.includes(t))) return false;
      if (concerns.length && !(p.concern ?? []).some((c) => concerns.includes(c))) return false;
      return true;
    });
    list = [...list];
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    return list;
  }, [products, prices, minRating, bestOnly, petTypes, concerns, sort]);

  // useCallback keeps these stable across renders so child components that
  // receive them as props (e.g. filter labels) are not forced to re-render.
  const toggle = useCallback((arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]), []);

  const clearAll = useCallback(() => {
    setPrices([]);
    setMinRating(null);
    setBestOnly(false);
    setPetTypes([]);
    setConcerns([]);
  }, []);

  const activeCount =
    prices.length + petTypes.length + concerns.length + (minRating !== null ? 1 : 0) + (bestOnly ? 1 : 0);

  const banner = getCategoryBanner(category.slug, category.image);

  return (
    <main>
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="sep">/</span>
          <span className="cur">{category.name}</span>
        </nav>
      </div>

      <section className="wrap">
        <div
          className={
            "collection-banner " + category.tone + (banner?.fullBleed ? " has-art" : "")
          }
          style={{ background: `var(--${category.tone}-50)` }}
        >
          <div className="collection-banner-copy">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Collection</div>
            <h1 className="h1" style={{ marginBottom: 12 }}>{category.name}</h1>
            <p className="lead">{category.blurb}</p>
          </div>

          <BannerDecor />

          {banner?.fullBleed ? (
            // Transparent artwork bleeding across the banner — no frame, the
            // empty left half of the source is what clears the copy.
            <div className="collection-banner-art" aria-hidden="true">
              {/* fit/position live in CSS, not inline, so the mobile breakpoint
                  can crop to the animals instead of showing the empty half. */}
              <Image src={banner.src} alt="" fill priority sizes="(max-width: 768px) 100vw, 1200px" />
            </div>
          ) : (
            <div className="collection-banner-media is-contain">
              {banner ? (
                <Image
                  src={banner.src}
                  alt={`${category.name} products for cats and dogs`}
                  fill
                  priority
                  sizes="(max-width: 768px) 60vw, 40vw"
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <Placeholder tone={category.tone} label={category.name} />
              )}
            </div>
          )}
        </div>
      </section>

      <section className="wrap section-sm">
        <div className="collection-layout">
          <button type="button" className="filter-toggle btn btn-secondary" onClick={() => setMobileOpen((v) => !v)}>
            <Icon name="settings" size={18} /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>

          {mobileOpen && <div className={"filter-scrim open"} onClick={() => setMobileOpen(false)} aria-hidden={false} />}

          {mobileOpen && (
          <aside className="filter-panel open">
            <div className="filter-panel-head">
              <h3 className="h3" style={{ fontSize: 18 }}>Filter</h3>
              {activeCount > 0 && (
                <button type="button" className="filter-clear" onClick={clearAll}>Clear all</button>
              )}
              <button type="button" className="filter-close mobile-only" aria-label="Close filters" onClick={() => setMobileOpen(false)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="filter-panel-body">

            {petTypeFacet.length > 0 && (
              <div className="filter-group">
                <div className="filter-group-title">Pet Type</div>
                {petTypeFacet.map((t) => (
                  <label key={t} className="filter-check">
                    <input type="checkbox" checked={petTypes.includes(t)} onChange={() => toggle(petTypes, setPetTypes, t)} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            )}

            {concernFacet.length > 0 && (
              <div className="filter-group">
                <div className="filter-group-title">Concern</div>
                {concernFacet.map((c) => (
                  <label key={c} className="filter-check">
                    <input type="checkbox" checked={concerns.includes(c)} onChange={() => toggle(concerns, setConcerns, c)} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="filter-group">
              <div className="filter-group-title">Price Range</div>
              {PRICE_BUCKETS.map((b) => (
                <label key={b.id} className="filter-check">
                  <input type="checkbox" checked={prices.includes(b.id)} onChange={() => toggle(prices, setPrices, b.id)} />
                  <span>{b.label}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">Rating</div>
              {RATINGS.map((r) => (
                <label key={r.id} className="filter-check">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === r.min}
                    onChange={() => setMinRating(r.min)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
              {minRating !== null && (
                <button type="button" className="filter-clear" onClick={() => setMinRating(null)}>Any rating</button>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-group-title">Highlights</div>
              <label className="filter-check">
                <input type="checkbox" checked={bestOnly} onChange={() => setBestOnly((v) => !v)} />
                <span>Best Sellers only</span>
              </label>
            </div>

            <div className="filter-group">
              <div className="filter-group-title">Other Collections</div>
              {categories.filter((c) => c.slug !== category.slug).map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} className="filter-link">{c.name}</Link>
              ))}
            </div>
            </div>

            <div className="filter-apply mobile-only">
              <button type="button" className="btn btn-primary btn-block" onClick={() => setMobileOpen(false)}>
                Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </aside>
          )}

          <div className="collection-main">
            <div className="shop-toolbar">
              <div className="muted" style={{ fontSize: 14 }}>
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </div>
              <select
                className="sort-select"
                value={sort}
                aria-label="Sort products"
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="featured">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {filtered.length > 0 ? (
              <div className="prod-grid prod-grid-vertical collection-grid">
                {filtered.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="ec"><Icon name="search" size={32} /></div>
                <h3 className="h3" style={{ marginBottom: 8 }}>No products match your filters</h3>
                <p className="muted" style={{ marginBottom: 18 }}>Try clearing some filters to see more.</p>
                <button type="button" className="btn btn-secondary" onClick={clearAll}>Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
