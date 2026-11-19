export const dynamic = "force-dynamic";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/admin/messages?status=new|read|archived — contact form inbox
export const GET = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const status = new URL(req.url).searchParams.get("status");
  const supabase = await createClient();

  let q = supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && ["new", "read", "archived"].includes(status)) q = q.eq("status", status);

  const { data, error: dbError } = await q;
  if (dbError) return error(dbError.message, 500);
  return ok(data ?? []);
});

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "read", "archived"]),
});

// PATCH /api/admin/messages — { id, status }
export const PATCH = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const { id, status } = patchSchema.parse(await req.json());
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (dbError) return error(dbError.message, 500);
  return ok({ id, status });
});
