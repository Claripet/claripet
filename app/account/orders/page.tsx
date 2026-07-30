"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/icons";
import { AccountShell } from "@/components/account/AccountShell";
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
  total: number;
  created_at: string;
  items: OrderItem[];
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--cream)",
  paid: "var(--sky)",
  processing: "var(--lavender)",
  shipped: "var(--sage)",
  delivered: "var(--sage)",
  cancelled: "var(--pink)",
};

export default function OrdersPage() {
  return (
    <AccountShell title="My Orders">
      <OrdersList />
    </AccountShell>
  );
}

function OrdersList() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    fetch(`/api/orders${qs}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.orders);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, status]);

  return (
    <div>
      <div className="orders-head">
        <h2 className="h3">Order History</h2>
      </div>

      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={"pill" + (status === f.value ? " active" : "")}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="empty-box">
          <Icon name="package" size={32} />
          <p>{status ? `No ${status} orders` : "No orders yet"}</p>
          <Link href="/shop" className="btn btn-primary btn-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="order-card card"
            >
              <div className="order-header">
                <div>
                  <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className="order-status"
                  style={{ background: STATUS_COLORS[order.status] ?? "var(--mist)" }}
                >
                  {order.status}
                </span>
              </div>
              <div className="order-items">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="order-item">
                    <span className="order-item-name">
                      {item.product_name}
                      {item.size_label ? ` (${item.size_label})` : ""}
                    </span>
                    <span className="order-item-qty">×{item.qty}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="order-item muted">+{order.items.length - 3} more items</div>
                )}
              </div>
              <div className="order-footer">
                <div>
                  <span className="order-total-label">Total</span>
                  <span className="order-total">{formatPrice(order.total)}</span>
                </div>
                <span className="order-view">
                  View Details <Icon name="arrowRight" size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-head {
          margin-bottom: 16px;
        }
        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pill {
          padding: 8px 16px;
          border-radius: var(--r-pill);
          border: 1.5px solid var(--line);
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-soft);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pill:hover {
          border-color: var(--navy);
          color: var(--navy);
        }
        .pill.active {
          background: var(--navy);
          border-color: var(--navy);
          color: #fff;
        }
        .empty-box {
          text-align: center;
          padding: 48px;
          background: var(--mist);
          border-radius: var(--r-lg);
          color: var(--text-soft);
        }
        .empty-box p {
          margin: 12px 0 20px;
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .orders-list :global(.order-card) {
          display: block;
          padding: 20px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .orders-list :global(.order-card:hover) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(27, 42, 74, 0.1);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .order-id {
          font-weight: 700;
          color: var(--navy);
          font-size: 15px;
          margin-right: 12px;
        }
        .order-date {
          font-size: 13px;
          color: var(--text-soft);
        }
        .order-status {
          padding: 5px 12px;
          border-radius: var(--r-pill);
          font-size: 12px;
          font-weight: 600;
          color: var(--navy);
          text-transform: capitalize;
        }
        .order-items {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 12px 0;
          margin-bottom: 14px;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-soft);
          padding: 4px 0;
        }
        .order-item-name {
          flex: 1;
        }
        .order-item-qty {
          font-weight: 500;
          color: var(--navy);
        }
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-total-label {
          font-size: 13px;
          color: var(--text-soft);
          margin-right: 8px;
        }
        .order-total {
          font-weight: 700;
          font-size: 17px;
          color: var(--navy);
        }
        .order-view {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: var(--navy);
        }
      `}</style>
    </div>
  );
}
