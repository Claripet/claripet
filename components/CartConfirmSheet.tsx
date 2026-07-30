"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";

/**
 * Slide-up confirmation sheet shown after adding a product to cart.
 * Mobile only; hidden on desktop via CSS.
 */
export function CartConfirmSheet() {
  const { lastAdded, dismissLastAdded } = useCart();

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lastAdded) dismissLastAdded();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastAdded, dismissLastAdded]);

  const show = !!lastAdded;

  return (
    <>
      <div
        className={"ccs-scrim" + (show ? " show" : "")}
        onClick={dismissLastAdded}
        aria-hidden="true"
      />
      <div
        className={"cart-confirm-sheet" + (show ? " show" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Product added to cart"
      >
        <div className="ccs-header">
          <Icon name="check" size={20} strokeWidth={3} />
          <span>Added to cart</span>
        </div>
        <div className="ccs-product">
          {lastAdded?.product.images?.[0]?.url && (
            <div className="ccs-product-img">
              <Image
                src={lastAdded.product.images[0].url}
                alt={lastAdded.product.images[0].alt || lastAdded.product.name}
                fill
                style={{ objectFit: "contain" }}
                sizes="56px"
              />
            </div>
          )}
          <div className="ccs-product-info">
            <span className="ccs-product-name">{lastAdded?.product.name}</span>
            <span className="ccs-product-price">
              {lastAdded?.qty}x {formatPrice(lastAdded?.product.price ?? 0)}
            </span>
          </div>
        </div>
        <div className="ccs-actions">
          <Link href="/cart" className="btn btn-outline" onClick={dismissLastAdded}>
            View Cart
          </Link>
          <button className="btn btn-primary" onClick={dismissLastAdded}>
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
