"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: { full_name: string; city: string } | null;
  items: any[];
}

const STATUS_FILTERS = ["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const url = filter === "all" ? "/api/admin/orders" : `/api/admin/orders?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.orders);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        Orders
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={"pill" + (filter === s ? " active" : "")}
            onClick={() => setFilter(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p className="muted" style={{ padding: 32 }}>Loading...</p>
        ) : orders.length === 0 ? (
          <p className="muted" style={{ padding: 32 }}>No orders</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
                  <td>{order.shipping_address?.full_name ?? "—"}</td>
                  <td>{order.items?.length ?? 0}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      style={{ color: "var(--navy)", fontWeight: 500, fontSize: 13 }}
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
