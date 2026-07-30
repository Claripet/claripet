"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { Icon } from "@/components/icons";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setProduct(json.success ? json.data : null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="muted">Loading...</p>;
  if (!product) return <p className="muted">Product not found</p>;

  return (
    <div>
      <Link
        href="/admin/products"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Products
      </Link>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        Edit Product
      </h1>
      <ProductForm product={product} />
    </div>
  );
}
