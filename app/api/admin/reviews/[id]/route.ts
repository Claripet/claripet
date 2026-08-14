import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateReviewSchema } from "@/lib/validators/review";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

const REVIEW_SELECT = "*, product:products(slug, name)";

// GET /api/admin/reviews/[id] — single review
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { data, error: dbError } = await supabase
      .from("reviews")
      .select(REVIEW_SELECT)
      .eq("id", params.id)
      .single();

    if (dbError || !data) return notFound("Review not found");
    return ok(data);
  },
);

// PUT /api/admin/reviews/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const reviewData = updateReviewSchema.parse(body);

    const supabase = createClient();

    const { data, error: updateError } = await supabase
      .from("reviews")
      .update(reviewData)
      .eq("id", params.id)
      .select(REVIEW_SELECT)
      .single();

    if (updateError) return error(updateError.message, 500);
    if (!data) return notFound("Review not found");
    return ok(data);
  },
);

// DELETE /api/admin/reviews/[id] — hard delete
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { error: dbError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", params.id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Review deleted" });
  },
);
