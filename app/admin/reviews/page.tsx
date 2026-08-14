"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface Review {
  id: string;
  author_name: string;
  pet_name: string | null;
  rating: number;
  body: string;
  photo_url: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  product?: { slug: string; name: string } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToastMsg } = useCart();
  const [search, setSearch] = useState("");

  const fetchReviews = () => {
    setLoading(true);
    const url = search
      ? `/api/admin/reviews?search=${encodeURIComponent(search)}`
      : "/api/admin/reviews";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setReviews(json.data.reviews);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [modalState, setModalState] = useState<{ isOpen: boolean; reviewId: string | null }>({
    isOpen: false,
    reviewId: null,
  });

  const confirmDelete = async () => {
    if (!modalState.reviewId) return;
    setModalState({ isOpen: false, reviewId: null });

    await fetch(`/api/admin/reviews/${modalState.reviewId}`, { method: "DELETE" });
    showToastMsg("Review deleted successfully");
    fetchReviews();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 className="h2">Customer Reviews</h1>
        <Link href="/admin/reviews/new" className="btn btn-primary">
          <Icon name="plus" size={16} /> New Review
        </Link>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchReviews()}
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
        <button className="btn btn-ghost" onClick={fetchReviews}>
          Search
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p className="muted" style={{ padding: 32 }}>Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="muted" style={{ padding: 32 }}>
            No reviews yet. Add one and it appears on the reviews page straight away.
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Product</th>
                  <th>Photo</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{r.author_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.body}
                      </div>
                    </td>
                    <td>{r.rating} ★</td>
                    <td>{r.product?.name ?? "—"}</td>
                    <td>{r.photo_url ? "Yes" : "—"}</td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.featured && <span className="badge badge-shipped">featured</span>}
                      {!r.published && <span className="badge">hidden</span>}
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/admin/reviews/${r.id}`}
                        style={{ marginRight: 14, color: "var(--navy)", fontWeight: 500, fontSize: 13 }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setModalState({ isOpen: true, reviewId: r.id })}
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
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setModalState({ isOpen: false, reviewId: null })}
      />
    </div>
  );
}
