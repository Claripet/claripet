"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCart } from "@/context/CartContext";

interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  status: string;
  best_seller: boolean;
  category: { name: string } | null;
  sizes: { id: string; label: string; stock: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { showToastMsg } = useCart();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    productId: string | null;
    status: string | null;
    step: number; // 1 for archive, 2 for delete
  }>({ isOpen: false, productId: null, status: null, step: 1 });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedCategory) params.append("category", selectedCategory);
    
    const url = params.toString() ? `/api/admin/products?${params.toString()}` : "/api/admin/products";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProducts(json.data.products);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleArchive = (id: string, currentStatus: string) => {
    setModalState({
      isOpen: true,
      productId: id,
      status: currentStatus,
      step: currentStatus === "archived" ? 2 : 1,
    });
  };

  const handleUnarchive = async (id: string) => {
    // When we just want to update status, we use PATCH instead of PUT 
    // to bypass the full-object validation inside the PUT endpoint.
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    showToastMsg("Product restored successfully");
    fetchProducts();
  };

  const confirmAction = async () => {
    if (!modalState.productId) return;
    
    setModalState(prev => ({ ...prev, isOpen: false }));
    
    if (modalState.step === 1) {
      await fetch(`/api/admin/products/${modalState.productId}`, { method: "DELETE" });
      showToastMsg("Product archived successfully");
    } else {
      await fetch(`/api/admin/products/${modalState.productId}?force=true`, { method: "DELETE" });
      showToastMsg("Product permanently deleted");
    }
    
    fetchProducts();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 className="h2">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Icon name="plus" size={16} /> New Product
        </Link>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "var(--r-pill)",
            border: "1.5px solid var(--line)",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "12px 18px",
            borderRadius: "var(--r-pill)",
            border: "1.5px solid var(--line)",
            fontSize: 14,
            outline: "none",
            fontFamily: "inherit",
            backgroundColor: "#fff",
            minWidth: 160,
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn btn-ghost" onClick={fetchProducts}>
          Search
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p className="muted" style={{ padding: 32 }}>Loading...</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.sizes.reduce((s, x) => s + x.stock, 0);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{p.slug}</div>
                    </td>
                    <td>{p.category?.name ?? "—"}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>
                      <span style={{ color: totalStock < 20 ? "#b04050" : "var(--text)" }}>
                        {totalStock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.status === "active" ? "shipped" : p.status === "draft" ? "pending" : "cancelled"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", minWidth: 200 }}>
                      {p.status === "archived" && (
                        <button
                          onClick={() => handleUnarchive(p.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--navy)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            marginRight: 14,
                          }}
                        >
                          Restore
                        </button>
                      )}
                      <Link
                        href={`/admin/products/${p.id}`}
                        style={{ marginRight: 14, color: "var(--navy)", fontWeight: 500, fontSize: 13 }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleArchive(p.id, p.status)}
                        style={{
                          background: "none",
                          border: "none",
                          color: p.status === "archived" ? "var(--text-soft)" : "#b04050",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {p.status === "archived" ? "Delete Permanently" : "Archive"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.step === 1 ? "Archive Product" : "Delete Product Permanently"}
        message={
          modalState.step === 1
            ? "Step 1: Are you sure you want to archive this product? It will be hidden from the storefront."
            : "Step 2: Are you sure you want to PERMANENTLY DELETE this product? This action cannot be undone and all related data will be lost."
        }
        confirmText={modalState.step === 1 ? "Archive" : "Delete"}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmAction}
        onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
