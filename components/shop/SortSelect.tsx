"use client";

import { useRouter } from "next/navigation";

export type SortKey = "featured" | "price-low" | "price-high" | "rating";

export function SortSelect({ value, category }: { value: SortKey; category: string }) {
  const router = useRouter();

  return (
    <select
      className="sort-select"
      value={value}
      aria-label="Sort products"
      onChange={(e) => {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (e.target.value !== "featured") params.set("sort", e.target.value);
        const qs = params.toString();
        router.push(qs ? `/shop?${qs}` : "/shop", { scroll: false });
      }}
    >
      <option value="featured">Featured</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </select>
  );
}
