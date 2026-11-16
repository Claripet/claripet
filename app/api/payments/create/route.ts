import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { requireUser } from "@/lib/helpers/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paymentCreateSchema } from "@/lib/validators/order";
import { safeLog } from "@/lib/helpers/safeLog";
import { Snap } from "midtrans-client";

// Snap expiry set on the transaction. The expiry sweep (022) cancels pending
// orders after 3 hours, so this must stay well below that.
const SNAP_EXPIRY_MINUTES = 60;
// Stop handing out a stored token a little before Midtrans expires it, so the
// popup never opens on an already-dead transaction.
const TOKEN_REUSE_MARGIN_MS = 2 * 60 * 1000;

/**
 * POST /api/payments/create
 *
 * Returns a Snap token for one of the caller's pending orders. Called at
 * checkout and again from the order page ("Bayar Sekarang") when the customer
 * closed the popup. Midtrans allows one transaction per order_id, so the token
 * from the first call is stored on the order and handed back on later calls
 * instead of asking Midtrans for a second transaction with the same id.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { order_id: orderId } = paymentCreateSchema.parse(body);

  const supabase = await createClient();
  const { data: order, error: dbError } = await supabase
    .from("orders")
    .select("id, status, total, shipping_address, payment_token, payment_url, payment_expires_at, created_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (dbError || !order) {
    return error("Pesanan tidak ditemukan", 404);
  }

  if (order.status !== "pending") {
    return error(
      order.status === "cancelled"
        ? "Pesanan ini sudah dibatalkan. Silakan buat pesanan baru."
        : "Pesanan ini sudah dibayar.",
      409,
    );
  }

  const now = Date.now();
  if (
    order.payment_token &&
    order.payment_expires_at &&
    new Date(order.payment_expires_at).getTime() - TOKEN_REUSE_MARGIN_MS > now
  ) {
    return ok({
      order_id: order.id,
      token: order.payment_token,
      redirect_url: order.payment_url,
      expires_at: order.payment_expires_at,
    });
  }

  if (order.payment_token) {
    // The one Snap transaction this order may have is expired; Midtrans will
    // refuse a new one for the same order_id. The sweep will cancel the order
    // and release its stock.
    return error("Waktu pembayaran sudah habis. Silakan buat pesanan baru.", 410);
  }

  const snap = new Snap({
    isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
  });

  const address = (order.shipping_address ?? {}) as Record<string, string>;
  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.total,
    },
    expiry: {
      unit: "minutes",
      duration: SNAP_EXPIRY_MINUTES,
    },
    customer_details: {
      first_name: address.full_name || user.email || "Customer",
      email: user.email,
      phone: address.phone || "",
    },
  };

  let transaction: { token: string; redirect_url: string };
  try {
    transaction = await snap.createTransaction(parameter);
  } catch (err) {
    safeLog.error("Midtrans createTransaction failed", err);
    return error("Gagal membuat pembayaran. Silakan coba lagi.", 502);
  }

  const expiresAt = new Date(now + SNAP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // orders is not writable by `authenticated` (015), so the token is stored
  // with the service-role client. Only the owner can read it back (RLS).
  const admin = createAdminClient();
  const { error: saveError } = await admin
    .from("orders")
    .update({
      payment_token: transaction.token,
      payment_url: transaction.redirect_url,
      payment_expires_at: expiresAt,
    })
    .eq("id", order.id)
    .eq("status", "pending");
  if (saveError) safeLog.error("Saving Snap token failed", saveError);

  return ok({
    order_id: order.id,
    token: transaction.token,
    redirect_url: transaction.redirect_url,
    expires_at: expiresAt,
  });
});
