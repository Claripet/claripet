import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateProductSchema, patchProductSchema } from "@/lib/validators/product";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/admin/products/[id] — single product with relations
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();

    const { data, error: dbError } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(*), images:product_images(*)")
      .eq("id", params.id)
      .single();

    if (dbError || !data) return notFound("Product not found");
    return ok(data);
  },
);

// PATCH /api/admin/products/[id] — partial update of scalar fields only (e.g. status).
// sizes/images are managed via PUT. Zod-validated to prevent mass-assignment.
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const input = patchProductSchema.parse(body);
    const supabase = createClient();

    const { error: updateError } = await supabase
        .from("products")
        .update(input)
        .eq("id", params.id);

    if (updateError) return error(updateError.message, 500);

    return ok({ message: "Updated successfully" });
  }
);
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const body = await req.json();
    const { sizes, images, ...productData } = updateProductSchema.parse(body);

    const supabase = createClient();

    if (Object.keys(productData).length > 0) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", params.id);

      if (updateError) return error(updateError.message, 500);
    }

    // Replace sizes if provided
    if (sizes && sizes.length > 0) {
      await supabase.from("product_sizes").delete().eq("product_id", params.id);

      const sizeRows = sizes.map((s) => ({
        product_id: params.id,
        label: s.label,
        stock: s.stock,
        sku: s.sku ?? null,
      }));

      const { error: sizeError } = await supabase
        .from("product_sizes")
        .insert(sizeRows);

      if (sizeError) return error(sizeError.message, 500);
    }

    // Replace images if provided (empty array clears the gallery)
    if (images !== undefined) {
      await supabase.from("product_images").delete().eq("product_id", params.id);

      if (images.length > 0) {
        const imageRows = images.map((img, i) => ({
          product_id: params.id,
          url: img.url,
          alt: img.alt ?? null,
          sort_order: img.sort_order ?? i,
        }));

        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imageError) return error(imageError.message, 500);
      }
    }

    const { data: full } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(*), images:product_images(*)")
      .eq("id", params.id)
      .single();

    if (!full) return notFound("Product not found");
    return ok(full);
  },
);

// DELETE /api/admin/products/[id]
export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      // Hard delete
      const { error: dbError } = await supabase
        .from("products")
        .delete()
        .eq("id", params.id);
      if (dbError) return error(dbError.message, 500);
      return ok({ message: "Product hard deleted" });
    } else {
      // Soft delete (archive)
      const { error: dbError } = await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("id", params.id);
      if (dbError) return error(dbError.message, 500);
      return ok({ message: "Product archived" });
    }
  },
);
