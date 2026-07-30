export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/wishlist -> string[] of product slugs
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = createClient();
  const { data, error: dbError } = await supabase
    .from("wishlist")
    .select("product_slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (dbError) return error(dbError.message, 500);
  return ok((data ?? []).map((r) => r.product_slug));
});

// POST /api/wishlist { product_slug }
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const { product_slug } = await req.json();
  if (typeof product_slug !== "string" || !product_slug) return error("product_slug required", 400);
  const supabase = createClient();
  const { error: dbError } = await supabase
    .from("wishlist")
    .upsert({ user_id: user.id, product_slug }, { onConflict: "user_id,product_slug" });
  if (dbError) return error(dbError.message, 500);
  return ok({ product_slug }, 201);
});

// DELETE /api/wishlist?slug=...
export const DELETE = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return error("slug required", 400);
  const supabase = createClient();
  const { error: dbError } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug);
  if (dbError) return error(dbError.message, 500);
  return ok({ removed: slug });
});
