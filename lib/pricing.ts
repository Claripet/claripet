import { formatPrice } from "@/lib/format";
import type { Product, ProductSize } from "@/lib/types";

/**
 * Display-side price resolution for per-size pricing.
 *
 * None of this decides what a customer is charged. `create_order_from_cart`
 * (019_per_size_pricing.sql) reads `product_sizes.price` inside the database
 * and is the only writer of `order_items.unit_price`, so a wrong number here
 * is a wrong number on screen, never a wrong number on an invoice.
 */

/** The size row for `label`, or undefined when the product has no such size. */
export function findSize(
  product: Pick<Product, "sizes">,
  label: string | undefined,
): ProductSize | undefined {
  if (!label) return undefined;
  return product.sizes.find((s) => s.label === label);
}

/**
 * What one unit of `label` costs.
 *
 * Falls back to the product's "from" price when the size is unknown — a cart
 * row whose size was renamed or deleted in admin, for instance. That under-
 * quotes rather than over-quotes, and checkout resolves the real figure from
 * the size row it looks up by id.
 */
export function priceForSize(
  product: Pick<Product, "sizes" | "price">,
  label: string | undefined,
): number {
  return findSize(product, label)?.price ?? product.price;
}

/** True when the product's sizes are not all the same price. */
export function hasPriceRange(product: Pick<Product, "sizes">): boolean {
  if (product.sizes.length < 2) return false;
  const first = product.sizes[0].price;
  return product.sizes.some((s) => s.price !== first);
}

/** Cheapest and dearest size price. Both equal `price` when there are no sizes. */
export function priceRange(
  product: Pick<Product, "sizes" | "price">,
): { min: number; max: number } {
  if (product.sizes.length === 0) return { min: product.price, max: product.price };
  const prices = product.sizes.map((s) => s.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * Catalogue-listing price: `"Rp 59.000"`, or `"Mulai dari Rp 30.000"` when the
 * product's sizes are priced differently and the card can only show one figure.
 * Without the prefix a card advertises a price two thirds of what the size the
 * shopper wants actually costs.
 */
export function formatListPrice(product: Pick<Product, "sizes" | "price">): string {
  const from = formatPrice(priceRange(product).min);
  return hasPriceRange(product) ? `Mulai dari ${from}` : from;
}
