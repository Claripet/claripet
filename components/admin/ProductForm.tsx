"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { ImageUploader, type ProductImageInput } from "@/components/admin/ImageUploader";
import { useCart } from "@/context/CartContext";

interface Size {
  label: string;
  stock: number;
  sku?: string;
}

interface Product {
  id?: string;
  slug: string;
  name: string;
  subtitle: string;
  category_id: string;
  price: number;
  tone: string;
  best_seller: boolean;
  short: string;
  benefits: string[];
  features: string[];
  mascot: string;
  ingredients: string;
  howto: string;
  status: string;
  sizes: Size[];
  images: ProductImageInput[];
}

const TONES = ["sky", "sage", "pink", "lavender", "cream", "peach"];
const STATUSES = ["draft", "active", "archived"];

export function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToastMsg } = useCart();

  const [form, setForm] = useState<Product>({
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    subtitle: product?.subtitle ?? "",
    category_id: product?.category_id ?? "",
    price: product?.price ?? 0,
    tone: product?.tone ?? "sky",
    best_seller: product?.best_seller ?? false,
    short: product?.short ?? "",
    benefits: product?.benefits ?? [],
    features: product?.features ?? [],
    mascot: product?.mascot ?? "",
    ingredients: product?.ingredients ?? "",
    howto: product?.howto ?? "",
    status: product?.status ?? "draft",
    sizes: product?.sizes?.length
      ? product.sizes.map((s: any) => ({ label: s.label, stock: s.stock, sku: s.sku }))
      : [{ label: "", stock: 0 }],
    images: product?.images?.length
      ? [...product.images]
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((img: any, i: number) => ({ url: img.url, alt: img.alt ?? undefined, sort_order: i }))
      : [],
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCategories(json.data);
          if (!form.category_id && json.data.length > 0) {
            setForm((f) => ({ ...f, category_id: json.data[0].id }));
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      price: Number(form.price),
      sizes: form.sizes
        .filter((s) => s.label)
        .map((s) => ({ ...s, stock: Number(s.stock) })),
    };

    const url = product?.id
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = product?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? "Failed to save product");
      setSaving(false);
      return;
    }

    showToastMsg(product?.id ? "Product updated successfully" : "Product created successfully");
    router.push("/admin/products");
    router.refresh();
  };

  const updateSize = (i: number, patch: Partial<Size>) => {
    const next = [...form.sizes];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, sizes: next });
  };

  const addSize = () => setForm({ ...form, sizes: [...form.sizes, { label: "", stock: 0 }] });
  const removeSize = (i: number) =>
    setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) });

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && (
        <div style={{ background: "var(--pink-50)", color: "#b04050", padding: "12px 18px", borderRadius: "var(--r-md)", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="form-section card">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-product-name"
              required
            />
          </div>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group full">
            <label>Subtitle</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Price (IDR) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              min={0}
              required
            />
          </div>
          <div className="form-group">
            <label>Tone</label>
            <select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label className="form-group full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.best_seller}
              onChange={(e) => setForm({ ...form, best_seller: e.target.checked })}
            />
            Best Seller
          </label>
        </div>
      </div>

      <div className="form-section card">
        <h3>Photos</h3>
        <ImageUploader
          images={form.images}
          onChange={(images) => setForm({ ...form, images })}
        />
      </div>

      <div className="form-section card">
        <h3>Description</h3>
        <div className="form-group">
          <label>Short Description</label>
          <textarea
            value={form.short}
            onChange={(e) => setForm({ ...form, short: e.target.value })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Benefits (one per line)</label>
          <textarea
            value={form.benefits.join("\n")}
            onChange={(e) => setForm({ ...form, benefits: e.target.value.split("\n").filter(Boolean) })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Features (one per line)</label>
          <textarea
            value={form.features.join("\n")}
            onChange={(e) => setForm({ ...form, features: e.target.value.split("\n").filter(Boolean) })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Mascot Tagline</label>
          <input
            type="text"
            value={form.mascot}
            onChange={(e) => setForm({ ...form, mascot: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Ingredients</label>
          <textarea
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>How To Use</label>
          <textarea
            value={form.howto}
            onChange={(e) => setForm({ ...form, howto: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="form-section card">
        <h3>Sizes & Inventory</h3>
        {form.sizes.map((s, i) => (
          <div key={i} className="size-row">
            <input
              type="text"
              placeholder="Size label (e.g., 100ml)"
              value={s.label}
              onChange={(e) => updateSize(i, { label: e.target.value })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={s.stock}
              onChange={(e) => updateSize(i, { stock: Number(e.target.value) })}
              min={0}
            />
            <input
              type="text"
              placeholder="SKU (optional)"
              value={s.sku ?? ""}
              onChange={(e) => updateSize(i, { sku: e.target.value })}
            />
            <button type="button" onClick={() => removeSize(i)} aria-label="Remove" className="del-btn">
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addSize}>
          <Icon name="plus" size={14} /> Add Size
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : product?.id ? "Update Product" : "Create Product"}
        </button>
      </div>

      <style jsx>{`
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-section {
          padding: 24px;
        }
        .form-section h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 18px;
          color: var(--navy);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .form-group.full {
          grid-column: 1 / -1;
        }
        .form-group label {
          font-weight: 500;
          font-size: 13px;
          color: var(--navy);
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 14px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          background: #fff;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--navy);
        }
        .size-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr auto;
          gap: 10px;
          margin-bottom: 10px;
        }
        .size-row input {
          padding: 9px 12px;
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }
        .del-btn {
          background: var(--pink-50);
          border: none;
          border-radius: var(--r-md);
          color: #b04050;
          padding: 0 12px;
          cursor: pointer;
        }
        @media (max-width: 700px) {
          .form-grid { grid-template-columns: 1fr; }
          .size-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}
