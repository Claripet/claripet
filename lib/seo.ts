/**
 * Shared SEO helpers.
 *
 * Product and article copy is written for the page body, where length is a
 * virtue. Meta descriptions are the opposite: Google renders roughly 155-160
 * characters and truncates the rest mid-word, so the value proposition never
 * reaches the SERP. These helpers keep the long-form copy intact for the page
 * and derive a short form for the `<head>`.
 */

/** Google renders ~155-160 chars of a description before truncating. */
const META_DESCRIPTION_MAX = 155;

/**
 * Shortens `text` to fit a meta description, cutting on a word boundary and
 * appending an ellipsis. Text already within budget is returned untouched, so
 * hand-written short descriptions pass through verbatim.
 */
export function metaDescription(
  text: string | undefined | null,
  max: number = META_DESCRIPTION_MAX,
): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  // Reserve one character for the ellipsis, then back up to the last space so
  // the snippet never ends on a half-word. The 0.6 floor guards against a
  // pathological input with no spaces near the end, where backing up would
  // throw away most of the budget.
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${cut.replace(/[,;:.\s]+$/, "")}…`;
}

/**
 * `Offer.priceValidUntil` is required for Google product rich results, but
 * ClariPet prices have no real expiry. Emitting a rolling one-year horizon
 * satisfies the requirement without asserting a discount deadline that does
 * not exist.
 */
export function rollingPriceValidUntil(from: Date = new Date()): string {
  const until = new Date(from);
  until.setFullYear(until.getFullYear() + 1);
  return until.toISOString().split("T")[0];
}
