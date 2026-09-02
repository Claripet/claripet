import Link from "next/link";
import { Icon } from "@/components/icons";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { getFeaturedReviews } from "@/lib/data";

/**
 * Home page review shelf, fed by the reviews an admin marked as featured in
 * /admin/reviews. Renders nothing at all when there are no published reviews —
 * an empty shelf is worse than no shelf, and there is no dummy copy to fall
 * back on by design.
 */
export async function CustomerReviews() {
  const reviews = await getFeaturedReviews(3);
  if (reviews.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="center" style={{ marginBottom: 38 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Reviews
          </div>
          <h2 className="h2">Loved By Pet Parents</h2>
          <p className="muted">
            Cerita nyata dari pemilik hewan peliharaan yang memakai ClariPet setiap hari.
          </p>
        </div>

        <div className="story-grid">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>

        <div className="center" style={{ marginTop: 32 }}>
          <Link href="/reviews" className="btn btn-ghost">
            Lihat Semua Ulasan <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
