"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setUpdating(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    fetchOrder();
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (!order) return <p className="muted">Order not found</p>;

  return (
    <div>
      <Link
        href="/admin/orders"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Orders
      </Link>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 className="h2" style={{ marginBottom: 6 }}>Order #{order.id.slice(0, 8)}</h1>
            <div style={{ fontSize: 14, color: "var(--text-soft)" }}>
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <span className={`badge badge-${order.status}`} style={{ fontSize: 14, padding: "6px 14px" }}>
            {order.status}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Customer</h4>
            <div style={{ color: "var(--text)" }}>{order.profile?.full_name ?? "—"}</div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Shipping Address</h4>
            <div style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ color: "var(--navy)", fontWeight: 500 }}>{order.shipping_address.full_name}</div>
              <div>{order.shipping_address.phone}</div>
              <div>{order.shipping_address.street}</div>
              <div>{order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Items</h4>
          {order.items.map((item: any) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--line-soft)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: "var(--navy)" }}>{item.product_name}</div>
                <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{item.size_label} x {item.qty}</div>
              </div>
              <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                {formatPrice(item.unit_price * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Subtotal</div>
            <div style={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Shipping</div>
            <div style={{ fontWeight: 600 }}>{order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "var(--text-soft)" }}>Total</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>
              {formatPrice(order.total)}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Update Status</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={"pill" + (order.status === s ? " active" : "")}
                onClick={() => handleStatusChange(s)}
                disabled={updating || order.status === s}
                style={{ textTransform: "capitalize" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
