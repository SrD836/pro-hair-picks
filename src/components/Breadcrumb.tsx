import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://guiadelsalon.com";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  injectSchema?: boolean; // default: true
}

function buildSchema(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  });
}

const Breadcrumb = ({ items, injectSchema = true }: BreadcrumbProps) => {
  if (items.length === 0) return null;

  const penultimate = items.length > 2 ? items[items.length - 2] : null;

  return (
    <>
      {injectSchema && (
        <Helmet>
          <script type="application/ld+json">{buildSchema(items)}</script>
        </Helmet>
      )}

      {/* Mobile: only show penultimate item as back link when depth > 2 */}
      {penultimate && (
        <nav aria-label="breadcrumb" className="sm:hidden flex items-center py-2">
          {penultimate.href ? (
            <Link
              to={penultimate.href}
              className="text-sm text-muted-foreground hover:text-[#C4A97D] transition-colors"
            >
              ← {penultimate.label}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">← {penultimate.label}</span>
          )}
        </nav>
      )}

      {/* Desktop: full breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className={`${penultimate ? "hidden sm:flex" : "flex"} items-center gap-1 text-sm text-muted-foreground py-2`}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
              {isLast || !item.href ? (
                <span className={isLast ? "text-[#2D2218] font-medium" : ""}>{item.label}</span>
              ) : (
                <Link to={item.href} className="hover:text-[#C4A97D] transition-colors">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
};

export default Breadcrumb;
