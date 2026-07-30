import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateCategorySchema } from "@/lib/validators/category";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// PUT /api/admin/categories/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const input = updateCategorySchema.parse(body);

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("categories")
      .update(input)
      .eq("id", params.id)
      .select()
      .single();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Category not found");
    return ok(data);
  },
);

// DELETE /api/admin/categories/[id]
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { error: dbError } = await supabase
      .from("categories")
      .delete()
      .eq("id", params.id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Category deleted" });
  },
);
