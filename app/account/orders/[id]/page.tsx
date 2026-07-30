"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  id: string;
  product_name: string;
  size_label: string;
  qty: number;
  unit_price: number;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: {
    full_name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusColors: Record<string, string> = {
    pending: "var(--cream)",
    paid: "var(--sky)",
    processing: "var(--lavender)",
    shipped: "var(--sage)",
    delivered: "var(--sage)",
    cancelled: "var(--pink)",
  };

  if (loading) {
    return (
      <main className="section">
        <div className="wrap center">Loading...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="section">
        <div className="wrap center">
          <h2 className="h3">Order not found</h2>
          <Link href="/account/orders" className="btn btn-primary" style={{ marginTop: 20 }}>
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHead title={`Order #${order.id.slice(0, 8)}`} />
      <div className="wrap" style={{ maxWidth: 800, paddingBottom: 80 }}>
        <Link
          href="/account/orders"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--navy)", fontWeight: 500 }}
        >
          <Icon name="arrow-left" size={18} /> Back to Orders
        </Link>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 className="h3" style={{ marginBottom: 4 }}>
                Order #{order.id.slice(0, 8)}
              </h2>
              <span style={{ fontSize: 14, color: "var(--text-soft)" }}>
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "var(--r-pill)",
                background: statusColors[order.status],
                fontWeight: 600,
                fontSize: 13,
                color: "var(--navy)",
                textTransform: "capitalize",
              }}
            >
              {order.status}
            </span>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Items</h4>
            {order.items.map((item) => (
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
                  <div style={{ fontSize: 13, color: "var(--text-soft)" }}>
                    {item.size_label} x {item.qty}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                  {formatPrice(item.unit_price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 32 }}>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Subtotal</div>
              <div style={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Shipping</div>
              <div style={{ fontWeight: 600 }}>
                {order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>
                {formatPrice(order.total)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Shipping Address</h4>
            <div style={{ color: "var(--text-soft)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 500, color: "var(--navy)" }}>{order.shipping_address.full_name}</div>
              <div>{order.shipping_address.phone}</div>
              <div>{order.shipping_address.street}</div>
              <div>
                {order.shipping_address.city}, {order.shipping_address.province}{" "}
                {order.shipping_address.postal_code}
              </div>
            </div>
          </div>

          {order.notes && (
            <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Notes</h4>
              <p style={{ color: "var(--text-soft)" }}>{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
