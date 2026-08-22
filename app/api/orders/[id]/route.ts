import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, notFound, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/orders/[id]
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (dbError || !data) return notFound("Order not found");
    return ok(data);
  },
);
