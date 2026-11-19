export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];
const DAY_MS = 24 * 60 * 60 * 1000;

// GET /api/admin/stats — dashboard numbers over ALL orders.
// The dashboard used to add up the latest 100 orders in the browser, so
// revenue and the pending count were wrong from the 101st order on.
export const GET = withErrorHandling(async () => {
  await requireAdmin();
  const supabase = await createClient();

  const count = (status?: string[], table = "orders") => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (status) q = q.in("status", status);
    return q;
  };

  const [all, unpaid, toShip, unreadMessages, revenueRows] = await Promise.all([
    count(),
    count(["pending"]),
    count(["paid", "processing"]),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    // PostgREST has no SUM without an RPC; at this shop's volume the totals of
    // paid orders are a small payload. Capped so it can never grow unbounded.
    supabase
      .from("orders")
      .select("total, created_at")
      .in("status", PAID_STATUSES)
      .order("created_at", { ascending: false })
      .limit(10000),
  ]);

  const failed = [all, unpaid, toShip, unreadMessages, revenueRows].find((r) => r.error);
  if (failed?.error) return error(failed.error.message, 500);

  const rows = revenueRows.data ?? [];
  const now = Date.now();
  const sumSince = (days: number) =>
    rows.filter((r) => now - new Date(r.created_at).getTime() <= days * DAY_MS).reduce((s, r) => s + (r.total ?? 0), 0);

  return ok({
    totalOrders: all.count ?? 0,
    unpaidOrders: unpaid.count ?? 0,
    toShipOrders: toShip.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
    revenueTotal: rows.reduce((s, r) => s + (r.total ?? 0), 0),
    revenue7d: sumSince(7),
    revenue30d: sumSince(30),
  });
});
