export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { createOrderSchema, orderQuerySchema } from "@/lib/validators/order";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { calculateShippingQuote } from "@/lib/shipping";
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

  const supabase = createClient();

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

  const supabase = createClient();

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

  // Calculate shipping
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("qty, product:products(price)")
    .eq("user_id", user.id);

  if (!cartItems || cartItems.length === 0) {
    return error("Cart is empty", 400);
  }

  const subtotal = cartItems.reduce(
    (sum, i) => sum + (i.product as any).price * i.qty,
    0,
  );
  const shippingQuote = await calculateShippingQuote({
    province: shippingAddress.province,
    city: shippingAddress.city,
    subtotal,
    courierCode: input.courier_code,
    courierServiceCode: input.courier_service_code,
  });
  const shippingFee = shippingQuote.fee;

  // Call atomic order function
  const { data: orderId, error: rpcError } = await supabase.rpc(
    "create_order_from_cart",
    {
      p_shipping_address: shippingAddress,
      p_shipping_fee: shippingFee,
      p_payment_method: input.payment_method ?? null,
      p_notes: input.notes ?? null,
    },
  );

  if (rpcError) {
    if (rpcError.message?.includes("CART_EMPTY")) {
      return error("Cart is empty", 400);
    }
    if (rpcError.message?.includes("INSUFFICIENT_STOCK")) {
      return error(rpcError.message, 400);
    }
    safeLog.error("Order Creation RPC Error", rpcError);
    return error("Failed to create order", 500);
  }

  // Fetch the new order
  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  return ok(order, 201);
});
