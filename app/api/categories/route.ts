export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const GET = withErrorHandling(async () => {
  const supabase = createClient();

  const { data, error: dbError } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (dbError) {
    return error(dbError.message, 500);
  }

  return ok(data ?? []);
});
