export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { createArticleSchema } from "@/lib/validators/article";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";
import type { NextRequest } from "next/server";

// GET /api/admin/articles — all articles
export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const supabase = createClient();

  let qb = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const search = searchParams.get("search");
  if (search) qb = qb.ilike("title", `%${search}%`);

  const { data, count, error: dbError } = await qb;
  if (dbError) return error(dbError.message, 500);

  return ok({ articles: data ?? [], total: count ?? 0 });
});

// POST /api/admin/articles — create article
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();
  const body = await req.json();
  const articleData = createArticleSchema.parse(body);

  const supabase = createClient();

  const { data, error: insertError } = await supabase
    .from("articles")
    .insert(articleData)
    .select()
    .single();

  if (insertError) return error(insertError.message, 500);
  return ok(data, 201);
});
