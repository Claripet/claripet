import type { ReactNode } from "react";

// Rendered per request for the strict-CSP nonce (lib/csp.ts).
export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
