import type { Metadata } from "next";
import { LegalView } from "@/components/legal/LegalView";

export const metadata: Metadata = {
  title: "Privacy Policy | ClariPet",
  description:
    "Kebijakan Privasi ClariPet. Bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.",
  alternates: { canonical: "/privacy-policy" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalView
      title="Kebijakan Privasi"
      intro="Di ClariPet, kami menghargai dan menjaga privasi setiap pelanggan. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi yang diberikan saat Anda menggunakan website maupun layanan ClariPet. Dengan menggunakan website ClariPet, Anda dianggap telah memahami dan menyetujui kebijakan yang dijelaskan di bawah ini."
      updated="Juni 2026"
      sections={[
        {
          heading: "Informasi Yang Kami Kumpulkan",
          body: [
            "Saat Anda melakukan pembelian, membuat akun, menghubungi kami, berlangganan newsletter, atau menggunakan layanan yang tersedia di website ClariPet, kami dapat mengumpulkan informasi seperti:",
            "â€¢ Nama lengkap\nâ€¢ Nomor telepon\nâ€¢ Alamat email\nâ€¢ Alamat pengiriman\nâ€¢ Informasi pesanan\nâ€¢ Riwayat transaksi\nâ€¢ Informasi akun pelanggan\nâ€¢ Informasi profil hewan peliharaan yang disimpan secara sukarela oleh pelanggan\nâ€¢ Informasi lain yang secara sukarela Anda berikan kepada kami",
            "Kami hanya mengumpulkan informasi yang diperlukan untuk menjalankan layanan dan meningkatkan pengalaman pelanggan.",
          ],
        },
        {
          heading: "Bagaimana Kami Menggunakan Informasi Anda",
          body: [
            "Informasi yang diberikan digunakan untuk:",
            "â€¢ Memproses dan mengirimkan pesanan\nâ€¢ Mengelola akun pelanggan\nâ€¢ Menyimpan riwayat transaksi dan pesanan\nâ€¢ Menyediakan fitur My ClariPet\nâ€¢ Memberikan layanan pelanggan\nâ€¢ Menjawab pertanyaan atau permintaan bantuan\nâ€¢ Mengirimkan informasi terkait pesanan\nâ€¢ Mengirimkan informasi produk, promosi, atau pembaruan apabila pelanggan memberikan persetujuan\nâ€¢ Meningkatkan pengalaman pengguna di website ClariPet\nâ€¢ Meningkatkan kualitas produk dan layanan kami",
            "Kami tidak menggunakan informasi pelanggan untuk tujuan yang tidak berkaitan dengan operasional ClariPet.",
          ],
        },
        {
          heading: "Akun Pelanggan",
          body: [
            "Pelanggan yang membuat akun di website ClariPet dapat menyimpan informasi tertentu untuk mempermudah penggunaan layanan di masa mendatang, termasuk: Alamat pengiriman, Riwayat pesanan, Wishlist atau produk tersimpan, Informasi profil hewan peliharaan, dan Preferensi akun lainnya.",
            "Pelanggan bertanggung jawab untuk menjaga kerahasiaan informasi akun dan kata sandi yang digunakan.",
          ],
        },
        {
          heading: "Newsletter dan Komunikasi Pemasaran",
          body: [
            "Apabila pelanggan memilih untuk berlangganan newsletter atau komunikasi pemasaran dari ClariPet, kami dapat mengirimkan informasi mengenai produk baru, promo, penawaran khusus, dan artikel Pet Care Journal.",
            "Pelanggan dapat berhenti berlangganan kapan saja melalui tautan unsubscribe yang tersedia atau dengan menghubungi tim ClariPet.",
          ],
        },
        {
          heading: "Pembayaran",
          body: [
            "Transaksi pembayaran yang dilakukan melalui website ClariPet diproses melalui penyedia layanan pembayaran pihak ketiga yang terpercaya.",
            "ClariPet tidak menyimpan informasi kartu kredit, kartu debit, maupun data pembayaran sensitif lainnya milik pelanggan.",
          ],
        },
        {
          heading: "Penggunaan Data Oleh Pihak Ketiga",
          body: [
            "Dalam menjalankan layanan, kami dapat membagikan informasi yang diperlukan kepada pihak ketiga tertentu, seperti penyedia layanan pembayaran, jasa pengiriman, dan penyedia layanan pemasaran atau analitik.",
            "Informasi yang dibagikan hanya sebatas yang diperlukan untuk menjalankan layanan tersebut. ClariPet tidak menjual, menyewakan, atau memperdagangkan data pribadi pelanggan kepada pihak lain.",
          ],
        },
        {
          heading: "Cookies dan Teknologi Serupa",
          body: [
            "Website ClariPet dapat menggunakan cookies dan teknologi serupa untuk menyimpan preferensi pengguna, mempermudah proses login, mengingat isi keranjang belanja, menganalisis penggunaan website, dan meningkatkan performa serta pengalaman pengguna.",
            "Pengguna dapat mengatur penggunaan cookies melalui pengaturan browser masing-masing. Namun, menonaktifkan cookies dapat memengaruhi fungsi tertentu pada website.",
          ],
        },
        {
          heading: "Keamanan Informasi",
          body: [
            "Kami berupaya menjaga keamanan informasi pelanggan dengan menerapkan langkah-langkah yang wajar untuk mencegah akses, penggunaan, perubahan, atau pengungkapan yang tidak sah.",
            "Meskipun demikian, tidak ada sistem yang dapat menjamin keamanan data secara mutlak. Oleh karena itu, pelanggan juga diharapkan menjaga kerahasiaan informasi akun dan data pribadinya.",
          ],
        },
        {
          heading: "Hak Pelanggan",
          body: [
            "Pelanggan berhak untuk: Meminta pembaruan data yang tidak akurat, Meminta koreksi informasi yang diberikan, Mengubah informasi akun, Berhenti menerima komunikasi pemasaran, dan Menghubungi kami terkait penggunaan data pribadi.",
            "Untuk permintaan terkait data pribadi, pelanggan dapat menghubungi tim ClariPet melalui halaman Contact Us.",
          ],
        },
        {
          heading: "Perubahan Kebijakan Privasi",
          body: [
            "ClariPet berhak memperbarui Kebijakan Privasi ini dari waktu ke waktu apabila diperlukan. Perubahan akan berlaku sejak dipublikasikan pada website. Kami menyarankan pelanggan untuk meninjau halaman ini secara berkala.",
          ],
        },
        {
          heading: "Hubungi Kami",
          body: [
            "Apabila Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau penggunaan data pribadi Anda, silakan menghubungi tim ClariPet melalui informasi kontak yang tersedia pada halaman Contact Us. Terima kasih telah mempercayai ClariPet sebagai bagian dari perjalanan Anda dalam merawat hewan peliharaan kesayangan.",
          ],
        },
      ]}
    />
  );
}

