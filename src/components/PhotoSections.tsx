import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Zap, Armchair } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const categories = [
  {
    titleKey: "sections.barber.title",
    defaultTitle: "Barbería & Hombre",
    subtitleKey: "sections.barber.subtitle",
    defaultSubtitle: "Clippers, trimmers, tijeras y más",
    href: "/categorias/clippers",
    image: "/images/section-barber.webp",
    fallback: "/images/section-barber.jpg",
    accent: "#C4A97D",
  },
  {
    titleKey: "sections.salon.title",
    defaultTitle: "Peluquería & Mujer",
    subtitleKey: "sections.salon.subtitle",
    defaultSubtitle: "Secadores, planchas y tratamientos",
    href: "/categorias/secadores-profesionales",
    image: "/images/section-salon.webp",
    fallback: "/images/section-salon.jpg",
    accent: "#D4956A",
  },
  {
    titleKey: "sections.mixed.title",
    defaultTitle: "Salón Mixto",
    subtitleKey: "sections.mixed.subtitle",
    defaultSubtitle: "Mobiliario y equipamiento",
    href: "/categorias/capas-y-delantales",
    image: "/images/section-mixto.webp",
    fallback: "/images/section-mixto.jpg",
    accent: "#8BAF7C",
  },
];

const shortcuts = [
  {
    icon: Scissors,
    labelKey: "sections.iconCards.clippers",
    defaultLabel: "Cortadoras",
    countKey: "sections.iconCards.clippersCount",
    defaultCount: "82+ modelos",
    descKey: "sections.iconCards.clippersDesc",
    defaultDesc: "Para cortes precisos",
    href: "/categorias/clippers",
    accent: "#C4A97D",
  },
  {
    icon: Zap,
    labelKey: "sections.iconCards.trimmers",
    defaultLabel: "Perfiladoras",
    countKey: "sections.iconCards.trimmersCount",
    defaultCount: "63+ modelos",
    descKey: "sections.iconCards.trimmersDesc",
    defaultDesc: "Perfilado perfecto",
    href: "/categorias/trimmers",
    accent: "#D4956A",
  },
  {
    icon: Armchair,
    labelKey: "sections.iconCards.furniture",
    defaultLabel: "Mobiliario",
    countKey: "sections.iconCards.furnitureCount",
    defaultCount: "40+ opciones",
    descKey: "sections.iconCards.furnitureDesc",
    defaultDesc: "Diseña tu espacio",
    href: "/categorias/sillones-de-barbero-hidraulico",
    accent: "#8BAF7C",
  },
];

const PhotoSections = () => {
  const { t } = useLanguage();

  return (
    <section
      className="py-12 md:py-16 px-4 md:px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #1a1008 0%, #2D2218 100%)" }}
    >
      {/* Gold accent line top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D, transparent)" }}
      />

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

        {/* Shortcuts row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <motion.div
                key={sc.href}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={sc.href}
                  className="flex flex-col gap-3 py-5 px-4 rounded-xl transition-all group relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${sc.accent}20`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${sc.accent}08`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${sc.accent}35`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLElement).style.borderColor = `${sc.accent}20`;
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${sc.accent}12 0%, transparent 70%)` }}
                  />
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: `${sc.accent}15`, border: `1px solid ${sc.accent}25` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: sc.accent }} strokeWidth={1.5} />
                    </div>
                    <span
                      className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                      style={{ color: sc.accent, background: `${sc.accent}15` }}
                    >
                      {t(sc.countKey) || sc.defaultCount}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#F5F0E8" }}>
                      {t(sc.labelKey) || sc.defaultLabel}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#F5F0E8", opacity: 0.45 }}>
                      {t(sc.descKey) || sc.defaultDesc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PhotoSections;
