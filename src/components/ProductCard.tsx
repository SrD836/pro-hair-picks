import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SupabaseProduct } from "@/hooks/useCategory";

interface ProductCardProps {
  product: SupabaseProduct;
  index: number;
  affiliateUrl?: string;
}

const classificationConfig: Record<string, { label: string; className: string }> = {
  TOP: {
    label: "TOP",
    className: "bg-badge-top text-badge-top-foreground",
  },
  "CALIDAD-PRECIO": {
    label: "CALIDAD-PRECIO",
    className: "bg-badge-calidad text-badge-calidad-foreground",
  },
  COMIENZO: {
    label: "COMIENZO",
    className: "bg-badge-comienzo text-badge-comienzo-foreground",
  },
};

const ProductCard = ({ product, index, affiliateUrl }: ProductCardProps) => {
  const badge = classificationConfig[product.classification || "TOP"] || classificationConfig.TOP;
  const isFirst = index === 0;
  const features = Array.isArray(product.features) ? product.features : [];
  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`relative bg-card rounded-xl border transition-all duration-200 hover:shadow-card-hover ${
        isFirst ? "border-secondary/50 shadow-md" : "border-border shadow-card"
      }`}
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-3 -left-2 w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm z-10 ${
          isFirst
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        #{product.position || index + 1}
      </div>

      {isFirst && (
        <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
          🏆 MEJOR OPCIÓN
        </div>
      )}

      <div className="p-5 pt-6 flex flex-col sm:flex-row gap-5">
        {/* Image */}
        <div className="w-full sm:w-40 h-40 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-5xl opacity-30">📷</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
            {product.brand && (
              <span className="text-xs text-muted-foreground font-medium uppercase">
                {product.brand}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                -{product.discount_percentage}%
              </span>
            )}
          </div>

          <h3 className="font-display text-lg font-bold text-foreground mb-3 leading-tight">
            {product.name}
          </h3>

          {features.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-secondary mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* Price + CTA */}
          <div className="flex flex-wrap items-center gap-3 mt-auto">
            {product.current_price && (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  {product.current_price.toFixed(2)}€
                </span>
                {product.original_price && product.original_price > product.current_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.original_price.toFixed(2)}€
                  </span>
                )}
              </div>
            )}

            <a
              href={affiliateUrl || "#"}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Ver precio en Amazon
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
