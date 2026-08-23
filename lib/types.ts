export type Tone = "sky" | "sage" | "pink" | "lavender" | "cream" | "peach";

export interface Category {
  image?: string;
  slug: string;
  name: string;
  tone: Tone;
  /** lucide icon name, resolved in components/icons.tsx */
  icon: string;
  blurb: string;
}

/** One purchasable variant of a product. Price is per size, in IDR. */
export interface ProductSize {
  label: string;
  price: number;
  /** Units on hand. Undefined when the query did not join stock. */
  stock?: number;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  categoryName: string;
  /**
   * The "from" price in IDR — the cheapest size. Derived, never charged:
   * `product_sizes.price` is what a line item actually costs, and the DB
   * trigger in 019_per_size_pricing.sql keeps this equal to `min(sizes.price)`.
   * Use it for cards, sorting, and price filters; use `sizes[n].price` (or
   * `priceForSize`) anywhere money is shown against a chosen size.
   */
  price: number;
  rating: number;
  reviews: number;
  tone: Tone;
  bestSeller: boolean;
  sizes: ProductSize[];
  short: string;
  benefits: string[];
  features: string[];
  mascot: string;
  ingredients: string;
  howto: string;
  /** Uploaded photos, ordered. Empty/undefined → illustrated placeholder. */
  images?: { url: string; alt?: string }[];
  /** Optional collection-filter facets. When present, they appear as filter
   *  sections on the collection page; when absent, those sections are hidden. */
  petType?: ("Cat" | "Dog")[];
  concern?: string[];
  /**
   * True when at least one size has stock, false when every size is at zero.
   * Undefined for the static seed catalogue, which carries no stock data —
   * consumers must treat undefined as "unknown", not as "out of stock".
   * Feeds schema.org `Offer.availability` on the product page.
   */
  inStock?: boolean;
}

export interface ArticleSection {
  h: string;
  p: string;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  tone: Tone;
  featured: boolean;
  excerpt: string;
  body: string[];
  sections: ArticleSection[];
  /** Thumbnail/hero photo. Empty → illustrated tone placeholder. */
  image?: string;
  /**
   * Publication date as `YYYY-MM-DD`. Feeds schema.org `datePublished` and the
   * sitemap's `lastModified`. Without it, editorial content carries no freshness
   * signal at all and every sitemap entry claims to have changed today.
   */
  publishedAt?: string;
  /** Last substantive edit, `YYYY-MM-DD`. Falls back to `publishedAt`. */
  updatedAt?: string;
  /** Byline for schema.org `author`. Defaults to the ClariPet editorial team. */
  author?: string;
}

export interface CartItem {
  slug: string;
  size: string;
  qty: number;
}

/**
 * A customer review, authored in /admin/reviews. Shown on the reviews page,
 * the home page shelf, and the reviewed product's page.
 */
export interface Review {
  id: string;
  authorName: string;
  /** Subtitle under the name, e.g. "Mochi · Poodle". */
  petName?: string;
  rating: number;
  body: string;
  /** Uploaded photo. Empty → illustrated tone placeholder. */
  photoUrl?: string;
  tone: Tone;
  featured: boolean;
  /** `YYYY-MM-DD`, when the review was added. */
  publishedAt?: string;
  /** The reviewed product, when one was linked. */
  product?: { slug: string; name: string };
}
