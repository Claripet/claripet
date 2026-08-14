import Link from "next/link";
import { Icon } from "@/components/icons";
import { Placeholder } from "@/components/Placeholder";
import type { Review } from "@/lib/types";

/**
 * One admin-authored review. Shared by the reviews page, the home page shelf
 * and the product page, so a card looks the same wherever it appears.
 */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="story-card">
      <div className="story-media">
        <Placeholder
          tone={review.tone}
          src={review.photoUrl}
          alt={review.photoUrl ? `${review.authorName} — foto ulasan` : undefined}
          label={review.authorName}
          width={640}
          height={400}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <blockquote>“{review.body}”</blockquote>

      <span className="stars" role="img" aria-label={`Rated ${review.rating} out of 5 stars`}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <Icon key={i} name="star" size={14} />
        ))}
      </span>

      <figcaption>
        <strong>{review.authorName}</strong>
        {review.petName && <span>{review.petName}</span>}
        {review.product && (
          <Link href={`/product/${review.product.slug}`} className="story-product">
            {review.product.name}
          </Link>
        )}
      </figcaption>
    </figure>
  );
}
