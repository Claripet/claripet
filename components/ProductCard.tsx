"use client";

import { memo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons";
import { StarRating } from "@/components/ui/StarRating";

const PrimaryButton = dynamic(() => import("@/components/ui/PrimaryButton").then((mod) => mod.PrimaryButton));

import { useCart } from "@/context/CartContext";
import { useFlyToCart } from "@/context/FlyToCartContext";
import { useWishlist } from "@/context/WishlistContext";

// memo prevents re-renders of every card in the grid when unrelated parent
// state changes (e.g. filter toggles, cart count update in Navbar).
// FIXED: price row nowrap + product name 2-line clamp for consistent card height on mobile
export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const btnRef = useRef<HTMLDivElement>(null);
  const { flyToCart } = useFlyToCart();
  const { slugs, toggle } = useWishlist();
  const isWished = slugs.includes(product.slug);

  // Stable reference so memo comparison is not defeated by inline arrow functions
  const handleAddToCart = useCallback(() => {
    if (btnRef.current) flyToCart(btnRef.current);
    cart.add(product.slug, undefined, 1, product);
  }, [cart, flyToCart, product]);

  const toggleWish = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent link click if necessary
      toggle(product.slug);
    },
    [toggle, product.slug]
  );

  const displayImage = product.images?.[0];

  return (
    <div className="prod-card" role="group" aria-label={`Product: ${product.name}`}>
      <div className="prod-media" style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "#f5f5f5", display: "flex", alignItems: "center", justifyItems: "center" }}>
              {product.bestSeller && <span className="prod-tag tag">Best Seller</span>}
              <button
                className={"wishlist" + (isWished ? " active" : "")}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWished}
                onClick={toggleWish}
              >
                <Icon name="heart" size={19} />
              </button>
              <Link
                className="prod-media-link"
                href={`/product/${product.slug}`}
                aria-label={`View ${product.name} details`}
                style={{ position: "relative", width: "100%", height: "100%", display: "block" }}
              >
                {displayImage ? (
                  <Image
                    src={displayImage.url}
                    alt={displayImage.alt ?? product.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: "contain", padding: "16px" }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="image" size={32} className="muted" />
                  </div>
                )}
              </Link>
            </div>
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
        </div>
        <div ref={btnRef} className="prod-add">
          <PrimaryButton block size="sm" type="button" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
            Add to Cart
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
});
