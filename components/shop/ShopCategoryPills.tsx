"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/data/categories";

/**
 * Sticky horizontal pill bar for quick category filtering on the shop page.
 * Mobile only (hidden on desktop via CSS).
 */
export function ShopCategoryPills() {
  const pathname = usePathname();

  return (
    <div className="shop-cat-pills">
      <Link
        href="/shop"
        className={"shop-cat-pill" + (pathname === "/shop" ? " active" : "")}
      >
        All
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/shop/${c.slug}`}
          className={
            "shop-cat-pill" +
            (pathname === `/shop/${c.slug}` ? " active" : "")
          }
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
