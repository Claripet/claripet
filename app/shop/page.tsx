import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts, getAllCategories, getBestSellers } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { BannerDecor } from "@/components/BannerDecor";
import { Icon } from "@/components/icons";
import { ShopCategoryPills } from "@/components/shop/ShopCategoryPills";
import { AllProductsBrowser } from "@/components/shop/AllProductsBrowser";

export const metadata: Metadata = {
  title: "Shop ClariPet",
  description:
    "Everything your pet needs for grooming, wellness, hygiene and everyday care.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop ClariPet",
    description:
      "Everything your pet needs for grooming, wellness, hygiene and everyday care.",
    url: "/shop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop ClariPet",
    description:
      "Everything your pet needs for grooming, wellness, hygiene and everyday care.",
  },
};

export default async function ShopPage() {
  const [products, categories, bestSellers] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getBestSellers(),
  ]);
  const featured = [...products].sort(
    (a, b) => Number(b.bestSeller) - Number(a.bestSeller),
  );

  return (
    <main>
      <ShopCategoryPills />

      <section className="wrap shop-hero-section">
        <div className="shop-hero-banner">
          <div className="shop-hero-copy">
            <h1 className="h1" style={{ marginBottom: 12 }}>Shop ClariPet</h1>
            <p className="lead">
              Everything your pet needs for grooming, wellness, hygiene and everyday care.
            </p>
          </div>
          <BannerDecor />
          <div className="shop-hero-art">
            <Image
              src="/images/shop-hero.png"
              alt="A puppy and a kitten playing among ClariPet gift boxes"
              fill
              priority
              sizes="(max-width: 860px) 92vw, 660px"
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />
          </div>
        </div>
      </section>

      {/* Mobile: Hot & Trending first (horizontal carousel of best sellers) */}
      <section className="shop-mobile-featured wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Hot &amp; Trending
            </div>
            <h2 className="h2">Featured Products</h2>
          </div>
        </div>
        <div className="prod-grid shop-featured-row">
          {bestSellers.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <Link href="#all-products" className="btn btn-primary btn-block shop-all-btn">
          View All Products <Icon name="arrowRight" size={18} />
        </Link>
      </section>

      {/* Desktop: Categories first (original order) */}
      <section className="wrap shop-cat-wide section-sm shop-desktop-categories" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Browse
            </div>
            <h2 className="h2">Shop by Category</h2>
          </div>
        </div>
        <div className="cat-grid cat-grid-row">
          {categories.map((c) => (
            <CategoryCard key={c.slug} cat={c} />
          ))}
        </div>
      </section>

      {/* Mobile: Categories as a small side-scroll carousel */}
      <section className="shop-mobile-categories wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Browse
            </div>
            <h2 className="h2">Shop by Category</h2>
          </div>
        </div>
        <div className="cat-scroll">
          {categories.map((c) => (
            <CategoryCard key={c.slug} cat={c} />
          ))}
        </div>
      </section>

      <section id="all-products" className="wrap section-sm" style={{ paddingTop: 0, scrollMarginTop: '90px' }}>
        <AllProductsBrowser products={featured} categories={categories} />
      </section>

      <section className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="shop-banner">
          <div className="shop-banner-copy">
            <h2 className="h2" style={{ marginBottom: 10 }}>
              Helping You Help Them.
            </h2>
            <p className="lead" style={{ marginBottom: 22 }}>
              Not sure where to start? Take our quick quiz and we&apos;ll match
              your pet with the right care.
            </p>
            <Link href="/quiz" className="btn btn-primary btn-lg">
              <Icon name="sparkle" size={18} /> Find My Product
            </Link>
          </div>
          <BannerDecor />

          {/* Cut-out artwork bleeding across the panel — no frame. */}
          <div className="shop-banner-art" aria-hidden="true">
            <Image
              src="/images/shop-cta-banner.png"
              alt=""
              fill
              loading="lazy"
              sizes="(max-width: 860px) 100vw, 1200px"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
