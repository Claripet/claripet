export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ok, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { slug: string } }) => {
    const supabase = createClient();

    const { data, error: dbError } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(*)")
      .eq("slug", params.slug)
      .eq("status", "active")
      .single();

    if (dbError || !data) {
      return notFound("Product not found");
    }

    return ok(data);
  },
);
