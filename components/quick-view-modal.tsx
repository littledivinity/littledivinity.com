"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import { PRODUCT_PLACEHOLDER_IMAGE, discountPercent, formatPrice, parseProductImages, resolveAssetUrl, parseBulletPoints, getProducts, isProductSellable, stripHtmlContent } from "../lib/api";
import { getProductPath } from "../lib/site";
import { Product } from "../lib/types";
import { ProductDetailActions } from "./product-detail-actions";
import { OffersWidget } from "./offers-widget";

type QuickViewModalProps = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
};

export function QuickViewModal({ product, isOpen, onClose, currencySymbol }: QuickViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedAccents, setRelatedAccents] = useState<Product[]>([]);
  const isSellable = isProductSellable(product);
  
  const parsedImages = parseProductImages(product.images);
  const discount = discountPercent(product);
  const currentPrice = isSellable ? formatPrice(product.effective_price ?? product.price, currencySymbol) : "Coming Soon";
  
  const comparePrice =
    isSellable && Number(product.sale_price || 0) > 0 && Number(product.sale_price || 0) < Number(product.price)
      ? formatPrice(product.price, currencySymbol)
      : null;

  // Savings calculations
  const parsedPrice = Number(product.price || 0);
  const parsedEffectivePrice = Number((product.effective_price ?? product.price) || 0);
  const savingsAmount = parsedPrice > parsedEffectivePrice ? parsedPrice - parsedEffectivePrice : 0;
  const savingsText = isSellable && savingsAmount > 0 ? formatPrice(savingsAmount, currencySymbol) : null;

  const productPath = getProductPath(product);
  const bulletPoints = parseBulletPoints(product.bullet_points);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? parsedImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === parsedImages.length - 1 ? 0 : prev + 1));
  };


  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when the modal is open
  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  // Reset active image index and fetch related products when product changes
  useEffect(() => {
    setActiveImageIndex(0);

    if (!isOpen || !product.category_slug) return;

    const controller = new AbortController();
    getProducts(`category=${encodeURIComponent(product.category_slug)}&per_page=5`)
      .then((res) => {
        if (!controller.signal.aborted && res?.items) {
          const filtered = res.items.filter((item) => item.id !== product.id).slice(0, 4);
          setRelatedAccents(filtered);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Error fetching related accents", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [product, isOpen]);

  if (!isOpen || !mounted) {
    return null;
  }

  const activeImageSrc = parsedImages.length > 0
    ? resolveAssetUrl(parsedImages[activeImageIndex])
    : PRODUCT_PLACEHOLDER_IMAGE;

  // Use React Portal to mount under body to avoid relative stacking contexts/transforms and flickering
  return createPortal(
    <div className="quickview-overlay" onClick={onClose}>
      <div 
        className="quickview-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
      >
        {/* Floating Close Button */}
        <button 
          type="button" 
          className="quickview-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Gallery / Slider Column */}
        <div className="quickview-gallery">
          <div className="quickview-active-image-wrap">
            <Image
              src={activeImageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              priority
              className="quickview-active-image"
            />
            {isSellable ? (
              discount ? <span className="product-badge">Sale {discount}%</span> : null
            ) : (
              <span className="product-badge product-badge-coming-soon">Coming Soon</span>
            )}
            
            {/* Gallery Floating Navigation Chevron Controls */}
            {parsedImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="quickview-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron-icon">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="quickview-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-chevron-icon">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Slider / Selector Strip */}
          {parsedImages.length > 1 ? (
            <div className="quickview-thumbs">
              {parsedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`quickview-thumb-btn${idx === activeImageIndex ? " active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <Image
                    src={resolveAssetUrl(img)}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Details Column */}
        <div className="quickview-details">
          <div className="quickview-details-header">
            <p className="product-category">{product.category_name || "Signature Edit"}</p>
            <h2 id="qv-title" className="quickview-title">{product.name}</h2>
            
            <div className={`price-row${isSellable ? "" : " price-row-coming-soon"}`} style={{ margin: "0.5rem 0 1rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
              <strong className={`quickview-price${isSellable ? "" : " coming-soon"}`}>{currentPrice}</strong>
              {comparePrice ? <span className="quickview-compare-price">{comparePrice}</span> : null}
              {savingsText && (
                <span className="quickview-savings-tag">
                  Save {savingsText} ({discount}% off)
                </span>
              )}
            </div>

            <hr className="quickview-divider" />
            
            {/* Elegant Brand Editorial Callout Box */}
            <div className="quickview-quote-box">
              {product.short_desc ? (
                <p className="quickview-snippet">{product.short_desc}</p>
              ) : product.description ? (
                <p className="quickview-snippet" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {stripHtmlContent(product.description)}
                </p>
              ) : (
                <p className="quickview-snippet">Handcrafted heirloom accent created to elevate your spaces with spiritual warmth and curated boutique styling.</p>
              )}
            </div>

            {/* Premium Bullet Points Checklist */}
            {bulletPoints.length > 0 && (
              <div className="product-bullets-container quickview-bullets">
                <ul className="bullet-list">
                  {bulletPoints.map((point, index) => (
                    <li key={index} className="bullet-item">
                      <svg className="bullet-icon-star" viewBox="0 0 24 24" fill="var(--accent, #f1a720)">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="bullet-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

              {/* Exclusive Offers Widget */}
              {isSellable ? (
                <div className="quickview-offers-wrap" style={{ marginTop: "1rem" }}>
                  <OffersWidget autoFetch />
                </div>
              ) : null}
          </div>

          <div className="quickview-details-footer">
            {/* Unified Luxury Action Deck */}
            <div className="quickview-actions-container" style={{ marginTop: "1.25rem" }}>
              <ProductDetailActions product={product} />
            </div>

            {/* Compact Related Accents Preview Strip */}
            {relatedAccents.length > 0 && (
              <div className="related-accents-strip" style={{ marginTop: "1.25rem" }}>
                <p className="related-accents-title">Related Accents</p>
                <div className="related-accents-row">
                  {relatedAccents.map((item) => {
                    const [firstImage] = parseProductImages(item.images);
                    return (
                      <Link
                        key={item.id}
                        href={getProductPath(item)}
                        className="related-accent-thumb-link"
                        onClick={onClose}
                        title={item.name}
                      >
                        <div className="related-accent-thumb-image-wrap">
                          <Image
                            src={firstImage ? resolveAssetUrl(firstImage) : PRODUCT_PLACEHOLDER_IMAGE}
                            alt={item.name}
                            fill
                            sizes="40px"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <Link 
                href={productPath} 
                className="quickview-view-more"
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
