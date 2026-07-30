import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { z } from "zod";

const updateStockSchema = z.object({
  stock: z.number().int().min(0),
});

// PATCH /api/admin/inventory/[sizeId] — set stock
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: { sizeId: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const { stock } = updateStockSchema.parse(body);

    const supabase = createClient();

    const { data, error: dbError } = await supabase
      .from("product_sizes")
      .update({ stock })
      .eq("id", params.sizeId)
      .select("*, product:products(slug, name)")
      .single();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Size not found");
    return ok(data);
  },
);
