import { Icon } from "@/components/icons";

export function StarRating({
  rating,
  reviews,
  showCount = true,
}: {
  rating: number;
  reviews?: number;
  showCount?: boolean;
}) {
  if (reviews === 0 && showCount) {
    return <span className="stars muted" style={{ fontSize: 12 }}>Belum ada ulasan</span>;
  }
  return (
    <span className="stars" role="img" aria-label={`Rated ${rating} out of 5 stars` + (reviews != null && showCount ? ` from ${reviews} reviews` : "")}>
      <Icon name="star" size={14} />
      <span className="num">{rating}</span>
      {showCount && reviews != null && <span>({reviews})</span>}
    </span>
  );
}
