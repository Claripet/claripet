// Transactional order emails, sent through the Cloudflare Email Service
// `send_email` binding (EMAIL in wrangler.jsonc). No API key is involved: the
// binding only works inside the deployed Worker, and only from a domain that
// has been onboarded under Email Service > Email Sending in the dashboard.
//
// Every send is best-effort. A failed email must never fail the payment
// webhook or the admin status change that triggered it, so errors are logged
// and swallowed. Each email is sent at most once per order: the caller first
// claims the order by setting paid_email_sent_at / shipped_email_sent_at with
// an `is null` guard, and only the request that wins the claim sends.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { courierName } from "@/lib/orderStatus";

export const ORDER_EMAIL_FROM = { email: "pesanan@claripetcare.com", name: "ClariPet" };
export const ORDER_EMAIL_REPLY_TO = "claripetindonesia@gmail.com";

type OrderEmailKind = "paid" | "shipped";

interface SendEmailBinding {
  send(message: {
    to: string;
    from: { email: string; name: string };
    replyTo?: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<unknown>;
}

interface OrderItemRow {
  product_name: string;
  size_label: string;
  qty: number;
  unit_price: number;
}

export interface OrderEmailData {
  id: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: Record<string, string | undefined> | null;
  courier_code: string | null;
  courier_service: string | null;
  shipping_etd: string | null;
  tracking_number: string | null;
  items: OrderItemRow[];
}

export function shortOrderNo(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function rupiah(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildOrderEmail(kind: OrderEmailKind, order: OrderEmailData, customerName: string) {
  const no = shortOrderNo(order.id);
  const link = `${SITE_URL}/account/orders/${order.id}`;
  const courier = order.courier_code
    ? `${courierName(order.courier_code)}${order.courier_service ? ` ${order.courier_service}` : ""}`
    : "";
  const a = order.shipping_address ?? {};
  const addressLines = [
    a.full_name,
    a.phone,
    a.street,
    [a.city, a.province, a.postal_code].filter(Boolean).join(", "),
  ].filter((l): l is string => Boolean(l));

  const subject =
    kind === "paid"
      ? `Pembayaran diterima, pesanan #${no}`
      : `Pesanan #${no} sudah dikirim`;

  const intro =
    kind === "paid"
      ? `Terima kasih, pembayaran untuk pesanan #${no} sudah kami terima dan pesananmu sedang kami siapkan untuk dikirim.`
      : `Pesanan #${no} sudah kami serahkan ke kurir${courier ? ` ${courier}` : ""}, jadi kamu bisa melacaknya dengan nomor resi di bawah ini.`;

  const itemLinesText = order.items.map(
    (it) => `- ${it.product_name} (${it.size_label}) x${it.qty}  ${rupiah(it.unit_price * it.qty)}`,
  );

  const text = [
    `Halo ${customerName},`,
    "",
    intro,
    "",
    ...(kind === "shipped" && order.tracking_number
      ? [`Kurir: ${courier || "-"}`, `No. resi: ${order.tracking_number}`, ""]
      : []),
    "Pesanan:",
    ...itemLinesText,
    `Subtotal: ${rupiah(order.subtotal)}`,
    `Ongkir: ${order.shipping_fee === 0 ? "Gratis" : rupiah(order.shipping_fee)}`,
    `Total: ${rupiah(order.total)}`,
    "",
    ...(kind === "paid" && courier
      ? [`Pengiriman: ${courier}${order.shipping_etd ? ` (estimasi ${order.shipping_etd} hari)` : ""}`]
      : []),
    "Dikirim ke:",
    ...addressLines,
    "",
    `Detail pesanan: ${link}`,
    "",
    `Ada pertanyaan? Balas email ini atau hubungi ${ORDER_EMAIL_REPLY_TO}.`,
    "",
    "Salam hangat,",
    "ClariPet",
  ].join("\n");

  const e = escapeHtml;
  const rows = order.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0">${e(it.product_name)} <span style="color:#6b6b6b">(${e(it.size_label)}) &times;${it.qty}</span></td><td style="padding:6px 0;text-align:right;white-space:nowrap">${rupiah(it.unit_price * it.qty)}</td></tr>`,
    )
    .join("");

  const resiBlock =
    kind === "shipped" && order.tracking_number
      ? `<div style="margin:20px 0;padding:14px 16px;border:1px solid #e3ddd3;border-radius:10px;background:#faf7f2">
           <div style="font-size:12px;color:#6b6b6b;text-transform:uppercase;letter-spacing:.06em">Kurir</div>
           <div style="font-size:15px;margin-bottom:8px">${e(courier || "-")}</div>
           <div style="font-size:12px;color:#6b6b6b;text-transform:uppercase;letter-spacing:.06em">No. resi</div>
           <div style="font-size:20px;font-weight:700;letter-spacing:.04em;font-family:monospace">${e(order.tracking_number)}</div>
         </div>`
      : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#ffffff;border-radius:14px;padding:28px 24px">
      <div style="font-size:20px;font-weight:700;margin-bottom:18px">ClariPet</div>
      <p style="margin:0 0 12px">Halo ${e(customerName)},</p>
      <p style="margin:0 0 12px;line-height:1.55">${e(intro)}</p>
      ${resiBlock}
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
        ${rows}
        <tr><td style="padding:10px 0 4px;border-top:1px solid #eee">Subtotal</td><td style="padding:10px 0 4px;border-top:1px solid #eee;text-align:right">${rupiah(order.subtotal)}</td></tr>
        <tr><td style="padding:4px 0">Ongkir</td><td style="padding:4px 0;text-align:right">${order.shipping_fee === 0 ? "Gratis" : rupiah(order.shipping_fee)}</td></tr>
        <tr><td style="padding:4px 0;font-weight:700">Total</td><td style="padding:4px 0;text-align:right;font-weight:700">${rupiah(order.total)}</td></tr>
      </table>
      ${
        kind === "paid" && courier
          ? `<p style="margin:16px 0 0;font-size:14px">Pengiriman: ${e(courier)}${order.shipping_etd ? ` (estimasi ${e(order.shipping_etd)} hari)` : ""}</p>`
          : ""
      }
      <p style="margin:16px 0 4px;font-size:12px;color:#6b6b6b;text-transform:uppercase;letter-spacing:.06em">Dikirim ke</p>
      <p style="margin:0;font-size:14px;line-height:1.5">${addressLines.map(e).join("<br>")}</p>
      <p style="margin:24px 0 0"><a href="${e(link)}" style="display:inline-block;background:#2b2b2b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px">Lihat pesanan</a></p>
    </div>
    <p style="font-size:12px;color:#6b6b6b;text-align:center;margin:16px 0 0;line-height:1.5">Ada pertanyaan? Balas email ini atau hubungi ${e(ORDER_EMAIL_REPLY_TO)}.</p>
  </div>
</body></html>`;

  return { subject, html, text };
}

/**
 * Heads-up to the shop itself that an order was paid, so it does not depend on
 * someone refreshing the dashboard. Goes to STORE_NOTIFY_EMAIL, falling back to
 * the reply-to inbox. Best effort: a failure here never affects the customer.
 */
async function notifyStoreOfPaidOrder(
  binding: SendEmailBinding,
  order: OrderEmailData & { id: string },
  customerName: string,
): Promise<void> {
  const to = (process.env.STORE_NOTIFY_EMAIL ?? "").trim() || ORDER_EMAIL_REPLY_TO;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const link = `${base}/admin/orders/${order.id}`;
  const no = shortOrderNo(order.id);
  const lines = (order.items ?? []).map((it) => `- ${it.product_name} (${it.size_label}) x${it.qty}`);
  const courier = [order.courier_code, order.courier_service].filter(Boolean).join(" ").toUpperCase();
  const subject = `Pesanan baru dibayar #${no} - ${rupiah(order.total)}`;
  const text = [
    `Pesanan #${no} dari ${customerName} sudah dibayar (${rupiah(order.total)}).`,
    "",
    ...lines,
    "",
    `Kurir pilihan pembeli: ${courier || "-"}`,
    `Proses di dashboard: ${link}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
  <h2 style="margin:0 0 12px">Pesanan baru dibayar #${escapeHtml(no)}</h2>
  <p style="margin:0 0 12px"><b>${escapeHtml(customerName)}</b> membayar <b>${rupiah(order.total)}</b>.</p>
  <ul style="padding-left:18px;margin:0 0 12px">${lines.map((l) => `<li>${escapeHtml(l.slice(2))}</li>`).join("")}</ul>
  <p style="margin:0 0 16px">Kurir pilihan pembeli: <b>${escapeHtml(courier || "-")}</b></p>
  <p><a href="${escapeHtml(link)}" style="background:#2b2b2b;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px">Buka pesanan</a></p>
</body></html>`;
  try {
    await binding.send({ to, from: ORDER_EMAIL_FROM, replyTo: ORDER_EMAIL_REPLY_TO, subject, html, text });
  } catch (err) {
    console.error(`[order-email] store notification failed for ${order.id}`, err);
  }
}

function getEmailBinding(): SendEmailBinding | null {
  try {
    const env = getCloudflareContext().env as unknown as { EMAIL?: SendEmailBinding };
    return env.EMAIL ?? null;
  } catch {
    return null;
  }
}

function runInBackground(task: Promise<void>): Promise<void> {
  try {
    const ctx = getCloudflareContext().ctx as { waitUntil?: (p: Promise<unknown>) => void } | undefined;
    if (ctx?.waitUntil) {
      ctx.waitUntil(task);
      return Promise.resolve();
    }
  } catch {
    // not running inside the Worker (next dev, tests)
  }
  return task;
}

async function sendOrderEmailNow(orderId: string, kind: OrderEmailKind): Promise<void> {
  const binding = getEmailBinding();
  if (!binding) {
    console.warn(`[order-email] EMAIL binding missing, skipped ${kind} email for ${orderId}`);
    return;
  }

  const supabase = createAdminClient();
  const claimColumn = kind === "paid" ? "paid_email_sent_at" : "shipped_email_sent_at";

  const { data: claimed, error: claimError } = await supabase
    .from("orders")
    .update({ [claimColumn]: new Date().toISOString() })
    .eq("id", orderId)
    .is(claimColumn, null)
    .select(
      "id, user_id, subtotal, shipping_fee, total, shipping_address, courier_code, courier_service, shipping_etd, tracking_number, items:order_items(product_name, size_label, qty, unit_price)",
    )
    .maybeSingle();

  if (claimError) {
    console.error(`[order-email] claim failed for ${orderId}`, claimError);
    return;
  }
  if (!claimed) return;

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(claimed.user_id);
  const to = userData?.user?.email;
  if (userError || !to) {
    console.error(`[order-email] no email address for order ${orderId}`, userError);
    return;
  }

  const addr = (claimed.shipping_address ?? {}) as Record<string, string | undefined>;
  const customerName = addr.full_name || (userData.user.user_metadata?.full_name as string | undefined) || "Pelanggan ClariPet";
  const { subject, html, text } = buildOrderEmail(kind, claimed as unknown as OrderEmailData, customerName);

  try {
    await binding.send({ to, from: ORDER_EMAIL_FROM, replyTo: ORDER_EMAIL_REPLY_TO, subject, html, text });
  } catch (err) {
    console.error(`[order-email] send failed for ${orderId} (${kind})`, err);
    await supabase.from("orders").update({ [claimColumn]: null }).eq("id", orderId);
    return;
  }

  // The claim above makes this run once per order, together with the customer email.
  if (kind === "paid") {
    await notifyStoreOfPaidOrder(binding, claimed as unknown as OrderEmailData & { id: string }, customerName);
  }
}

export function queueOrderEmail(orderId: string, kind: OrderEmailKind): Promise<void> {
  return runInBackground(
    sendOrderEmailNow(orderId, kind).catch((err) => {
      console.error(`[order-email] unexpected error for ${orderId} (${kind})`, err);
    }),
  );
}
