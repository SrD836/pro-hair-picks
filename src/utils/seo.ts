const BRAND = "Guía del Salón";
const MAX_CHARS = 60;

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
