import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface Post {
  slug: string;
  title: string;
  title_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  cover_image_url?: string;
  category?: string;
  read_time_minutes?: number;
}

const categoryColors: Record<string, string> = {
  TENDENCIAS: "#C4A97D",
  REVIEWS: "#8BAF7C",
  NEGOCIO: "#7B9EC7",
  TÉCNICA: "#D4956A",
  DEFAULT: "#C4A97D",
};

const HomeBlogPreview = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug,title,title_en,excerpt,excerpt_en,cover_image_url,category,read_time_minutes")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  if (!posts.length) return null;

  return (
    <section
      className="py-20 md:py-28 px-4 md:px-8"
      style={{ background: "linear-gradient(180deg, #2D2218 0%, #1a1008 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{ background: "rgba(196,169,125,0.1)", border: "1px solid rgba(196,169,125,0.2)" }}
            >
              <TrendingUp className="w-3 h-3 text-[#C4A97D]" />
              <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
                {isEN ? "Latest" : "Reciente"}
              </span>
            </div>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#F5F0E8" }}
            >
              {t("blog.latestArticles")}
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold transition-all group"
            style={{ color: "#C4A97D" }}
          >
            {t("blog.viewAll")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post, i) => {
            const title = (isEN && post.title_en) || post.title;
            const excerpt = (isEN && post.excerpt_en) || post.excerpt;
            const catKey = post.category?.toUpperCase() ?? "DEFAULT";
            const catColor = categoryColors[catKey] ?? categoryColors.DEFAULT;

            return (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex flex-col h-full"
                  aria-label={isEN ? `Read: ${title}` : `Leer: ${title}`}
                >
                  {/* Cover image */}
                  {post.cover_image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={`${post.cover_image_url}?width=600&height=338&resize=cover`}
                        alt={title}
                        width={600}
                        height={338}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient over image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2D2218]/80 to-transparent" />
                      {/* Category badge on image */}
                      {post.category && (
                        <div className="absolute bottom-3 left-3">
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{
                              background: `${catColor}20`,
                              color: catColor,
                              border: `1px solid ${catColor}40`,
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="font-display font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-[#C4A97D]"
                      style={{ color: "#F5F0E8" }}
                    >
                      {title}
                    </h3>
                    {excerpt && (
                      <p
                        className="text-xs leading-relaxed line-clamp-2 mb-4"
                        style={{ color: "#F5F0E8", opacity: 0.45 }}
                      >
                        {excerpt}
                      </p>
                    )}

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-auto">
                      {post.read_time_minutes && (
                        <span
                          className="flex items-center gap-1 text-[10px]"
                          style={{ color: "#F5F0E8", opacity: 0.35 }}
                        >
                          <Clock className="w-3 h-3" />
                          {post.read_time_minutes} {t("blog.min")}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all ml-auto"
                        style={{ color: "#C4A97D" }}
                      >
                        {t("blog.readMore")}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(196,169,125,0.12)",
              color: "#C4A97D",
              border: "1px solid rgba(196,169,125,0.25)",
            }}
          >
            {t("blog.viewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
