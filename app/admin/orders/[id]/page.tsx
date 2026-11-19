"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ConfirmModal, type ConfirmTone } from "@/components/ui/ConfirmModal";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { ADMIN_TRANSITIONS, STATUS_LABELS_ID, TRACKING_EDITABLE, courierName } from "@/lib/orderStatus";
import type { OrderStatus } from "@/lib/validators/order";

/** The happy path, in order. Cancelled sits outside it. */
const FLOW: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered"];

const STEP_ICON: Record<OrderStatus, string> = {
  pending: "clock",
  paid: "wallet",
  processing: "package",
  shipped: "truck",
  delivered: "package-check",
  cancelled: "x-circle",
};

type StatusAction = {
  title: string;
  hint: string;
  dialogTitle: string;
  dialogMessage: string;
  confirmText: string;
  tone: ConfirmTone;
};

const ACTIONS: Partial<Record<OrderStatus, StatusAction>> = {
  paid: {
    title: "Tandai Dibayar",
    hint: "Dana sudah masuk",
    dialogTitle: "Tandai pesanan sebagai dibayar?",
    dialogMessage: "Lakukan ini hanya jika uangnya benar-benar sudah masuk.",
    confirmText: "Ya, sudah dibayar",
    tone: "warning",
  },
  processing: {
    title: "Mulai Proses",
    hint: "Pesanan sedang dikemas",
    dialogTitle: "Proses pesanan ini?",
    dialogMessage: "Status berubah menjadi Diproses, dan pelanggan akan melihat bahwa pesanannya sedang dikemas.",
    confirmText: "Ya, proses sekarang",
    tone: "default",
  },
  shipped: {
    title: "Tandai Dikirim",
    hint: "Paket sudah diserahkan ke kurir",
    dialogTitle: "Kirim pesanan ini?",
    dialogMessage: "Pelanggan akan melihat nomor resi di bawah ini dan bisa melacak paketnya.",
    confirmText: "Ya, sudah dikirim",
    tone: "default",
  },
  delivered: {
    title: "Tandai Terkirim",
    hint: "Paket sudah sampai ke pelanggan",
    dialogTitle: "Tandai pesanan sebagai terkirim?",
    dialogMessage: "Pesanan akan ditutup dan statusnya tidak bisa diubah lagi.",
    confirmText: "Ya, sudah sampai",
    tone: "success",
  },
  cancelled: {
    title: "Batalkan Pesanan",
    hint: "",
    dialogTitle: "Batalkan pesanan ini?",
    dialogMessage: "Stok akan dikembalikan dan pesanan tidak bisa diaktifkan lagi.",
    confirmText: "Ya, batalkan pesanan",
    tone: "danger",
  },
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resi, setResi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const { showToastMsg } = useCart();

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
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        showToastMsg(success);
      } else {
        const msg = json?.error ?? "Gagal menyimpan perubahan.";
        setError(msg);
        showToastMsg(msg, "error");
      }
    } catch {
      const msg = "Koneksi terputus. Periksa internet lalu coba lagi.";
      setError(msg);
      showToastMsg(msg, "error");
    } finally {
      setUpdating(false);
      await fetchOrder();
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    const body: Record<string, unknown> = { status: pendingStatus };
    if (pendingStatus === "shipped" && resi.trim() && resi.trim() !== order.tracking_number) {
      body.tracking_number = resi.trim();
    }
    try {
      await patch(body, `Status diubah ke ${STATUS_LABELS_ID[pendingStatus]}.`);
    } finally {
      setPendingStatus(null);
    }
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
  const forwardActions = nextStatuses.filter((s) => s !== "cancelled");
  const canCancel = nextStatuses.includes("cancelled");
  const hasResi = Boolean(resi.trim() || order.tracking_number);
  const currentIndex = FLOW.indexOf(status);
  const pendingAction = pendingStatus ? ACTIONS[pendingStatus] : null;

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
              <Icon name="printer" size={16} /> Cetak Label
            </Link>
            <span className={`badge badge-${order.status}`} style={{ fontSize: 14, padding: "6px 14px" }}>
              {STATUS_LABELS_ID[status] ?? order.status}
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
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Status Pesanan</h4>

          {status === "cancelled" ? (
            <div className="os-cancelled">
              <Icon name="x-circle" size={20} /> Pesanan ini sudah dibatalkan dan statusnya tidak bisa diubah lagi.
            </div>
          ) : (
            <ol className="os-track" aria-label="Progres pesanan">
              {FLOW.map((s, i) => {
                const state = i < currentIndex ? "done" : i === currentIndex ? "done current" : "";
                return (
                  <li key={s} className={`os-step ${state}`} aria-current={i === currentIndex ? "step" : undefined}>
                    <span className="os-dot">
                      <Icon name={i < currentIndex ? "check" : STEP_ICON[s]} size={18} />
                    </span>
                    {STATUS_LABELS_ID[s]}
                  </li>
                );
              })}
            </ol>
          )}

          {status === "delivered" && (
            <p style={{ fontSize: 14, color: "var(--text-soft)", margin: 0 }}>
              Pesanan sudah selesai; statusnya tidak bisa diubah lagi.
            </p>
          )}

          {forwardActions.length > 0 && (
            <div className="os-actions">
              {forwardActions.map((s) => {
                const action = ACTIONS[s]!;
                const needsResi = s === "shipped" && !hasResi;
                return (
                  <button
                    key={s}
                    type="button"
                    className={`os-action os-action-${s}`}
                    onClick={() => setPendingStatus(s)}
                    disabled={updating || needsResi}
                  >
                    <span className="os-action-icon">
                      <Icon name={STEP_ICON[s]} size={20} />
                    </span>
                    <span className="os-action-text">
                      <span className="os-action-title">{action.title}</span>
                      <span className={`os-action-hint${needsResi ? " warn" : ""}`}>
                        {needsResi ? "Isi nomor resi di atas dulu" : action.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {canCancel && (
            <button type="button" className="os-cancel" onClick={() => setPendingStatus("cancelled")} disabled={updating}>
              <Icon name="x-circle" size={16} /> Batalkan pesanan
            </button>
          )}

          {error && (
            <div className="os-error" role="alert">
              <Icon name="alert-circle" size={18} /> {error}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={pendingAction !== null}
        title={pendingAction?.dialogTitle ?? ""}
        message={pendingAction?.dialogMessage}
        confirmText={pendingAction?.confirmText}
        cancelText="Kembali"
        tone={pendingAction?.tone}
        icon={pendingStatus ? STEP_ICON[pendingStatus] : undefined}
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatus(null)}
      >
        {pendingStatus === "shipped" && (
          <dl className="cm-summary" style={{ margin: 0 }}>
            <div><dt>Kurir</dt><dd>{courierName(order.courier_code)} {order.courier_service ?? ""}</dd></div>
            <div><dt>No. resi</dt><dd>{(resi.trim() || order.tracking_number || "").toUpperCase()}</dd></div>
          </dl>
        )}
        {pendingStatus === "cancelled" && status !== "pending" && (
          <div className="cm-note cm-note-danger">
            <Icon name="alert-triangle" size={16} />
            <span>
              Pelanggan sudah membayar. Dana <strong>tidak</strong> dikembalikan otomatis, jadi lakukan refund
              lewat dashboard Midtrans.
            </span>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
