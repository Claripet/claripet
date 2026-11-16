import { CheckoutView } from "@/components/checkout/CheckoutView";

// Rendered per request for the strict-CSP nonce (lib/csp.ts).
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutView />;
}
