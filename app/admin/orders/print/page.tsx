"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { courierName } from "@/lib/orderStatus";
import { STORE_SENDER } from "@/lib/store";

type Layout = "thermal" | "a4";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LABELS = 50;

export default function PrintLabelsPage() {
  return (
    <Suspense fallback={<p className="muted">Loading...</p>}>
      <PrintLabels />
    </Suspense>
  );
}

function PrintLabels() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s))
    .slice(0, MAX_LABELS);
  const idsKey = ids.join(",");

  const [orders, setOrders] = useState<any[]>([]);
  const [failed, setFailed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<Layout>("thermal");

  useEffect(() => {
    let active = true;
    const list = idsKey ? idsKey.split(",") : [];
    Promise.all(
      list.map((id) =>
        fetch(`/api/admin/orders/${id}`)
          .then((r) => r.json())
          .then((j) => (j.success ? j.data : null))
          .catch(() => null),
      ),
    ).then((results) => {
      if (!active) return;
      setOrders(results.filter(Boolean));
      setFailed(results.filter((r) => !r).length);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [idsKey]);

  if (!idsKey) return <p className="muted">Pilih pesanan dulu dari halaman Orders.</p>;
  if (loading) return <p className="muted">Menyiapkan label...</p>;

  const notReady = orders.filter((o) => !["paid", "processing", "shipped"].includes(o.status));

  return (
    <div>
      <div className="print-toolbar">
        <h1 className="h2" style={{ margin: 0 }}>Cetak Label ({orders.length})</h1>
        <div className="print-actions">
          <label>
            Ukuran kertas{" "}
            <select value={layout} onChange={(e) => setLayout(e.target.value as Layout)}>
              <option value="thermal">Thermal 100 × 150 mm (1 per lembar)</option>
              <option value="a4">A4 (4 per lembar)</option>
            </select>
          </label>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()} disabled={orders.length === 0}>
            Print
          </button>
        </div>
        {failed > 0 && <p className="print-warn">{failed} pesanan tidak bisa dimuat.</p>}
        {notReady.length > 0 && (
          <p className="print-warn">
            {notReady.length} pesanan belum dibayar atau sudah selesai/dibatalkan:{" "}
            {notReady.map((o) => `#${o.id.slice(0, 8).toUpperCase()} (${o.status})`).join(", ")}.
          </p>
        )}
        {!STORE_SENDER.address && (
          <p className="print-warn">Alamat pengirim belum diisi di lib/store.ts.</p>
        )}
      </div>

      <div className={`label-sheet layout-${layout}`}>
        {orders.map((o) => (
          <ShippingLabel key={o.id} order={o} />
        ))}
      </div>

      <style jsx global>{`
        .print-toolbar { margin-bottom: 20px; display: grid; gap: 10px; }
        .print-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; font-size: 14px; }
        .print-actions select { padding: 6px 10px; border: 1.5px solid var(--line); border-radius: var(--r-md); font-family: inherit; }
        .print-warn { margin: 0; font-size: 13px; font-weight: 600; color: var(--navy); }

        .label-sheet { display: flex; flex-wrap: wrap; gap: 16px; }
        .ship-label {
          width: 100mm; min-height: 150mm; box-sizing: border-box; padding: 5mm;
          border: 1px solid #000; background: #fff; color: #000;
          font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.35;
          display: flex; flex-direction: column; gap: 3mm;
        }
        .ship-label .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 3mm; }
        .ship-label .box { border: 1px solid #000; padding: 2.5mm; }
        .ship-label .tag { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1mm; }
        .ship-label .courier { font-size: 15pt; font-weight: 700; }
        .ship-label .order-no { font-size: 9pt; text-align: right; }
        .ship-label .recipient-name { font-size: 13pt; font-weight: 700; }
        .ship-label .resi { font-family: "Courier New", monospace; font-size: 15pt; font-weight: 700; letter-spacing: 0.04em; }
        .ship-label .resi-blank { border-bottom: 1px solid #000; height: 7mm; }
        .ship-label table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
        .ship-label td { padding: 0.8mm 0; border-bottom: 1px dotted #000; vertical-align: top; }
        .ship-label td.qty { text-align: right; white-space: nowrap; padding-left: 2mm; }
        .ship-label .note { font-size: 8.5pt; white-space: pre-wrap; }
        .ship-label .muted-small { font-size: 8pt; }

        @media print {
          .admin-sidebar, .print-toolbar, .global-decor-wrapper { display: none !important; }
          .admin-shell, .admin-main { display: block !important; padding: 0 !important; margin: 0 !important; background: #fff !important; }
          body { background: #fff !important; }
          .label-sheet { gap: 0; }
          .layout-thermal .ship-label { width: 100mm; height: 150mm; border: none; break-after: page; page-break-after: always; overflow: hidden; }
          .layout-a4 { display: grid !important; grid-template-columns: 1fr 1fr; gap: 6mm; }
          .layout-a4 .ship-label { width: 100%; min-height: 0; height: 138mm; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
          .layout-a4 .ship-label:nth-child(4n) { break-after: page; page-break-after: always; }
        }
      `}</style>
      <style jsx global>{`
        @page { size: ${layout === "thermal" ? "100mm 150mm" : "A4"}; margin: ${layout === "thermal" ? "0" : "8mm"}; }
      `}</style>
    </div>
  );
}

function ShippingLabel({ order }: { order: any }) {
  const a = order.shipping_address ?? {};
  const items: any[] = order.items ?? [];
  const totalQty = items.reduce((n, i) => n + (i.qty ?? 0), 0);

  return (
    <div className="ship-label">
      <div className="row">
        <div>
          <div className="courier">
            {courierName(order.courier_code)} {order.courier_service ?? ""}
          </div>
          {order.shipping_weight_grams ? (
            <div className="muted-small">Berat {(order.shipping_weight_grams / 1000).toFixed(2)} kg</div>
          ) : null}
        </div>
        <div className="order-no">
          <div><strong>#{order.id.slice(0, 8).toUpperCase()}</strong></div>
          <div>{new Date(order.created_at).toLocaleDateString("id-ID")}</div>
        </div>
      </div>

      <div className="box">
        <div className="tag">No. Resi</div>
        {order.tracking_number ? <div className="resi">{order.tracking_number}</div> : <div className="resi-blank" />}
      </div>

      <div className="box">
        <div className="tag">Penerima</div>
        <div className="recipient-name">{a.full_name}</div>
        <div>{a.phone}</div>
        <div>{a.street}</div>
        <div>
          {a.city}, {a.province} {a.postal_code}
        </div>
      </div>

      <div className="box">
        <div className="tag">Pengirim</div>
        <div><strong>{STORE_SENDER.name}</strong> · {STORE_SENDER.phone}</div>
        <div>{STORE_SENDER.address ? `${STORE_SENDER.address}, ` : ""}{STORE_SENDER.city}</div>
      </div>

      <div>
        <div className="tag">Isi paket ({totalQty} barang)</div>
        <table>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.product_name} {i.size_label}</td>
                <td className="qty">x {i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div>
          <div className="tag">Catatan</div>
          <div className="note">{order.notes}</div>
        </div>
      )}
    </div>
  );
}
