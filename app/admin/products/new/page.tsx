"use client";

import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { Icon } from "@/components/icons";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Products
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        New Product
      </h1>
      <ProductForm />
    </div>
  );
}
