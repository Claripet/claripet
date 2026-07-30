"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Icon } from "@/components/icons";

export default function EditArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setArticle(json.success ? json.data : null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="muted">Loading...</p>;
  if (!article) return <p className="muted">Article not found</p>;

  return (
    <div>
      <Link
        href="/admin/articles"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Articles
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        Edit Article
      </h1>
      <ArticleForm article={article} />
    </div>
  );
}
