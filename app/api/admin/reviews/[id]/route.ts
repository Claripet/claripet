import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateReviewSchema } from "@/lib/validators/review";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { stripDangerousMarkup } from "@/lib/helpers/sanitize";

const REVIEW_SELECT = "*, product:products(slug, name)";

// GET /api/admin/reviews/[id] — single review
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("id", id)
      .single();

    if (dbError || !data) return notFound("Review not found");
    return ok(data);
  },
);

// PUT /api/admin/reviews/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const reviewData = updateReviewSchema.parse(body);
    if (reviewData.author_name !== undefined) {
      reviewData.author_name = stripDangerousMarkup(reviewData.author_name);
    }
    if (reviewData.pet_name !== undefined) {
      reviewData.pet_name = stripDangerousMarkup(reviewData.pet_name);
    }
    if (reviewData.body !== undefined) {
      reviewData.body = stripDangerousMarkup(reviewData.body);
    }

    const supabase = await createClient();

    const { data, error: updateError } = await supabase
      .from("reviews")
      .update(reviewData)
      .eq("id", id)
      .select(REVIEW_SELECT)
      .single();

    if (updateError) return error(updateError.message, 500);
    if (!data) return notFound("Review not found");
    return ok(data);
  },
);

// DELETE /api/admin/reviews/[id] — hard delete
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Review deleted" });
  },
);
