import { SupabaseProduct } from "@/hooks/useCategory";

interface SimilarProductsSidebarProps {
  products: SupabaseProduct[];
  currentIndex?: number;
}

const SimilarProductsSidebar = ({ products, currentIndex = 0 }: SimilarProductsSidebarProps) => {
  const similar = products.filter((_, i) => i !== currentIndex).slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <aside className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-display text-base font-bold text-foreground mb-4">
        Productos Similares
      </h3>
      <div className="space-y-3">
        {similar.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="w-14 h-14 bg-muted/50 rounded-lg flex items-center justify-center shrink-0 border border-border/50 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl opacity-30">📷</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                #{product.position} {product.name}
              </p>
              {product.current_price != null && (
                <p className="text-sm font-bold text-secondary mt-0.5">
                  {product.current_price.toFixed(2)}€
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SimilarProductsSidebar;
