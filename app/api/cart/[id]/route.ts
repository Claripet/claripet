import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { updateCartItemSchema } from "@/lib/validators/cart";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// PATCH /api/cart/[id] — update qty
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const body = await req.json();
    const { qty } = updateCartItemSchema.parse(body);

    const supabase = await createClient();

    // Verify ownership and check stock
    const { data: item } = await supabase
      .from("cart_items")
      .select("id, size:product_sizes(stock)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!item) return notFound("Cart item not found");

    const stock = (item.size as any)?.stock ?? 0;
    if (qty > stock) {
      return error(`Only ${stock} in stock`, 400);
    }

    const { data, error: dbError } = await supabase
      .from("cart_items")
      .update({ qty })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) return error(dbError.message, 500);
    return ok(data);
  },
);

// DELETE /api/cart/[id] — remove item
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Item removed" });
  },
);
