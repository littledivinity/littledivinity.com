import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "../../components/structured-data";
import { ShopProductList } from "../../components/shop-product-list";
import { ShopSortSelect, ShopPriceFilter } from "../../components/shop-controls";
import { HeroSlider } from "../../components/hero-slider";
import { getCategories, getProducts, getSettings, resolveAssetUrl } from "../../lib/api";
import { getCanonicalUrl, getProductPath, getSiteDescription, getSiteName } from "../../lib/site";
import { referenceAssets } from "../../lib/reference-assets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(24)]);
  const activeCategory = categories.find((category) => category.slug === params.category);
  const siteName = getSiteName(settings);
  const description = activeCategory
    ? `Shop ${activeCategory.name.toLowerCase()} from ${siteName}. ${getSiteDescription(settings)}`
    : getSiteDescription(settings);

  return {
    title: activeCategory ? `${activeCategory.name} Collection` : "Shop",
    description,
    alternates: {
      canonical: activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop"
    },
    openGraph: {
      title: activeCategory ? `${activeCategory.name} Collection | ${siteName}` : `${siteName} Shop`,
      description,
      url: getCanonicalUrl(activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop", settings)
    }
  };
}

const categorySubtitles: Record<string, string> = {
  "god-idols": "Sacred deities handcrafted in heavy antique brass to center meditation spaces and home altars.",
  "wall-decor": "Detailed brass plates, hanging lamps, and vintage brackets that weave structural stories.",
  "table-decor": "Fine-art frames, ornate candle holders, and intricate showpieces curated for focal consoles.",
  "pooja-decor": "Ritual singhasans, bells, incense holders, and brass vessels designed for peaceful ceremonies.",
  "home-kitchen": "Ornate spice jars, serving trays, and heritage vessels blending luxury and utility.",
  "gifting-edit": "Thoughtfully bundled brass coordinates, ideal for housewarmings, weddings, and milestones."
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const [settings, categories] = await Promise.all([getSettings(), getCategories(12)]);
  const query = new URLSearchParams();
  const activeSort = params.sort || "popularity";
  const sortMap: Record<string, string> = {
    newest: "newest",
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    popularity: "popular"
  };

  query.set("per_page", "24");
  query.set("sort", sortMap[activeSort] || "popular");

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.min_price) {
    query.set("min_price", params.min_price);
  }

  if (params.max_price) {
    query.set("max_price", params.max_price);
  }

  const products = await getProducts(query.toString());
  const currencySymbol = settings.site_currency_symbol || "₹";
  const activeCategory = categories.find((category) => category.slug === params.category);

  // Curated fallback slides for general shop page
  const curatedShopSlides = [
    {
      alt: "Premium Handcrafted Brass God Idols Collection",
      title: "God Idols Collection",
      image: resolveAssetUrl(referenceAssets.collections.godIdols),
      href: "/shop?category=god-idols"
    },
    {
      alt: "Statement Handcrafted Brass Wall Decor",
      title: "Wall Decor Collection",
      image: resolveAssetUrl(referenceAssets.hero.wallDecor),
      href: "/shop?category=wall-decor"
    },
    {
      alt: "Ritual Singhasans and Pooja Accents",
      title: "Pooja Decor Collection",
      image: resolveAssetUrl(referenceAssets.collections.poojaDecor),
      href: "/shop?category=pooja-decor"
    },
    {
      alt: "Curated Festive Gifting Hamper Edits",
      title: "Gifting Edit Collection",
      image: resolveAssetUrl(referenceAssets.founderAndBrand.weddingGift),
      href: "/shop?category=gifting-edit"
    }
  ];

  // Specific category matches to slide between cover and premium close-up
  const categorySliderTheme: Record<string, string> = {
    "god-idols": referenceAssets.productHighlights.superfineShiva,
    "wall-decor": referenceAssets.collections.homeDecor,
    "table-decor": referenceAssets.productHighlights.peacock,
    "pooja-decor": referenceAssets.productHighlights.throne,
    "home-kitchen": referenceAssets.collections.homeKitchen,
    "gifting-edit": referenceAssets.founderAndBrand.weddingGift
  };

  const finalShopSlides = activeCategory
    ? [
        {
          alt: activeCategory.name,
          title: activeCategory.name,
          image: resolveAssetUrl(activeCategory.image),
          href: `/shop?category=${activeCategory.slug}`
        },
        {
          alt: `${activeCategory.name} Closeup`,
          title: activeCategory.name,
          image: resolveAssetUrl(categorySliderTheme[activeCategory.slug] || referenceAssets.collections.homeDecor),
          href: `/shop?category=${activeCategory.slug}`
        }
      ]
    : curatedShopSlides;

  const shopItems = products.items;
  const featuredCategories = categories.slice(0, 8);
  const pageTitle = activeCategory ? `${activeCategory.name} Picks` : "Most Loved Pieces";
  const storePromises = [
    "Handcrafted accents and idols",
    "Festive gifting friendly picks",
    `Free shipping over ${currencySymbol}${settings.min_order_free_shipping || "499"}`,
    "Curated with warm brass styling"
  ];
  const shopPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: activeCategory ? `${activeCategory.name} Collection` : `${getSiteName(settings)} Shop`,
    url: getCanonicalUrl(activeCategory ? `/shop?category=${activeCategory.slug}` : "/shop", settings),
    description: activeCategory
      ? `Browse ${activeCategory.name.toLowerCase()} and handcrafted gifting pieces from ${getSiteName(settings)}.`
      : getSiteDescription(settings),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: shopItems.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(getProductPath(product), settings),
        name: product.name
      }))
    }
  };

  const subtitleText = activeCategory && categorySubtitles[activeCategory.slug]
    ? categorySubtitles[activeCategory.slug]
    : "Browse our complete collection of handcrafted brass idols, wall accents, pooja decor, gifting edits, and lifestyle pieces — curated for sacred spaces, meaningful gifting, and premium home styling.";

  return (
    <main className="page-shell">
      <StructuredData data={shopPageJsonLd} />
      <section className="shop-hero">
        <div className="container">
          <div className="shop-hero-grid">
            <div className="shop-hero-copy">
              <p className="eyebrow">Shop The Collection</p>
              <h1 className="page-title">{activeCategory ? activeCategory.name : "Premium Decor For Home, Ritual, And Gifting"}</h1>
              <p className="shop-intro">{subtitleText}</p>
            </div>

            <div className="shop-hero-visual-frame">
              <div className="shop-hero-visual-inner">
                <HeroSlider
                  slides={finalShopSlides}
                  autoplayMs={4000}
                  showArrows={false}
                  showDots={finalShopSlides.length > 1}
                  showText={false}
                />
                <div className="shop-summary-card">
                  <span>{products.pagination.total} products ready to browse</span>
                  <strong>Curated around festive display, sacred corners, and meaningful gifting.</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Horizontal Category Pill Bar */}
      <div className="shop-sticky-category-bar">
        <div className="container">
          <div className="shop-category-horizontal-list">
            <Link
              href="/shop"
              className={!params.category ? "shop-category-pill active" : "shop-category-pill"}
            >
              <strong>All Pieces</strong>
            </Link>
            {featuredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={category.slug === params.category ? "shop-category-pill active" : "shop-category-pill"}
              >
                <strong>{category.name}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="content-section shop-layout-section">
        <div className="container">
          <div className="shop-layout">
            <aside className="shop-sidebar">
              <div className="shop-filter-card">
                <p className="eyebrow">Filter By</p>
                <h3>Price Range</h3>
                <div className="shop-filter-block">
                  <ShopPriceFilter />
                </div>
              </div>

              <div className="shop-filter-card">
                <p className="eyebrow">Store Promise</p>
                <h3>Why Browse Here</h3>
                <ul className="shop-promise-list">
                  {storePromises.map((promise) => (
                    <li key={promise}>{promise}</li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="shop-results">
              <div className="shop-results-toolbar">
                <div>
                  <p className="eyebrow">Featured Listing</p>
                  <h2>{pageTitle}</h2>
                </div>
                <div className="shop-results-meta">
                  <span className="listing-meta">{products.pagination.total} products found</span>
                  <ShopSortSelect />
                </div>
              </div>

              <ShopProductList
                initialProducts={shopItems}
                initialPagination={products.pagination}
                baseQuery={query.toString()}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
