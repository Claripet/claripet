import { createClient } from "@/lib/supabase/server";
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

    const supabase = createClient();

    // Get current order to validate transition
    const { data: current } = await supabase
      .from("orders")
      .select("status")
      .eq("id", params.id)
      .single();

    if (!current) return notFound("Order not found");

    // If cancelling, restore stock
    if (status === "cancelled" && current.status !== "cancelled") {
      const { error: rpcError } = await supabase.rpc("restore_stock_for_order", {
        p_order_id: params.id,
      });
      if (rpcError) return error(rpcError.message, 500);
    }

    const { data, error: dbError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", params.id)
      .select("*, items:order_items(*)")
      .single();

    if (dbError) return error(dbError.message, 500);
    return ok(data);
  },
);
