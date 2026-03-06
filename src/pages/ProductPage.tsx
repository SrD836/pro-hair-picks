import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import { Star, ArrowLeft, ExternalLink, ArrowRight } from "lucide-react";
import { toProductSlug } from "@/lib/utils";
import ScissorsSpinner from "@/components/ScissorsSpinner";

type RelatedGuidesResult =
  | { posts: { id: string; title: string; slug: string; excerpt: string | null }[]; isLastResort: false }
  | { posts: never[]; isLastResort: true };

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-[#C4A97D] text-[#C4A97D]" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-[#2D2218]">{rating.toFixed(1)}</span>
    </span>
  );
}

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-by-slug", slug],
    queryFn: async () => {
      const nameSearch = slug!.replace(/-/g, " ");
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, amazon_rating, amazon_reviews, current_price, brand, category, amazon_url, amazon_url_us")
        .ilike("name", `%${nameSearch}%`)
        .limit(10);
      if (!data) return null;
      return data.find((p) => toProductSlug(p.name) === slug) ?? data[0] ?? null;
    },
    enabled: !!slug,
  });

  const { data: guidesResult } = useQuery<RelatedGuidesResult>({
    queryKey: ["product-related-guides", product?.name, product?.category, product?.id],
    queryFn: async (): Promise<RelatedGuidesResult> => {
      const terms = [product!.name, product!.category].filter(Boolean) as string[];

      // Level 1: keywords overlap with name + category
      if (terms.length > 0) {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt")
          .eq("is_published", true)
          .overlaps("keywords", terms)
          .order("published_at", { ascending: false })
          .limit(3);
        if (data && data.length > 0) return { posts: data, isLastResort: false };
      }

      // Level 2: keywords overlap with name only
      if (product!.name) {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt")
          .eq("is_published", true)
          .overlaps("keywords", [product!.name])
          .order("published_at", { ascending: false })
          .limit(3);
        if (data && data.length > 0) return { posts: data, isLastResort: false };
      }

      // Level 3: category ILIKE
      if (product!.category) {
        const { data } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt")
          .eq("is_published", true)
          .ilike("category", `%${product!.category}%`)
          .order("published_at", { ascending: false })
          .limit(3);
        if (data && data.length > 0) return { posts: data, isLastResort: false };
      }

      // Last resort: most recent — show link only, not section
      return { posts: [], isLastResort: true };
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <ScissorsSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Producto no encontrado.{" "}
        <Link to="/categorias" className="text-[#C4A97D] hover:underline">
          Ver todas las categorías
        </Link>
      </div>
    );
  }

  const amazonUrl = product.amazon_url ?? product.amazon_url_us;
  const categorySlug = product.category
    ? product.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${product.name} | Guía del Salón`}
        description={`Análisis y comparativa de ${product.name}. ${product.brand ? `Marca: ${product.brand}.` : ""} Precios verificados y opiniones reales.`}
      />

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {categorySlug && (
          <Link
            to={`/categorias/${categorySlug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#C4A97D] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a {product.category}
          </Link>
        )}

        {/* Product card */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-56 h-56 bg-muted/30 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-3"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg" />
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            {product.brand && (
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {product.brand}
              </span>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#2D2218] leading-tight mb-3">
              {product.name}
            </h1>

            {product.amazon_rating != null && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={product.amazon_rating} />
                {product.amazon_reviews != null && product.amazon_reviews > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({product.amazon_reviews.toLocaleString("es-ES")} valoraciones)
                  </span>
                )}
              </div>
            )}

            {product.current_price != null && (
              <p className="text-3xl font-bold text-[#2D2218] mb-4">
                {product.current_price.toFixed(2)}€
              </p>
            )}

            {product.category && (
              <p className="text-sm text-muted-foreground mb-4">
                Categoría:{" "}
                {categorySlug ? (
                  <Link to={`/categorias/${categorySlug}`} className="text-[#C4A97D] hover:underline">
                    {product.category}
                  </Link>
                ) : (
                  product.category
                )}
              </p>
            )}

            {amazonUrl && (
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 mt-auto px-5 py-2.5 bg-[#C4A97D] text-white font-bold text-sm rounded-lg hover:opacity-90 transition-opacity w-fit"
              >
                Ver en Amazon
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Guías relacionadas */}
        {guidesResult && !guidesResult.isLastResort && guidesResult.posts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="font-display text-xl font-bold text-[#2D2218] mb-6">Guías relacionadas</h2>
            <ul className="space-y-4">
              {guidesResult.posts.map((post) => (
                <li key={post.id} className="group">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <span className="font-semibold text-[#2D2218] group-hover:text-[#C4A97D] transition-colors text-sm">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.excerpt.slice(0, 100)}{post.excerpt.length > 100 ? "…" : ""}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {guidesResult?.isLastResort && (
          <div className="mt-12 border-t border-border pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[#C4A97D] font-semibold hover:opacity-80 transition-opacity"
            >
              Ver todas las guías
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
