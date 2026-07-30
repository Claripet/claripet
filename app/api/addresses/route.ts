export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { addressSchema } from "@/lib/validators/address";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/addresses
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = createClient();

  const { data, error: dbError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (dbError) return error(dbError.message, 500);
  return ok(data ?? []);
});

// POST /api/addresses
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const body = await req.json();
  const input = addressSchema.parse(body);
  const supabase = createClient();

  // If marking as default, unset other defaults
  if (input.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error: dbError } = await supabase
    .from("addresses")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (dbError) return error(dbError.message, 500);
  return ok(data, 201);
});
