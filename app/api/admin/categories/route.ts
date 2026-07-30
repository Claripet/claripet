import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { createCategorySchema } from "@/lib/validators/category";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const body = await req.json();
  const input = createCategorySchema.parse(body);

  const supabase = createClient();
  const { data, error: dbError } = await supabase
    .from("categories")
    .insert(input)
    .select()
    .single();

  if (dbError) return error(dbError.message, 500);
  return ok(data, 201);
});
