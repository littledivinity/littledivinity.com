"use client";

import Image from "next/image";
import Link from "next/link";

import { formatPrice, resolveAssetUrl } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Coupon, SiteSettings } from "../lib/types";
import { CartQuantityControl } from "./cart-quantity-control";
import { useCart } from "./cart-provider";

export function CartView({ settings, offers }: { settings: SiteSettings; offers: Coupon[] }) {
  const { items, subtotal, clearCart, removeItem } = useCart();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!items.length) {
    return (
      <div className="cart-empty-state">
        <div className="empty-cart-icon-container">
          <svg
            viewBox="0 0 24 24"
            className="empty-cart-svg"
            aria-hidden="true"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <p className="eyebrow">Your Cart</p>
        <h1 className="page-title">Your Cart is Empty</h1>
        <p className="shop-intro">Explore our collection of handcrafted brass pooja articles, home decor, and premium gifting pieces to fill your home with divinity.</p>
        <Link href="/shop" className="primary-button continue-shopping-btn">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-list-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Selection</h1>
          <span className="cart-count-badge">
            {itemCount} {itemCount === 1 ? "piece" : "pieces"}
          </span>
        </div>

        <div className="cart-list">
          {items.map((item, index) => (
            <article key={item.cartKey} className="cart-item-card">
              <div className="cart-item-media">
                <Link
                  href={getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null })}
                  className="cart-item-media-shell"
                >
                  <Image
                    src={resolveAssetUrl(item.image)}
                    alt={item.name}
                    fill
                    sizes="(max-width: 760px) 80px, 120px"
                    className="cart-item-image"
                    priority={index === 0}
                  />
                </Link>
              </div>

              <div className="cart-item-copy">
                <div className="cart-item-head">
                  <div className="product-info">
                    <p className="product-category">{item.categoryName || "Signature Edit"}</p>
                    <Link
                      href={getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null })}
                      className="product-title-link"
                    >
                      <h2 className="product-name">{item.name}</h2>
                    </Link>
                  </div>
                  
                  <div className="price-and-delete">
                    <p className="detail-price">{formatPrice(item.price, currencySymbol)}</p>
                    <button
                      type="button"
                      className="cart-item-delete-btn"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.cartKey)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="trash-icon"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="cart-item-foot">
                  <div className="quantity-wrapper">
                    <span className="quantity-label">Quantity</span>
                    <CartQuantityControl cartKey={item.cartKey} compact />
                  </div>
                  <Link
                    href={getProductPath({ slug: item.slug, category_slug: item.categorySlug ?? null })}
                    className="text-link view-product-link"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="cart-actions-bottom">
          <Link href="/shop" className="secondary-button back-to-shop-btn">
            ← Continue Shopping
          </Link>
          <button type="button" className="clear-cart-text-btn" onClick={clearCart}>
            Clear All Items
          </button>
        </div>
      </div>

      <aside className="cart-summary-aside">
        <div className="cart-summary-card">
          <p className="eyebrow">Checkout Details</p>
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="cart-summary-details">
            <div className="cart-summary-row">
              <span className="summary-label">Selected Items</span>
              <strong className="summary-value">{itemCount}</strong>
            </div>
            <div className="cart-summary-row subtotal-row">
              <span className="summary-label">Subtotal</span>
              <strong className="summary-value subtotal-value">{formatPrice(subtotal, currencySymbol)}</strong>
            </div>
            <div className="shipping-info-alert">
              <svg viewBox="0 0 24 24" className="shipping-icon" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Shipping & taxes calculated at checkout</span>
            </div>
          </div>

          <div className="cart-summary-actions">
            <Link href="/checkout" className="primary-button checkout-btn">
              Proceed to Secure Checkout
            </Link>
          </div>
        </div>

        {offers.length ? (
          <div className="cart-offers-panel">
            <div className="offers-header">
              <svg viewBox="0 0 24 24" className="offers-icon" aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <h3 className="offers-title">Available Offers</h3>
            </div>
            
            <div className="cart-offers-list">
              {offers.map((offer) => (
                <article key={offer.id} className="cart-offer-card">
                  <div className="cart-offer-head">
                    <strong className="offer-title">{offer.title}</strong>
                    <span className="offer-badge">{offer.badge_text || offer.code}</span>
                  </div>
                  <p className="offer-desc">{offer.description || `${offer.code} can be applied on eligible orders.`}</p>
                  <div className="offer-code-tag">
                    <span className="code-label">Use Code:</span>
                    <code className="code-value">{offer.code}</code>
                    {offer.min_order_amount ? (
                      <span className="min-order-text">
                        (Min. Order: {formatPrice(offer.min_order_amount, currencySymbol)})
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
