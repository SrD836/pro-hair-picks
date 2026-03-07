const BRAND = "Guía del Salón";
const MAX_CHARS = 60;                    // total <title> length limit
const SUFFIX = ` | ${BRAND}`;           // 17 chars
const MAX_RAW = MAX_CHARS - SUFFIX.length; // 43 chars max for the raw title part
const SITE_URL = "https://guiadelsalon.com";
const OG_DEFAULT = `${SITE_URL}/og-default.jpg`;
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Builds a page title guaranteed to be ≤ MAX_CHARS (60) total.
 * Priority: rawTitle as-is → keyword-based "Top X 2026" → truncated rawTitle.
 * Guard: if rawTitle already contains the brand suffix, clamp and return without re-adding.
 */
export function buildPageTitle(rawTitle: string, keyword?: string): string {
  // Guard: already branded — clamp total to MAX_CHARS and return as-is
  if (rawTitle.includes(SUFFIX)) {
    if (rawTitle.length <= MAX_CHARS) return rawTitle;
    const sepIdx = rawTitle.lastIndexOf(SUFFIX);
    const raw = rawTitle.slice(0, sepIdx);
    const clamped = raw.slice(0, MAX_RAW - 1).replace(/\s+\S*$/, "") || raw.slice(0, MAX_RAW - 1);
    return `${clamped}…${SUFFIX}`;
  }

  if (rawTitle.length <= MAX_RAW) {
    return `${rawTitle}${SUFFIX}`;
  }

  if (keyword && keyword.trim().length > 0) {
    const seoTitle = `Top ${keyword.trim()} 2026`;
    if (seoTitle.length <= MAX_RAW) {
      return `${seoTitle}${SUFFIX}`;
    }
    const maxKeywordLen = MAX_RAW - "Top  2026".length;
    const truncatedKeyword = keyword.trim().slice(0, maxKeywordLen);
    return `Top ${truncatedKeyword} 2026${SUFFIX}`;
  }

  // Truncate at word boundary: MAX_RAW - 1 to leave room for the ellipsis (1c)
  const truncated = rawTitle.slice(0, MAX_RAW - 1).replace(/\s+\S*$/, "") || rawTitle.slice(0, MAX_RAW - 1);
  return `${truncated}…${SUFFIX}`;
}

// ── Schema markup builders ────────────────────────────────────────────────────

const PUBLISHER = {
  "@type": "Organization",
  name: BRAND,
  logo: { "@type": "ImageObject", url: LOGO_URL },
};

/** Article schema for BlogPostPage. Merges with existing schema_markup if present. */
export function buildArticleSchema(post: {
  title: string;
  slug: string;
  author?: string | null;
  published_at?: string | null;
  cover_image_url?: string | null;
  meta_description?: string | null;
  excerpt?: string | null;
  schema_markup?: Record<string, unknown> | unknown | null;
}): string {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.slice(0, 110),
    author: { "@type": "Person", name: post.author ?? "Equipo GuiaDelSalon" },
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    image: post.cover_image_url ?? OG_DEFAULT,
    publisher: PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    description: post.meta_description ?? post.excerpt ?? "",
  };

  // Extend with any pre-existing valid fields from DB (never overwrite our keys)
  if (post.schema_markup && typeof post.schema_markup === "object" && !Array.isArray(post.schema_markup)) {
    for (const [k, v] of Object.entries(post.schema_markup as Record<string, unknown>)) {
      if (!(k in base)) base[k] = v;
    }
  }

  return JSON.stringify(base);
}

/** Product schema for ProductPage. */
export function buildProductSchema(product: {
  name: string;
  image_url?: string | null;
  brand?: string | null;
  amazon_rating?: number | null;
  amazon_reviews?: number | null;
  current_price?: number | null;
  amazon_url?: string | null;
}): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image_url ?? OG_DEFAULT,
    brand: { "@type": "Brand", name: product.brand ?? "Varios" },
  };

  if (product.amazon_rating != null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.amazon_rating,
      bestRating: "5",
      worstRating: "1",
      ratingCount: String(product.amazon_reviews ?? 1),
    };
  }

  if (product.amazon_url) {
    schema.offers = {
      "@type": "Offer",
      url: product.amazon_url,
      priceCurrency: "EUR",
      ...(product.current_price != null ? { price: product.current_price.toFixed(2) } : {}),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Amazon España" },
    };
  }

  return JSON.stringify(schema);
}

/** BreadcrumbList schema for CategoryProductsPage. */
export function buildBreadcrumbSchema(categoryName: string, categorySlug: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${SITE_URL}/categorias/${categorySlug}`,
      },
    ],
  });
}
