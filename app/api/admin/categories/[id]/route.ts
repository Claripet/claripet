import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateCategorySchema } from "@/lib/validators/category";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// PUT /api/admin/categories/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const input = updateCategorySchema.parse(body);

    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Category not found");
    return ok(data);
  },
);

// DELETE /api/admin/categories/[id]
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Category deleted" });
  },
);
