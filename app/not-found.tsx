import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap empty-state">
      <h1 className="h1" style={{ marginBottom: 12 }}>Page not found</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        We couldn’t find what you were looking for.
      </p>
      <Link className="btn btn-primary" href="/">
        Back to Home
      </Link>
    </main>
  );
}
