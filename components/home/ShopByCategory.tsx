import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { Icon } from "@/components/icons";
import { CategoryCard } from "@/components/CategoryCard";
import { SectionDoodles } from "@/components/DecorIcons";

export function ShopByCategory() {
  return (
    <section className="section shop-cat-wide section-doodles" style={{ margin: "0 auto" }}>
      <SectionDoodles marks={["paw-soft", "sparkle-mini", "heart-mini", "trail-curve"]} />
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <h2 className="h2">Find What Your Pet Needs</h2>
          </div>
          <Link className="link" href="/shop">
            Lihat Semua Produk <Icon name="arrowRight" size={17} />
          </Link>
        </div>
        <div className="cat-grid cat-grid-row cat-scroll-mobile">
          {CATEGORIES.map((c, i) => (
            <div key={c.slug} className={`reveal reveal-d${Math.min(i + 1, 5)}`}>
              <CategoryCard cat={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
