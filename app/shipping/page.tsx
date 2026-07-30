import type { Metadata } from "next";
import { LegalView } from "@/components/legal/LegalView";

export const metadata: Metadata = {
  title: "Shipping Policy | ClariPet",
  description: "Kebijakan Pengiriman ClariPet.",
  alternates: { canonical: "/shipping" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ShippingPage() {
  return (
    <LegalView
      title="Kebijakan Pengiriman"
      intro="Terima kasih telah berbelanja di ClariPet. Kami berkomitmen untuk memproses dan mengirimkan pesanan Anda secepat mungkin."
      updated="Juni 2026"
      sections={[
        {
          heading: "Waktu Pemrosesan Pesanan",
          body: [
            "Pesanan akan diproses setelah pembayaran berhasil dikonfirmasi.",
            "Pesanan umumnya diproses dalam waktu 1â€“3 hari kerja, tidak termasuk hari Sabtu, Minggu, dan hari libur nasional.",
            "Pada periode promosi, peluncuran produk baru, atau volume pesanan yang tinggi, waktu pemrosesan dapat memerlukan waktu lebih lama dari biasanya.",
          ],
        },
        {
          heading: "Biaya Pengiriman",
          body: [
            "Biaya pengiriman ditanggung oleh pelanggan dan akan dihitung secara otomatis saat proses checkout berdasarkan alamat tujuan, berat paket, serta layanan ekspedisi yang dipilih.",
            "Mohon pastikan alamat pengiriman yang dimasukkan sudah benar dan lengkap sebelum menyelesaikan pesanan.",
          ],
        },
        {
          heading: "Pengiriman Pesanan",
          body: [
            "Pengiriman dilakukan melalui jasa ekspedisi yang tersedia pada saat checkout.",
            "Setelah pesanan dikirim, pelanggan akan menerima nomor resi untuk melakukan pelacakan status pengiriman secara langsung melalui pihak ekspedisi.",
          ],
        },
        {
          heading: "Perubahan Alamat Pengiriman",
          body: [
            "Pelanggan bertanggung jawab untuk memastikan bahwa nama penerima, alamat, nomor telepon, dan informasi pengiriman lainnya telah diisi dengan benar saat melakukan pemesanan.",
            "Setelah pesanan diproses dan diserahkan kepada pihak ekspedisi, alamat pengiriman tidak dapat diubah karena paket sudah berada dalam proses pengiriman.",
          ],
        },
        {
          heading: "Keterlambatan Pengiriman",
          body: [
            "Estimasi waktu pengiriman sepenuhnya mengikuti ketentuan dan layanan dari ekspedisi yang dipilih pelanggan.",
            "Setelah paket diserahkan kepada pihak ekspedisi, proses pengiriman berada di luar kendali ClariPet. Oleh karena itu, ClariPet tidak bertanggung jawab atas keterlambatan, kegagalan pengiriman, atau kendala operasional yang disebabkan oleh pihak ekspedisi.",
            "Apabila terjadi keterlambatan atau kendala pengiriman, pelanggan dapat langsung menghubungi pihak ekspedisi menggunakan nomor resi yang telah diberikan untuk mendapatkan informasi lebih lanjut mengenai status pengiriman.",
          ],
        },
        {
          heading: "Paket Hilang atau Bermasalah Dalam Pengiriman",
          body: [
            "Apabila terjadi kehilangan paket, keterlambatan yang tidak wajar, atau kendala lain selama proses pengiriman, pelanggan disarankan untuk menghubungi pihak ekspedisi terlebih dahulu karena proses pengiriman berada di bawah tanggung jawab mereka setelah paket diserahkan oleh ClariPet.",
            "Kami akan membantu memberikan informasi yang kami miliki apabila diperlukan, namun keputusan dan penyelesaian terkait pengiriman tetap mengikuti kebijakan pihak ekspedisi.",
          ],
        },
        {
          heading: "Pemeriksaan Paket Saat Diterima",
          body: [
            "Kami sangat menyarankan pelanggan untuk merekam video unboxing secara jelas dan tanpa jeda saat membuka paket untuk pertama kalinya.",
            "Video unboxing diperlukan apabila terjadi: Produk salah kirim, Produk rusak, Produk kurang, atau Kendala lain yang memerlukan proses verifikasi.",
            "Tanpa video unboxing, klaim mungkin tidak dapat diproses.",
          ],
        },
        {
          heading: "Hubungi Kami",
          body: [
            "Apabila Anda memiliki pertanyaan terkait pesanan atau membutuhkan bantuan, silakan menghubungi tim ClariPet melalui WhatsApp atau email yang tersedia pada halaman Contact Us.",
            "Kami akan membantu semampu kami sesuai informasi yang tersedia.",
          ],
        },
      ]}
    />
  );
}

