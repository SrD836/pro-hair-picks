import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SimilarProductsSidebar from "@/components/SimilarProductsSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCategory, useCategoryProducts } from "@/hooks/useCategory";
import { useAffiliateLinks } from "@/hooks/useAffiliateLinks";
import { menCategories, womenCategories } from "@/data/categories";

const CategoryRanking = () => {
  const { gender, slug } = useParams<{ gender: string; slug: string }>();
  const { data: category, isLoading: catLoading } = useCategory(gender || "", slug || "");
  const { data: products = [], isLoading: prodLoading } = useCategoryProducts(category?.id);
  const { data: affiliateLinks = [] } = useAffiliateLinks(products.map((p) => p.id));

  const isLoading = catLoading || prodLoading;
  const staticCategories = gender === "mujer" ? womenCategories : menCategories;

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="mt-8 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">
          Categoría no encontrada
        </h1>
        <Link to="/" className="text-primary hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const linksByProduct = affiliateLinks.reduce<Record<string, string>>((acc, link) => {
    if (link.product_id && link.is_primary) acc[link.product_id] = link.affiliate_url;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="capitalize">{gender}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
          10 Mejores {category.name} en España
        </h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            📅 Actualizado: <strong className="text-foreground">{today}</strong>
          </span>
          <span>✅ Precios verificados diariamente</span>
          <span>🏷️ {products.length} productos analizados</span>
        </div>
      </header>

      {/* Main content with sidebar */}
      {products.length > 0 ? (
        <Tabs defaultValue="TOP" className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1 h-auto flex-wrap gap-1 mb-8">
            {[
              { value: "TOP", label: "Los Mejores" },
              { value: "CALIDAD-PRECIO", label: "Mejor Calidad-Precio" },
              { value: "COMIENZO", label: "Para Comenzar" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-5 py-2.5 text-sm font-bold text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-sm transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {["TOP", "CALIDAD-PRECIO", "COMIENZO"].map((classification) => {
            const filtered = products
              .filter((p) => p.classification === classification)
              .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

            return (
              <TabsContent key={classification} value={classification}>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6 max-w-4xl">
                    {filtered.length > 0 ? (
                      filtered.map((product, i) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={i}
                          affiliateUrl={linksByProduct[product.id]}
                        />
                      ))
                    ) : (
                      <div className="bg-card rounded-xl border border-border p-12 text-center">
                        <p className="text-muted-foreground">No hay productos en esta clasificación todavía.</p>
                      </div>
                    )}
                  </div>

                  {filtered.length > 1 && (
                    <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-6">
                      <SimilarProductsSidebar products={filtered} currentIndex={0} />
                      <div className="bg-card rounded-xl border border-border p-5">
                        <h3 className="font-display text-base font-bold text-foreground mb-3">
                          Ir al producto
                        </h3>
                        <div className="space-y-1">
                          {filtered.map((p) => (
                            <div
                              key={p.id}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
                            >
                              <span className="font-bold text-primary">#{p.position}</span>{" "}
                              <span className="truncate">{p.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center max-w-2xl">
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
          {staticCategories
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
