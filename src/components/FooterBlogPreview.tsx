import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface BlogPost {
  slug: string;
  title: string;
  title_en: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  cover_image_url: string | null;
  category: string | null;
  category_en: string | null;
  read_time_minutes: number | null;
  published_at: string | null;
}

export function FooterBlogPreview() {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";

  const { data: posts = [] } = useQuery({
    queryKey: ["footer_blog_posts"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "slug, title, title_en, excerpt, excerpt_en, cover_image_url, category, category_en, read_time_minutes, published_at"
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });

  if (posts.length === 0) return null;

  return (
    <section
      className="py-16 md:py-20 px-4 md:px-8 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #1a1410 0%, #221508 50%, #221508 100%)",
      }}
    >
      {/* Gold accent top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C4A97D, transparent)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{
                background: "rgba(196,169,125,0.1)",
                border: "1px solid rgba(196,169,125,0.2)",
              }}
            >
              <Newspaper className="w-3 h-3 text-[#C4A97D]" />
              <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
                Blog
              </span>
            </div>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
                color: "#F5F0E8",
              }}
            >
              {isEN ? "Latest Articles" : "Últimos Artículos"}
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold transition-all group"
            style={{ color: "#C4A97D" }}
          >
            {isEN ? "See all articles" : "Ver todos los artículos"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {posts.map((post, i) => {
            const title = isEN && post.title_en ? post.title_en : post.title;
            const excerpt =
              isEN && post.excerpt_en ? post.excerpt_en : post.excerpt;
            const category =
              isEN && post.category_en
                ? post.category_en
                : post.category || "Blog";

            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden flex flex-col h-full"
                  style={{
                    background:
                      "linear-gradient(145deg, #3a2a1a 0%, #2d2015 60%, #241a0e 100%)",
                    border: "1px solid rgba(196,169,125,0.15)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#2D2218]">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#3a2a1a] to-[#2D2218] flex items-center justify-center">
                        <span className="text-3xl opacity-20">✂️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241a0e]/80 to-transparent" />
                    {/* Category badge */}
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(196,169,125,0.15)",
                        color: "#C4A97D",
                        border: "1px solid rgba(196,169,125,0.3)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-display font-bold text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[#C4A97D] transition-colors"
                      style={{ color: "#F5F0E8" }}
                    >
                      {title}
                    </h3>
                    {excerpt && (
                      <p
                        className="text-xs leading-relaxed line-clamp-2 mb-3"
                        style={{ color: "#F5F0E8", opacity: 0.4 }}
                      >
                        {excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 text-[#F5F0E8]/30">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">
                          {post.read_time_minutes ?? 5} min
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#C4A97D] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                        {isEN ? "Read" : "Leer"} →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(196,169,125,0.12)",
              color: "#C4A97D",
              border: "1px solid rgba(196,169,125,0.25)",
            }}
          >
            {isEN ? "See all articles" : "Ver todos los artículos"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
