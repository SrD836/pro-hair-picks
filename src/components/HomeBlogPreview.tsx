import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HomeBlogPreview = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";
  const { data: posts } = useQuery({
    queryKey: ["blog-preview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, title_en, excerpt, excerpt_en, cover_image_url, category, published_at, read_time_minutes")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos — evita refetch en navegación
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3"
          >
            <BookOpen className="w-5 h-5 text-secondary" />
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
              {t("blog.sectionLabel")}
            </span>
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t("blog.latestArticles")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            {t("blog.subtitle")}
          </p>
        </div>
        <Link
          to="/blog"
          className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
        >
          {t("blog.viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{
              y: -6,
              boxShadow: "0 20px 40px rgba(196,169,125,0.2)",
              borderColor: "rgba(196,169,125,0.5)",
              transition: { duration: 0.25 },
            }}
            className="rounded-2xl border border-secondary/15 bg-card overflow-hidden group"
          >
            <Link to={`/blog/${post.slug}`} className="block">
              {post.cover_image_url && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={`${post.cover_image_url}?width=378&height=252&resize=cover`}
                    srcSet={`${post.cover_image_url}?width=378&height=252&resize=cover 1x, ${post.cover_image_url}?width=756&height=504&resize=cover 2x`}
                    alt={post.title}
                    width={378}
                    height={252}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  {post.read_time_minutes && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.read_time_minutes} {t("blog.min")}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                  {(isEN && post.title_en) || post.title}
                </h3>
                {(post.excerpt || post.excerpt_en) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {(isEN && post.excerpt_en) || post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
        >
          {t("blog.viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
