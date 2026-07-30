import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/helpers/rateLimit";

/**
 * POST /api/payments/webhook
 * Placeholder webhook handler for payment gateways.
 * 
 * When integrating Midtrans or Xendit:
 * 1. Verify the webhook signature
 * 2. Parse the payment notification
 * 3. Update the order status
 */
export async function POST(req: NextRequest) {
  try {
    // Rate Limit: 60 requests per minute
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (ip !== "unknown" && !rateLimit(`webhook_${ip}`, 60, 60 * 1000)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const body = await req.json();

    // Verify webhook signature from Midtrans
    const crypto = await import("crypto");
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Hard-fail if the server key is not configured — an empty key lets anyone
    // forge a valid signature using the public SHA-512 formula.
    if (!serverKey) {
      console.error("[Payment Webhook Error] MIDTRANS_SERVER_KEY is not set");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Validate required signature fields are present before computing
    if (
      typeof body.order_id !== "string" ||
      typeof body.status_code !== "string" ||
      typeof body.gross_amount !== "string" ||
      typeof body.signature_key !== "string" ||
      typeof body.transaction_status !== "string"
    ) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Midtrans signature formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const hashData = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash("sha512").update(hashData).digest("hex");

    // Use timingSafeEqual to prevent timing-oracle attacks on the signature comparison
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(body.signature_key, "utf8");
    const signaturesMatch =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!signaturesMatch) {
      console.error("[Payment Webhook Error] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // order_id and transaction_status are guaranteed strings by the validation above.
    const orderId = body.order_id;
    const paymentStatus = body.transaction_status; // e.g., "settlement", "pending", "deny", "expire"

    const supabase = createAdminClient();

    // Defense-in-depth: confirm the notified amount matches the stored order total.
    // Redundant with the signature, but a cheap guard. Midtrans sends gross_amount as a
    // decimal string ("10000.00"); order.total is an integer in IDR.
    const { data: amountOrder } = await supabase
      .from("orders")
      .select("total")
      .eq("id", orderId)
      .single();
    if (!amountOrder || Math.round(parseFloat(body.gross_amount)) !== amountOrder.total) {
      console.error("[Payment Webhook Error] Amount mismatch", {
        orderId,
        gross_amount: body.gross_amount,
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Map payment gateway status to our order status
    let orderStatus: string;
    
    // Check for Fraud Detection System challenge first
    if (body.fraud_status === "challenge") {
      orderStatus = "challenged";
    } else {
      switch (paymentStatus) {
        case "settlement":
        case "capture":
          orderStatus = "paid";
          break;
        case "deny":
        case "expire":
        case "cancel":
          orderStatus = "cancelled";
          break;
        default:
          orderStatus = "pending";
      }
    }

    // Call atomic RPC to handle status update, idempotency, and stock restoration safely
    const { error: rpcError } = await supabase.rpc("handle_payment_webhook", {
      p_order_id: orderId,
      p_new_status: orderStatus,
      p_payment_ref: body.transaction_id || body.signature_key, // fallback to signature for idempotency
    });

    if (rpcError) {
      console.error("[Supabase RPC Error]", rpcError);
      return NextResponse.json({ error: "Failed to process webhook securely" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Payment Webhook Error]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
