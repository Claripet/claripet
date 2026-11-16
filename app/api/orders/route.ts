export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { createOrderSchema, orderQuerySchema } from "@/lib/validators/order";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateShippingQuote, CourierUnavailableError } from "@/lib/shipping";
import { loadCartTotals } from "@/lib/cartTotals";
import { stripDangerousMarkup } from "@/lib/helpers/sanitize";
import { safeLog } from "@/lib/helpers/safeLog";
import type { NextRequest } from "next/server";

// GET /api/orders — list user's orders
export const GET = withErrorHandling(async (req: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);

  const query = orderQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 20,
  });

  const supabase = await createClient();

  let qb = supabase
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (query.status) {
    qb = qb.eq("status", query.status);
  }

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;
  qb = qb.range(from, to);

  const { data, count, error: dbError } = await qb;

  if (dbError) return error(dbError.message, 500);

  return ok({
    orders: data ?? [],
    total: count ?? 0,
    page: query.page,
    limit: query.limit,
  });
});

// POST /api/orders — create order from cart
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const input = createOrderSchema.parse(body);

  const supabase = await createClient();

  // Resolve shipping address
  let shippingAddress: Record<string, string>;

  if (input.shipping_address) {
    shippingAddress = input.shipping_address;
  } else if (input.shipping_address_id) {
    const { data: addr } = await supabase
      .from("addresses")
      .select("full_name, phone, street, city, province, postal_code")
      .eq("id", input.shipping_address_id)
      .eq("user_id", user.id)
      .single();

    if (!addr) return error("Address not found", 404);
    shippingAddress = addr;
  } else {
    return error("Shipping address is required", 400);
  }

  // Subtotal and parcel weight come from the server-side cart, priced and
  // weighed off product_sizes. The subtotal decides free shipping ONLY; the
  // order's own subtotal is recomputed inside create_order_from_cart from the
  // same rows, so the two cannot disagree about item prices.
  const totals = await loadCartTotals(supabase, user.id);
  if (totals.itemCount === 0) {
    return error("Keranjang kosong", 400);
  }

  let shippingQuote;
  try {
    shippingQuote = await calculateShippingQuote({
      province: shippingAddress.province,
      city: shippingAddress.city,
      subtotal: totals.subtotal,
      weightGrams: totals.weightGrams,
      courierCode: input.courier_code,
      courierServiceCode: input.courier_service_code,
    });
  } catch (err) {
    if (err instanceof CourierUnavailableError) return error(err.message, 409);
    safeLog.error("Order shipping quote failed", err);
    return error("Gagal menghitung ongkir. Silakan coba lagi.", 502);
  }

  // create_order_from_cart is service-role only since 023: when customers
  // could call it themselves they could also pass p_shipping_fee = 0. The user
  // id is taken from the verified session above, never from the request body.
  const admin = createAdminClient();
  const { data: orderId, error: rpcError } = await admin.rpc(
    "create_order_from_cart",
    {
      p_user_id: user.id,
      p_shipping_address: shippingAddress,
      p_shipping_fee: shippingQuote.fee,
      p_courier_code: shippingQuote.courierCode,
      p_courier_service: shippingQuote.courierServiceCode || shippingQuote.courierServiceName,
      p_shipping_etd: shippingQuote.etd || null,
      p_shipping_weight_grams: totals.weightGrams,
      p_payment_method: input.payment_method ?? null,
      p_notes: input.notes ? stripDangerousMarkup(input.notes) : null,
    },
  );

  if (rpcError) {
    if (rpcError.message?.includes("CART_EMPTY")) {
      return error("Keranjang kosong", 400);
    }
    if (rpcError.message?.includes("INSUFFICIENT_STOCK")) {
      return error(rpcError.message, 400);
    }
    safeLog.error("Order Creation RPC Error", rpcError);
    return error("Gagal membuat pesanan", 500);
  }

  // Fetch the new order
  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  return ok(order, 201);
});
