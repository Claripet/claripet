export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { updateProfileSchema } from "@/lib/validators/profile";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// PUT /api/profile — update current user's profile
export const PUT = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const input = updateProfileSchema.parse(body);
  const supabase = createClient();

  const { data, error: dbError } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone || null,
    })
    .eq("id", user.id)
    .select("full_name, phone, role")
    .single();

  if (dbError) return error(dbError.message, 500);
  return ok(data);
});
