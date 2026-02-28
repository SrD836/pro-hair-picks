import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTrendingProducts } from "@/hooks/useTrendingProducts";

const categories = [
  {
    titleKey: "sections.barber.title",
    defaultTitle: "Barbería & Hombre",
    subtitleKey: "sections.barber.subtitle",
    defaultSubtitle: "Clippers, trimmers, tijeras y más",
    href: "/hombre",
    image: "/images/section-barber.webp",
    fallback: "/images/section-barber.jpg",
    accent: "#C4A97D",
  },
  {
    titleKey: "sections.salon.title",
    defaultTitle: "Peluquería & Mujer",
    subtitleKey: "sections.salon.subtitle",
    defaultSubtitle: "Secadores, planchas y tratamientos",
    href: "/mujer",
    image: "/images/section-salon.webp",
    fallback: "/images/section-salon.jpg",
    accent: "#D4956A",
  },
  {
    titleKey: "sections.mixed.title",
    defaultTitle: "Salón Mixto",
    subtitleKey: "sections.mixed.subtitle",
    defaultSubtitle: "Mobiliario y equipamiento",
    href: "/mixto",
    image: "/images/section-mixto.webp",
    fallback: "/images/section-mixto.jpg",
    accent: "#8BAF7C",
  },
];


const PhotoSections = () => {
  const { t, lang } = useLanguage();

  const { data: trendingProducts = [], isLoading: trendingLoading } = useTrendingProducts();

  const accentColors = ["#C4A97D", "#D4956A", "#8BAF7C"];
  const badges = [
    lang === "es" ? "🔥 Más vendido" : "🔥 Best seller",
    lang === "es" ? "⭐ Top rated" : "⭐ Top rated",
    lang === "es" ? "💎 Premium" : "💎 Premium",
  ];
  const hrefs = ["/categorias/clippers", "/categorias/trimmers", "/categorias/secadores-profesionales"];
  const fallbackImages = [
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
    "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80",
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #1a1008 0%, #2D2218 100%)" }}
    >
      {/* Gold accent line top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D, transparent)" }}
      />

      <div className="py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(196,169,125,0.08)", border: "1px solid rgba(196,169,125,0.18)" }}
          >
            <span className="text-[#C4A97D] text-xs font-bold uppercase tracking-widest">
              {t("sections.exploreTitle") || "Explorar Categorías"}
            </span>
          </div>
          <h2
            className="font-display font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#F5F0E8" }}
          >
            {t("sections.exploreTitle") || "Explorar Categorías"}
          </h2>
          <p className="text-sm mt-2" style={{ color: "#F5F0E8", opacity: 0.45 }}>
            {t("sections.subtitle") || "Todo lo que tu salón necesita, organizado para ti."}
          </p>
        </motion.div>

        {/* Main grid: 1 large left + 2 stacked right */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3 md:gap-4 mb-3 md:mb-4">
          {/* Large card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            className="group relative rounded-2xl overflow-hidden"
            style={{ minHeight: 380 }}
          >
            <Link to={categories[0].href} className="block w-full h-full absolute inset-0">
              <picture>
                <source srcSet={categories[0].image} type="image/webp" />
                <img
                  src={categories[0].fallback}
                  alt={t(categories[0].titleKey) || categories[0].defaultTitle}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/90 via-[#110b05]/30 to-transparent" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute top-0 left-0 h-0.5 w-24 origin-left"
                style={{ background: categories[0].accent }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
                  style={{
                    background: `${categories[0].accent}20`,
                    color: categories[0].accent,
                    border: `1px solid ${categories[0].accent}35`,
                  }}
                >
                  {t("sections.featured") || "Destacado"}
                </span>
                <h3
                  className="font-display font-bold text-2xl md:text-3xl leading-tight mb-2"
                  style={{ color: "#F5F0E8" }}
                >
                  {t(categories[0].titleKey) || categories[0].defaultTitle}
                </h3>
                <p className="text-sm mb-4" style={{ color: "#F5F0E8", opacity: 0.6 }}>
                  {t(categories[0].subtitleKey) || categories[0].defaultSubtitle}
                </p>
                <span
                  className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                  style={{ color: categories[0].accent }}
                >
                  {t("bento.explore") || "Explorar"}{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Right column — 2 stacked */}
          <div className="flex flex-col gap-3 md:gap-4">
            {[categories[1], categories[2]].map((cat, i) => (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl overflow-hidden flex-1"
                style={{ minHeight: 180 }}
              >
                <Link to={cat.href} className="block w-full h-full absolute inset-0">
                  <picture>
                    <source srcSet={cat.image} type="image/webp" />
                    <img
                      src={cat.fallback}
                      alt={t(cat.titleKey) || cat.defaultTitle}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/85 via-[#110b05]/25 to-transparent" />
                  <div
                    className="absolute top-4 right-4 w-2 h-2 rounded-full"
                    style={{ background: cat.accent, boxShadow: `0 0 8px ${cat.accent}` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3
                      className="font-display font-bold text-lg leading-tight mb-1"
                      style={{ color: "#F5F0E8" }}
                    >
                      {t(cat.titleKey) || cat.defaultTitle}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                      style={{ color: cat.accent }}
                    >
                      {t("bento.explore") || "Explorar"} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
      </div>

      {/* Trending Products */}
      <div
        className="py-10 md:py-14 px-5 md:px-8"
        style={{ background: "linear-gradient(180deg, #1E1208 0%, #221508 100%)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4A97D]/70 block mb-1">
              {lang === "es" ? "Ahora mismo" : "Right now"}
            </span>
            <h3 className="font-display font-bold text-[#F5F0E8] text-xl">
              {lang === "es" ? "Tendencias del Mes" : "This Month's Trends"}
            </h3>
          </div>
          <Link
            to="/categorias"
            className="text-xs text-[#C4A97D] hover:text-[#F5F0E8] transition-colors flex items-center gap-1"
          >
            {lang === "es" ? "Ver todo" : "See all"} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {trendingLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div className="h-28 bg-[#3a2a1a]" />
                <div className="p-3 space-y-2">
                  <div className="h-2 bg-[#3a2a1a] rounded w-1/2" />
                  <div className="h-3 bg-[#3a2a1a] rounded w-3/4" />
                  <div className="h-3 bg-[#3a2a1a] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {trendingProducts.map((product, i) => {
              const accent = accentColors[i] || "#C4A97D";
              const badge = badges[i];
              const href = hrefs[i] || "/categorias";
              const imageSrc = product.image_url || fallbackImages[i];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={href}
                    className="block rounded-2xl overflow-hidden group"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}20` }}
                  >
                    {/* Image */}
                    <div className="relative h-28 overflow-hidden bg-[#2d1f10]">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImages[i];
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(26,16,8,0.5))" }}
                      />
                      <span
                        className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
                      >
                        {badge}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: `${accent}80` }}>
                        {product.category}
                      </p>
                      <p className="text-[#F5F0E8] text-xs font-semibold leading-tight mb-1.5 truncate">
                        {product.name}
                      </p>
                      {product.current_price > 0 && (
                        <p className="font-display font-bold text-sm" style={{ color: accent }}>
                          {product.current_price.toFixed(2)}€
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PhotoSections;
