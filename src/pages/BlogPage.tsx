import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Clock, Heart, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getBlogImage } from "@/lib/blogImage";

const BlogPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory) result = result.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [posts, activeCategory, search]);

  return (
    <section className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl text-foreground text-center mb-2"
        >
          Nuestro <span className="text-secondary">Blog</span>
        </motion.h1>
        <p className="text-center text-muted-foreground mb-8">
          Consejos, tendencias y guías para profesionales del salón
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary text-sm"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-secondary text-secondary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat!)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No se encontraron artículos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-secondary/50 hover:shadow-gold transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={getBlogImage(post)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5">
                    {/* Category badge */}
                    {post.category && (
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {post.category}
                      </Badge>
                    )}

                    <h2 className="font-display text-lg text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {post.read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {post.read_time_minutes} min
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.published_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 ml-auto text-secondary">
                        <Heart className="w-3.5 h-3.5" /> {post.likes ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPage;
