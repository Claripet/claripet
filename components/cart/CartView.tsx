"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/PageHead";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useCart, FREE_SHIPPING_THRESHOLD } from "@/context/CartContext";

import { useAuth } from "@/context/AuthContext";

export function CartView() {
  const cart = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      // Store current cart page to return to after login
      sessionStorage.setItem("returnTo", "/checkout");
      router.push("/login?alert=checkout");
    }
  };

  if (cart.detailed.length === 0) {
    return (
      <main>
        <PageHead title="Your Cart" />
        <div className="wrap empty-state" style={{ paddingBottom: '40px' }}>
          <div className="ec">
            <Icon name="cart" size={36} />
          </div>
          <h3 className="h3" style={{ marginBottom: 10 }}>
            Your cart is empty
          </h3>
          <p className="lead" style={{ marginBottom: 24, color: '#5A6072' }}>
            Looks like you haven&apos;t added anything yet. Let&apos;s fix that!
          </p>
          <PrimaryButton icon="arrowRight" onClick={() => router.push("/shop")}>
            Shop Best Sellers
          </PrimaryButton>
        </div>
      </main>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - cart.subtotal;
  const progress = Math.min(100, Math.round((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <main>
      <PageHead title="Your Cart" />
      <div className="wrap cart-layout">
        <div className="cart-items">
          {cart.detailed.map((item) => (
            <div className="cart-item" key={item.slug + item.size}>
              <Link
                className="ci-media"
                href={`/product/${item.slug}`}
                aria-label={item.product?.name || "Product"}
              >
                {item.product?.images?.[0]?.url ? (
                  <Image src={item.product.images[0].url} alt={item.product.images[0].alt || item.product.name} fill style={{ objectFit: "contain" }} sizes="80px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="image" size={24} className="muted" />
                  </div>
                )}
              </Link>
              <div>
                <div className="ci-name">{item.product?.name || "Unknown Product"}</div>
                <div className="ci-size">Size: {item.size}</div>
                <div className="ci-actions" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <QuantityStepper value={item.qty} onChange={(q) => cart.updateQty(item.slug, item.size, q)} />
                    <button
                      className="ci-remove"
                      aria-label={`Remove ${item.product?.name || "product"} from cart`}
                      onClick={() => cart.remove(item.slug, item.size)}
                      style={{ minWidth: "44px", minHeight: "44px", border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                    <Icon name="trash" size={18} />{" "}
                    <span style={{ fontSize: 13, verticalAlign: "middle" }}>Remove</span>
                  </button>
                </div>
              </div>
              <div className="ci-price">{formatPrice((item.product?.price || 0) * item.qty)}</div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3 className="h3">Order Summary</h3>
          <div className="freeship-strip">
            {remaining > 0 ? (
              <>
                <span>
                  Add <b>{formatPrice(remaining)}</b> more for <b>FREE shipping</b>
                </span>
                <div className="freeship-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <span>🎉 You&apos;ve unlocked <b>FREE shipping</b>!</span>
            )}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{remaining > 0 ? "Calculated at checkout" : "Free"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn btn-primary cart-checkout-btn" style={{ width: '100%', display: 'block', textAlign: 'center', padding: '16px', fontSize: '16px' }} onClick={handleCheckoutClick}>
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="btn btn-secondary" style={{ display: 'block', textAlign: 'center', marginTop: 12, padding: '16px', fontSize: '16px' }}>
            Continue Shopping
          </Link>
        </aside>
      </div>

      {/* Sticky mobile checkout bar */}
      <div className="mobile-cart-bar">
        <div className="mcb-total">
          <span className="mcb-label">Total</span>
          <span className="mcb-value">{formatPrice(cart.subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary mcb-btn" onClick={handleCheckoutClick}>
          Checkout
        </Link>
      </div>
    </main>
  );
}
