import Link from "next/link";
import type { Category } from "@/lib/types";

const IMG: Record<string, string> = {
  perfumes: "/assets/images/categories/Perfume Card.png",
  "hygiene-grooming": "/assets/images/categories/Hygiene & Grooming Card.png",
  "skin-care": "/assets/images/categories/Skin Care Card.png",
  "fur-care-supplements": "/assets/images/categories/Fur Care & Supplements Card.png",
  "behavior-training": "/assets/images/categories/Behavior & Training Card.png",
  "home-environment-care": "/assets/images/categories/Home & Environment Card.png",
};

export function CategoryCard({ cat }: { cat: Category }) {
  const src = cat.image || IMG[cat.slug];
  return (
    <Link
      href={`/shop/${cat.slug}`}
      className="cat-card"
      aria-label={`Shop ${cat.name} category`}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={cat.name} className="cat-card-img" />
      ) : (
        <span className="cat-card-fallback">{cat.name}</span>
      )}
    </Link>
  );
}
