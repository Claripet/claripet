export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { z } from "zod";

// GET /api/cart — list current user's cart items with product details
export const GET = withErrorHandling(async () => {
  await requireUser();
  const supabase = createClient();

  const { data, error: dbError } = await supabase
    .from("cart_items")
    .select(
      `
      id, qty, product_id, size_id, updated_at,
      product:products(id, slug, name, subtitle, price, tone, category:categories(slug, name)),
      size:product_sizes(id, label, stock)
    `,
    )
    .order("updated_at", { ascending: false });

  if (dbError) return error(dbError.message, 500);

  return ok(data ?? []);
});

// POST /api/cart — add item to cart by product slug + size label
const addBySlugSchema = z.object({
  product_slug: z.string().min(1),
  size_label: z.string().min(1),
  qty: z.number().int().min(1).max(99).default(1),
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { product_slug, size_label, qty } = addBySlugSchema.parse(body);

  const supabase = createClient();

  // Resolve product + size by slug/label
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product_slug)
    .eq("status", "active")
    .single();

  if (!product) return error("Product not found", 404);

  const { data: size } = await supabase
    .from("product_sizes")
    .select("id, stock")
    .eq("product_id", product.id)
    .eq("label", size_label)
    .single();

  if (!size) return error("Size not found", 404);

  // Check existing cart item — if exists, increment
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .eq("size_id", size.id)
    .maybeSingle();

  const newQty = (existing?.qty ?? 0) + qty;
  if (newQty > size.stock) {
    return error(`Only ${size.stock} in stock`, 400);
  }

  if (existing) {
    const { data, error: updateError } = await supabase
      .from("cart_items")
      .update({ qty: newQty })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) return error(updateError.message, 500);
    return ok(data);
  }

  const { data, error: insertError } = await supabase
    .from("cart_items")
    .insert({
      user_id: user.id,
      product_id: product.id,
      size_id: size.id,
      qty,
    })
    .select()
    .single();

  if (insertError) return error(insertError.message, 500);
  return ok(data, 201);
});

// DELETE /api/cart — clear cart
export const DELETE = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = createClient();

  const { error: dbError } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (dbError) return error(dbError.message, 500);

  return ok({ message: "Cart cleared" });
});
