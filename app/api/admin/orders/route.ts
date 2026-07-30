export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { orderQuerySchema } from "@/lib/validators/order";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import type { NextRequest } from "next/server";

// GET /api/admin/orders — list all orders (admin)
export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);

  const query = orderQuerySchema.parse({
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 20,
  });

  const supabase = createClient();

  let qb = supabase
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (query.status) {
    qb = qb.eq("status", query.status);
  }

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;
  qb = qb.range(from, to);

  const { data, count, error: dbError } = await qb;

  if (dbError) return error(dbError.message, 500);

  return ok({
    orders: data ?? [],
    total: count ?? 0,
    page: query.page,
    limit: query.limit,
  });
});
