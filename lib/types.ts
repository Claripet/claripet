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

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  categoryName: string;
  price: number;
  rating: number;
  reviews: number;
  tone: Tone;
  bestSeller: boolean;
  sizes: string[];
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
