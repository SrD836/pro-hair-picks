import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
}

function FeedCard({ post, index, isEN, readMoreLabel }: {
  post: Post;
  index: number;
  isEN: boolean;
  readMoreLabel: string;
}) {
  const title = (isEN && post.title_en) || post.title;
  const excerpt = (isEN && post.excerpt_en) || post.excerpt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="flex gap-4 py-4"
      style={{ borderBottom: "1px solid rgba(45,34,24,0.1)" }}
    >
      {/* Thumbnail */}
      {post.cover_image_url && (
        <Link
          to={`/blog/${post.slug}`}
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 100, height: 80 }}
        >
          <img
            src={`${post.cover_image_url}?width=200&height=160&resize=cover`}
            alt={title}
            width={100}
            height={80}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </Link>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3
            className="font-display font-bold text-sm md:text-base leading-snug line-clamp-2 mb-1"
            style={{ color: "#2D2218" }}
          >
            <Link to={`/blog/${post.slug}`} className="hover:opacity-70 transition-opacity">
              {title}
            </Link>
          </h3>
          {excerpt && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mb-2"
              style={{ color: "#2D2218", opacity: 0.55 }}
            >
              {excerpt}
            </p>
          )}
        </div>
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg self-start transition-all active:scale-95"
          style={{
            background: "#F5F0E8",
            color: "#2D2218",
            border: "1px solid rgba(45,34,24,0.2)",
          }}
        >
          {readMoreLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.article>
  );
}

const HomeBlogPreview = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug,title,title_en,excerpt,excerpt_en,cover_image_url,category")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setPosts(data); });
  }, []);

  if (!posts.length) return null;

  return (
    <section className="py-12 md:py-16 px-4 md:px-8" style={{ background: "#F5F0E8" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display font-bold text-center mb-6"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#2D2218" }}
        >
          {t("blog.latestArticles") || "Feed de Noticias"}
        </motion.h2>

        {/* Feed list */}
        <div
          className="rounded-xl overflow-hidden px-4"
          style={{ border: "1px solid rgba(45,34,24,0.12)", background: "#F5F0E8" }}
        >
          {posts.map((post, i) => (
            <FeedCard
              key={post.slug}
              post={post}
              index={i}
              isEN={isEN}
              readMoreLabel={t("blog.readMore") || "Leer Más"}
            />
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-5">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: "#2D2218",
              color: "#F5F0E8",
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
