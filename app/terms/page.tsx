import type { Metadata } from "next";
import { LegalView } from "@/components/legal/LegalView";

export const metadata: Metadata = {
  title: "Terms & Conditions | ClariPet",
  description:
    "Syarat & Ketentuan penggunaan website dan layanan ClariPet.",
  alternates: { canonical: "/terms" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalView
      title="Syarat & Ketentuan"
      intro="Selamat datang di website ClariPet. Dengan mengakses dan menggunakan website ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. Apabila Anda tidak menyetujui syarat dan ketentuan ini, kami menyarankan untuk tidak menggunakan website maupun layanan yang tersedia."
      updated="Juni 2026"
      sections={[
        {
          heading: "Penggunaan Website",
          body: [
            "Website ClariPet disediakan untuk memberikan informasi mengenai produk, layanan, dan aktivitas ClariPet serta memfasilitasi pembelian produk secara online.",
            "Pengguna setuju untuk menggunakan website ini secara wajar dan tidak melakukan tindakan yang dapat mengganggu, merusak, atau menghambat operasional website.",
          ],
        },
        {
          heading: "Informasi Produk",
          body: [
            "Kami berusaha untuk menyajikan informasi produk seakurat mungkin, termasuk deskripsi, manfaat, petunjuk penggunaan, gambar, dan informasi lainnya.",
            "Namun demikian, kesalahan penulisan, perbedaan tampilan warna pada layar perangkat, atau perubahan informasi produk dapat terjadi sewaktu-waktu tanpa pemberitahuan sebelumnya. ClariPet berhak untuk memperbarui, mengubah, atau memperbaiki informasi yang tersedia di website kapan saja apabila diperlukan.",
          ],
        },
        {
          heading: "Harga dan Ketersediaan Produk",
          body: [
            "Seluruh harga yang tercantum di website dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Ketersediaan stok produk juga dapat berubah sewaktu-waktu.",
            "Dalam kondisi tertentu, pesanan dapat dibatalkan apabila terjadi kesalahan harga, kesalahan stok, atau keadaan lain yang berada di luar kendali kami. Jika pembayaran telah dilakukan, dana akan dikembalikan sesuai dengan metode yang disepakati.",
          ],
        },
        {
          heading: "Pemesanan",
          body: [
            "Dengan melakukan pemesanan melalui website ClariPet, pelanggan menyatakan bahwa informasi yang diberikan adalah benar dan lengkap.",
            "ClariPet berhak menolak atau membatalkan pesanan yang terindikasi mengandung informasi yang tidak valid, aktivitas mencurigakan, penyalahgunaan promosi, atau pelanggaran terhadap syarat dan ketentuan yang berlaku.",
          ],
        },
        {
          heading: "Hak Kekayaan Intelektual",
          body: [
            "Seluruh konten yang terdapat pada website ini, termasuk namun tidak terbatas pada: Logo, Nama merek, Desain, Teks, Gambar, Foto, Ilustrasi, Mascot, Video, dan Materi promosi merupakan milik ClariPet atau pihak yang telah memberikan izin kepada ClariPet.",
            "Penggunaan, reproduksi, distribusi, atau pemanfaatan konten tanpa izin tertulis dari ClariPet tidak diperkenankan.",
          ],
        },
        {
          heading: "Batasan Tanggung Jawab",
          body: [
            "Produk ClariPet dirancang untuk membantu mendukung perawatan, kebersihan, dan kenyamanan hewan peliharaan dalam kehidupan sehari-hari. Produk ClariPet tidak dimaksudkan untuk menggantikan diagnosis, pengobatan, tindakan medis, atau saran profesional dari dokter hewan.",
            "Apabila hewan peliharaan Anda mengalami kondisi medis tertentu atau membutuhkan penanganan khusus, kami menyarankan untuk berkonsultasi langsung dengan dokter hewan.",
            "Hasil penggunaan produk dapat berbeda pada setiap hewan tergantung pada berbagai faktor seperti usia, kondisi kesehatan, lingkungan, sensitivitas individu, serta konsistensi penggunaan.",
          ],
        },
        {
          heading: "Tautan dan Layanan Pihak Ketiga",
          body: [
            "Website ClariPet dapat menyediakan tautan menuju layanan atau platform pihak ketiga, termasuk penyedia pembayaran, jasa pengiriman, media sosial, dan layanan lainnya.",
            "ClariPet tidak bertanggung jawab atas isi, kebijakan, layanan, atau aktivitas yang dilakukan oleh pihak ketiga tersebut.",
          ],
        },
        {
          heading: "Privasi Pelanggan",
          body: [
            "Informasi pelanggan yang diberikan melalui website akan digunakan sesuai dengan Kebijakan Privasi ClariPet. Kami berkomitmen untuk menjaga keamanan dan kerahasiaan informasi pelanggan sesuai dengan kebijakan yang berlaku.",
          ],
        },
        {
          heading: "Perubahan Syarat & Ketentuan",
          body: [
            "ClariPet berhak untuk mengubah, memperbarui, atau menyesuaikan syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku sejak dipublikasikan pada website. Kami menyarankan pengguna untuk meninjau halaman ini secara berkala.",
          ],
        },
        {
          heading: "Hubungi Kami",
          body: [
            "Apabila Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan menghubungi tim ClariPet melalui informasi kontak yang tersedia pada halaman Contact Us. Terima kasih telah mempercayai ClariPet sebagai bagian dari perjalanan Anda dalam merawat hewan peliharaan kesayangan.",
          ],
        },
      ]}
    />
  );
}

