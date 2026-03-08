import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface Article {
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  readTime: number;
  imageUrl?: string;
  featured?: boolean;
}

interface LatestArticlesProps {
  articles: Article[];
  title?: string;
}

/* ── Article card — bento style ──────────────────────────────────────────── */
function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        to={`/blog/${article.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(45,34,24,0.07)] hover:-translate-y-1 transition-all duration-200 h-full"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F0E8]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5F0E8] to-[#E8DFD0] flex items-center justify-center">
              <span className="text-4xl opacity-30">✂️</span>
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#2D2218]/80 backdrop-blur-sm text-[#C4A97D] text-[10px] font-bold uppercase tracking-[0.12em] rounded-full">
            {article.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3 className="font-display font-bold text-[#2D2218] text-sm leading-snug line-clamp-2 group-hover:text-[#C4A97D] transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-[#2D2218]/60 text-xs leading-relaxed line-clamp-2">{article.excerpt}</p>
          )}
          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#F5F0E8]">
            <div className="flex items-center gap-1 text-[#2D2218]/40">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{article.readTime} min</span>
            </div>
            <span className="text-[10px] font-semibold text-[#C4A97D] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
              {t("blog.readMore")} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Featured (hero) card ────────────────────────────────────────────────── */
function FeaturedCard({ article }: { article: Article }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="md:col-span-2"
    >
      <Link
        to={`/blog/${article.slug}`}
        className="group relative flex flex-col justify-end bg-[#2D2218] rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(45,34,24,0.12)] hover:-translate-y-1 transition-all duration-200 aspect-[16/9] md:aspect-[2/1]"
      >
        {/* Image */}
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2218]/90 via-[#2D2218]/40 to-transparent" />

        {/* Content */}
        <div className="relative p-5 md:p-6 space-y-2">
          <span className="inline-block px-2.5 py-0.5 bg-[#C4A97D]/20 border border-[#C4A97D]/30 text-[#C4A97D] text-[10px] font-bold uppercase tracking-[0.12em] rounded-full">
            {article.category}
          </span>
          <h3 className="font-display font-bold text-[#F5F0E8] text-lg md:text-xl leading-snug max-w-lg">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-[#F5F0E8]/50">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{article.readTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function LatestArticles({ articles, title }: LatestArticlesProps) {
  const { t } = useLanguage();
  const displayTitle = title || t("home.latestArticles") || "Últimos Artículos";

  if (!articles || articles.length === 0) return null;

  const featured = articles.find((a) => a.featured) || articles[0];
  const rest = articles.filter((a) => a.slug !== featured.slug).slice(0, 4);

  return (
    <section className="py-14 md:py-20 bg-[#F5F0E8]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-[#C4A97D] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t("blog.sectionLabel")}</p>
            <h2 className="font-display font-bold text-[#2D2218] text-2xl md:text-3xl">{displayTitle}</h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D2218]/50 hover:text-[#C4A97D] transition-colors group"
          >
            {t("blog.viewAll")}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* ── Desktop: Bento grid ── */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {/* Row 1: featured (2/3) */}
          <FeaturedCard article={featured} />
          {rest.length > 0 && <ArticleCard article={rest[0]} index={0} />}

          {/* Row 2: remaining cards */}
          {rest.slice(1, 4).map((article, i) => (
            <ArticleCard key={article.slug} article={article} index={i + 1} />
          ))}
        </div>

        {/* ── Mobile: horizontal scroll ── */}
        <div className="md:hidden">
          {/* Featured */}
          <div className="mb-4">
            <FeaturedCard article={featured} />
          </div>

          {/* Scrollable row */}
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {rest.map((article, i) => (
              <div key={article.slug} className="snap-start shrink-0 w-[72vw] max-w-[280px]">
                <ArticleCard article={article} index={i} />
              </div>
            ))}
          </div>

          {/* Scroll dots indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: Math.min(rest.length + 1, 4) }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${i === 0 ? "w-4 h-1.5 bg-[#C4A97D]" : "w-1.5 h-1.5 bg-[#2D2218]/20"}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile "ver todos" CTA */}
        <div className="md:hidden text-center mt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D2218] text-[#F5F0E8] rounded-full text-sm font-medium hover:bg-[#2D2218]/90 transition-colors"
          >
            {t("blog.viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
