import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(3, "Nama penerima minimal 3 karakter").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?62|0)?8\d{7,11}$/, "Nomor handphone tidak valid (contoh: 81234567890)"),
  label: z.string().trim().min(2, "Label alamat wajib diisi (contoh: Rumah)").max(50),
  address: z.string().trim().min(8, "Alamat lengkap minimal 8 karakter").max(300),
  city: z.string().trim().min(2, "Kota / kabupaten wajib diisi").max(100),
  province: z.string().trim().min(2, "Provinsi wajib diisi").max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "Kode pos tidak valid (4-10 digit)"),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
