"use client";

import { useRouter } from "next/navigation";
import { Product } from "../lib/types";
import { formatPrice, isProductSellable } from "../lib/api";
import { CartQuantityControl } from "./cart-quantity-control";
import { buildCartKey, useCart } from "./cart-provider";
import { useWishlist } from "./wishlist-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const cartKey = buildCartKey(product.slug, null);
  const quantity = getItemQuantity(cartKey);
  const isWishlisted = hasItem(product.slug);
  const isSellable = isProductSellable(product);
  const showAmazonButton = Boolean(product.amazon_button_enabled && product.amazon_link);
  const amazonPriceLabel = product.amazon_price ? formatPrice(product.amazon_price, "₹") : null;

  return (
    <div className="detail-actions-deck">
      {isSellable ? (
        <>
          {/* Primary CTA Row */}
          <div className="action-primary-row">
            {quantity > 0 ? (
              <CartQuantityControl cartKey={cartKey} className="detail-quantity-wrap" />
            ) : (
              <button
                type="button"
                className="pdp-add-to-cart-btn"
                onClick={() => addItem(product, 1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Add to Cart
              </button>
            )}

            <button
              type="button"
              className="pdp-buy-now-btn"
              onClick={() => {
                if (quantity === 0) addItem(product, 1);
                router.push("/checkout");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Buy Now
            </button>
          </div>

          {/* Wishlist Row */}
          <button
            type="button"
            onClick={() => toggleItem(product)}
            className={`pdp-wishlist-btn ${isWishlisted ? "active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
          </button>

          {/* Amazon Button — shown only when admin enables it */}
          {showAmazonButton && (
            <a
              href={product.amazon_link as string}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="pdp-amazon-btn"
            >
              {/* Amazon "a" logo */}
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="amazon-logo-icon">
                <path d="M15.93 17.09c-.16.1-1.56.83-3.32.83-3.7 0-6.09-2.7-6.09-5.6 0-3.1 2.57-5.71 6.09-5.71 1.49 0 2.87.54 3.39.95.1.07.17.22.17.36v2.76c0 .15-.07.29-.19.37-.14.1-.34.1-.48.02-.58-.4-1.66-.68-2.89-.68-2.01 0-3.41 1.53-3.41 3.39 0 1.68 1.19 3.19 3.41 3.19 1.13 0 2.18-.32 2.89-.73.14-.08.34-.08.48.02.12.08.19.23.19.37v2.35c0 .14-.07.28-.17.38-.1.1-.26.14-.07.03zM20.72 18.04c-.45.31-1.08.47-1.71.47-1.98 0-3.17-1.46-3.17-3.06 0-.85.35-1.66 1.03-2.25.64-.57 1.56-.86 2.71-.86.47 0 .93.06 1.14.12v-.28c0-.87-.57-1.37-1.56-1.37-.72 0-1.35.22-1.85.64-.12.1-.28.12-.4.03l-1.27-.93c-.14-.1-.17-.29-.07-.42.68-.84 1.79-1.38 3.44-1.38 2.37 0 3.64 1.29 3.64 3.37v4.21c0 .16-.07.3-.19.38l-1.74 1.33zM18.1 15.12c-.35 0-.79.1-1.13.32-.31.2-.47.49-.47.84 0 .75.59 1.25 1.49 1.25.43 0 .86-.12 1.19-.32v-1.95c-.3-.09-.69-.14-1.08-.14z"/>
              </svg>
              <span className="amazon-btn-text">
                <span className="amazon-btn-label">Also on Amazon</span>
                {amazonPriceLabel && <span className="amazon-btn-price">{amazonPriceLabel}</span>}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="amazon-external-icon" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>
          )}
        </>
      ) : (
        <div className="action-primary-row">
          <button
            type="button"
            className="pdp-add-to-cart-btn pdp-btn-disabled"
            disabled
            aria-disabled="true"
          >
            Coming Soon
          </button>
          <p className="coming-soon-note">
            Add final images and price from admin to make this product buyable.
          </p>
        </div>
      )}
    </div>
  );
}
