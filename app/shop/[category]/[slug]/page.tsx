import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "../../../../components/structured-data";
import { ProductDetailActions } from "../../../../components/product-detail-actions";
import { ProductCard } from "../../../../components/product-card";
import { OffersWidget } from "../../../../components/offers-widget";
import { ProductGallery } from "../../../../components/product-gallery";
import { UrgencyTimer } from "../../../../components/urgency-timer";
import { ProductReviews } from "../../../../components/product-reviews";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  formatPrice,
  getPrimaryImage,
  getProduct,
  getProducts,
  getSettings,
  parseProductImages,
  resolveAssetUrl,
  parseBulletPoints,
  extractDescriptionBulletPoints,
  getActiveCoupons,
  isProductSellable,
} from "../../../../lib/api";
import { getCanonicalUrl, getProductPath, getSiteDescription, getSiteName, getProductRenderKey } from "../../../../lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts("per_page=24&sort=popular");
  return products.items
    .filter((product) => product.category_slug)
    .slice(0, 24)
    .map((product) => ({
      category: product.category_slug as string,
      slug: product.slug,
    }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const [settings, product] = await Promise.all([getSettings(), getProduct(slug)]);
  const siteName = getSiteName(settings);
  const fallbackDescription = getSiteDescription(settings);

  if (!product || product.category_slug !== category) {
    return { title: "Product Not Found", description: fallbackDescription };
  }

  const description = product.meta_desc || product.short_desc || product.description || fallbackDescription;
  const image = getPrimaryImage(product);
  const canonicalPath = getProductPath(product);

  return {
    title: product.meta_title || product.name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description,
      url: getCanonicalUrl(canonicalPath, settings),
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, category } = await params;
  const [settings, product, activeCoupons] = await Promise.all([
    getSettings(),
    getProduct(slug),
    getActiveCoupons(),
  ]);

  if (!product || product.category_slug !== category) {
    notFound();
  }

  // Fetch related products — filter out ones with no images
  const relatedProductsResponse = await getProducts(
    `category=${encodeURIComponent(product.category_slug || category)}&per_page=8`
  );
  const relatedProducts = relatedProductsResponse.items
    .filter((item) => item.id !== product.id)
    .filter((item) => {
      const imgs = parseProductImages(item.images);
      return imgs.length > 0;
    })
    .slice(0, 4);

  const currencySymbol = settings.site_currency_symbol || "₹";
  const isSellable = isProductSellable(product);
  const gallery = parseProductImages(product.images);
  const images = gallery.length
    ? gallery.map((image) => resolveAssetUrl(image))
    : [PRODUCT_PLACEHOLDER_IMAGE];

  const description = product.meta_desc || product.short_desc || product.description || getSiteDescription(settings);
  const canonicalPath = getProductPath(product);
  const explicitBulletPoints = parseBulletPoints(product.bullet_points);
  const fallbackDescriptionBullets =
    explicitBulletPoints.length === 0 ? extractDescriptionBulletPoints(product.description) : [];
  const bulletPoints = explicitBulletPoints.length > 0 ? explicitBulletPoints : fallbackDescriptionBullets;
  const showDescriptionBody = Boolean(product.description) && bulletPoints.length === 0;

  // Product specs — only non-null fields
  const productSpecs = [
    product.material ? { label: "Material", value: product.material } : null,
    product.size_label ? { label: "Size", value: product.size_label } : null,
    product.length ? { label: "Length", value: `${product.length} ${product.dimension_unit || "cm"}` } : null,
    product.width ? { label: "Width", value: `${product.width} ${product.dimension_unit || "cm"}` } : null,
    product.height ? { label: "Height", value: `${product.height} ${product.dimension_unit || "cm"}` } : null,
    product.weight ? { label: "Weight", value: `${product.weight} ${product.weight_unit || "kg"}` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string | number }>;

  // Price info
  const hasDiscount =
    product.sale_price &&
    Number(product.sale_price) > 0 &&
    Number(product.sale_price) < Number(product.price);
  const savingsAmount = hasDiscount
    ? Number(product.price) - Number(product.sale_price)
    : 0;
  const savingsPct = hasDiscount
    ? Math.round((savingsAmount / Number(product.price)) * 100)
    : 0;

  // Structured data
  let productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.meta_title || product.name,
    description,
    image: images,
    category: product.category_name || undefined,
    sku: product.slug,
    brand: { "@type": "Brand", name: getSiteName(settings) },
    offers: {
      "@type": "Offer",
      priceCurrency: settings.site_currency || "INR",
      price: Number(product.effective_price ?? product.price ?? 0),
      availability: isSellable ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: getCanonicalUrl(canonicalPath, settings),
    },
  };

  if (product.custom_schema) {
    try {
      productJsonLd = JSON.parse(product.custom_schema) as Record<string, unknown>;
    } catch {
      // Ignore invalid custom schema
    }
  }

  // Use product's own images for the story section if available
  const storyImage1 = images.length > 1 ? images[1] : null;
  const storyImage2 = images.length > 2 ? images[2] : images.length > 1 ? images[0] : null;

  return (
    <main className="page-shell">
      <StructuredData data={productJsonLd} />

      {/* Breadcrumb */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <div className="container">
          <Link href="/">Home</Link>
          <span className="separator">/</span>
          <Link href="/shop">Shop</Link>
          <span className="separator">/</span>
          <Link
            href={`/shop?category=${product.category_slug || category}`}
            style={{ textTransform: "capitalize" }}
          >
            {product.category_name || (product.category_slug || category).replace(/-/g, " ")}
          </Link>
          <span className="separator">/</span>
          <span
            className="current"
            style={{
              display: "inline-block",
              maxWidth: "260px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              verticalAlign: "bottom",
            }}
          >
            {product.name}
          </span>
        </div>
      </nav>

      {/* ── HERO: Gallery + Info ── */}
      <section className="pdp-hero">
        <div className="container pdp-grid">
          {/* Gallery — Left */}
          <ProductGallery images={images} productName={product.name} />

          {/* Info Panel — Right */}
          <div className="pdp-info-panel">

            {/* Category eyebrow */}
            <p className="eyebrow">{product.category_name || "Signature Collection"}</p>

            {/* Product Name */}
            <h1 className="pdp-product-title">{product.name}</h1>

            {/* Rating Row */}
            <div className="pdp-rating-row">
              <span className="pdp-stars">
                {"★".repeat(Math.max(0, Math.min(5, Math.round(Number(product.avg_rating || 0)))))}
                {"☆".repeat(Math.max(0, 5 - Math.min(5, Math.round(Number(product.avg_rating || 0)))))}
              </span>
              <strong className="pdp-rating-score">
                {Number(product.avg_rating || 0).toFixed(1)}
              </strong>
              <a href="#reviews" className="pdp-rating-count">
                {Number(product.review_count || 0)} review{Number(product.review_count || 0) === 1 ? "" : "s"}
              </a>
            </div>

            {/* Divider */}
            <div className="pdp-divider" />

            {/* Price Block */}
            {isSellable ? (
              <div className="pdp-price-block">
                <span className="pdp-effective-price">
                  {formatPrice(product.effective_price ?? product.price, currencySymbol)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="pdp-mrp">
                      MRP <s>{formatPrice(product.price, currencySymbol)}</s>
                    </span>
                    <span className="pdp-savings-badge">
                      {savingsPct}% off
                    </span>
                  </>
                )}
                <span className="pdp-tax-note">Inclusive of all taxes</span>
              </div>
            ) : (
              <div className="pdp-price-block">
                <span className="pdp-coming-soon-price">Coming Soon</span>
              </div>
            )}

            {/* Delivery Strip */}
            {isSellable && (
              <div className="pdp-delivery-strip">
                <div className="pdp-delivery-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <div>
                    <strong>Free Delivery</strong>
                    <span>On orders above ₹499</span>
                  </div>
                </div>
                <div className="pdp-delivery-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <strong>Secure Packaging</strong>
                    <span>Ships in 3–5 business days</span>
                  </div>
                </div>
                <div className="pdp-delivery-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <div>
                    <strong>Easy Returns</strong>
                    <span>7-day hassle-free returns</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="pdp-trust-strip">
              <div className="pdp-trust-badge">
                <div className="pdp-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <strong>100% Brass</strong>
                  <span>Pure & authentic</span>
                </div>
              </div>
              <div className="pdp-trust-badge">
                <div className="pdp-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 0v20M2 12h20" />
                  </svg>
                </div>
                <div>
                  <strong>Handcrafted</strong>
                  <span>Artisan made</span>
                </div>
              </div>
              <div className="pdp-trust-badge">
                <div className="pdp-trust-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <div>
                  <strong>Gift Box</strong>
                  <span>Festive ready</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Add to Cart / Buy Now / Amazon) */}
            <ProductDetailActions product={product} />

            {/* Urgency Timer */}
            {isSellable ? <UrgencyTimer /> : null}

            {/* Divider */}
            <div className="pdp-divider" style={{ marginTop: "1.5rem" }} />

            {/* Bullet Points */}
            {bulletPoints.length > 0 && (
              <div className="pdp-bullets">
                <h3 className="pdp-section-label">About this product</h3>
                <ul className="pdp-bullet-list">
                  {bulletPoints.map((point, index) => (
                    <li key={index} className="pdp-bullet-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pdp-bullet-check" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.short_desc ? (
              <p className="pdp-short-desc">{product.short_desc}</p>
            ) : null}

            {/* Product Description */}
            {showDescriptionBody ? (
              <div className="pdp-description">
                <h3 className="pdp-section-label">About this product</h3>
                <p className="pdp-desc-body">{product.description}</p>
              </div>
            ) : null}

            {/* Offers Widget */}
            {isSellable && activeCoupons.length > 0 ? (
              <div style={{ marginTop: "1.5rem" }}>
                <OffersWidget coupons={activeCoupons} />
              </div>
            ) : null}

            {/* Spec Table */}
            {productSpecs.length > 0 && (
              <div className="pdp-specs">
                <h3 className="pdp-section-label">Product Details</h3>
                <table className="pdp-spec-table">
                  <tbody>
                    {productSpecs.map((spec) => (
                      <tr key={spec.label} className="pdp-spec-row">
                        <td className="pdp-spec-label">{spec.label}</td>
                        <td className="pdp-spec-value">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STORY SECTION ── */}
      {(storyImage1 || storyImage2) && (
        <section className="pdp-story-section">
          <div className="container pdp-story-grid">
            <div className="pdp-story-copy">
              <p className="eyebrow">Crafted With Purpose</p>
              <h2>Designed To Feel Special The Moment It Is Placed</h2>
              <p>
                Each piece from Little Divinity is carefully selected for its finish quality, weight,
                and display presence. Whether placed on an altar, gifted at a celebration, or styled
                as a statement piece — our brass and heritage decor is built to last a lifetime and
                tell a story worth sharing.
              </p>
            </div>
            <div className="pdp-story-cards">
              {storyImage1 && (
                <div className="pdp-story-card">
                  <Image
                    src={storyImage1}
                    alt={`${product.name} — Detail view`}
                    width={600}
                    height={600}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="pdp-story-card-caption">
                    <h3>Sacred Craftsmanship</h3>
                    <p>Use it to create a richer altar, console story, or celebratory vignette at home.</p>
                  </div>
                </div>
              )}
              {storyImage2 && (
                <div className="pdp-story-card">
                  <Image
                    src={storyImage2}
                    alt={`${product.name} — Lifestyle view`}
                    width={600}
                    height={600}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="pdp-story-card-caption">
                    <h3>Meaningful Gifting</h3>
                    <p>A strong choice for housewarmings, wedding hampers, festive exchanges, and milestone keepsakes.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related-section">
          <div className="container">
            <div className="pdp-section-head">
              <p className="eyebrow">You May Also Like</p>
              <h2 className="pdp-related-title">Related Accents</h2>
              <Link href={`/shop?category=${product.category_slug || category}`} className="pdp-see-all-link">
                See all →
              </Link>
            </div>
            <div className="product-grid shop-product-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {relatedProducts.map((item) => (
                <ProductCard key={getProductRenderKey(item)} product={item} currencySymbol={currencySymbol} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      <div id="reviews">
        <ProductReviews
          productName={product.name}
          productSlug={product.slug}
          initialAverage={Number(product.avg_rating || 0)}
          initialCount={Number(product.review_count || 0)}
        />
      </div>
    </main>
  );
}
