"use client";

export const SNAP_SCRIPT_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export const SNAP_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

type SnapResult = "success" | "pending" | "closed";

/** Ask the server for this order's Snap token. Throws with a readable message. */
export async function fetchSnapToken(orderId: string): Promise<string> {
  const res = await fetch("/api/payments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || "Gagal membuat pembayaran. Silakan coba lagi.");
  }
  return json.data.token as string;
}

/**
 * Open the Midtrans Snap popup and resolve when the customer finishes or
 * closes it. Rejects only when Snap itself reports an error.
 */
export function openSnap(token: string): Promise<SnapResult> {
  return new Promise((resolve, reject) => {
    const snap = (window as any).snap;
    if (!snap) {
      reject(new Error("Skrip pembayaran belum dimuat. Silakan muat ulang halaman."));
      return;
    }
    snap.pay(token, {
      onSuccess: () => resolve("success"),
      onPending: () => resolve("pending"),
      onClose: () => resolve("closed"),
      onError: () => reject(new Error("Pembayaran gagal. Silakan coba lagi.")),
    });
  });
}
