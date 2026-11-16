"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { courierName } from "@/lib/orderStatus";

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  courier_code: string | null;
  courier_service: string | null;
  tracking_number: string | null;
  shipping_address: { full_name: string; city: string } | null;
  items: any[];
}

const STATUS_FILTERS = ["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("paid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setSelected(new Set());
    const qs = new URLSearchParams({ limit: "100" });
    if (filter !== "all") qs.set("status", filter);
    fetch(`/api/admin/orders?${qs.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.orders);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));

  const printSelected = () => {
    if (selected.size === 0) return;
    window.open(`/admin/orders/print?ids=${Array.from(selected).join(",")}`, "_blank");
  };

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

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <button className="btn btn-primary btn-sm" onClick={printSelected} disabled={selected.size === 0}>
          Cetak Label ({selected.size})
        </button>
        <span style={{ fontSize: 13, color: "var(--text-soft)" }}>
          Pilih pesanan yang sudah dibayar, cetak labelnya, lalu isi nomor resi di tiap pesanan setelah paket diserahkan ke kurir.
        </span>
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
                <th>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Pilih semua" />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Courier</th>
                <th>Resi</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggle(order.id)}
                      aria-label={`Pilih pesanan ${order.id.slice(0, 8)}`}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{order.shipping_address?.full_name ?? "—"}</td>
                  <td>{order.items?.reduce((n: number, i: any) => n + (i.qty ?? 0), 0) ?? 0}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{order.courier_code ? `${courierName(order.courier_code)} ${order.courier_service ?? ""}` : "—"}</td>
                  <td>{order.tracking_number ?? "—"}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString("id-ID")}</td>
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
