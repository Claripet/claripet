/**
 * Sender details printed on shipping labels (admin → Orders → Cetak Label).
 *
 * `address` is the pickup / return address. Fill it in before printing
 * labels for real parcels: couriers return undeliverable packages to it.
 */
export const STORE_SENDER = {
  name: "ClariPet",
  phone: "0881-0809-63188",
  address: "",
  city: "Jakarta",
} as const;
