import type { OrderStatus } from "@/lib/validators/order";

/**
 * Which status an admin may move an order to from each status.
 *
 * Forward-only, so the dashboard can no longer do things like cancelled → paid
 * (stock was already put back, so it would be sold twice) or delivered →
 * pending. `paid → cancelled` stays possible for a customer who asks to cancel
 * before the parcel leaves, but the money is NOT refunded automatically —
 * that has to be done in the Midtrans dashboard.
 */
export const ADMIN_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses in which the admin may still set or correct the resi. */
export const TRACKING_EDITABLE: readonly OrderStatus[] = ["paid", "processing", "shipped"];

export const STATUS_LABELS_ID: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
};

export const COURIER_NAMES: Record<string, string> = {
  jne: "JNE",
  jnt: "J&T Express",
  sicepat: "SiCepat",
};

export function courierName(code: string | null | undefined): string {
  if (!code) return "-";
  return COURIER_NAMES[code] ?? code.toUpperCase();
}
