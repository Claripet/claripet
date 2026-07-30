import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { Icon } from "@/components/icons";
import { CategoryCard } from "@/components/CategoryCard";

export function ShopByCategory() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <h2 className="h2">Find What Your Pet Needs</h2>
          </div>
          <Link className="link" href="/shop">
            View All Products <Icon name="arrowRight" size={17} />
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
