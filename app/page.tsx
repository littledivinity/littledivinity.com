import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "../components/structured-data";
import { HeroSlider } from "../components/hero-slider";
import { ProductCard } from "../components/product-card";
import { HomepageNewsletter } from "../components/homepage-newsletter";
import { getHomePageData, resolveAssetUrl } from "../lib/api";
import { resolveFullHomepageContent } from "../lib/homepage-content";
import { referenceAssets } from "../lib/reference-assets";
import { getCanonicalUrl, getProductPath, getProductRenderKey, getSiteDescription, getSiteName } from "../lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const { settings, socialLinks, featuredProducts, newestProducts, homepageSections } = await getHomePageData();
  const currencySymbol = settings.site_currency_symbol || "₹";
  const siteName = getSiteName(settings);
  const instagramLink = socialLinks.find((link) => link.platform.toLowerCase() === "instagram");
  const instagramUrl = instagramLink?.url || "https://www.instagram.com/littledivinity_official/";
  const instagramLabel = instagramLink?.handle
    ? (instagramLink.handle.startsWith("@") ? instagramLink.handle : `@${instagramLink.handle}`)
    : "@littledivinity_official";
  const sectionMap = new Map(homepageSections.map((section) => [section.section_key, section]));

  const heroPromos = [
    {
      title: "Wall Decor Collection",
      subtitle: "Designed for thoughtful spaces",
      show_text: true,
      image: referenceAssets.hero.wallDecor,
      href: "/shop?category=wall-decor"
    },
    {
      title: "Stonework Collection",
      subtitle: "Timeless pieces for every space",
      show_text: true,
      image: referenceAssets.hero.stonework,
      href: "/shop?category=home-decor"
    }
  ];

  const heroSlides = [
    {
      alt: "Mother's Day gifting collection",
      title: "Mother's Day Collection",
      image: referenceAssets.hero.primary
    },
    {
      alt: "Brass English watch collection",
      title: "Brass English Watch",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_2/screen.png"
    },
    {
      alt: "Sacred incense decor",
      title: "Ritual Essentials",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_2/screen.png"
    },
    {
      alt: "Buddha collection",
      title: "Buddha Collection",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_your_paragraph_text_2025_10_2/screen.png"
    },
    {
      alt: "Wooden collection",
      title: "Wooden Collection",
      image: "/reference-assets/image_from_https_theadvitya.com_cdn_shop_files_whatsapp_image_2026_02_20_at_3/screen.png"
    }
  ];

  const heroSection = sectionMap.get("hero");
  const bestSellerSection = sectionMap.get("best-sellers");
  const newArrivalsSection = sectionMap.get("new-arrivals");
  const newArrivalsProductsSection = sectionMap.get("new-arrivals-products");
  const fullHomepageSection = sectionMap.get("full-homepage");
  const hasAdminHomepageSections = homepageSections.length > 0;
  const homepageContent = resolveFullHomepageContent((fullHomepageSection?.config as Record<string, unknown> | null) || null);

  const heroConfig = (heroSection?.config as {
    slider_settings?: { show_text?: boolean; show_dots?: boolean; show_arrows?: boolean; autoplay_ms?: number; nav_gap?: number };
    slides?: Array<{ title?: string; image?: string; alt?: string; href?: string; is_active?: boolean }>;
    promos?: Array<{ title?: string; subtitle?: string; image?: string; href?: string; show_text?: boolean; is_active?: boolean }>;
    secondary_button_text?: string;
    secondary_button_url?: string;
  } | null) || { slides: [], promos: [] };

  const heroHeadline = heroSection?.heading || "Sacred Craft. Pure Brass. Pan-India Delivery.";
  const heroDescription =
    heroSection?.content || "Handcrafted god idols, home decor & festive gifting — trusted by 45,000+ customers across India.";
  const heroPrimaryButtonText = heroSection?.button_text || "Shop the Collection →";
  const heroPrimaryButtonUrl = heroSection?.button_url || "/shop";
  const heroSecondaryButtonText = heroConfig.secondary_button_text || "Explore Gifting Picks";
  const heroSecondaryButtonUrl = heroConfig.secondary_button_url || "/shop?category=gifting-edit";

  const resolvedHeroSlides =
    heroConfig.slides?.filter((slide) => slide.image && slide.is_active !== false).map((slide, index) => ({
      alt: slide.alt || slide.title || `Hero slide ${index + 1}`,
      title: slide.title,
      href: slide.href,
      image: resolveAssetUrl(slide.image || "")
    })) || [];

  const resolvedHeroPromos =
    heroConfig.promos?.filter((promo) => promo.image && promo.is_active !== false).map((promo) => ({
      title: promo.title || "",
      subtitle: promo.subtitle || "",
      show_text: promo.show_text !== false,
      image: resolveAssetUrl(promo.image || ""),
      href: promo.href || "/shop"
    })) || [];

  const finalHeroSlides = resolvedHeroSlides.length
    ? resolvedHeroSlides
    : heroSlides.map((slide) => ({ ...slide, image: resolveAssetUrl(slide.image) }));
  const finalHeroPromos = resolvedHeroPromos.length
    ? resolvedHeroPromos
    : heroPromos.map((promo) => ({ ...promo, image: resolveAssetUrl(promo.image) }));
  const isHeroEnabled = heroSection?.is_active !== false;
  const showBestSellersSection = hasAdminHomepageSections ? Boolean(bestSellerSection) : true;
  const showNewArrivalsPromoSection = hasAdminHomepageSections ? Boolean(newArrivalsSection) : true;
  const showNewArrivalsProductsSection = hasAdminHomepageSections ? Boolean(newArrivalsProductsSection) : true;

  const twinPromos = [
    {
      title: "Serving Boxes & Trays",
      image: referenceAssets.founderAndBrand.weddingGift,
      href: "/shop?category=home-kitchen"
    },
    {
      title: "Wooden Collection",
      image: referenceAssets.founderAndBrand.woodenDecor,
      href: "/shop?category=wooden-collection"
    }
  ];

  const finalNewArrivalPromos = [
    {
      title: (newArrivalsSection?.config as { left_title?: string } | null)?.left_title || twinPromos[0].title,
      image: resolveAssetUrl(newArrivalsSection?.image_url || twinPromos[0].image),
      href: (newArrivalsSection?.config as { left_href?: string } | null)?.left_href || twinPromos[0].href
    },
    {
      title: (newArrivalsSection?.config as { right_title?: string } | null)?.right_title || twinPromos[1].title,
      image: resolveAssetUrl(newArrivalsSection?.side_image_url || twinPromos[1].image),
      href: (newArrivalsSection?.config as { right_href?: string } | null)?.right_href || twinPromos[1].href
    }
  ];

  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteName,
    description: getSiteDescription(settings),
    url: getCanonicalUrl("/", settings),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: featuredProducts.slice(0, 8).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(getProductPath(product), settings),
        name: product.name
      }))
    }
  };

  return (
    <main>
      <StructuredData data={homePageJsonLd} />
      {isHeroEnabled ? (
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-primary-stack">
              <div className="hero-visual">
                <HeroSlider
                  slides={finalHeroSlides}
                  autoplayMs={heroConfig.slider_settings?.autoplay_ms || 3500}
                  navGap={heroConfig.slider_settings?.nav_gap || 34}
                  showArrows={heroConfig.slider_settings?.show_arrows !== false}
                  showDots={heroConfig.slider_settings?.show_dots === true}
                  showText={heroConfig.slider_settings?.show_text !== false}
                />
                <div className="hero-cta-overlay">
                  <h1 className="hero-cta-headline">{heroHeadline}</h1>
                  <p className="hero-cta-sub">{heroDescription}</p>
                  <div className="hero-cta-actions">
                    <Link href={heroPrimaryButtonUrl} className="primary-button">{heroPrimaryButtonText}</Link>
                    <Link href={heroSecondaryButtonUrl} className="secondary-button">{heroSecondaryButtonText}</Link>
                  </div>
                </div>
              </div>

              <div className="hero-cta-mobile" aria-label="Hero call to action">
                <h1 className="hero-cta-headline">{heroHeadline}</h1>
                <p className="hero-cta-sub">{heroDescription}</p>
                <div className="hero-cta-actions">
                  <Link href={heroPrimaryButtonUrl} className="primary-button">{heroPrimaryButtonText}</Link>
                  <Link href={heroSecondaryButtonUrl} className="secondary-button">{heroSecondaryButtonText}</Link>
                </div>
              </div>
            </div>

            <div className="hero-promo-stack">
              {finalHeroPromos.map((promo) => (
                <Link key={promo.title} href={promo.href} className="hero-promo-card">
                  <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 900px) 100vw, 30vw" />
                  {promo.show_text !== false ? (
                    <div className="hero-promo-copy">
                      <small>{promo.subtitle}</small>
                      <strong>{promo.title}</strong>
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {homepageContent.collections.is_active ? (
      <section className="content-section" id="collections">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{homepageContent.collections.eyebrow}</p>
              <h2>{homepageContent.collections.title}</h2>
            </div>
            <Link href={homepageContent.collections.button_url} className="text-link">
              {homepageContent.collections.button_text}
            </Link>
          </div>

          <div className="category-grid">
            {homepageContent.collections.items.map((collection) => (
              <Link key={collection.title} href={collection.href} className="category-card">
                <Image src={resolveAssetUrl(collection.image)} alt={collection.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
                <div>
                  <small>{collection.subtitle}</small>
                  <strong>{collection.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.occasions.is_active ? (
      <section className="content-section circle-category-section mobile-home-hidden">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">{homepageContent.occasions.eyebrow}</p>
              <h2>{homepageContent.occasions.title}</h2>
            </div>
          </div>

          <div className="circle-category-grid">
            {homepageContent.occasions.items.map((category) => (
              <Link key={category.title} href={category.href} className="circle-category-card">
                <span className="circle-category-image">
                  <Image src={resolveAssetUrl(category.image)} alt={category.title} fill sizes="(max-width: 768px) 40vw, 16vw" />
                </span>
                <strong>{category.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.editorial_picks.is_active ? (
      <section className="content-section soft-section mobile-home-hidden">
        <div className="container story-grid">
          {homepageContent.editorial_picks.items.map((item, index) => (
            <Link key={item.title} href={item.href} className={`story-card story-card-${index}`}>
              <Image src={resolveAssetUrl(item.image)} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="story-overlay" />
              <div className="story-copy">
                <small>{item.badge || "Editorial Pick"}</small>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      ) : null}

      {showBestSellersSection ? (
      <section className="content-section" id="bestsellers">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{bestSellerSection?.subtitle || "Best Sellers"}</p>
              <h2>{bestSellerSection?.title || "Most Loved Across The Storefront"}</h2>
            </div>
            <Link href={bestSellerSection?.button_url || "/shop"} className="text-link">
              {bestSellerSection?.button_text || "Shop all"}
            </Link>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={getProductRenderKey(product)} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.about_brand.is_active ? (
      <section className="content-section white-section mobile-home-hidden">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{homepageContent.about_brand.eyebrow}</p>
              <h2>{homepageContent.about_brand.title}</h2>
            </div>
          </div>

          <div className="about-brand-grid">
            <div className="about-brand-image">
              <Image src={resolveAssetUrl(homepageContent.about_brand.image)} alt="About the brand" width={1200} height={900} sizes="(max-width: 900px) 100vw, 45vw" />
            </div>
            <div className="about-brand-copy">
              <p>{homepageContent.about_brand.paragraph_one}</p>
              <p>{homepageContent.about_brand.paragraph_two}</p>
              <Link href={homepageContent.about_brand.button_url} className="text-link">
                {homepageContent.about_brand.button_text}
              </Link>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.founders.is_active ? (
      <section className="content-section artisan-section mobile-home-hidden">
        <div className="container artisan-grid">
          <div className="artisan-copy">
            <p className="eyebrow">{homepageContent.founders.eyebrow}</p>
            <h2>{homepageContent.founders.title}</h2>
            <p className="hero-text">{homepageContent.founders.content}</p>
            <Link href={homepageContent.founders.button_url} className="primary-button">
              {homepageContent.founders.button_text}
            </Link>
          </div>
          <div className="artisan-stack">
            <Image src={resolveAssetUrl(homepageContent.founders.main_image)} alt="Artisans" className="artisan-main" width={900} height={1100} sizes="(max-width: 900px) 100vw, 40vw" />
            <Image src={resolveAssetUrl(homepageContent.founders.side_image)} alt="Founder" className="artisan-side" width={900} height={1100} sizes="(max-width: 900px) 100vw, 20vw" />
          </div>
        </div>
      </section>
      ) : null}

      {showNewArrivalsPromoSection ? (
      <section className="content-section white-section new-arrivals-showcase mobile-home-hidden">
        <div className="container new-arrivals-showcase-shell">
          <div className="section-head new-arrivals-heading">
            <div>
              <p className="eyebrow">{newArrivalsSection?.subtitle || "New Arrivals"}</p>
              <h2>{newArrivalsSection?.title || "Fresh Pieces Worth A First Look"}</h2>
            </div>
          </div>

          <div className="twin-promo-grid new-arrivals-grid">
            {finalNewArrivalPromos.map((promo) => (
              <Link key={promo.title} href={promo.href} className="twin-promo-card">
                <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 900px) 100vw, 50vw" />
                <div className="twin-promo-copy">
                  <small>Curated Promotion</small>
                  <strong>{promo.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {showNewArrivalsProductsSection ? (
      <section className="content-section new-arrivals-products mobile-home-hidden">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{newArrivalsProductsSection?.subtitle || "New Arrivals"}</p>
              <h2>{newArrivalsProductsSection?.title || "Latest From The Craft Table"}</h2>
            </div>
            <Link href={newArrivalsProductsSection?.button_url || "/shop"} className="text-link">
              {newArrivalsProductsSection?.button_text || "Explore all"}
            </Link>
          </div>
          <div className="product-grid">
            {newestProducts.map((product) => (
              <ProductCard key={getProductRenderKey(product)} product={product} currencySymbol={currencySymbol} />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.testimonials.is_active ? (
      <section className="content-section white-section mobile-home-hidden">
        <div className="container">
          <div className="section-head section-head-center">
            <div>
              <p className="eyebrow">{homepageContent.testimonials.eyebrow}</p>
              <h2>{homepageContent.testimonials.title}</h2>
            </div>
          </div>

          <div className="testimonial-grid">
            {homepageContent.testimonials.items.map((testimonial) => (
              <article key={testimonial.author} className="testimonial-card">
                <span className="testimonial-stars">{testimonial.stars}</span>
                <h3>{testimonial.title}</h3>
                <p>{testimonial.quote}</p>
                <strong>{testimonial.author}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* Premium Homepage Lead Opt-in Banner */}
      {homepageContent.newsletter.is_active ? (
      <div className="mobile-home-hidden">
        <HomepageNewsletter
          eyebrow={homepageContent.newsletter.eyebrow}
          title={homepageContent.newsletter.title}
          description={homepageContent.newsletter.description}
          buttonText={homepageContent.newsletter.button_text}
          placeholder={homepageContent.newsletter.placeholder}
          footnote={homepageContent.newsletter.footnote}
        />
      </div>
      ) : null}

      {homepageContent.instagram.is_active ? (
      <section className="content-section instagram-section mobile-home-hidden">
        <div className="container">
          <div className="section-head section-head-center instagram-head">
            <div>
              <p className="eyebrow">{homepageContent.instagram.eyebrow}</p>
              <h2>{homepageContent.instagram.title}</h2>
            </div>
            <a href={homepageContent.instagram.profile_url || instagramUrl} target="_blank" rel="noopener noreferrer" className="text-link">{homepageContent.instagram.profile_label || instagramLabel}</a>
          </div>

          <div className="instagram-grid">
            {homepageContent.instagram.tiles.map((tile, index) => (
              <a key={`${tile.image}-${index}`} href={homepageContent.instagram.profile_url || instagramUrl} target="_blank" rel="noopener noreferrer" className="instagram-tile" aria-label={`View on Instagram — post ${index + 1}`}>
                <Image
                  src={resolveAssetUrl(tile.image)}
                  alt={tile.alt || `Handcrafted product ${index + 1}`}
                  width={700}
                  height={700}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              </a>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {homepageContent.festive_edits.is_active ? (
      <section className="content-section mobile-home-hidden">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{homepageContent.festive_edits.eyebrow}</p>
              <h2>{homepageContent.festive_edits.title}</h2>
            </div>
            <Link href={homepageContent.festive_edits.button_url} className="text-link">{homepageContent.festive_edits.button_text}</Link>
          </div>

          <div className="occasion-grid">
            {homepageContent.festive_edits.items.map((moment) => (
              <Link key={moment.title} href={moment.href} className="occasion-card">
                <Image src={resolveAssetUrl(moment.image)} alt={moment.title} width={700} height={700} sizes="(max-width: 768px) 100vw, 25vw" />
                <div>
                  <small>{moment.badge || "Curated Edit"}</small>
                  <strong>{moment.title}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}
    </main>
  );
}
