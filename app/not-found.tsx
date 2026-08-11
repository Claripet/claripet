import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap empty-state">
      <h1 className="h1" style={{ marginBottom: 12 }}>Halaman tidak ditemukan</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Kami tidak dapat menemukan apa yang Anda cari.
      </p>
      <Link className="btn btn-primary" href="/">
        Kembali ke Beranda
      </Link>
    </main>
  );
}
