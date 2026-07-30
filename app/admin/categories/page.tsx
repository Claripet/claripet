"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCart } from "@/context/CartContext";

interface Category {
  id: string;
  slug: string;
  name: string;
  tone: string | null;
  icon: string | null;
  blurb: string | null;
  sort_order: number;
}

const TONES = ["sky", "sage", "pink", "lavender", "cream", "peach"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { showToastMsg } = useCart();
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = (id: string) => {
    setModalState({ isOpen: true, categoryId: id });
  };

  const confirmDelete = async () => {
    if (!modalState.categoryId) return;
    setModalState({ isOpen: false, categoryId: null });
    
    await fetch(`/api/admin/categories/${modalState.categoryId}`, { method: "DELETE" });
    showToastMsg("Category deleted successfully");
    fetchCategories();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 className="h2">Categories</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Icon name="plus" size={16} /> New Category
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p className="muted" style={{ padding: 32 }}>Loading...</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Tone</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{c.name}</div>
                    {c.blurb && <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{c.blurb}</div>}
                  </td>
                  <td>{c.slug}</td>
                  <td>{c.tone ?? "—"}</td>
                  <td>{c.sort_order}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => { setEditing(c); setShowForm(true); }}
                      style={{ marginRight: 14, background: "none", border: "none", color: "var(--navy)", fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{ background: "none", border: "none", color: "#b04050", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { 
            setShowForm(false); 
            setEditing(null); 
            showToastMsg(editing ? "Category updated successfully" : "Category created successfully");
            fetchCategories(); 
          }}
        />
      )}

      <ConfirmModal
        isOpen={modalState.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products currently in this category will lose their category assignment."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ isOpen: false, categoryId: null })}
      />
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: category?.slug ?? "",
    name: category?.name ?? "",
    tone: category?.tone ?? "sky",
    icon: category?.icon ?? "sparkle",
    blurb: category?.blurb ?? "",
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
    const method = category ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) }),
    });
    onSaved();
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, textAlign: "left" }}>
        <h3 className="h3" style={{ marginBottom: 20 }}>
          {category ? "Edit Category" : "New Category"}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="grooming"
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
          <div className="form-group">
            <label>Blurb</label>
            <input
              type="text"
              value={form.blurb}
              onChange={(e) => setForm({ ...form, blurb: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Tone</label>
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
          </div>
          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="sparkle, droplet, leaf, smile, shield, spray"
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-group label {
            font-weight: 500;
            font-size: 13px;
            color: var(--navy);
          }
          .form-group input,
          .form-group select {
            padding: 10px 14px;
            border: 1.5px solid var(--line);
            border-radius: var(--r-md);
            font-family: inherit;
            font-size: 14px;
            outline: none;
          }
          .form-group input:focus,
          .form-group select:focus {
            border-color: var(--navy);
          }
        `}</style>
      </div>
    </div>
  );
}
