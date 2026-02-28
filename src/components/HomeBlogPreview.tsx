import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface Post {
  slug: string;
  title: string;
  title_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  cover_image_url?: string | null;
  category?: string | null;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function BlogCard({ post, isEN, readMoreLabel }: {
  post: Post;
  isEN: boolean;
  readMoreLabel: string;
}) {
  const title = (isEN && post.title_en) || post.title;
  const excerpt = (isEN && post.excerpt_en) || post.excerpt;

  return (
    <motion.article
      variants={cardVariants}
      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#3E2D1F] to-[#2D2218] border border-white/8"
    >
      {/* Image */}
      {post.cover_image_url && (
        <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden">
          <img
            src={`${post.cover_image_url}?width=600&height=375&resize=cover`}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
      )}

      {/* Content */}
      <div className="p-5">
        {post.category && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-2">
            {post.category}
          </span>
        )}
        <h3 className="font-display font-bold text-base md:text-lg leading-snug line-clamp-2 mb-2 text-[#F5F0E8]">
          <Link to={`/blog/${post.slug}`} className="hover:opacity-80 transition-opacity">
            {title}
          </Link>
        </h3>
        {excerpt && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3 text-[#F5F0E8]/50">
            {excerpt}
          </p>
        )}
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C4A97D] group-hover:gap-3 transition-all duration-300"
        >
          {readMoreLabel} <ArrowRight className="w-3.5 h-3.5" />
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
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,title_en,excerpt,excerpt_en,cover_image_url,category")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (data) setPosts(data as Post[]);
    };
    fetchPosts();
  }, []);

  if (!posts.length) return null;

  return (
    <section className="py-16 md:py-24 px-4 md:px-8" style={{ background: "#2D2218" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2
            className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#F5F0E8" }}
          >
            {t("blog.latestArticles") || "Últimos Artículos"}
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5"
        >
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              isEN={isEN}
              readMoreLabel={t("blog.readMore") || "Leer Más"}
            />
          ))}
        </motion.div>

        {/* View all */}
        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 border border-[#C4A97D]/30 text-[#C4A97D] hover:bg-[#C4A97D]/10"
          >
            {t("blog.viewAll") || "Ver Todos"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
