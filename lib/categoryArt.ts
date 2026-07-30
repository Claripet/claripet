/**
 * Static category artwork. Baked into public/, never stored in the DB, so both
 * the static data layer and the Supabase-backed mapper resolve through here.
 */

/**
 * Grid card art — the illustrated card set in public/assets/images/categories,
 * which has the category name and blurb drawn into the artwork.
 */
export const CATEGORY_CARD_IMAGES: Record<string, string> = {
  perfumes: "/assets/images/categories/Perfume Card.png",
  "hygiene-grooming": "/assets/images/categories/Hygiene & Grooming Card.png",
  "skin-care": "/assets/images/categories/Skin Care Card.png",
  "fur-care-supplements": "/assets/images/categories/Fur Care & Supplements Card.png",
  "behavior-training": "/assets/images/categories/Behavior & Training Card.png",
  "home-environment-care": "/assets/images/categories/Home & Environment Card.png",
};

/**
 * Collection-page banner art: transparent 2000x467 artwork with the animals in
 * the right ~40% and the left half empty, drawn to bleed across the banner
 * behind the left-aligned copy. Rendered frameless — no card, no shadow.
 *
 * Behavior & Training and Home & Environment have no banner artwork, so they
 * fall back to their illustrated card, letterboxed on the banner tint.
 */
const CATEGORY_BANNER_IMAGES: Record<string, string> = {
  perfumes: "/images/categories/perfumes-banner.png",
  "hygiene-grooming": "/images/categories/grooming-banner.png",
  "skin-care": "/images/categories/skin-care-banner.png",
  "fur-care-supplements": "/images/categories/supplements-banner.png",
};

export type CategoryBanner = {
  src: string;
  /** true when the art bleeds across the full banner rather than sitting in the side column */
  fullBleed: boolean;
};

export function getCategoryBanner(slug: string, fallback?: string): CategoryBanner | null {
  const wide = CATEGORY_BANNER_IMAGES[slug];
  if (wide) return { src: wide, fullBleed: true };

  const card = fallback || CATEGORY_CARD_IMAGES[slug];
  return card ? { src: card, fullBleed: false } : null;
}
