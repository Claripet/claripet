import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/helpers/auth";
import { ok, error } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
// Allow-list rather than free-form: the value becomes a storage path segment,
// so anything unlisted would let a caller write outside the intended folders.
const ALLOWED_FOLDERS = ["products", "reviews"];

// POST /api/admin/uploads — upload an image to Supabase Storage
export const POST = withErrorHandling(async (req: Request) => {
  await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file");
  const folderField = formData.get("folder");
  const folder = typeof folderField === "string" ? folderField : "products";

  if (!(file instanceof File)) return error("No file provided");
  if (!ALLOWED_TYPES.includes(file.type))
    return error("Only JPEG, PNG, or WebP images are allowed");
  if (file.size > MAX_SIZE) return error("Image must be 5 MB or smaller");
  if (!ALLOWED_FOLDERS.includes(folder)) return error("Unknown upload folder");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

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
