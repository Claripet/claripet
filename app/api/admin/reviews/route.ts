export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { createReviewSchema } from "@/lib/validators/review";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import type { NextRequest } from "next/server";

const REVIEW_SELECT = "*, product:products(slug, name)";

// GET /api/admin/reviews — all reviews, published or not
export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const supabase = createClient();

  let qb = supabase
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const search = searchParams.get("search");
  if (search) qb = qb.ilike("author_name", `%${search}%`);

  const { data, count, error: dbError } = await qb;
  if (dbError) return error(dbError.message, 500);

  return ok({ reviews: data ?? [], total: count ?? 0 });
});

// POST /api/admin/reviews — create review
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const body = await req.json();
  const reviewData = createReviewSchema.parse(body);

  const supabase = createClient();

  const { data, error: insertError } = await supabase
    .from("reviews")
    .insert(reviewData)
    .select(REVIEW_SELECT)
    .single();

  if (insertError) return error(insertError.message, 500);
  return ok(data, 201);
});
