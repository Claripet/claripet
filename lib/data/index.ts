/**
 * Data service layer - fetches from Supabase when available,
 * falls back to static data when DB not set up.
 * 
 * This enables gradual migration: the frontend code uses these
 * functions, and they seamlessly switch between DB and static data.
 */

// Public catalogue reads use the cookie-free anon client on purpose: the
// cookie-bound one in `lib/supabase/server.ts` calls `cookies()`, which marks
// every route that touches it dynamic and blocks static generation site-wide.
import { createPublicClient as createClient } from "@/lib/supabase/public";
import { PRODUCTS, getProduct as getStaticProduct, getProductsByCategory as getStaticProductsByCategory } from "@/data/products";
import { CATEGORIES, getCategory as getStaticCategory } from "@/data/categories";
import { ARTICLES, getArticle as getStaticArticle, FEATURED_ARTICLE } from "@/data/articles";
import { mapDBProductToProduct } from "@/lib/data/mapProduct";
import { CATEGORY_CARD_IMAGES } from "@/lib/categoryArt";
import type { Product, Category, Article, Review } from "@/lib/types";
import type { DBReview } from "@/lib/db-types";

/**
 * The DB rows carry no merchandising facets (petType / concern) and sometimes
 * no images, so patch those from the static catalogue by slug. Without this the
 * shop filter renders empty Pet Type and Concern groups.
 */
function hydrateFromStatic(p: Product): Product {
  const fallback = getStaticProduct(p.slug);
  if (!fallback) return p;
  if (!p.images?.length && fallback.images) p.images = fallback.images;
  if (!p.petType?.length && fallback.petType) p.petType = fallback.petType;
  if (!p.concern?.length && fallback.concern) p.concern = fallback.concern;
  return p;
}

const USE_DATABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your-supabase-url-here",
);

// ----- PRODUCTS -----

export async function getAllProducts(): Promise<Product[]> {
  if (!USE_DATABASE) return PRODUCTS;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(label, stock), images:product_images(url, alt, sort_order)")
      .neq("status", "archived")
      .order("best_seller", { ascending: false });

    // Empty counts as "not populated", same as an error: the DB catalogue is
    // currently a partial subset of data/products.ts, and silently serving an
    // empty list makes whole collections disappear from the storefront.
    if (error || !data?.length) return PRODUCTS;

    return data.map((db) => hydrateFromStatic(mapDBProductToProduct(db)));
  } catch {
    return PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!USE_DATABASE) return getStaticProduct(slug);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(label, stock), images:product_images(url, alt, sort_order)")
      .eq("slug", slug)
      .neq("status", "archived")
      .single();

    if (error || !data) return getStaticProduct(slug);

    return hydrateFromStatic(mapDBProductToProduct(data));
  } catch {
    return getStaticProduct(slug);
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (!USE_DATABASE) return getStaticProductsByCategory(categorySlug);

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "*, category:categories!inner(*), sizes:product_sizes(label, stock), images:product_images(url, alt, sort_order)",
      )
      .eq("category.slug", categorySlug)
      .neq("status", "archived")
      .order("best_seller", { ascending: false });

    if (error || !data?.length) return getStaticProductsByCategory(categorySlug);

    return data.map((db) => hydrateFromStatic(mapDBProductToProduct(db)));
  } catch {
    return getStaticProductsByCategory(categorySlug);
  }
}

export async function getBestSellers(): Promise<Product[]> {
  if (!USE_DATABASE) return PRODUCTS.filter((p) => p.bestSeller);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(label, stock), images:product_images(url, alt, sort_order)")
      .neq("status", "archived")
      .eq("best_seller", true)
      .order("reviews_count", { ascending: false });

    if (error || !data?.length) return PRODUCTS.filter((p) => p.bestSeller);

    return data.map((db) => hydrateFromStatic(mapDBProductToProduct(db)));
  } catch {
    return PRODUCTS.filter((p) => p.bestSeller);
  }
}

// ----- CATEGORIES -----

export async function getAllCategories(): Promise<Category[]> {
  // ponytail: static-only — add DB query when categories become dynamic/admin-editable
  return CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  if (!USE_DATABASE) return getStaticCategory(slug);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return getStaticCategory(slug);

    return mapDBCategoryToCategory(data);
  } catch {
    return getStaticCategory(slug);
  }
}

// ----- ARTICLES -----

export async function getAllArticles(): Promise<Article[]> {
  if (!USE_DATABASE) return ARTICLES;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return ARTICLES;

    return data.map(mapDBArticleToArticle);
  } catch {
    return ARTICLES;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  if (!USE_DATABASE) return getStaticArticle(slug);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return getStaticArticle(slug);

    return mapDBArticleToArticle(data);
  } catch {
    return getStaticArticle(slug);
  }
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  if (!USE_DATABASE) return FEATURED_ARTICLE;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("featured", true)
      .limit(1)
      .single();

    if (error || !data) return FEATURED_ARTICLE;

    return mapDBArticleToArticle(data);
  } catch {
    return FEATURED_ARTICLE;
  }
}

// ----- REVIEWS -----

// Reviews are admin-authored and live only in the DB — there is no static seed
// to fall back on, so an unreachable database yields an empty list and every
// review surface hides itself rather than showing invented testimonials.
const REVIEW_SELECT = "*, product:products(slug, name)";

/** Published reviews, newest first within the admin's manual ordering. */
export async function getReviews(limit?: number): Promise<Review[]> {
  if (!USE_DATABASE) return [];

  try {
    const supabase = createClient();
    let qb = supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (limit) qb = qb.limit(limit);

    const { data, error } = await qb;
    if (error || !data) return [];

    return data.map(mapDBReviewToReview);
  } catch {
    return [];
  }
}

/**
 * Reviews for the home page shelf: the ones the admin flagged as featured,
 * topped up with the newest published reviews when fewer than `limit` are
 * flagged, so the section is never half-empty just because nobody ticked a box.
 */
export async function getFeaturedReviews(limit = 3): Promise<Review[]> {
  if (!USE_DATABASE) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(mapDBReviewToReview);
  } catch {
    return [];
  }
}

/** Published reviews linked to one product, for the PDP "Ulasan" tab. */
export async function getReviewsByProductSlug(slug: string): Promise<Review[]> {
  if (!USE_DATABASE) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, product:products!inner(slug, name)")
      .eq("product.slug", slug)
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map(mapDBReviewToReview);
  } catch {
    return [];
  }
}

// ----- MAPPERS -----

interface DBCategoryRow {
  slug: string;
  name: string;
  tone?: Category["tone"] | null;
  icon?: string | null;
  blurb?: string | null;
  image?: string | null;
}

function mapDBCategoryToCategory(db: DBCategoryRow): Category {
  return {
    slug: db.slug,
    name: db.name,
    tone: db.tone ?? "sky",
    icon: db.icon ?? "sparkle",
    blurb: db.blurb ?? "",
    image: db.image || CATEGORY_CARD_IMAGES[db.slug],
  };
}

interface DBArticleRow {
  slug: string;
  title: string;
  category?: string | null;
  read_time?: string | null;
  tone?: Article["tone"] | null;
  featured?: boolean | null;
  excerpt?: string | null;
  body?: string[] | null;
  sections?: Article["sections"] | null;
  created_at?: string | null;
}

/** timestamptz → `YYYY-MM-DD`, the form schema.org and sitemaps expect. */
function toDateOnly(ts: string | null | undefined): string | undefined {
  if (!ts) return undefined;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

function mapDBArticleToArticle(db: DBArticleRow): Article {
  // The articles table has no image, author or updated_at column, so those
  // three come from the seed entry of the same slug.
  const seed = ARTICLES.find((a) => a.slug === db.slug);

  return {
    slug: db.slug,
    title: db.title,
    category: db.category ?? "",
    readTime: db.read_time ?? "",
    tone: db.tone ?? "sky",
    featured: db.featured ?? false,
    excerpt: db.excerpt ?? "",
    body: db.body ?? [],
    sections: db.sections ?? [],
    // Article photos are static assets, not a DB column — carry them over from
    // the seed so DB-backed articles aren't left with a blank thumbnail.
    image: seed?.image,
    publishedAt: toDateOnly(db.created_at) ?? seed?.publishedAt,
    updatedAt: seed?.updatedAt,
    author: seed?.author,
  };
}

function mapDBReviewToReview(db: DBReview): Review {
  return {
    id: db.id,
    authorName: db.author_name,
    petName: db.pet_name ?? undefined,
    rating: Number(db.rating ?? 5),
    body: db.body,
    photoUrl: db.photo_url ?? undefined,
    tone: db.tone ?? "sky",
    featured: db.featured ?? false,
    publishedAt: toDateOnly(db.created_at),
    product: db.product ? { slug: db.product.slug, name: db.product.name } : undefined,
  };
}
