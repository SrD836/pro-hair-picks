import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useProductsByCategory } from "@/hooks/useProductsByCategory";
import { getCategoryNameBySlug } from "@/data/categories";
import ClipperProductCard from "@/components/ClipperProductCard";

const CategoryProductsPage = () => {
  const { categoria } = useParams<{ categoria: string }>();
  const slug = categoria || "";

  // Resolve slug → exact DB category name, fallback to slug itself
  const categoryName = getCategoryNameBySlug(slug) || slug;
  const { data: products = [], isLoading } = useProductsByCategory(categoryName);

  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const displayName = categoryName;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded w-2/3" />
          <div className="mt-8 space-y-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{displayName}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
          10 Mejores {displayName} en España
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>📅 Actualizado: <strong className="text-foreground">{today}</strong></span>
          <span>✅ Precios verificados</span>
          <span>🏷️ {products.length} productos</span>
        </div>
      </header>

      {/* Product list */}
      <div className="max-w-4xl space-y-6">
        {products.length > 0 ? (
          products.map((product, i) => (
            <ClipperProductCard key={product.id} product={product} index={i} />
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Rankings próximamente</h2>
            <p className="text-muted-foreground">Estamos preparando el análisis completo de {displayName}.</p>
            <Link to="/" className="inline-block mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Ver categorías
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
