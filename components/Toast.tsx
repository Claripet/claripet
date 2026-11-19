"use client";

import { Icon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

export function Toast() {
  const { toast, toastTone } = useCart();
  const isError = toastTone === "error";
  return (
    <div
      className={"toast" + (toast ? " show" : "") + (isError ? " toast-error" : "")}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <Icon name={isError ? "alert-circle" : "check"} size={18} /> {toast}
    </div>
  );
}
