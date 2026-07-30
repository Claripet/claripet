export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ok, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { slug: string } }) => {
    const supabase = createClient();

    const { data: category, error: dbError } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (dbError || !category) {
      return notFound("Category not found");
    }

    const { data: products } = await supabase
      .from("products")
      .select("*, sizes:product_sizes(*)")
      .eq("category_id", category.id)
      .eq("status", "active")
      .order("best_seller", { ascending: false });

    return ok({ ...category, products: products ?? [] });
  },
);
