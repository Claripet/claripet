"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { ADMIN_TRANSITIONS, TRACKING_EDITABLE, courierName } from "@/lib/orderStatus";
import type { OrderStatus } from "@/lib/validators/order";

const CONFIRM_TEXT: Partial<Record<OrderStatus, string>> = {
  paid: "Tandai pesanan ini sebagai DIBAYAR? Lakukan ini hanya jika uangnya benar-benar sudah masuk.",
  processing: "Tandai pesanan ini sebagai DIPROSES (sedang dikemas)?",
  shipped: "Tandai pesanan ini sebagai DIKIRIM? Pelanggan akan melihat nomor resinya.",
  delivered: "Tandai pesanan ini sebagai TERKIRIM?",
  cancelled:
    "Batalkan pesanan ini? Stok akan dikembalikan. Jika pelanggan sudah membayar, dana TIDAK dikembalikan otomatis: lakukan refund di dashboard Midtrans.",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resi, setResi] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrder = useCallback(() => {
    return fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrder(json.data);
          setResi(json.data.tracking_number ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  const patch = async (body: Record<string, unknown>, success: string) => {
    setUpdating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      setMessage(json?.success ? success : json?.error ?? "Gagal menyimpan perubahan.");
    } finally {
      setUpdating(false);
      await fetchOrder();
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!confirm(CONFIRM_TEXT[newStatus] ?? `Ubah status ke ${newStatus}?`)) return;
    const body: Record<string, unknown> = { status: newStatus };
    if (newStatus === "shipped" && resi.trim() && resi.trim() !== order.tracking_number) {
      body.tracking_number = resi.trim();
    }
    await patch(body, `Status diubah ke ${newStatus}.`);
  };

  const saveResi = async () => {
    if (!resi.trim()) return;
    await patch({ tracking_number: resi.trim() }, "Nomor resi disimpan.");
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (!order) return <p className="muted">Order not found</p>;

  const status = order.status as OrderStatus;
  const nextStatuses = ADMIN_TRANSITIONS[status] ?? [];
  const resiEditable = TRACKING_EDITABLE.includes(status);
  const addr = order.shipping_address ?? {};

  return (
    <div>
      <Link
        href="/admin/orders"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, color: "var(--navy)", fontWeight: 500 }}
      >
        <Icon name="arrow-left" size={18} /> Back to Orders
      </Link>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 className="h2" style={{ marginBottom: 6 }}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <div style={{ fontSize: 14, color: "var(--text-soft)" }}>
              {new Date(order.created_at).toLocaleString("id-ID")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href={`/admin/orders/print?ids=${order.id}`}
              target="_blank"
              className="btn btn-ghost btn-sm"
            >
              Cetak Label
            </Link>
            <span className={`badge badge-${order.status}`} style={{ fontSize: 14, padding: "6px 14px" }}>
              {order.status}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 24 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Customer</h4>
            <div style={{ color: "var(--text)" }}>{order.profile?.full_name ?? "—"}</div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Shipping Address</h4>
            <div style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ color: "var(--navy)", fontWeight: 500 }}>{addr.full_name}</div>
              <div>{addr.phone}</div>
              <div>{addr.street}</div>
              <div>{addr.city}, {addr.province} {addr.postal_code}</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Courier</h4>
            <div style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ color: "var(--navy)", fontWeight: 600 }}>
                {courierName(order.courier_code)} {order.courier_service ?? ""}
              </div>
              {order.shipping_weight_grams ? <div>Berat: {(order.shipping_weight_grams / 1000).toFixed(2)} kg</div> : null}
              {order.shipping_etd ? <div>Estimasi: {order.shipping_etd}</div> : null}
              {order.payment_ref ? <div>Midtrans ref: {order.payment_ref}</div> : null}
            </div>
          </div>
        </div>

        {order.notes && (
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 14, marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Catatan pelanggan</h4>
            <div style={{ color: "var(--text)", fontSize: 14, whiteSpace: "pre-wrap" }}>{order.notes}</div>
          </div>
        )}

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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginBottom: 24, flexWrap: "wrap" }}>
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

        {resiEditable && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Nomor Resi</h4>
            <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 10px" }}>
              Isi setelah paket diserahkan ke {courierName(order.courier_code)}. Wajib diisi sebelum status diubah ke shipped.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="text"
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                placeholder="Contoh: JP1234567890"
                maxLength={40}
                style={{
                  padding: "9px 12px",
                  border: "1.5px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  minWidth: 240,
                }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={saveResi}
                disabled={updating || !resi.trim() || resi.trim() === order.tracking_number}
              >
                Simpan Resi
              </button>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Update Status</h4>
          {nextStatuses.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-soft)" }}>
              Pesanan ini sudah {status === "cancelled" ? "dibatalkan" : "selesai"}; statusnya tidak bisa diubah lagi.
            </p>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  className="pill"
                  onClick={() => handleStatusChange(s)}
                  disabled={updating}
                  style={{ textTransform: "capitalize" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {message && (
            <p role="status" style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
