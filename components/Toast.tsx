"use client";

import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

export function Toast() {
  const { toast } = useCart();
  return (
    <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">
      <Icon name="check" size={18} /> {toast}
    </div>
  );
}
