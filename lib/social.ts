/**
 * Canonical ClariPet profile URLs, in one place.
 *
 * These feed two consumers that must never drift apart:
 *
 *   1. The footer's social icons (components/Footer.tsx).
 *   2. The `sameAs` array on the Organization JSON-LD (app/page.tsx).
 *
 * `sameAs` is the machine-readable claim that this domain and these profiles
 * are the same entity. It matters more than usual here: the Instagram, Shopee
 * and Tokopedia listings already rank on page one for the query "claripet"
 * while claripetcare.com does not, so these links are how Google is told the
 * ranking profiles and this site belong to one brand rather than to four
 * unrelated ones — especially with an unrelated claripet.com (a clarinetist)
 * competing for the same string.
 *
 * Every URL below was verified to resolve to a real ClariPet-owned profile.
 * Do not add a speculative URL: a `sameAs` pointing at a profile the brand
 * does not control is a wrong entity claim, which is worse than no claim.
 */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/claripetcare/",
  tiktok: "https://www.tiktok.com/@claripetcare",
  shopee: "https://shopee.co.id/claripet",
  tokopedia: "https://www.tokopedia.com/claripet",
} as const;

/**
 * The `sameAs` value for Organization JSON-LD.
 *
 * Marketplace storefronts are included deliberately. Google treats a verified
 * seller profile as a strong corroborating signal for a commercial entity, and
 * these two are the pages currently outranking the site for its own name.
 */
export const SAME_AS: string[] = Object.values(SOCIAL_LINKS);
