import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateOrderStatusSchema } from "@/lib/validators/order";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/admin/orders/[id]
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*), profile:profiles(full_name)")
      .eq("id", params.id)
      .single();

    if (!data) return notFound("Order not found");
    return ok(data);
  },
);

// PATCH /api/admin/orders/[id] — update status
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    // Mutations go through the service-role client. 015 revokes UPDATE on
    // orders and EXECUTE on restore_stock_for_order from `authenticated`, so
    // the cookie-bound client can no longer perform either — and it should
    // not: requireAdmin() above has already resolved the role server-side
    // from the DB, which is the actual gate.
    const supabase = createAdminClient();

    // Cancelling used to be two unguarded statements — restore stock, then
    // update — off an unlocked read. Two admins clicking Cancel at the same
    // time both saw a non-cancelled order and both restored stock, so the
    // qty was added back twice. Flipping the order and making the UPDATE
    // itself the guard (`.neq("status", "cancelled")`) means exactly one
    // caller can win the transition, and only the winner restores stock.
    if (status === "cancelled") {
      const { data: cancelled, error: cancelError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", params.id)
        .neq("status", "cancelled")
        .select("*, items:order_items(*)")
        .maybeSingle();

      if (cancelError) return error(cancelError.message, 500);

      // No row came back: either the order does not exist, or it was already
      // cancelled by a concurrent request. Distinguish the two so a double
      // click reads as a no-op rather than a 404.
      if (!cancelled) {
        const { data: existing } = await supabase
          .from("orders")
          .select("*, items:order_items(*)")
          .eq("id", params.id)
          .maybeSingle();

        if (!existing) return notFound("Order not found");
        return ok(existing);
      }

      const { error: rpcError } = await supabase.rpc("restore_stock_for_order", {
        p_order_id: params.id,
      });
      if (rpcError) return error(rpcError.message, 500);

      return ok(cancelled);
    }

    const { data, error: dbError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", params.id)
      .select("*, items:order_items(*)")
      .maybeSingle();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Order not found");
    return ok(data);
  },
);
