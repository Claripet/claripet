import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { requireUser } from "@/lib/helpers/auth";
import { getClientIp } from "@/lib/helpers/clientIp";
import { getShippingRates } from "@/lib/shipping";
import { loadCartTotals } from "@/lib/cartTotals";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { shippingQuoteSchema } from "@/lib/validators/shipping";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/shipping/quote
 *
 * Signed-in only (checkout already is, via middleware). Every call spends a
 * paid RajaOngkir request, so an open endpoint was free quota for anyone, and
 * the per-IP limit alone could be dodged with a forged header.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();

  if (!(await rateLimit(`shipping_user_${user.id}`, 20, 60 * 1000))) {
    return error("Terlalu banyak permintaan. Silakan coba lagi nanti.", 429);
  }
  const ip = getClientIp(req);
  if (ip !== "unknown" && !(await rateLimit(`shipping_${ip}`, 30, 60 * 1000))) {
    return error("Terlalu banyak permintaan. Silakan coba lagi nanti.", 429);
  }

  const body = await req.json();
  const input = shippingQuoteSchema.parse(body);

  const supabase = await createClient();
  const totals = await loadCartTotals(supabase, user.id);
  if (totals.itemCount === 0) return error("Keranjang kosong", 400);

  let rates;
  try {
    rates = await getShippingRates({
      province: input.province,
      city: input.city,
      subtotal: totals.subtotal,
      weightGrams: totals.weightGrams,
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Gagal menghitung ongkir", 502);
  }

  return ok({ rates, weightGrams: totals.weightGrams });
});
