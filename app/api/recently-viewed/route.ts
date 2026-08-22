export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { productSlugSchema } from "@/lib/validators/wishlist";

// GET /api/recently-viewed -> string[] slugs (most recent first)
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("recently_viewed")
    .select("product_slug")
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(12);
  if (dbError) return error(dbError.message, 500);
  return ok((data ?? []).map((r) => r.product_slug));
});

// POST /api/recently-viewed { product_slug }
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const { product_slug } = productSlugSchema.parse(body);
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("recently_viewed")
    .upsert(
      { user_id: user.id, product_slug, viewed_at: new Date().toISOString() },
      { onConflict: "user_id,product_slug" }
    );
  if (dbError) return error(dbError.message, 500);
  return ok({ product_slug }, 201);
});
