"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Product, Tone } from "@/lib/types";
import { PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StarRating } from "@/components/ui/StarRating";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Mascot } from "@/components/Mascot";

const ProductCard = dynamic(() => import("@/components/ProductCard").then((mod) => mod.ProductCard));

import { useCart } from "@/context/CartContext";
import { useFlyToCart } from "@/context/FlyToCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const FEATURE_ICONS = ["shield", "droplet", "clock", "pin"];

export function ProductView({ product }: { product: Product }) {
  const { user } = useAuth();
  const cart = useCart();
  const { flyToCart } = useFlyToCart();
  const { slugs, toggle } = useWishlist();
  const isWished = slugs.includes(product.slug);
  const addRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mobile carousel scroll with activeThumb state
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeThumb) setActiveThumb(newIndex);
  };

  // Click a thumbnail/dot: update state AND scroll the main carousel to that slide.
  // Works for both desktop thumbnails and mobile dots.
  const goToSlide = (i: number) => {
    setActiveThumb(i);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: i * carouselRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  // Track Recently Viewed
  useEffect(() => {
    if (user) {
      fetch("/api/recently-viewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_slug: product.slug }),
      }).catch(console.error);
    }
  }, [user, product.slug]);

  const photos = product.images ?? [];
  const hasPhotos = photos.length > 0;
  const thumbTones: Tone[] = [product.tone, "sky", "cream", "sage"];

  const related = PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  const fill =
    related.length < 4
      ? PRODUCTS.filter((p) => p.slug !== product.slug && !related.includes(p)).slice(0, 4 - related.length)
      : [];
  const relatedAll = [...related, ...fill];

  const accItems: AccordionItem[] = [
    {
      title: "Description",
      content: (
        <p>
          {product.short} Crafted in small batches in Indonesia using thoughtfully selected, pet-safe
          ingredients.
        </p>
      ),
    },
    { title: "Ingredients", content: <p>{product.ingredients}</p> },
    { title: "How to Use", content: <p>{product.howto}</p> },
    {
      title: "FAQ",
      content: (
        <ul>
          <li>Is it safe for daily use? Yes — it’s formulated to be gentle enough for everyday care.</li>
          <li>Can I use it on both dogs and cats? Yes, it’s suitable for both.</li>
          <li>When will I see results? Most pet parents notice a difference within 1–2 weeks.</li>
        </ul>
      ),
    },
    {
      title: `Reviews (${product.reviews})`,
      content: (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <StarRating rating={product.rating} showCount={false} />
            <span style={{ fontWeight: 600, color: "var(--navy)" }}>{product.rating} out of 5</span>
            <span className="muted">· {product.reviews} reviews</span>
          </div>
          <p>
            “Honestly the easiest product to use and my pup actually doesn’t mind it. Noticed a real
            difference quickly.” — Verified Buyer
          </p>
        </div>
      ),
    },
  ];

  return (
    <main>
      <Breadcrumb
        trail={[
          { label: "Shop", href: "/shop" },
          { label: product.category, href: `/shop/${product.category.toLowerCase()}` },
          { label: product.name },
        ]}
      />
      <div className="wrap product-grid pdp">
        <div className="pdp-gallery">
          <div className="pdp-thumbs desktop-only">
              {hasPhotos
                ? photos.map((img, i) => (
                    <button
                      key={img.url}
                      className={"pdp-thumb" + (activeThumb === i ? " active" : "")}
                      onClick={() => goToSlide(i)}
                      aria-label={`View image ${i + 1}`}
                      style={{ background: "#FFFFFF" }}
                    >
                    <Image
                      src={img.url}
                      alt={img.alt ?? `${product.name} photo ${i + 1}`}
                      fill
                      loading="lazy"
                      style={{ objectFit: "contain" }}
                      sizes="80px"
                    />
                  </button>
                ))
              : thumbTones.map((t, i) => (
                  <button
                    key={i}
                    className={"pdp-thumb" + (activeThumb === i ? " active" : "")}
                    onClick={() => setActiveThumb(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    {product.images?.[i] ? (
                      <Image src={product.images[i].url} alt={product.images[i].alt || product.name} fill loading="lazy" style={{ objectFit: "contain" }} sizes="80px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="image" size={16} className="muted" />
                      </div>
                    )}
                  </button>
                ))}
          </div>
          <div className="pdp-main-wrap">
            <div className="pdp-main" style={{ background: "#FFFFFF" }}>
              {product.bestSeller && <span className="prod-tag tag desktop-only" style={{ top: 20, left: 20 }}>Best Seller</span>}
              
              <div className="pdp-carousel" ref={carouselRef} onScroll={handleScroll}>
                {hasPhotos ? (
                  photos.map((img, i) => (
                    <div className="pdp-carousel-slide" key={img.url}>
                      <Image
                        src={img.url}
                        alt={img.alt || product.name}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? undefined : "lazy"}
                        sizes="(max-width: 768px) 100vw, 800px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="pdp-carousel-slide">
                    <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="image" size={48} className="muted" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {hasPhotos && photos.length > 1 && (
              <div className="pdp-carousel-dots mobile-only">
                {photos.map((_, i) => (
                  <button 
                    key={i} 
                    className={"pdp-dot" + (activeThumb === i ? " active" : "")} 
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pdp-info">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {product.categoryName}
          </div>
          <h1 className="h2">{product.name}</h1>
          <div style={{ margin: "14px 0" }}>
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>
          <div className="pdp-price">{formatPrice(product.price)}</div>
          <p className="pdp-desc">{product.short}</p>

          <div className="pdp-benefits">
            {product.benefits.map((b, i) => (
              <div className="benefit" key={i}>
                <span className="benefit-ic">
                  <Icon name="check" size={16} strokeWidth={3} />
                </span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Size</div>
            <div className="size-row" style={{ margin: 0 }}>
              {product.sizes.map((s) => (
                <button key={s} className={"size-opt" + (size === s ? " active" : "")} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-buy" ref={addRef}>
            <div className="pdp-actions-row">
              <span className="pdp-mobile-price">{formatPrice(product.price)}</span>
              <QuantityStepper value={qty} onChange={setQty} />
              <PrimaryButton
                size="lg"
                onClick={() => {
                  if (addRef.current) flyToCart(addRef.current);
                  cart.add(product.slug, size, qty, product);
                }}
              >
                Add to Cart
              </PrimaryButton>
              <button
                className={"wishlist" + (isWished ? " active" : "") + " desktop-only"}
                style={{ position: "static", width: 50, height: 50, background: "var(--mist)", flexShrink: 0 }}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWished}
                onClick={() => toggle(product.slug)}
              >
                <Icon name="heart" size={19} />
              </button>
            </div>
          </div>

          <div className="feature-row">
            {product.features.map((f, i) => (
              <div className="feature-item" key={i}>
                <div className="fic">
                  <Icon name={FEATURE_ICONS[i] ?? "check"} size={22} />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Mascot tone={product.tone} speech={product.mascot} sub="ClariPet care tip" />

          <div style={{ marginTop: 28 }}>
            <Accordion items={accItems} defaultOpen={0} />
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 className="h3">You might also like</h2>
          </div>
          <div className="prod-grid">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Add to Cart bar — mobile only */}
      {mounted && createPortal(
        <div className="pdp-sticky-bar">
          <span className="pdp-sticky-price">{formatPrice(product.price)}</span>
          <div className="pdp-sticky-qty">
            <QuantityStepper value={qty} onChange={setQty} />
          </div>
          <PrimaryButton
            size="lg"
            onClick={() => {
              if (addRef.current) flyToCart(addRef.current);
              cart.add(product.slug, size, qty, product);
            }}
          >
            Add to Cart
          </PrimaryButton>
        </div>,
        document.body
      )}
    </main>
  );
}
