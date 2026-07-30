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
}

export interface CartItem {
  slug: string;
  size: string;
  qty: number;
}
