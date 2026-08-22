export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import { petProfileSchema } from "@/lib/validators/petProfile";

// PATCH /api/pet-profiles/[id]
export const PATCH = withErrorHandling(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await requireUser();
  const input = petProfileSchema.parse(await req.json());
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("pet_profiles")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (dbError) return error(dbError.message, 500);
  return ok(data);
});

// DELETE /api/pet-profiles/[id]
export const DELETE = withErrorHandling(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("pet_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (dbError) return error(dbError.message, 500);
  return ok({ removed: id });
});
