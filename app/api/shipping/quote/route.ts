import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { getShippingRates } from "@/lib/shipping";
import { rateLimit } from "@/lib/helpers/rateLimit";
import { shippingQuoteSchema } from "@/lib/validators/shipping";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (req: Request) => {
  // Rate Limit: 30 requests per minute
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (ip !== "unknown" && !(await rateLimit(`shipping_${ip}`, 30, 60 * 1000))) {
    return error("Terlalu banyak permintaan. Silakan coba lagi nanti.", 429);
  }

  const body = await req.json();
  const input = shippingQuoteSchema.parse(body);

  let rates;
  try {
    rates = await getShippingRates(input);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Gagal menghitung ongkir", 502);
  }

  return ok({ rates });
});
