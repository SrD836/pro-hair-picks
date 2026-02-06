import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, clippersProducts, menCategories, womenCategories } from "@/data/categories";

const CategoryRanking = () => {
  const { gender, slug } = useParams<{ gender: string; slug: string }>();
  const genderKey = gender as "hombre" | "mujer";
  const category = getCategoryBySlug(genderKey, slug || "");

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">Categoría no encontrada</h1>
        <Link to="/" className="text-primary hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  // For now only clippers have full data
  const products = slug === "clippers-profesionales" ? clippersProducts : [];

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="capitalize">{gender}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{category.icon}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            10 Mejores {category.name} en España
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span>📅 Actualizado: {today}</span>
          <span>✅ Precios verificados diariamente</span>
          <span>🏷️ {products.length} productos analizados</span>
        </div>
      </header>

      {/* Products list */}
      {products.length > 0 ? (
        <div className="space-y-6 max-w-4xl">
          {products.map((product, i) => (
            <ProductCard key={product.rank} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center max-w-2xl">
          <span className="text-5xl mb-4 block">{category.icon}</span>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Rankings próximamente
          </h2>
          <p className="text-muted-foreground">
            Estamos preparando el análisis completo de los mejores productos de esta categoría.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Ver todas las categorías
          </Link>
        </div>
      )}

      {/* Related categories */}
      <aside className="mt-16">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          Categorías relacionadas
        </h2>
        <div className="flex flex-wrap gap-2">
          {(genderKey === "hombre" ? menCategories : womenCategories)
            .filter((c) => c.slug !== slug)
            .slice(0, 8)
            .map((c) => (
              <Link
                key={c.slug}
                to={`/${gender}/${c.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border text-sm text-foreground hover:border-primary/30 hover:shadow-card-hover transition-all"
              >
                <span>{c.icon}</span>
                {c.name}
              </Link>
            ))}
        </div>
      </aside>
    </div>
  );
};

export default CategoryRanking;
