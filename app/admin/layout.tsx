import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

// Rendered per request so every admin page carries the strict-CSP nonce that
// middleware puts on the request (lib/csp.ts). A prerendered page has no nonce
// and its inline scripts would be blocked once the policy is enforced.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
