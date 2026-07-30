import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateArticleSchema } from "@/lib/validators/article";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/admin/articles/[id] — single article
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { data, error: dbError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (dbError || !data) return notFound("Article not found");
    return ok(data);
  },
);

// PUT /api/admin/articles/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const articleData = updateArticleSchema.parse(body);

    const supabase = createClient();

    const { data, error: updateError } = await supabase
      .from("articles")
      .update(articleData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) return error(updateError.message, 500);
    if (!data) return notFound("Article not found");
    return ok(data);
  },
);

// DELETE /api/admin/articles/[id] — hard delete
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { error: dbError } = await supabase
      .from("articles")
      .delete()
      .eq("id", params.id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Article deleted" });
  },
);
