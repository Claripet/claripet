"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  read_time: string | null;
  featured: boolean;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToastMsg } = useCart();
  const [search, setSearch] = useState("");

  const fetchArticles = () => {
    setLoading(true);
    const url = search
      ? `/api/admin/articles?search=${encodeURIComponent(search)}`
      : "/api/admin/articles";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setArticles(json.data.articles);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalState, setModalState] = useState<{ isOpen: boolean; articleId: string | null }>({
    isOpen: false,
    articleId: null
  });

  const handleDelete = (id: string) => {
    setModalState({ isOpen: true, articleId: id });
  };

  const confirmDelete = async () => {
    if (!modalState.articleId) return;
    setModalState({ isOpen: false, articleId: null });
    
    await fetch(`/api/admin/articles/${modalState.articleId}`, { method: "DELETE" });
    showToastMsg("Article deleted successfully");
    fetchArticles();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 className="h2">Journal Articles</h1>
        <Link href="/admin/articles/new" className="btn btn-primary">
          <Icon name="plus" size={16} /> New Article
        </Link>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchArticles()}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "var(--r-pill)",
            border: "1.5px solid var(--line)",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button className="btn btn-ghost" onClick={fetchArticles}>
          Search
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p className="muted" style={{ padding: 32 }}>Loading...</p>
        ) : articles.length === 0 ? (
          <p className="muted" style={{ padding: 32 }}>No articles yet.</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Read Time</th>
                <th>Featured</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{a.slug}</div>
                  </td>
                  <td>{a.category ?? "—"}</td>
                  <td>{a.read_time ?? "—"}</td>
                  <td>
                    {a.featured && <span className="badge badge-shipped">featured</span>}
                  </td>
                  <td>{new Date(a.created_at).toLocaleDateString("id-ID")}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/admin/articles/${a.id}`}
                      style={{ marginRight: 14, color: "var(--navy)", fontWeight: 500, fontSize: 13 }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#b04050",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
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
        
                <ConfirmModal
                isOpen={modalState.isOpen}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setModalState({ isOpen: false, articleId: null })}
                />
                </div>
                );
                }
