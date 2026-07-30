import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// POST /api/admin/uploads — upload a product photo to Supabase Storage
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) return error("No file provided");
  if (!ALLOWED_TYPES.includes(file.type))
    return error("Only JPEG, PNG, or WebP images are allowed");
  if (file.size > MAX_SIZE) return error("Image must be 5 MB or smaller");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  // Service-role client: storage write bypasses RLS (admin already verified above)
  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

  if (uploadError) return error(uploadError.message, 500);

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  return ok({ url: publicUrl, path }, 201);
});
