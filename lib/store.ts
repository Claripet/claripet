/**
 * Sender details printed on shipping labels (admin → Orders → Cetak Label)
 * and used as the courier pickup address.
 *
 * `address` is the pickup / return address: couriers return undeliverable
 * packages to it. `landmark` helps the courier find the gate.
 */
export const STORE_SENDER = {
  name: "ClariPet",
  phone: "0881-0809-63188",
  address: "Jl. Pelepah Elok III Blok QB2 No. 7, Kelapa Gading",
  city: "Jakarta Utara 14240",
  landmark: "Pagar emas",
} as const;
