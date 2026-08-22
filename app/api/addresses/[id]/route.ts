import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/helpers/auth";
import { updateAddressSchema } from "@/lib/validators/address";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/addresses/[id]
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!data) return notFound("Address not found");
    return ok(data);
  },
);

// PUT /api/addresses/[id]
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const body = await req.json();
    const input = updateAddressSchema.parse(body);
    const supabase = await createClient();

    if (input.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error: dbError } = await supabase
      .from("addresses")
      .update(input)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) return error(dbError.message, 500);
    if (!data) return notFound("Address not found");
    return ok(data);
  },
);

// DELETE /api/addresses/[id]
export const DELETE = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = await requireUser();
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (dbError) return error(dbError.message, 500);
    return ok({ message: "Address deleted" });
  },
);
