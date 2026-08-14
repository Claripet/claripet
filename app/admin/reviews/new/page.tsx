"use client";

import Link from "next/link";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { Icon } from "@/components/icons";

export default function NewReviewPage() {
  return (
    <div>
      <Link
        href="/admin/reviews"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Reviews
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        New Review
      </h1>
      <ReviewForm />
    </div>
  );
}
