import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateOrderStatusSchema, type OrderStatus } from "@/lib/validators/order";
import { canTransition, TRACKING_EDITABLE } from "@/lib/orderStatus";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { queueOrderEmail } from "@/lib/email/orderEmails";

// GET /api/admin/orders/[id]
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    // No profile:profiles(...) embed: orders.user_id references auth.users, not
    // profiles, so PostgREST rejects the embed (PGRST200) and every order 404'd.
    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .maybeSingle();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Order not found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user_id)
      .maybeSingle();

    return ok({ ...data, profile });
  },
);

// PATCH /api/admin/orders/[id] — change status and/or set the resi
//
// Body: { status?, tracking_number? }
//   - status changes must follow ADMIN_TRANSITIONS (forward only)
//   - "shipped" requires a resi, either in this request or already stored
//   - the resi can be set or corrected while paid / processing / shipped
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const { status, tracking_number } = updateOrderStatusSchema.parse(body);

    // Mutations go through the service-role client. 015 revokes UPDATE on
    // orders and EXECUTE on restore_stock_for_order from `authenticated`, so
    // the cookie-bound client can no longer perform either — and it should
    // not: requireAdmin() above has already resolved the role server-side
    // from the DB, which is the actual gate.
    const supabase = createAdminClient();

    const { data: current, error: readError } = await supabase
      .from("orders")
      .select("id, status, tracking_number")
      .eq("id", id)
      .maybeSingle();
    if (readError) return error(readError.message, 500);
    if (!current) return notFound("Order not found");

    const from = current.status as OrderStatus;
    const changingStatus = status !== undefined && status !== from;

    if (changingStatus && !canTransition(from, status)) {
      return error(`Status tidak bisa diubah dari "${from}" ke "${status}".`, 409);
    }

    const targetStatus: OrderStatus = changingStatus ? status : from;
    const resi = tracking_number?.toUpperCase();

    if (resi !== undefined && !TRACKING_EDITABLE.includes(targetStatus)) {
      return error("Nomor resi hanya bisa diisi untuk pesanan yang sudah dibayar.", 409);
    }
    if (targetStatus === "shipped" && !(resi ?? current.tracking_number)) {
      return error("Isi nomor resi dulu sebelum menandai pesanan sebagai dikirim.", 400);
    }

    const patch: Record<string, unknown> = {};
    if (resi !== undefined) patch.tracking_number = resi;
    if (changingStatus) {
      patch.status = status;
      if (status === "shipped") patch.shipped_at = new Date().toISOString();
      if (status === "delivered") patch.delivered_at = new Date().toISOString();
    }
    if (Object.keys(patch).length === 0) {
      const { data: unchanged } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", id)
        .maybeSingle();
      return ok(unchanged);
    }
    patch.updated_at = new Date().toISOString();

    // The UPDATE is guarded on the status we validated against, so a webhook
    // or a second admin changing the order in between makes this a no-op
    // instead of an invalid jump. For a cancel it also means exactly one
    // caller wins, and only the winner restores stock (previously two admins
    // clicking Cancel together put the stock back twice).
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .eq("status", from)
      .select("*, items:order_items(*)")
      .maybeSingle();

    if (updateError) return error(updateError.message, 500);
    if (!updated) {
      return error("Pesanan baru saja diubah di tempat lain. Muat ulang halaman lalu coba lagi.", 409);
    }

    if (changingStatus && status === "cancelled") {
      const { error: rpcError } = await supabase.rpc("restore_stock_for_order", {
        p_order_id: id,
      });
      if (rpcError) return error(rpcError.message, 500);
    }

    if (changingStatus && (status === "paid" || status === "shipped")) {
      await queueOrderEmail(id, status);
    }

    return ok(updated);
  },
);
