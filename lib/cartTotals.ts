import type { SupabaseClient } from "@supabase/supabase-js";

/** Box, bubble wrap and tape added once per parcel on top of the items. */
export const PACKAGING_WEIGHT_GRAMS = 100;

/** Used for a size whose weight is missing (should not happen after 023). */
export const FALLBACK_ITEM_WEIGHT_GRAMS = 300;

export interface CartLine {
  qty: number;
  price: number;
  weightGrams: number | null | undefined;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  weightGrams: number;
}

/** Pure: subtotal and parcel weight for a set of cart lines. */
export function computeCartTotals(lines: CartLine[]): CartTotals {
  let subtotal = 0;
  let itemWeight = 0;
  let itemCount = 0;
  for (const l of lines) {
    const qty = Math.max(0, Math.floor(l.qty));
    itemCount += qty;
    subtotal += l.price * qty;
    const w = l.weightGrams && l.weightGrams > 0 ? l.weightGrams : FALLBACK_ITEM_WEIGHT_GRAMS;
    itemWeight += w * qty;
  }
  return {
    itemCount,
    subtotal,
    weightGrams: itemCount > 0 ? itemWeight + PACKAGING_WEIGHT_GRAMS : 0,
  };
}

/**
 * Subtotal and weight of the signed-in user's server-side cart, priced and
 * weighed from product_sizes. This is what both the ongkir quote and the order
 * use, so neither ever trusts a subtotal or weight sent by the browser.
 */
export async function loadCartTotals(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartTotals> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("qty, size:product_sizes(price, weight_grams)")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const lines: CartLine[] = (data ?? []).map((row: any) => {
    const size = Array.isArray(row.size) ? row.size[0] : row.size;
    return {
      qty: row.qty,
      price: size?.price ?? 0,
      weightGrams: size?.weight_grams,
    };
  });

  return computeCartTotals(lines);
}
