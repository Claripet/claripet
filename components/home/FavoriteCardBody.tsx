"use client";

import { memo, useRef, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { StarRating } from "@/components/ui/StarRating";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useCart } from "@/context/CartContext";
import { useFlyToCart } from "@/context/FlyToCartContext";
import type { Product } from "@/lib/types";

export const FavoriteCardBody = memo(function FavoriteCardBody({ product }: { product: Product }) {
  const cart = useCart();
  const btnRef = useRef<HTMLDivElement>(null);
  const { flyToCart } = useFlyToCart();

  const handleAddToCart = useCallback(() => {
    if (btnRef.current) flyToCart(btnRef.current);
    // The cart.add method handles its own toast dispatch internally via CartContext
    cart.add(product.slug, undefined, 1, product);
  }, [cart, flyToCart, product]);

  return (
    <div className="prod-body">
      <Link className="prod-name" href={`/product/${product.slug}`}>
        {product.name}
      </Link>
      <div className="prod-sub">{product.subtitle}</div>
      <div className="prod-foot-wrapper">
        <div className="prod-foot">
          <span className="prod-price">{formatPrice(product.price)}</span>
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>
        <button className="mobile-add-btn mobile-only" onClick={handleAddToCart} aria-label="Add to cart">
          <Icon name="plus" size={18} />
        </button>
      </div>
      <div ref={btnRef} className="prod-add desktop-only">
        <PrimaryButton block size="sm" type="button" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
          Add to Cart
        </PrimaryButton>
      </div>
    </div>
  );
});