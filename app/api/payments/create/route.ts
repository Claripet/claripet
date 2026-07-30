import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { requireUser } from "@/lib/helpers/auth";
import { createClient } from "@/lib/supabase/server";
import { Snap } from "midtrans-client";

/**
 * POST /api/payments/create
 * Creates a Midtrans Snap transaction for a given order.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const orderId = body.order_id;

  if (!orderId) {
    return error("order_id is required", 400);
  }

  const supabase = createClient();
  const { data: order, error: dbError } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (dbError || !order) {
    return error("Order not found", 404);
  }

  // Never mint a fresh payment token for an order that is already settled or dead.
  if (order.status === "paid") {
    return error("Order already paid", 409);
  }
  if (order.status === "cancelled") {
    return error("Order is no longer payable", 409);
  }

  // Init Midtrans Snap. Sandbox vs production is driven by a single explicit flag
  // (shared with the frontend snap.js URL) so the two can never drift apart.
  const snap = new Snap({
    isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
  });

  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.total
    },
    // Expire abandoned checkouts quickly so reserved stock is freed via the
    // Midtrans `expire` webhook (-> cancelled -> stock restored) instead of ~24h later.
    expiry: {
      unit: "minutes",
      duration: 60
    },
    customer_details: {
      first_name: order.shipping_address?.full_name || user.email || "Customer",
      email: user.email,
      phone: order.shipping_address?.phone || ""
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return ok({
      order_id: order.id,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (err: any) {
    return error(err.message, 500);
  }
});
