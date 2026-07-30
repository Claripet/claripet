import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { z } from "zod";

// POST /api/cart/merge — merge an array of guest cart items into user's DB cart
const mergeSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        size: z.string().min(1),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .max(50),
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { items } = mergeSchema.parse(body);

  if (items.length === 0) return ok({ merged: 0 });

  const supabase = createClient();

  let merged = 0;
  for (const item of items) {
    // resolve product
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", item.slug)
      .eq("status", "active")
      .single();
    if (!product) continue;

    const { data: size } = await supabase
      .from("product_sizes")
      .select("id, stock")
      .eq("product_id", product.id)
      .eq("label", item.size)
      .single();
    if (!size) continue;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, qty")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("size_id", size.id)
      .maybeSingle();

    const targetQty = Math.min((existing?.qty ?? 0) + item.qty, size.stock);
    if (targetQty <= 0) continue;

    if (existing) {
      await supabase.from("cart_items").update({ qty: targetQty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        size_id: size.id,
        qty: targetQty,
      });
    }
    merged++;
  }

  return ok({ merged });
});
