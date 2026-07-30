import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { getProduct } from "@/data/products";
import dynamic from "next/dynamic";

const FavoriteCardBody = dynamic(() => import("./FavoriteCardBody").then(m => m.FavoriteCardBody));

/**
 * Each card's media is the designed artwork from the mockup — a styled product
 * shot with the award badge already drawn in — so the pairing is fixed to the
 * product the artwork actually depicts, and no badge is rendered in code.
 * `bg` matches the artwork's own margin so the card blends into it seamlessly.
 */
const FAVORITES = [
  { slug: "claripet-baby-powder", img: "/images/features/favorite-most-loved.png", alt: "Most Loved", bg: "#f6f4f9" },
  { slug: "claripet-gentle-wash-shampoo", img: "/images/features/favorite-visible-results.png", alt: "Visible Results", bg: "#f6f6f6" },
  { slug: "claripet-tear-stain-remover", img: "/images/features/favorite-customer-favorite.png", alt: "Customer Favorite", bg: "#f7f6f6" },
  { slug: "claripet-breath", img: "/images/features/favorite-everyday-essential.png", alt: "Everyday Essential", bg: "#f5f5f5" },
];

export function PetParentFavorites() {
  return (
    <section className="section bg-sand" style={{ background: "var(--sand)" }}>
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <h2 className="h2">Pet Parent Favorites</h2>
            <p className="lead" style={{ marginTop: 8 }}>The products our customers keep coming back for</p>
          </div>
          <Link className="link" href="/shop">
            View All Products <Icon name="arrowRight" size={17} />
          </Link>
        </div>

        <div className="favorites-grid">
          {FAVORITES.map((fav, i) => {
            const p = getProduct(fav.slug);
            if (!p) return null;

            return (
              <div
                key={p.slug}
                className={`prod-card reveal reveal-d${Math.min(i + 1, 5)}`}
                style={{ backgroundColor: fav.bg, height: "100%" }}
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="prod-media"
                  style={{
                    display: "block",
                    // Matches the artwork's own ratio, so the badge is never
                    // cropped off the top by object-fit.
                    aspectRatio: "972 / 1133",
                    position: "relative",
                    backgroundColor: "transparent",
                  }}
                >
                  <Image
                    src={fav.img}
                    alt={`${p.name} — ${fav.alt}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </Link>
                <FavoriteCardBody product={p} />
              </div>
            );
          })}
        </div>
        <div className="center reveal reveal-d5" style={{ marginTop: 48 }}>
          <p className="lead" style={{ maxWidth: 800, margin: "0 auto" }}>
            Mulai dari bau badan, bau mulut, tear stain, perawatan bulu, hingga masalah kulit, ClariPet hadir untuk membantu kebutuhan sehari-hari hewan peliharaan Anda.
          </p>
        </div>
      </div>
    </section>
  );
}

