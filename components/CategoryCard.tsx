import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

const IMG: Record<string, string> = {
  perfumes: "/assets/images/categories/Perfume Card.png",
  "hygiene-grooming": "/assets/images/categories/Hygiene & Grooming Card.png",
  "skin-care": "/assets/images/categories/Skin Care Card.png",
  "fur-care-supplements": "/assets/images/categories/Fur Care & Supplements Card.png",
  "behavior-training": "/assets/images/categories/Behavior & Training Card.png",
  "home-environment-care": "/assets/images/categories/Home & Environment Card.png",
};

/** Intrinsic size of every file in the card set — they are cropped to match. */
const ART_W = 992;
const ART_H = 1504;

export function CategoryCard({ cat }: { cat: Category }) {
  const src = cat.image || IMG[cat.slug];
  return (
    <Link
      href={`/shop/${cat.slug}`}
      className="cat-card"
      aria-label={`Shop ${cat.name} category`}
    >
      {src ? (
        <>
          {/* Decorative: the name below carries the same information, and the
              link's aria-label already names the destination. */}
          <Image
            src={src}
            alt=""
            width={ART_W}
            height={ART_H}
            className="cat-card-img"
            /* The card is capped at 260px and drops to ~56vw on the mobile
               2-up grid. Without this the optimiser would serve a variant
               sized for the full viewport. */
            sizes="(max-width: 860px) 60vw, 260px"
            /* Eager, not lazy: the row sits just below the fold on the home
               page, and lazy-loading left the cards visibly blank on first
               scroll. Not `priority` — six preloads would compete with the
               hero for bandwidth. */
            loading="eager"
          />
          <span className="cat-card-title">{cat.name}</span>
        </>
      ) : (
        <span className="cat-card-fallback">{cat.name}</span>
      )}
    </Link>
  );
}
