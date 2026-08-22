import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { getProductBySlug, getReviewsByProductSlug } from "@/lib/data";
import { ProductView } from "@/components/product/ProductView";
import { SITE_URL } from "@/lib/site";
import { metaDescription, rollingPriceValidUntil, jsonLdScript } from "@/lib/seo";

// Prerendered at build, refreshed in the background every 5 minutes so price
// and stock edits from the admin panel land without a redeploy.
export const revalidate = 300;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const ogImage = product.images?.[0]?.url
    ? [
        {
          url: product.images[0].url,
          alt: product.images[0].alt ?? product.name,
        },
      ]
    : undefined;
  // `product.short` is body copy — 200-330 chars in practice, which Google cuts
  // off mid-sentence. Trim it for the head; the full text still renders on page.
  const snippet = metaDescription(product.short);

  return {
    title: product.name,
    description: snippet,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: snippet,
      url: `/product/${product.slug}`,
      type: "website",
      ...(ogImage && { images: ogImage }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: snippet,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, reviews] = await Promise.all([
    getProductBySlug(slug),
    getReviewsByProductSlug(slug),
  ]);
  if (!product) notFound();

  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const imageUrl = product.images?.[0]?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short,
    url: productUrl,
    // Schema.org requires an absolute URL here. The catalogue stores
    // root-relative paths ("/images/products/x.png"), which Google cannot
    // fetch — the product rich result then loses its image.
    ...(imageUrl && {
      image: imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`,
    }),
    category: product.categoryName,
    // No dedicated SKU column exists; the slug is the stable, unique merchant
    // identifier for the product, which is what Google asks `sku` to carry.
    sku: product.slug,
    brand: { "@type": "Brand", name: "ClariPet" },
    // Gate on REAL review rows, not on `product.reviews`.
    //
    // `product.rating` / `product.reviews` are seeded marketing figures — they
    // come from data/products.ts and 004_seed.sql inserts them straight into
    // products.rating / products.reviews_count, and no trigger ever recomputes
    // them from the reviews table. Keying the markup off that field meant every
    // product advertised an AggregateRating (e.g. 4.7 from 145 reviews) while
    // the page rendered zero reviews.
    //
    // Google treats review markup with no corresponding on-page reviews as
    // spam, and the penalty is a manual action that strips rich results from
    // the whole site — not just the stars. Deriving both numbers from the rows
    // actually rendered below keeps the markup and the page in agreement.
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue:
          Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
          ) / 10,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "IDR",
      price: product.price,
      // Derived from real per-size stock where the DB supplies it. `inStock` is
      // undefined for the static seed catalogue, which carries no stock data —
      // treat that as available rather than silently marking everything sold out.
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      priceValidUntil: rollingPriceValidUntil(),
      seller: { "@type": "Organization", name: "ClariPet" },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: product.categoryName,
        item: `${SITE_URL}/shop/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }}
      />
      <ProductView product={product} reviews={reviews} />
    </>
  );
}
