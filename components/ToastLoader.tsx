"use client";

import dynamic from "next/dynamic";

// next/dynamic with ssr:false is disallowed inside a Server Component as of
// Next.js 16 (app/layout.tsx has none of the "use client" directive it would
// need), so the lazy import lives here instead. Behavior is unchanged: Toast
// is still never rendered on the server and only loads its chunk client-side.
const Toast = dynamic(() => import("@/components/Toast").then((mod) => mod.Toast), {
  ssr: false,
});

export function ToastLoader() {
  return <Toast />;
}
