import type { Metadata } from "next";
import { LegalView } from "@/components/legal/LegalView";

export const metadata: Metadata = {
  title: "Return & Refund Policy | ClariPet",
  description: "Kebijakan Pengembalian dan Pengembalian Dana ClariPet.",
  alternates: { canonical: "/returns" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReturnsPage() {
  return (
    <LegalView
      title="Kebijakan Pengembalian & Pengembalian Dana"
      intro="Di ClariPet, kami selalu berusaha memastikan setiap pesanan diproses dengan benar dan sampai dalam kondisi yang baik. Namun apabila terjadi kesalahan atau kendala pada pesanan Anda, kami akan dengan senang hati membantu menyelesaikannya."
      updated="Juni 2026"
      sections={[
        {
          heading: "Produk Tidak Dapat Dikembalikan Karena Perubahan Pikiran",
          body: [
            "Kami tidak menerima pengembalian produk karena perubahan pikiran, salah memilih produk, atau alasan serupa setelah pesanan diterima.",
            "Mohon pastikan pesanan yang dibuat sudah sesuai sebelum melakukan pembayaran.",
          ],
        },
        {
          heading: "Produk Yang Sudah Dibuka Tidak Dapat Dikembalikan",
          body: [
            "Demi menjaga kualitas, keamanan, dan kebersihan produk, kami tidak menerima pengembalian atau penukaran untuk produk yang sudah dibuka, digunakan, atau segelnya telah rusak.",
          ],
        },
        {
          heading: "Jika Menerima Produk Yang Salah",
          body: [
            "Apabila Anda menerima produk yang berbeda dari pesanan yang dibuat, kami akan mengirimkan produk yang benar tanpa biaya tambahan.",
            "Untuk mengajukan klaim, pelanggan wajib menyediakan: Video unboxing yang jelas dan tidak terputus sejak paket pertama kali dibuka, dan Bukti pesanan yang sesuai.",
            "Tanpa video unboxing, kami tidak dapat memverifikasi klaim dan tidak dapat memproses penggantian produk.",
          ],
        },
        {
          heading: "Jika Produk Datang Dalam Keadaan Rusak",
          body: [
            "Apabila produk diterima dalam kondisi rusak akibat pengiriman atau kesalahan lainnya, kami akan membantu melakukan penggantian produk atau memberikan pengembalian dana sesuai hasil verifikasi.",
            "Untuk mengajukan klaim, pelanggan wajib menyediakan: Video unboxing yang jelas dan tidak terputus sejak paket pertama kali dibuka, Foto kondisi produk yang diterima, dan Informasi pesanan.",
            "Tanpa video unboxing, klaim tidak dapat diproses.",
          ],
        },
        {
          heading: "Batas Waktu Pengajuan Klaim",
          body: [
            "Seluruh klaim terkait produk salah kirim atau produk rusak harus diajukan maksimal 3 (tiga) hari kalender setelah paket diterima.",
            "Klaim yang diajukan setelah batas waktu tersebut tidak dapat kami proses.",
          ],
        },
        {
          heading: "Bentuk Penyelesaian",
          body: [
            "Setelah klaim diverifikasi dan disetujui, ClariPet berhak menentukan bentuk penyelesaian yang paling sesuai, berupa: Pengiriman produk pengganti; atau Pengembalian dana (refund).",
          ],
        },
        {
          heading: "Hubungi Kami",
          body: [
            "Jika Anda mengalami kendala dengan pesanan yang diterima, silakan hubungi tim ClariPet melalui WhatsApp atau email yang tersedia pada halaman Contact Us.",
            "Tim kami akan membantu melakukan proses verifikasi dan memberikan solusi secepat mungkin.",
          ],
        },
      ]}
    />
  );
}

