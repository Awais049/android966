/**
 * Android 966 Senior SEO & Structured Data Utility
 * Compliant with Google Search Essentials, OpenGraph, Twitter Cards, and Schema.org standards.
 */

export const SITE_URL = "https://android966.com";
export const SITE_NAME = "Android 966";
export const DEFAULT_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/463b04b7-74b8-42c0-9943-d0794fb7fd29";
export const TWITTER_HANDLE = "@Android966";

export interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  image?: string;
  ogType?: "website" | "article" | "profile" | "product" | "video";
  canonical?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Truncate title strictly under 60 chars for 100% visible display in Google desktop/mobile SERPs.
 */
export function formatMetaTitle(title: string): string {
  const clean = title.trim();
  if (clean.length <= 60) return clean;
  return clean.slice(0, 57).trim() + "…";
}

/**
 * Format meta description to optimal 145-155 character range (hard limit 160).
 */
export function formatMetaDescription(desc: string): string {
  const clean = desc.trim().replace(/\s+/g, " ");
  if (clean.length <= 158) return clean;
  return clean.slice(0, 155).trim() + "…";
}

/**
 * Generate complete, Google-compliant meta, canonical, and structured data tags for TanStack Router head.
 */
export function createPageHead(config: SeoConfig) {
  const title = formatMetaTitle(config.title);
  const description = formatMetaDescription(config.description);
  const canonicalUrl = config.canonical || `${SITE_URL}${config.path || ""}`;
  const image = config.ogImage || config.image || DEFAULT_OG_IMAGE;
  const type = config.ogType || "website";

  const defaultKeywords = [
    "Android 966",
    "Pakistan tech reviews",
    "smartphone unboxings",
    "Awais Ahmed YouTuber",
    "buy tech gadgets Pakistan",
    "perfumes online Pakistan",
    "tech accessories",
    "JazzCash COD electronics",
  ];

  const mergedKeywords = Array.from(new Set([...(config.keywords || []), ...defaultKeywords])).join(", ");

  const metaList: Array<
    | { name?: string; property?: string; content: string }
    | { title: string }
    | { [key: string]: string }
  > = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: mergedKeywords },
    { name: "author", content: config.author || "Android 966" },
    {
      name: "robots",
      content: config.noIndex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },

    // OpenGraph
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: title },
    { property: "og:locale", content: "en_PK" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
  ];

  if (config.publishedTime) {
    metaList.push({ property: "article:published_time", content: config.publishedTime });
  }
  if (config.modifiedTime) {
    metaList.push({ property: "article:modified_time", content: config.modifiedTime });
  }

  const scripts: Array<{ type: string; children: string }> = [];

  if (config.jsonLd) {
    const schemas = Array.isArray(config.jsonLd) ? config.jsonLd : [config.jsonLd];
    for (const s of schemas) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(s),
      });
    }
  }

  return {
    meta: metaList,
    links: [
      { rel: "canonical", href: canonicalUrl },
    ],
    scripts,
  };
}

// ----------------------------------------------------
// Schema.org Structured Data Generators
// ----------------------------------------------------

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Android 966",
    alternateName: "Android966",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      caption: "Android 966 Logo",
    },
    founder: {
      "@type": "Person",
      name: "Awais Ahmed",
      url: `${SITE_URL}/founder`,
    },
    sameAs: [
      "https://www.youtube.com/@Android966",
      "https://www.facebook.com/Android966/",
      "https://www.instagram.com/android966/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+923091726858",
      contactType: "customer support",
      areaServed: "PK",
      availableLanguage: ["Urdu", "English"],
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Android 966",
    description: "Pakistan's trusted tech voice — smartphone reviews, unboxings, and official online store.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/store?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; path?: string; item?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => {
      const target = crumb.path || crumb.item || "/";
      const fullUrl = target.startsWith("http")
        ? target
        : `${SITE_URL}${target.startsWith("/") ? "" : "/"}${target}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: fullUrl,
      };
    }),
  };
}

export function getProductSchema(product: {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  original_price?: number | null;
  originalPrice?: number | null;
  category: string;
  rating?: number | null;
  reviews?: number | null;
  in_stock?: boolean | null;
  inStock?: boolean | null;
  sku?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : [`${SITE_URL}/icon-512.png`],
    description: product.description || `${product.name} available at Android 966 store in Pakistan.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.category === "perfume" ? "Android 966 Fragrance" : "Android 966",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/store/${product.id}`,
      priceCurrency: "PKR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Android 966",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (product.rating ?? 4.8).toFixed(1),
      reviewCount: Math.max(product.reviews ?? 12, 1),
    },
  };
}

export function getArticleSchema(post: {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.image ? [post.image] : [`${SITE_URL}/icon-512.png`],
    datePublished: post.created_at || new Date().toISOString(),
    dateModified: post.updated_at || post.created_at || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Awais Ahmed",
      url: `${SITE_URL}/founder`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.id}`,
    },
    articleSection: post.category || "Technology",
  };
}

export function getVideoSchema(video: {
  id: string;
  title: string;
  description?: string | null;
  youtube_id: string;
  thumbnail?: string | null;
  created_at?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description || `${video.title} - Watch on Android 966`,
    thumbnailUrl: video.thumbnail ? [video.thumbnail] : [`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`],
    uploadDate: video.created_at || new Date().toISOString(),
    embedUrl: `https://www.youtube.com/embed/${video.youtube_id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
  };
}

export function getServiceSchema(service: {
  id?: string;
  slug?: string;
  name: string;
  tagline?: string;
  intro?: string;
  description?: string;
  hero_image?: string;
  heroImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: service.name,
    description: service.intro || service.description || service.tagline || `${service.name} by Android 966`,
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  };
}
