import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateArticleSchema } from "@/lib/validators/article";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { stripDangerousMarkup } from "@/lib/helpers/sanitize";

// GET /api/admin/articles/[id] — single article
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError || !data) return notFound("Article not found");
    return ok(data);
  },
);

// PUT /api/admin/articles/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const articleData = updateArticleSchema.parse(body);
    if (articleData.title !== undefined) {
      articleData.title = stripDangerousMarkup(articleData.title);
    }
    if (articleData.excerpt !== undefined) {
      articleData.excerpt = stripDangerousMarkup(articleData.excerpt);
    }
    if (articleData.body !== undefined) {
      articleData.body = articleData.body.map((p) => stripDangerousMarkup(p));
    }
    if (articleData.sections !== undefined) {
      articleData.sections = articleData.sections.map((s) => ({
        h: stripDangerousMarkup(s.h),
        p: stripDangerousMarkup(s.p),
      }));
    }

    const supabase = await createClient();

    const { data, error: updateError } = await supabase
      .from("articles")
      .update(articleData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) return error(updateError.message, 500);
    if (!data) return notFound("Article not found");
    return ok(data);
  },
);

// DELETE /api/admin/articles/[id] — hard delete
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Article deleted" });
  },
);
