"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { ImageUploader, type ProductImageInput } from "@/components/admin/ImageUploader";
import { useCart } from "@/context/CartContext";
interface Section {
  h: string;
  p: string;
}

interface ArticleFormState {
  slug: string;
  title: string;
  category: string;
  read_time: string;
  tone: string;
  featured: boolean;
  excerpt: string;
  body: string[];
  sections: Section[];
}

const TONES = ["sky", "sage", "pink", "lavender", "cream", "peach"];

export function ArticleForm({ article }: { article?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToastMsg } = useCart();

  const [form, setForm] = useState<ArticleFormState>({
    slug: article?.slug ?? "",
    title: article?.title ?? "",
    category: article?.category ?? "",
    read_time: article?.read_time ?? "",
    tone: article?.tone ?? "sky",
    featured: article?.featured ?? false,
    excerpt: article?.excerpt ?? "",
    body: article?.body ?? [],
    sections: article?.sections ?? [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      category: form.category || undefined,
      read_time: form.read_time || undefined,
      excerpt: form.excerpt || undefined,
      sections: form.sections.filter((s) => s.h && s.p),
    };

    const url = article?.id
      ? `/api/admin/articles/${article.id}`
      : "/api/admin/articles";
    const method = article?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? "Failed to save article");
      setSaving(false);
      return;
    }

    showToastMsg(article?.id ? "Article updated successfully" : "Article created successfully");
    router.push("/admin/articles");
    router.refresh();
  };

  const updateSection = (i: number, patch: Partial<Section>) => {
    const next = [...form.sections];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, sections: next });
  };

  const addSection = () =>
    setForm({ ...form, sections: [...form.sections, { h: "", p: "" }] });
  const removeSection = (i: number) =>
    setForm({ ...form, sections: form.sections.filter((_, idx) => idx !== i) });

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && (
        <div style={{ background: "var(--pink-50)", color: "#b04050", padding: "12px 18px", borderRadius: "var(--r-md)", marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="form-section card">
        <h3>Article Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-article-title"
              required
            />
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Grooming Tips"
            />
          </div>
          <div className="form-group">
            <label>Read Time</label>
            <input
              type="text"
              value={form.read_time}
              onChange={(e) => setForm({ ...form, read_time: e.target.value })}
              placeholder="5 min read"
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
          <label className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "end" }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
          <div className="form-group full">
            <label>Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="form-section card">
        <h3>Body (one paragraph per line)</h3>
        <div className="form-group">
          <textarea
            value={form.body.join("\n")}
            onChange={(e) => setForm({ ...form, body: e.target.value.split("\n").filter(Boolean) })}
            rows={6}
            placeholder="Intro paragraph...&#10;Second paragraph..."
          />
        </div>
      </div>

      <div className="form-section card">
        <h3>Sections</h3>
        {form.sections.map((s, i) => (
          <div key={i} className="section-row">
            <div className="section-fields">
              <input
                type="text"
                placeholder="Heading"
                value={s.h}
                onChange={(e) => updateSection(i, { h: e.target.value })}
              />
              <textarea
                placeholder="Paragraph"
                value={s.p}
                onChange={(e) => updateSection(i, { p: e.target.value })}
                rows={3}
              />
            </div>
            <button type="button" onClick={() => removeSection(i)} aria-label="Remove section" className="del-btn">
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addSection}>
          <Icon name="plus" size={14} /> Add Section
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : article?.id ? "Update Article" : "Create Article"}
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
        .form-group textarea,
        .section-fields input,
        .section-fields textarea {
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
        .form-group textarea:focus,
        .section-fields input:focus,
        .section-fields textarea:focus {
          border-color: var(--navy);
        }
        .section-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          margin-bottom: 14px;
        }
        .section-fields {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
        }
      `}</style>
    </form>
  );
}
