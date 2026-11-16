"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";
import { formatPrice } from "@/lib/format";
import { courierName } from "@/lib/orderStatus";
import { SNAP_SCRIPT_URL, SNAP_CLIENT_KEY, fetchSnapToken, openSnap } from "@/components/payment/snap";

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
  courier_code: string | null;
  courier_service: string | null;
  shipping_etd: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  payment_expires_at: string | null;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "var(--cream)",
  paid: "var(--sky)",
  processing: "var(--lavender)",
  shipped: "var(--sage)",
  delivered: "var(--sage)",
  cancelled: "var(--pink)",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    return fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrder(json.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePay() {
    if (!order) return;
    setPaying(true);
    setPayError(null);
    try {
      const token = await fetchSnapToken(order.id);
      await openSnap(token);
      await load();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Gagal membuka pembayaran.");
    } finally {
      setPaying(false);
    }
  }

  async function copyResi() {
    if (!order?.tracking_number) return;
    try {
      await navigator.clipboard.writeText(order.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the number is visible to copy by hand */
    }
  }

  if (loading) {
    return (
      <main className="section">
        <div className="wrap center">Memuat...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="section">
        <div className="wrap center">
          <h2 className="h3">Pesanan tidak ditemukan</h2>
          <Link href="/account/orders" className="btn btn-primary" style={{ marginTop: 20 }}>
            Kembali ke Pesanan
          </Link>
        </div>
      </main>
    );
  }

  const sectionStyle = { marginTop: 28, borderTop: "1px solid var(--line)", paddingTop: 20 } as const;
  const headingStyle = { fontSize: 15, fontWeight: 600, marginBottom: 12 } as const;

  return (
    <main>
      <PageHead title={`Pesanan #${order.id.slice(0, 8)}`} />
      {order.status === "pending" && <Script src={SNAP_SCRIPT_URL} data-client-key={SNAP_CLIENT_KEY} />}
      <div className="wrap" style={{ maxWidth: 800, paddingBottom: 80 }}>
        <Link
          href="/account/orders"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--navy)", fontWeight: 500 }}
        >
          <Icon name="arrow-left" size={18} /> Kembali ke Pesanan
        </Link>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <div>
              <h2 className="h3" style={{ marginBottom: 4 }}>
                Pesanan #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <span style={{ fontSize: 14, color: "var(--text-soft)" }}>{formatDateTime(order.created_at)}</span>
            </div>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "var(--r-pill)",
                background: statusColors[order.status],
                fontWeight: 600,
                fontSize: 13,
                color: "var(--navy)",
              }}
            >
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>

          {order.status === "pending" && (
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 16, marginBottom: 20 }}>
              <p style={{ margin: "0 0 12px", color: "var(--text)" }}>
                Pesanan ini belum dibayar.
                {order.payment_expires_at
                  ? ` Selesaikan pembayaran sebelum ${formatDateTime(order.payment_expires_at)}.`
                  : " Selesaikan pembayaran agar pesanan bisa kami proses."}{" "}
                Pesanan yang tidak dibayar akan dibatalkan otomatis.
              </p>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                {paying ? "Membuka pembayaran..." : "Bayar Sekarang"}
              </button>
              {payError && (
                <p role="alert" style={{ margin: "10px 0 0", color: "var(--navy)", fontWeight: 600 }}>
                  {payError}
                </p>
              )}
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <h4 style={headingStyle}>Barang</h4>
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
                <div style={{ fontWeight: 600, color: "var(--navy)" }}>{formatPrice(item.unit_price * item.qty)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Subtotal</div>
              <div style={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Ongkos Kirim</div>
              <div style={{ fontWeight: 600 }}>{order.shipping_fee === 0 ? "Gratis" : formatPrice(order.shipping_fee)}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "var(--text-soft)" }}>Total</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "var(--navy)" }}>{formatPrice(order.total)}</div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={headingStyle}>Pengiriman</h4>
            <div style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
              <div>
                Kurir:{" "}
                <span style={{ color: "var(--navy)", fontWeight: 500 }}>
                  {courierName(order.courier_code)}
                  {order.courier_service ? ` ${order.courier_service}` : ""}
                </span>
                {order.shipping_etd ? ` (estimasi ${order.shipping_etd})` : ""}
              </div>
              {order.tracking_number ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span>
                    No. Resi:{" "}
                    <span style={{ color: "var(--navy)", fontWeight: 700, letterSpacing: "0.03em" }}>
                      {order.tracking_number}
                    </span>
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copyResi}>
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              ) : (
                ["paid", "processing"].includes(order.status) && (
                  <div>Nomor resi akan muncul di sini setelah paket diserahkan ke kurir.</div>
                )
              )}
              {order.tracking_number && (
                <div style={{ fontSize: 13 }}>
                  Lacak paket dengan nomor resi ini di aplikasi atau situs resmi {courierName(order.courier_code)}.
                </div>
              )}
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={headingStyle}>Alamat Pengiriman</h4>
            <div style={{ color: "var(--text-soft)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 500, color: "var(--navy)" }}>{order.shipping_address.full_name}</div>
              <div>{order.shipping_address.phone}</div>
              <div>{order.shipping_address.street}</div>
              <div>
                {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
              </div>
            </div>
          </div>

          {order.notes && (
            <div style={sectionStyle}>
              <h4 style={{ ...headingStyle, marginBottom: 8 }}>Catatan</h4>
              <p style={{ color: "var(--text-soft)" }}>{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
