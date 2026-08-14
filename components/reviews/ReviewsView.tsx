import Link from "next/link";
import { Icon } from "@/components/icons";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { Review } from "@/lib/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={14} />
      ))}
      <span className="num">{value.toFixed(1)}</span>
    </span>
  );
}

export function ReviewsView({ reviews }: { reviews: Review[] }) {
  // Averaged from what is actually published — no hardcoded 4.9.
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <main>
      <section className="wrap reviews-hero">
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          <Icon name="heart" size={16} /> Reviews
        </div>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Loved By Pet Parents Across Indonesia
        </h1>
        <p className="lead mx-auto" style={{ marginBottom: 20 }}>
          Cerita nyata dari pemilik hewan peliharaan yang menjadikan ClariPet bagian
          dari rutinitas perawatan sehari-hari.
        </p>
        {reviews.length > 0 && <Stars value={average} />}
      </section>

      <section className="section" style={{ paddingTop: 28 }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 38 }}>
            <h2 className="h2">Real Stories From Real Pet Parents</h2>
          </div>

          {reviews.length === 0 ? (
            <p className="muted center">
              Belum ada ulasan yang dipublikasikan. Nantikan cerita dari para pet
              parents ClariPet.
            </p>
          ) : (
            <div className="story-grid">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="quiz-cta">
            <div>
              <h2 className="h2" style={{ marginBottom: 12 }}>
                Thank You For Being Part Of Our Journey
              </h2>
              <p className="lead">
                Bergabunglah dengan ribuan pet parents yang mempercayai ClariPet untuk perawatan sehari-hari.
              </p>
              <div style={{ marginTop: 22 }}>
                <Link href="/shop" className="btn btn-primary btn-lg">
                  <Icon name="arrowRight" size={18} /> Jelajahi Produk ClariPet
                </Link>
              </div>
            </div>
            <div className="quiz-cta-media">
              <div className="ph sky">Hewan peliharaan bahagia</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
