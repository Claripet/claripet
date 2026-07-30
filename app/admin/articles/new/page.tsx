"use client";

import Link from "next/link";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Icon } from "@/components/icons";

export default function NewArticlePage() {
  return (
    <div>
      <Link
        href="/admin/articles"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Articles
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        New Article
      </h1>
      <ArticleForm />
    </div>
  );
}
