import { Star, ExternalLink, Zap, Battery, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/hooks/useProductsByCategory";

const tierConfig: Record<string, { label: string; className: string }> = {
  ELITE: { label: "ELITE", className: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  VALUE: { label: "VALUE", className: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  STARTER: { label: "STARTER", className: "bg-muted text-muted-foreground border-border" },
};

const SPEC_ICONS: Record<string, React.ReactNode> = {
  spec1: <Zap className="w-3.5 h-3.5" />,
  spec2: <Battery className="w-3.5 h-3.5" />,
  spec3: <Ruler className="w-3.5 h-3.5" />,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">{rating?.toFixed(1)}</span>
    </span>
  );
}

interface Props {
  product: Product;
  index: number;
}

const ClipperProductCard = ({ product, index }: Props) => {
  const tier = tierConfig[product.price_range] ?? tierConfig.STARTER;
  const features = product.features ?? {};

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all"
    >
      {/* Rank */}
      <div className="absolute -top-3 -left-2 w-11 h-11 rounded-lg flex items-center justify-center font-display font-bold text-sm z-10 shadow-md bg-primary text-primary-foreground">
        #{index + 1}
      </div>

      <div className="p-5 pt-7 flex flex-col sm:flex-row gap-5">
        {/* Image */}
        <div className="w-full sm:w-44 h-44 bg-muted/50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" loading="lazy" />
          ) : (
            <span className="text-5xl opacity-20">✂️</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={`text-xs font-bold ${tier.className}`}>
              {tier.label}
            </Badge>
            {product.brand && (
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {product.brand}
              </span>
            )}
          </div>

          <h3 className="font-display text-lg font-bold text-foreground mb-1 leading-tight">
            {product.name}
          </h3>

          {/* Rating + Reviews */}
          <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
            <StarRating rating={product.amazon_rating} />
            {product.amazon_reviews > 0 && (
              <span>({product.amazon_reviews.toLocaleString("es-ES")} opiniones)</span>
            )}
          </div>

          {/* Features specs */}
          {Object.keys(features).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(features).map(([key, val]) => (
                <span key={key} className="inline-flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                  {SPEC_ICONS[key] ?? <Zap className="w-3.5 h-3.5" />}
                  {val}
                </span>
              ))}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex flex-wrap items-center gap-4 mt-auto pt-2 border-t border-border/50">
            {product.current_price != null && (
              <span className="text-2xl font-bold text-foreground">
                {product.current_price.toFixed(2)}€
              </span>
            )}
            <a
              href={product.amazon_url || "#"}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-bold text-sm rounded-lg hover:opacity-90 transition-opacity shadow-sm"
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

export default ClipperProductCard;
