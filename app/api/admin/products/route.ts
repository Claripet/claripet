export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { createProductSchema } from "@/lib/validators/product";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import type { NextRequest } from "next/server";

// GET /api/admin/products — all products including drafts/archived
export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const supabase = await createClient();

  let qb = supabase
    .from("products")
    .select("*, category:categories(slug, name), sizes:product_sizes(*), images:product_images(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  const status = searchParams.get("status");
  if (status) qb = qb.eq("status", status);

  const category = searchParams.get("category");
  if (category) qb = qb.eq("category_id", category);

  const search = searchParams.get("search");
  if (search) qb = qb.ilike("name", `%${search}%`);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);
  const from = (page - 1) * limit;
  qb = qb.range(from, from + limit - 1);

  const { data, count, error: dbError } = await qb;
  if (dbError) return error(dbError.message, 500);

  return ok({ products: data ?? [], total: count ?? 0, page, limit });
});

// POST /api/admin/products — create product
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const body = await req.json();
  // `price` is dropped on purpose: products.price is derived from the sizes by
  // the trigger in 019_per_size_pricing.sql, so writing it here would only be
  // overwritten a moment later by the size inserts below. Price is set per size.
  const { sizes, images, price: _ignoredPrice, ...productData } =
    createProductSchema.parse(body);

  const supabase = await createClient();

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (insertError) return error(insertError.message, 500);

  // Insert sizes
  if (sizes.length > 0) {
    const sizeRows = sizes.map((s) => ({
      product_id: product.id,
      label: s.label,
      price: s.price,
      stock: s.stock,
      sku: s.sku ?? null,
    }));

    const { error: sizeError } = await supabase
      .from("product_sizes")
      .insert(sizeRows);

    if (sizeError) return error(sizeError.message, 500);
  }

  // Insert images
  if (images.length > 0) {
    const imageRows = images.map((img, i) => ({
      product_id: product.id,
      url: img.url,
      alt: img.alt ?? null,
      sort_order: img.sort_order ?? i,
    }));

    const { error: imageError } = await supabase
      .from("product_images")
      .insert(imageRows);

    if (imageError) return error(imageError.message, 500);
  }

  // Re-fetch with relations
  const { data: full } = await supabase
    .from("products")
    .select("*, category:categories(*), sizes:product_sizes(*), images:product_images(*)")
    .eq("id", product.id)
    .single();

  return ok(full, 201);
});
