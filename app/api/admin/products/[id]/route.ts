import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/helpers/auth";
import { updateProductSchema, patchProductSchema } from "@/lib/validators/product";
import { ok, error, notFound } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

// GET /api/admin/products/[id] — single product with relations
export const GET = withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();

    const { data, error: dbError } = await supabase
      .from("products")
      .select("*, category:categories(*), sizes:product_sizes(*), images:product_images(*)")
      .eq("id", id)
      .single();

    if (dbError || !data) return notFound("Product not found");
    return ok(data);
  },
);

// PATCH /api/admin/products/[id] — partial update of scalar fields only (e.g. status).
// sizes/images are managed via PUT. Zod-validated to prevent mass-assignment.
export const PATCH = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    const input = patchProductSchema.parse(body);
    const supabase = await createClient();

    const { error: updateError } = await supabase
        .from("products")
        .update(input)
        .eq("id", id);

    if (updateError) return error(updateError.message, 500);

    return ok({ message: "Updated successfully" });
  }
);
export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const body = await req.json();
    // See the note in the POST route: products.price is derived from the sizes.
    const { sizes, images, price: _ignoredPrice, ...productData } =
      updateProductSchema.parse(body);

    const supabase = await createClient();

    if (Object.keys(productData).length > 0) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);

      if (updateError) return error(updateError.message, 500);
    }

    // Replace sizes if provided
    if (sizes && sizes.length > 0) {
      await supabase.from("product_sizes").delete().eq("product_id", id);

      const sizeRows = sizes.map((s) => ({
        product_id: id,
        label: s.label,
        price: s.price,
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
      await supabase.from("product_images").delete().eq("product_id", id);

      if (images.length > 0) {
        const imageRows = images.map((img, i) => ({
          product_id: id,
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
      .eq("id", id)
      .single();

    if (!full) return notFound("Product not found");
    return ok(full);
  },
);

// DELETE /api/admin/products/[id]
export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      // Hard delete
      const { error: dbError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (dbError) return error(dbError.message, 500);
      return ok({ message: "Product hard deleted" });
    } else {
      // Soft delete (archive)
      const { error: dbError } = await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("id", id);
      if (dbError) return error(dbError.message, 500);
      return ok({ message: "Product archived" });
    }
  },
);
