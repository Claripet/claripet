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
      <option value="featured">Unggulan</option>
      <option value="price-low">Harga: Rendah ke Tinggi</option>
      <option value="price-high">Harga: Tinggi ke Rendah</option>
      <option value="rating">Rating Tertinggi</option>
    </select>
  );
}
