export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import type { NextRequest } from "next/server";

// GET /api/admin/inventory — stock report
export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const threshold = searchParams.get("threshold");

  const supabase = createClient();

  let qb = supabase
    .from("product_sizes")
    .select("*, product:products(id, slug, name, status)");
    
  if (threshold !== null) {
      qb = qb.lte("stock", Number(threshold)).order("stock", { ascending: true });
  } else {
      qb = qb.order("stock", { ascending: true });
  }

  const { data, error: dbError } = await qb;

  if (dbError) return error(dbError.message, 500);

  return ok(data ?? []);
});
