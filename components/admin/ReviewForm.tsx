"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

interface ReviewFormState {
  author_name: string;
  pet_name: string;
  rating: number;
  body: string;
  photo_url: string;
  product_id: string;
  tone: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

interface ProductOption {
  id: string;
  name: string;
}

const TONES = ["sky", "sage", "pink", "lavender", "cream", "peach"];

export function ReviewForm({ review }: { review?: any }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToastMsg } = useCart();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [form, setForm] = useState<ReviewFormState>({
    author_name: review?.author_name ?? "",
    pet_name: review?.pet_name ?? "",
    rating: review?.rating ?? 5,
    body: review?.body ?? "",
    photo_url: review?.photo_url ?? "",
    product_id: review?.product_id ?? "",
    tone: review?.tone ?? "sky",
    featured: review?.featured ?? false,
    published: review?.published ?? true,
    sort_order: review?.sort_order ?? 0,
  });

  // Product link is optional, so a failed catalogue fetch just leaves the
  // dropdown empty rather than blocking the form.
  useEffect(() => {
    fetch("/api/admin/products?limit=200")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProducts(json.data.products ?? []);
      })
      .catch(() => {});
  }, []);

  const handlePhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "reviews");

    try {
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) setError(json.error ?? "Upload failed");
      else setForm((f) => ({ ...f, photo_url: json.data.url }));
    } catch {
      setError("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      pet_name: form.pet_name || undefined,
      photo_url: form.photo_url || undefined,
      // Null (not undefined) so clearing the dropdown actually unlinks the
      // product on an update instead of leaving the old link in place.
      product_id: form.product_id || null,
      rating: Number(form.rating),
      sort_order: Number(form.sort_order),
    };

    const url = review?.id ? `/api/admin/reviews/${review.id}` : "/api/admin/reviews";
    const method = review?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? "Failed to save review");
      setSaving(false);
      return;
    }

    showToastMsg(review?.id ? "Review updated successfully" : "Review created successfully");
    router.push("/admin/reviews");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && (
        <div style={{ background: "var(--pink-50)", color: "#b04050", padding: "12px 18px", borderRadius: "var(--r-md)", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="form-section card">
        <h3>Review Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              placeholder="Jessica & Mochi"
              required
            />
          </div>
          <div className="form-group">
            <label>Pet / Subtitle</label>
            <input
              type="text"
              value={form.pet_name}
              onChange={(e) => setForm({ ...form, pet_name: e.target.value })}
              placeholder="Mochi · Poodle"
            />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Product (optional)</label>
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            >
              <option value="">— No product —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label>Review *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={5}
              placeholder="What the customer said about the product…"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section card">
        <h3>Photo</h3>
        <div className="photo-row">
          {form.photo_url ? (
            <div className="thumb">
              <Image src={form.photo_url} alt="Review photo" width={120} height={120} style={{ objectFit: "cover" }} />
              <button type="button" className="remove" onClick={() => setForm({ ...form, photo_url: "" })}>
                <Icon name="trash" size={14} /> Remove
              </button>
            </div>
          ) : (
            <p className="hint">
              No photo — the card falls back to the illustrated placeholder in the tone below.
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => handlePhoto(e.target.files)}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Icon name="plus" size={14} /> {uploading ? "Uploading..." : form.photo_url ? "Replace Photo" : "Add Photo"}
          </button>
          <p className="hint">JPEG, PNG, or WebP — max 5 MB.</p>
        </div>
      </div>

      <div className="form-section card">
        <h3>Display</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Placeholder Tone</label>
            <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
          <label className="form-group check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured (shown on the home page)
          </label>
          <label className="form-group check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible on the site)
          </label>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
          {saving ? "Saving..." : review?.id ? "Update Review" : "Create Review"}
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
        .form-group.check {
          flex-direction: row;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--navy);
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
        .form-group.check input {
          padding: 0;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--navy);
        }
        .photo-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }
        .thumb {
          border: 1.5px solid var(--line);
          border-radius: var(--r-md);
          overflow: hidden;
          background: #fff;
          width: 120px;
        }
        .thumb :global(img) {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }
        .thumb .remove {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          padding: 6px;
          border: none;
          border-top: 1.5px solid var(--line);
          background: var(--pink-50);
          color: #b04050;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
        }
        .hint {
          font-size: 12px;
          color: var(--text-soft);
          margin: 0;
        }
        @media (max-width: 700px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}
