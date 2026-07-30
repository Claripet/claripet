import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { getShippingRates } from "@/lib/shipping";
import { rateLimit } from "@/lib/helpers/rateLimit";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 30 requests per minute
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !rateLimit(`shipping_${ip}`, 30, 60 * 1000)) {
    return error("Terlalu banyak permintaan. Silakan coba lagi nanti.", 429);
  }

  const body = await req.json();

  if (!body?.province || typeof body.province !== "string") {
    return error("Provinsi tujuan wajib diisi", 400);
  }

  let rates;
  try {
    rates = await getShippingRates({
      province: body.province,
      city: typeof body.city === "string" ? body.city : undefined,
      destinationId: typeof body.destinationId === "number" ? body.destinationId : undefined,
      weightGrams: typeof body.weightGrams === "number" ? body.weightGrams : undefined,
      subtotal: typeof body.subtotal === "number" ? body.subtotal : undefined,
      couriers: typeof body.couriers === "string" ? body.couriers : undefined,
    });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Gagal menghitung ongkir", 502);
  }

  return ok({ rates });
});
