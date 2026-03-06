const BRAND = "Guía del Salón";
const MAX_CHARS = 60;
const SITE_URL = "https://guiadelsalon.com";
const OG_DEFAULT = `${SITE_URL}/og-default.jpg`;
const LOGO_URL = `${SITE_URL}/logo.png`;

/**
 * Builds a page title truncated to MAX_CHARS before the brand separator.
 * Priority: rawTitle as-is → keyword-based "Top X 2026" → truncated rawTitle.
 */
export function buildPageTitle(rawTitle: string, keyword?: string): string {
  if (rawTitle.length <= MAX_CHARS) {
    return `${rawTitle} | ${BRAND}`;
  }

  if (keyword && keyword.trim().length > 0) {
    const seoTitle = `Top ${keyword.trim()} 2026`;
    if (seoTitle.length <= MAX_CHARS) {
      return `${seoTitle} | ${BRAND}`;
    }
    const maxKeywordLen = MAX_CHARS - "Top  2026".length;
    const truncatedKeyword = keyword.trim().slice(0, maxKeywordLen);
    return `Top ${truncatedKeyword} 2026 | ${BRAND}`;
  }

  const truncated = rawTitle.slice(0, MAX_CHARS).replace(/\s+\S*$/, "");
  return `${truncated}… | ${BRAND}`;
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
  schema_markup?: Record<string, unknown> | null;
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
  if (post.schema_markup && typeof post.schema_markup === "object") {
    for (const [k, v] of Object.entries(post.schema_markup)) {
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
