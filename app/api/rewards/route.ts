export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/rewards -> { balance, lifetime, tier, events[] }
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = createClient();

  // Run both queries in parallel — previously sequential, costing an extra RTT.
  const [pointsRes, eventsRes] = await Promise.all([
    supabase
      .from("reward_points")
      .select("balance, lifetime, tier")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("reward_events")
      .select("id, points, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (eventsRes.error) return error(eventsRes.error.message, 500);
  // A null reward_points row (new user, no points yet) is fine — maybeSingle()
  // returns { data: null, error: null } in that case. A non-null error means a
  // real DB failure, which we must surface rather than silently report 0 points.
  if (pointsRes.error) return error(pointsRes.error.message, 500);

  return ok({
    balance: pointsRes.data?.balance ?? 0,
    lifetime: pointsRes.data?.lifetime ?? 0,
    tier: pointsRes.data?.tier ?? "Friend",
    events: eventsRes.data ?? [],
  });
});
