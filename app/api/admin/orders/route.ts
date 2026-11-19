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

  const supabase = await createClient();

  let qb = supabase
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (query.status) {
    qb = qb.eq("status", query.status);
  }

  // Search: recipient name, resi, or the 8-character order number shown in the
  // list (matched as a uuid range, since PostgREST cannot ilike a uuid).
  // Characters that are PostgREST filter syntax are stripped first.
  const q = (searchParams.get("q") ?? "").replace(/[,()%*\\"']/g, " ").trim().slice(0, 60);
  if (q) {
    const parts = [`tracking_number.ilike.*${q}*`, `shipping_address->>full_name.ilike.*${q}*`];
    const hex = q.replace(/^#/, "").toLowerCase();
    if (/^[0-9a-f]{8}$/.test(hex)) {
      parts.push(`and(id.gte.${hex}-0000-0000-0000-000000000000,id.lte.${hex}-ffff-ffff-ffff-ffffffffffff)`);
    }
    qb = qb.or(parts.join(","));
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
