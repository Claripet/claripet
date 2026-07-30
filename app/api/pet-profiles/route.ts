export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { petProfileSchema } from "@/lib/validators/petProfile";

// GET /api/pet-profiles
export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const supabase = createClient();
  const { data, error: dbError } = await supabase
    .from("pet_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (dbError) return error(dbError.message, 500);
  return ok(data ?? []);
});

// POST /api/pet-profiles
export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireUser();
  const input = petProfileSchema.parse(await req.json());
  const supabase = createClient();
  const { data, error: dbError } = await supabase
    .from("pet_profiles")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (dbError) return error(dbError.message, 500);
  return ok(data, 201);
});
