import Link from "next/link";
import { getBestSellers } from "@/lib/data";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";

export async function BestSellers() {
  const products = await getBestSellers();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Loved most
            </div>
            <h2 className="h2">Best Sellers</h2>
          </div>
          <Link className="link" href="/shop">
            View all products <Icon name="arrowRight" size={17} />
          </Link>
        </div>
        <div className="prod-grid">
          {products.map((p, i) => (
            <div key={p.slug} className={`reveal-scale reveal-d${Math.min(i + 1, 5)}`}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
