"use client";

import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  type?: "button" | "submit";
  icon?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function SecondaryButton({
  children,
  onClick,
  size = "md",
  block,
  type = "button",
  icon,
  disabled,
  className,
  "aria-label": ariaLabel,
}: BtnProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const cls = [
    "btn btn-secondary ripple",
    size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    }
    onClick?.();
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      className={cls}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ minWidth: "44px", minHeight: "44px" }}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
}
