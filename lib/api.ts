import { referenceAssets } from "./reference-assets";
import { liveContactDefaults, livePrivacyPolicyHtml, liveRefundPolicyHtml, liveTermsHtml } from "./legal-content";
import { Category, Coupon, HomepageSection, NavigationItem, Product, ProductListResponse, SiteSettings, SocialLink, BlogPost, BlogCategory, BlogTag, BlogAuthor } from "./types";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://ecombeckend.saaszo.in/api/v1";

const BACKEND_SITE_URL =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://ecombeckend.saaszo.in";

const STOREFRONT_FALLBACKS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_STOREFRONT_FALLBACKS === "true" ||
  process.env.NODE_ENV !== "production";

const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const PUBLIC_READ_REVALIDATE_SECONDS = 60;

export const PRODUCT_PLACEHOLDER_IMAGE = "/product-placeholder.svg";

const fallbackSettings: SiteSettings = {
  site_name: "Little Divinity",
  site_tagline: "Handcrafted brass decor, pooja accents, and meaningful gifting pieces.",
  site_currency_symbol: "₹",
  default_shipping_cost: "99",
  min_order_free_shipping: "499",
  site_email: liveContactDefaults.email,
  site_phone: liveContactDefaults.phone,
  address_line1: liveContactDefaults.addressLine1,
  city: liveContactDefaults.city,
  state: liveContactDefaults.state,
  pincode: liveContactDefaults.pincode,
  country: liveContactDefaults.country,
  privacy_policy: livePrivacyPolicyHtml,
  terms_conditions: liveTermsHtml,
  return_policy: liveRefundPolicyHtml,
};

const fallbackHeaderMenu: NavigationItem[] = [
  { id: 20001, title: "Hindu Deities", url: "/shop?category=hindu-dieties", children: [{ id: 21001, title: "Ganesha Idols", url: "/shop?category=hindu-dieties" }, { id: 21002, title: "Krishna Idols", url: "/shop?category=hindu-dieties" }, { id: 21003, title: "Ram Darbar", url: "/shop?category=hindu-dieties" }] },
  { id: 20002, title: "Home Kitchen", url: "/shop?category=home-kitchen", children: [{ id: 22001, title: "Spice Boxes", url: "/shop?category=home-kitchen" }, { id: 22002, title: "Serving Trays", url: "/shop?category=home-kitchen" }, { id: 22003, title: "Utility Decor", url: "/shop?category=home-kitchen" }] },
  { id: 20003, title: "Home Decor", url: "/shop?category=home-decor", children: [{ id: 23001, title: "Wall Decor", url: "/shop?category=home-decor" }, { id: 23002, title: "Table Decor", url: "/shop?category=home-decor" }, { id: 23003, title: "Candle Stands", url: "/shop?category=home-decor" }] },
  { id: 20004, title: "Pooja Decor", url: "/shop?category=pooja-decor", children: [{ id: 24001, title: "Brass Singhasan", url: "/shop?category=pooja-decor" }, { id: 24002, title: "Incense Stand", url: "/shop?category=pooja-decor" }, { id: 24003, title: "Pooja Thali", url: "/shop?category=pooja-decor" }] },
  { id: 20005, title: "Mother's Day collection", url: "/shop?category=mothers-day-collection", children: [{ id: 25001, title: "Gifting Picks", url: "/shop?category=mothers-day-collection" }] },
  { id: 20006, title: "More", url: "/shop", children: [{ id: 26001, title: "New Arrivals", url: "/shop" }, { id: 26002, title: "Festival Categories", url: "/shop" }] }
];

const fallbackFooterMenu: NavigationItem[] = [
  { id: 30001, title: "About Us", url: "/pages/about-us" },
  { id: 30002, title: "Contact", url: "/pages/contact" },
  { id: 30003, title: "Privacy Policy", url: "/pages/privacy-policy" },
  { id: 30004, title: "Terms & Conditions", url: "/pages/terms-conditions" },
  { id: 30005, title: "Refund Policy", url: "/pages/refund-policy" },
  { id: 30006, title: "Shipping Policy", url: "/pages/shipping-policy" },
  { id: 30007, title: "Track Your Order", url: "/track-order" },
  { id: 30008, title: "Warranty & Buyback", url: "/warranty-portal" },
  { id: 30009, title: "Live Auctions", url: "/live-auctions" }
];

const fallbackSocialLinks: SocialLink[] = [
  { id: 40001, platform: "facebook", url: "https://www.facebook.com/uniquebrasscollection" },
  { id: 40002, platform: "instagram", url: "https://www.instagram.com/littledivinity/" },
  { id: 40003, platform: "youtube", url: "https://www.youtube.com/@littledivinity" },
  { id: 40004, platform: "linkedin", url: "https://www.linkedin.com/company/little-divinity/" }
];

const fallbackCategories: Category[] = [
  { id: 1, parent_id: null, name: "God Idols", slug: "god-idols", image: referenceAssets.collections.godIdols },
  { id: 2, parent_id: null, name: "Wall Decor", slug: "wall-decor", image: referenceAssets.hero.wallDecor },
  { id: 3, parent_id: null, name: "Table Decor", slug: "table-decor", image: referenceAssets.productHighlights.frame },
  { id: 4, parent_id: null, name: "Pooja Decor", slug: "pooja-decor", image: referenceAssets.collections.poojaDecor },
  { id: 5, parent_id: null, name: "Home Kitchen", slug: "home-kitchen", image: referenceAssets.collections.homeKitchen },
  { id: 6, parent_id: null, name: "Gifting Edit", slug: "gifting-edit", image: referenceAssets.founderAndBrand.weddingGift }
];

const fallbackProducts: Product[] = [
  {
    id: 101,
    name: "Little Divinity Brass Decor Demo",
    slug: "little-divinity-brass-decor-demo",
    price: 11999,
    sale_price: 7999,
    effective_price: 7999,
    category_name: "Demo Product",
    short_desc: "A real product photo from your local collection so the storefront card can be checked visually.",
    description:
      "This demo product is added only to preview how real Little Divinity photography looks inside the current shop and product page design.",
    images: ["/demo-products/little-divinity-real-1.jpg"]
  },
  {
    id: 1,
    name: "Brass Protection Buddha",
    slug: "brass-protection-buddha",
    price: 14999,
    sale_price: 11499,
    effective_price: 11499,
    category_name: "Best Seller",
    short_desc: "An ornate brass centrepiece created to anchor meditation corners and entry consoles.",
    description:
      "Layered carving, rich antique finish, and a calm seated form make this a statement accent for gifting or everyday styling.",
    images: [referenceAssets.productHighlights.buddha]
  },
  {
    id: 2,
    name: "Vintage Floral Brass Photo Frame",
    slug: "vintage-brass-photo-frame",
    price: 17999,
    sale_price: 8599,
    effective_price: 8599,
    category_name: "Table Decor",
    short_desc: "A warm brass photo frame with floral detailing for sideboards, mandirs, and memory shelves.",
    description:
      "Designed for festive gifting and curated tabletops, this frame blends handcrafted texture with heirloom-inspired styling.",
    images: [referenceAssets.productHighlights.frame]
  },
  {
    id: 3,
    name: "Kalpavriksha Brass Wall Piece",
    slug: "kalpavriksha-brass-wall-piece",
    price: 14999,
    sale_price: 7499,
    effective_price: 7499,
    category_name: "Wall Decor",
    short_desc: "A symbolic wall piece crafted for dramatic living room and foyer styling.",
    description:
      "Its sculptural silhouette and deep finish help create a gallery-like wall story rooted in Indian craft vocabulary.",
    images: [referenceAssets.collections.homeDecor]
  },
  {
    id: 4,
    name: "Brass Yali Singhasan",
    slug: "brass-yali-singhasan",
    price: 9999,
    sale_price: 5999,
    effective_price: 5999,
    category_name: "Pooja Decor",
    short_desc: "A temple-inspired pedestal built to elevate pooja idols and ceremonial styling.",
    description:
      "Detailed yali forms, layered metalwork, and a compact display footprint make it ideal for festive arrangements.",
    images: [referenceAssets.productHighlights.throne]
  },
  {
    id: 5,
    name: "Superfine Shiva Idol",
    slug: "superfine-shiva-idol",
    price: 8999,
    sale_price: 4699,
    effective_price: 4699,
    category_name: "God Idols",
    short_desc: "A premium Shiva idol with denser carving and a display-ready antique brass finish.",
    description:
      "Crafted for sacred corners and statement consoles, this piece brings a stronger festive-storefront presence.",
    images: [referenceAssets.productHighlights.superfineShiva]
  },
  {
    id: 6,
    name: "Peacock Brass Accent",
    slug: "peacock-brass-accent",
    price: 12999,
    sale_price: 7899,
    effective_price: 7899,
    category_name: "Home Decor",
    short_desc: "An ornate peacock sculpture designed for sideboards, foyers, and premium gifting moments.",
    description:
      "The jewel-toned detailing and elevated silhouette give this piece a richer handcrafted decor personality.",
    images: [referenceAssets.productHighlights.peacock]
  },
  {
    id: 7,
    name: "Brass Candle Stand Pair",
    slug: "brass-candle-stand-pair",
    price: 9999,
    sale_price: 6299,
    effective_price: 6299,
    category_name: "Table Decor",
    short_desc: "Tall brass candle stands suited to festive dining tables and layered living-room styling.",
    description:
      "Balanced proportions and carved details make this pair feel giftable, decorative, and occasion-ready.",
    images: [referenceAssets.productHighlights.candleStand]
  },
  {
    id: 8,
    name: "Brass Wall Elephant",
    slug: "brass-wall-elephant",
    price: 7599,
    sale_price: 4899,
    effective_price: 4899,
    category_name: "Wall Decor",
    short_desc: "A dramatic elephant wall accent for gallery walls, entryways, and conversation corners.",
    description:
      "Its carved texture and sculptural profile create a denser wall story without feeling overpowering.",
    images: [referenceAssets.hero.wallDecor]
  },
  {
    id: 9,
    name: "Wooden Spice Box",
    slug: "wooden-spice-box",
    price: 5999,
    sale_price: 3499,
    effective_price: 3499,
    category_name: "Home Kitchen",
    short_desc: "A handcrafted wooden masala box that blends utility with gifting-led styling.",
    description:
      "Built for warm kitchens and heritage-inspired tabletops, it adds texture, function, and retail appeal.",
    images: [referenceAssets.collections.homeKitchen]
  },
  {
    id: 10,
    name: "Brass Pooja Thali Set",
    slug: "brass-pooja-thali-set",
    price: 6999,
    sale_price: 4299,
    effective_price: 4299,
    category_name: "Pooja Decor",
    short_desc: "A coordinated pooja thali set for ceremonies, gifting hampers, and devotional styling.",
    description:
      "The curated set format makes it ideal for festive shopping pages and more complete ritual displays.",
    images: [referenceAssets.collections.poojaDecor]
  },
  {
    id: 11,
    name: "Handcrafted Gift Hamper Accent",
    slug: "handcrafted-gift-hamper-accent",
    price: 8499,
    sale_price: 5799,
    effective_price: 5799,
    category_name: "Gifting Edit",
    short_desc: "A warm handcrafted decor piece selected for festive hampers and premium gifting bundles.",
    description:
      "Made to feel elevated yet versatile, this piece helps the shop grid look fuller and more curated.",
    images: [referenceAssets.founderAndBrand.weddingGift]
  },
  {
    id: 12,
    name: "Wooden Mandir Decor Panel",
    slug: "wooden-mandir-decor-panel",
    price: 10999,
    sale_price: 6999,
    effective_price: 6999,
    category_name: "Wooden Collection",
    short_desc: "A wooden decorative panel with ceremonial warmth for pooja walls and gifting stories.",
    description:
      "The layered handcrafted finish helps balance spiritual styling with a stronger premium decor presence.",
    images: [referenceAssets.founderAndBrand.woodenDecor]
  }
];

function isNextDynamicUsageSignal(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type ReadFetchOptions = {
  noStore?: boolean;
  revalidate?: number;
};

function getReadFetchOptions(revalidate = PUBLIC_READ_REVALIDATE_SECONDS): ReadFetchOptions {
  if (typeof window === "undefined") {
    return { revalidate };
  }

  return { noStore: true };
}

async function fetchJson<T>(path: string, options: ReadFetchOptions = { noStore: true }): Promise<T | null> {
  try {
    const requestOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: {
        Accept: "application/json"
      }
    };

    if (options.noStore) {
      requestOptions.cache = "no-store";
    } else if (typeof options.revalidate === "number") {
      requestOptions.next = { revalidate: options.revalidate };
    }

    const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

    if (!response.ok) {
      if (!IS_PRODUCTION_BUILD) {
        console.error(`Storefront API request failed: ${path} (${response.status})`);
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isNextDynamicUsageSignal(error)) {
      throw error;
    }

    if (!IS_PRODUCTION_BUILD) {
      console.error(`Storefront API request failed: ${path}`, error);
    }
    return null;
  }
}

type PublicSettingsPayload = {
  data?: SiteSettings & {
    header_menu?: NavigationItem[];
    footer_menu?: NavigationItem[];
    mobile_menu?: NavigationItem[];
    social_links?: SocialLink[];
  };
};

type PublicCouponsPayload = {
  data?: Coupon[];
};

export function resolveAssetUrl(path?: string | null): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_SITE_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${BACKEND_SITE_URL}/${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${BACKEND_SITE_URL}/${path.replace(/^\/+/, "")}`;
}

export function containsHtmlMarkup(value?: string | null): boolean {
  return Boolean(value && /<[^>]+>/.test(value));
}

export function stripHtmlContent(value?: string | null): string {
  if (!value) {
    return "";
  }

  const withoutTags = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseProductImages(images?: Product["images"]): string[] {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string" && images.trim() !== "") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [images];
    }
  }

  return [];
}

export function parseBulletPoints(bullets?: Product["bullet_points"]): string[] {
  let list: string[] = [];

  if (Array.isArray(bullets)) {
    list = bullets.map(String).filter(Boolean);
  } else if (typeof bullets === "string" && bullets.trim() !== "") {
    const trimmed = bullets.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          list = parsed.map(String).filter(Boolean);
        }
      } catch {
        // Not valid JSON array, fallback to newline split
        list = trimmed.split(/\r?\n/).filter(Boolean);
      }
    } else {
      // Split by newlines or list tags
      list = trimmed.split(/\r?\n/).filter(Boolean);
    }
  }

  const sanitizeBulletPoint = (item: string): string =>
    item
      .replace(/^[\s\-*•▪◦‣►✅☑️✔]+/u, "")
      .replace(/\s+/g, " ")
      .trim();

  // Clean, limit characters to 150, and slice to max 10 bullet points
  return list
    .map((item) => sanitizeBulletPoint(item))
    .filter((item) => item.length > 0)
    .filter((item) => item.toLowerCase() !== "about this item")
    .map((item) => item.slice(0, 150))
    .slice(0, 10);
}

export function extractDescriptionBulletPoints(description?: string | null): string[] {
  const plainDescription = stripHtmlContent(description);

  if (!plainDescription) {
    return [];
  }

  const lines = plainDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLikeLines = lines.filter((line) => /^[\s\-*•▪◦‣►✅☑️✔]/u.test(line));

  if (bulletLikeLines.length === 0) {
    return [];
  }

  return parseBulletPoints(lines.join("\n"));
}

export function getPrimaryImage(product: Product): string {
  const [firstImage] = parseProductImages(product.images);
  return firstImage ? resolveAssetUrl(firstImage) : PRODUCT_PLACEHOLDER_IMAGE;
}

export function isProductSellable(product: Product): boolean {
  return product.is_sellable !== false;
}

export function formatPrice(value: number | string | null | undefined, symbol = "Rs."): string {
  const amount = Number(value ?? 0);
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function discountPercent(product: Product): number | null {
  const price = Number(product.price ?? 0);
  const salePrice = Number(product.sale_price ?? 0);

  if (price <= 0 || salePrice <= 0 || salePrice >= price) {
    return null;
  }

  return Math.round(((price - salePrice) / price) * 100);
}

export async function getSettings(): Promise<SiteSettings> {
  const payload = await fetchJson<PublicSettingsPayload>("/settings/public", getReadFetchOptions());
  if (payload?.data && Object.keys(payload.data).length > 0) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED ? fallbackSettings : {};
}

export async function getLayoutData() {
  const [settingsPayload, categories] = await Promise.all([
    fetchJson<PublicSettingsPayload>("/settings/public", getReadFetchOptions()),
    getCategories(8, getReadFetchOptions())
  ]);

  const data = settingsPayload?.data || {};

  return {
    settings: Object.keys(data).length > 0
      ? (data as SiteSettings)
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackSettings : {}),
    categories,
    headerMenu: data.header_menu?.length
      ? data.header_menu
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackHeaderMenu : []),
    mobileMenu: data.mobile_menu?.length
      ? data.mobile_menu
      : (data.header_menu?.length
        ? data.header_menu
        : (STOREFRONT_FALLBACKS_ENABLED ? fallbackHeaderMenu : [])),
    footerMenu: data.footer_menu?.length
      ? data.footer_menu
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackFooterMenu : []),
    socialLinks: data.social_links?.length
      ? data.social_links
      : (STOREFRONT_FALLBACKS_ENABLED ? fallbackSocialLinks : [])
  };
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const payload = await fetchJson<{ data?: HomepageSection[] }>("/settings/homepage-sections", getReadFetchOptions());
  return payload?.data?.length ? payload.data : [];
}

export async function getCategories(limit = 8, fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<Category[]> {
  const payload = await fetchJson<{ data?: Category[] }>(`/catalog/categories?limit=${limit}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED ? fallbackCategories.slice(0, limit) : [];
}

export async function getProducts(query = "", fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<ProductListResponse> {
  const payload = await fetchJson<{ data?: ProductListResponse }>(`/catalog/products${query ? `?${query}` : ""}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  if (!STOREFRONT_FALLBACKS_ENABLED) {
    return {
      items: [],
      pagination: {
        current_page: 1,
        per_page: 0,
        total: 0,
        last_page: 1
      }
    };
  }

  return {
    items: fallbackProducts,
    pagination: {
      current_page: 1,
      per_page: fallbackProducts.length,
      total: fallbackProducts.length,
      last_page: 1
    }
  };
}

export async function getProduct(slug: string, fetchOptions: ReadFetchOptions = getReadFetchOptions()): Promise<Product | null> {
  const payload = await fetchJson<{ data?: Product }>(`/catalog/products/${slug}`, fetchOptions);
  if (payload?.data) {
    return payload.data;
  }

  return STOREFRONT_FALLBACKS_ENABLED
    ? fallbackProducts.find((product) => product.slug === slug) || null
    : null;
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  const payload = await fetchJson<PublicCouponsPayload>("/marketing/coupons", getReadFetchOptions());
  return payload?.data?.length ? payload.data : [];
}

async function resolveProductRail(
  section: HomepageSection | undefined,
  fallbackQuery: string,
  fetchOptions: ReadFetchOptions = getReadFetchOptions()
): Promise<Product[]> {
  if (!section) {
    return (await getProducts(fallbackQuery, fetchOptions)).items;
  }

  const config = (section.config as {
    source_type?: "featured" | "newest" | "manual" | "category";
    product_count?: number;
    product_ids?: number[];
    category_slug?: string | null;
  } | null) || { source_type: "featured", product_count: 8, product_ids: [] };

  const count = Math.min(Math.max(Number(config.product_count || 8), 1), 24);

  if (config.source_type === "manual" && config.product_ids?.length) {
    return (await getProducts(`ids=${config.product_ids.join(",")}&per_page=${count}`, fetchOptions)).items.slice(0, count);
  }

  if (config.source_type === "category" && config.category_slug) {
    return (await getProducts(`category=${encodeURIComponent(config.category_slug)}&per_page=${count}&sort=newest`, fetchOptions)).items.slice(0, count);
  }

  if (config.source_type === "newest") {
    return (await getProducts(`per_page=${count}&sort=newest`, fetchOptions)).items.slice(0, count);
  }

  return (await getProducts(`featured=1&per_page=${count}&sort=popular`, fetchOptions)).items.slice(0, count);
}

export async function getHomePageData() {
  const fetchOptions = getReadFetchOptions();
  const [layoutData, homepageSections] = await Promise.all([
    getLayoutData(),
    getHomepageSections()
  ]);

  const { settings, categories, socialLinks } = layoutData;

  const sectionMap = new Map(homepageSections.map((section) => [section.section_key, section]));
  const [featuredProducts, newestProducts] = await Promise.all([
    resolveProductRail(sectionMap.get("best-sellers"), "featured=1&per_page=8&sort=popular", fetchOptions),
    resolveProductRail(sectionMap.get("new-arrivals-products"), "per_page=4&sort=newest", fetchOptions),
  ]);

  return {
    settings,
    categories,
    socialLinks,
    featuredProducts,
    newestProducts,
    homepageSections
  };
}

export interface PlaceOrderInput {
  ship_name: string;
  ship_email: string;
  ship_phone: string;
  ship_alt_phone?: string;
  ship_address: string;
  save_address?: boolean;
  address_type?: "home" | "office" | "other";
  address_label?: string;
  address_line1?: string;
  address_line2?: string;
  address_landmark?: string;
  address_is_default?: boolean;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  payment_method: "cod" | "razorpay" | "phonepe";
  payment_id?: string;
  coupon_code?: string;
  notes?: string;
  items: Array<{
    product_id: number;
    variant_id?: number | null;
    quantity: number;
  }>;
}

export async function placeOrder(data: PlaceOrderInput, token?: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    ship_name: string;
    ship_email: string;
    ship_phone: string;
    ship_alt_phone?: string | null;
    estimated_delivery: string;
    customer_auth?: {
      token: string;
      token_type: string;
      expires_at?: string | null;
      user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
        email_verified_at?: string | null;
        role?: string;
      };
    } | null;
    gateway_config?: {
      public_key: string | null;
      merchant_id: string | null;
      is_test_mode: boolean;
      provider_order_id: string | null;
      pending_access_token?: string | null;
      checkout_url?: string | null;
    } | null;
  };
}> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Something went wrong while placing order.")
    };
  }
}

export async function verifyPayment(
  data: {
    order_number: string;
    payment_method: "razorpay" | "phonepe";
    access_token?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    transaction_id?: string;
    provider_reference_id?: string;
  },
  token?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout/verify-payment`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to verify payment.")
    };
  }
}

export async function cancelOrder(orderNumber: string, token?: string, accessToken?: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/checkout/cancel-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ order_number: orderNumber, access_token: accessToken }),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to cancel order.")
    };
  }
}

export async function trackOrder(orderNumber: string, contact: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    order_number: string;
    status: string;
    ship_name: string;
    ship_city: string;
    ship_state: string;
    created_at: string;
    tracking_number: string | null;
    tracking_url: string | null;
    payment_method: string;
    payment_status: string;
    total_amount: number;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      image: string | null;
      size: string | null;
      color: string | null;
      variant_details: string | null;
    }>;
    tracking_milestones: Array<{
      id: number;
      status: string;
      location: string | null;
      message: string | null;
      created_at: string;
    }>;
  };
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders/track?number=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(contact)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store"
      }
    );

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Something went wrong while fetching tracking information.")
    };
  }
}

export async function getCustomerOrders(token: string): Promise<{
  success: boolean;
  message: string;
  data?: Array<{
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    ship_name: string;
    created_at: string;
    items_count: number;
    first_item_image: string | null;
    first_item_name: string | null;
  }>;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve order history.")
    };
  }
}

export async function getCustomerOrderDetail(token: string, orderNumber: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    payment_id: string | null;
    ship_name: string;
    ship_email: string;
    ship_phone: string;
    ship_alt_phone?: string | null;
    ship_address: string;
    ship_city: string;
    ship_state: string;
    ship_pincode: string;
    notes: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    created_at: string;
    items: Array<{
      id: number;
      product_id: number;
      variant_id: number | null;
      name: string;
      price: number;
      quantity: number;
      image: string | null;
      size: string | null;
      color: string | null;
      variant_details: string | null;
      line_total: number;
      sku: string | null;
    }>;
    tracking: Array<{
      id: number;
      status: string;
      location: string | null;
      message: string | null;
      created_at: string;
    }>;
    returns: Array<{
      id: number;
      return_number: string;
      status: string;
      reason: string;
      requested_amount: number;
      approved_amount: number;
      requested_at: string | null;
      resolved_at: string | null;
    }>;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders/${orderNumber}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve order details.")
    };
  }
}

export async function requestCustomerOrderReturn(
  token: string,
  orderNumber: string,
  data: {
    reason: string;
    customer_notes?: string;
    items: Array<{
      product_id: number;
      variant_id?: number | null;
      quantity: number;
    }>;
    images?: string[];
  }
): Promise<{
  success: boolean;
  message: string;
  data?: {
    return_number: string;
    status: string;
  };
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/orders/${orderNumber}/returns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
      cache: "no-store"
    });

    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not submit the return request.")
    };
  }
}

export async function getBlogPosts(params: {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  page?: number;
  per_page?: number;
} = {}): Promise<{
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: BlogPost[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}> {
  try {
    const url = new URL(`${API_BASE_URL}/blog/posts`);
    if (params.category) url.searchParams.append("category", params.category);
    if (params.tag) url.searchParams.append("tag", params.tag);
    if (params.author) url.searchParams.append("author", params.author);
    if (params.search) url.searchParams.append("search", params.search);
    if (params.page) url.searchParams.append("page", String(params.page));
    if (params.per_page) url.searchParams.append("per_page", String(params.per_page));

    const response = await fetch(url.toString(), {
      cache: "no-store", // Keep it fresh, or revalidate in background
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog posts."),
      data: {
        current_page: 1,
        data: [],
        first_page_url: "",
        from: 0,
        last_page: 1,
        last_page_url: "",
        next_page_url: null,
        path: "",
        per_page: 9,
        prev_page_url: null,
        to: 0,
        total: 0,
      },
    };
  }
}

export async function getBlogPost(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogPost | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog post details."),
      data: null,
    };
  }
}

export async function getBlogCategories(): Promise<{
  success: boolean;
  message: string;
  data: BlogCategory[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/categories`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog categories."),
      data: [],
    };
  }
}

export async function getBlogTags(): Promise<{
  success: boolean;
  message: string;
  data: BlogTag[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/tags`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog tags."),
      data: [],
    };
  }
}

export async function getBlogTag(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogTag | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/tags/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog tag details."),
      data: null,
    };
  }
}

export async function getBlogAuthors(): Promise<{
  success: boolean;
  message: string;
  data: BlogAuthor[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/authors`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog authors."),
      data: [],
    };
  }
}

export async function getBlogCategory(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogCategory | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/categories/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog category details."),
      data: null,
    };
  }
}

export async function getBlogAuthor(slug: string): Promise<{
  success: boolean;
  message: string;
  data: BlogAuthor | null;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/authors/${slug}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Could not retrieve blog author details."),
      data: null,
    };
  }
}

export async function subscribeNewsletter(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Something went wrong. Please try again later."),
    };
  }
}
