import type { Product } from "@/lib/types";

/**
 * Maps a raw Supabase product row (with joined category/sizes/images)
 * to the front-end Product shape. Client-safe: no server imports.
 *
 * Handles the slight schema variations returned by the different product
 * endpoints (`product_sizes(label)` vs `product_sizes(*)`).
 */
export function mapDBProductToProduct(db: any): Product {
  return {
    slug: db.slug,
    name: db.name,
    subtitle: db.subtitle ?? "",
    category: db.category?.slug ?? "",
    categoryName: db.category?.name ?? "",
    price: db.price,
    rating: Number(db.rating ?? 0),
    reviews: db.reviews_count ?? 0,
    tone: db.tone ?? "sky",
    bestSeller: db.best_seller ?? false,
    sizes: (db.sizes ?? []).map((s: any) => s.label),
    short: db.short ?? "",
    benefits: db.benefits ?? [],
    features: db.features ?? [],
    mascot: db.mascot ?? "",
    ingredients: db.ingredients ?? "",
    howto: db.howto ?? "",
    images: (db.images ?? [])
      .slice()
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img: any) => ({ url: img.url, alt: img.alt ?? undefined })),
  };
}
