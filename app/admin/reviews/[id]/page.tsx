"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { Icon } from "@/components/icons";

export default function EditReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/reviews/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setReview(json.success ? json.data : null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="muted">Loading...</p>;
  if (!review) return <p className="muted">Review not found</p>;

  return (
    <div>
      <Link
        href="/admin/reviews"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Reviews
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        Edit Review
      </h1>
      <ReviewForm review={review} />
    </div>
  );
}
