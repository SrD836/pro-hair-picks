import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface Post {
  slug: string;
  title: string;
  title_en?: string;
  cover_image_url?: string;
  category?: string;
  read_time_minutes?: number;
}

const HomeBlogPreview = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug,title,title_en,cover_image_url,category,read_time_minutes")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(6)
      .then(({ data }) => { if (data) setPosts(data); });
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !posts.length) return;
    const cardWidth = el.scrollWidth / posts.length;
    const dot = Math.round(el.scrollLeft / cardWidth);
    setActiveDot(Math.min(dot, posts.length - 1));
  };

  const scrollTo = (i: number) => {
    const el = scrollRef.current;
    if (!el || !posts.length) return;
    el.scrollTo({ left: (el.scrollWidth / posts.length) * i, behavior: "smooth" });
  };

  if (!posts.length) return null;

  return (
    <section className="py-10 md:py-14">
      {/* Header */}
      <div className="px-4 md:px-8 flex items-center justify-between mb-6 max-w-screen-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8]"
        >
          {t("blog.latestArticles")}
        </motion.h2>
        <Link
          to="/blog"
          className="hidden md:inline-flex items-center gap-1 text-[#C4A97D] text-sm font-medium hover:underline"
        >
          {t("blog.viewAll")} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal scroll carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-3 snap-x snap-mandatory scrollbar-none"
        style={{ scrollPaddingLeft: "1rem" }}
      >
        {posts.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="flex-shrink-0 rounded-2xl border border-[#C4A97D]/10 bg-[#2D2218] overflow-hidden snap-start group"
            style={{ width: "68vw", maxWidth: "260px" }}
          >
            <Link to={`/blog/${post.slug}`} className="block">
              {post.cover_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`${post.cover_image_url}?width=400&height=225&resize=cover`}
                    alt={(isEN && post.title_en) || post.title}
                    width={400}
                    height={225}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {post.category && (
                    <span className="text-[10px] font-bold text-[#C4A97D] uppercase tracking-widest">
                      {post.category}
                    </span>
                  )}
                  {post.read_time_minutes && (
                    <span className="flex items-center gap-1 text-[10px] text-[#F5F0E8]/45 ml-auto">
                      <Clock className="w-2.5 h-2.5" />
                      {post.read_time_minutes} {t("blog.min")}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-sm font-bold text-[#F5F0E8] leading-snug line-clamp-3 group-hover:text-[#C4A97D] transition-colors">
                  {(isEN && post.title_en) || post.title}
                </h3>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Scroll dots — mobile only */}
      <div className="flex justify-center gap-1.5 mt-3 md:hidden">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeDot ? "w-5 bg-[#C4A97D]" : "w-1.5 bg-[#C4A97D]/25"
            }`}
          />
        ))}
      </div>

      {/* Mobile "Ver todo" */}
      <div className="px-4 mt-5 md:hidden">
        <Link
          to="/blog"
          className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-[#C4A97D]/20 text-[#C4A97D] text-sm font-semibold hover:bg-[#C4A97D]/10 transition-colors"
        >
          {t("blog.viewAll")} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
