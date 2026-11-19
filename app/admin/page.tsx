"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

interface Stats {
  totalOrders: number;
  unpaidOrders: number;
  toShipOrders: number;
  unreadMessages: number;
  revenueTotal: number;
  revenue7d: number;
  revenue30d: number;
  lowStock: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    unpaidOrders: 0,
    toShipOrders: 0,
    unreadMessages: 0,
    revenueTotal: 0,
    revenue7d: 0,
    revenue30d: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/orders?limit=5").then((r) => r.json()),
      fetch("/api/admin/inventory?threshold=10").then((r) => r.json()),
    ])
      .then(([statsRes, ordersRes, invRes]) => {
        if (ordersRes.success) setRecentOrders(ordersRes.data.orders as any[]);
        setStats((prev) => ({
          ...prev,
          ...(statsRes.success ? statsRes.data : {}),
          lowStock: invRes.success ? invRes.data.length : 0,
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: "truck", bg: "var(--lavender-50)", value: stats.toShipOrders, label: "Perlu Dikemas / Dikirim", href: "/admin/orders" },
    { icon: "bag", bg: "var(--sage-50)", value: formatPrice(stats.revenue30d), label: "Pendapatan 30 Hari", href: undefined },
    { icon: "bag", bg: "var(--sky-50)", value: formatPrice(stats.revenue7d), label: "Pendapatan 7 Hari", href: undefined },
    { icon: "mail", bg: "var(--cream-50)", value: stats.unreadMessages, label: "Pesan Belum Dibaca", href: "/admin/messages" },
    { icon: "alert-circle", bg: "var(--pink-50)", value: stats.lowStock, label: "Stok Menipis", href: "/admin/inventory" },
    { icon: "package", bg: "var(--sky-50)", value: stats.totalOrders, label: `Total Pesanan (${stats.unpaidOrders} belum dibayar)`, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="h2" style={{ marginBottom: 28 }}>
        Dashboard
      </h1>

      <div className="stats-grid">
        {cards.map((c) => {
          const body = (
            <>
              <div className="stat-icon" style={{ background: c.bg }}>
                <Icon name={c.icon} size={22} />
              </div>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="stat-card card">
              {body}
            </Link>
          ) : (
            <div key={c.label} className="stat-card card">
              {body}
            </div>
          );
        })}
      </div>

      <div className="section-card card" style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 className="h3">Recent Orders</h3>
          <Link href="/admin/orders" className="link">View all</Link>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : recentOrders.length === 0 ? (
          <p className="muted">No orders yet</p>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 600 }}>
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td>{order.profile?.full_name ?? "—"}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }
        .stat-card {
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--r-md);
          display: grid;
          place-items: center;
          color: var(--navy);
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          line-height: 1.2;
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-soft);
          margin-top: 4px;
        }
        .section-card {
          padding: 24px;
        }
        :global(.data-table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        :global(.data-table th) {
          text-align: left;
          padding: 12px 14px;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-soft);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--line);
        }
        :global(.data-table td) {
          padding: 14px;
          border-bottom: 1px solid var(--line-soft);
          color: var(--text);
        }
        :global(.data-table tr:hover td) {
          background: var(--mist);
        }
        :global(.link) {
          font-size: 14px;
          font-weight: 600;
          color: var(--navy);
        }
        :global(.link:hover) {
          text-decoration: underline;
        }
        :global(.badge) {
          padding: 4px 10px;
          border-radius: var(--r-pill);
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        :global(.badge-pending) { background: var(--cream); color: var(--navy); }
        :global(.badge-paid) { background: var(--sky); color: var(--navy); }
        :global(.badge-processing) { background: var(--lavender); color: var(--navy); }
        :global(.badge-shipped),
        :global(.badge-delivered) { background: var(--sage); color: var(--navy); }
        :global(.badge-cancelled) { background: var(--pink); color: var(--navy); }
      `}</style>
    </div>
  );
}
