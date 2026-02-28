import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Image category cards (Men, Women, Unisex) ──────────────────────────────

const imageSections = [
  {
    titleKey: "sections.barber.title",
    href: "/hombre",
    image: "/images/section-barber.webp",
    fallback: "/images/section-barber.jpg",
  },
  {
    titleKey: "sections.salon.title",
    href: "/mujer",
    image: "/images/section-salon.webp",
    fallback: "/images/section-salon.jpg",
  },
  {
    titleKey: "sections.mixed.title",
    href: "/mixto",
    image: "/images/section-mixto.webp",
    fallback: "/images/section-mixto.jpg",
  },
];

// ── Icon category cards ────────────────────────────────────────────────────

const iconCats = [
  {
    labelKey: "sections.iconCards.clippers",
    href: "/categorias/clippers",
    // Clipper outline
    svgPaths: [
      "M7 3 L7 13 M17 3 L17 13",
      "M5 13 Q5 21 12 21 Q19 21 19 13 L5 13Z",
      "M9 7 L15 7",
    ],
  },
  {
    labelKey: "sections.iconCards.trimmers",
    href: "/categorias/trimmers",
    svgPaths: [
      "M10 2 L10 16",
      "M14 2 L14 16",
      "M8 16 Q8 22 12 22 Q16 22 16 16",
      "M7 6 L17 6",
      "M7 10 L17 10",
    ],
  },
  {
    labelKey: "sections.iconCards.furniture",
    href: "/categorias/sillones-de-barbero-hidraulico",
    svgPaths: [
      "M5 10 L19 10",
      "M5 10 L3 18 M19 10 L21 18",
      "M8 10 L8 6 Q8 3 12 3 Q16 3 16 6 L16 10",
      "M9 18 L9 22 M15 18 L15 22",
    ],
  },
];

function ImageCategoryCard({
  section,
  index,
  title,
  exploreLabel,
}: {
  section: typeof imageSections[0];
  index: number;
  title: string;
  exploreLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="relative rounded-2xl overflow-hidden flex-shrink-0"
      style={{ minWidth: "62vw", width: "62vw", aspectRatio: "4/5" }}
    >
      <Link to={section.href} className="block w-full h-full">
        <picture>
          <source srcSet={section.image} type="image/webp" />
          <img
            src={section.fallback}
            alt={title}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </picture>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/90 via-[#110b05]/15 to-transparent" />
        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-2xl font-bold text-[#F5F0E8] mb-1 leading-tight">
            {title}
          </h3>
          <span className="inline-flex items-center gap-1 text-[#C4A97D] text-sm font-medium">
            {exploreLabel} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function IconCategoryCard({
  cat,
  index,
  label,
}: {
  cat: typeof iconCats[0];
  index: number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="rounded-2xl border border-[#C4A97D]/15 bg-[#2D2218] hover:border-[#C4A97D]/40 transition-colors"
    >
      <Link to={cat.href} className="flex flex-col items-center justify-center gap-3 p-5 h-full">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C4A97D"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {cat.svgPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
        <span className="font-display text-sm font-semibold text-[#F5F0E8] text-center leading-tight">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

const PhotoSections = () => {
  const { t } = useLanguage();
  const exploreLabel = t("bento.explore");

  const iconLabels = [
    t("sections.iconCards.clippers"),
    t("sections.iconCards.trimmers"),
    t("sections.iconCards.furniture"),
  ];

  return (
    <section className="py-10 md:py-14">
      {/* ── Section title ── */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] text-center px-4 mb-8"
      >
        {t("sections.exploreTitle")}
      </motion.h2>

      {/* ── Image cards — horizontal scroll on mobile ── */}
      <div
        className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-2 snap-x snap-mandatory scrollbar-none md:overflow-visible md:grid md:grid-cols-3 md:gap-4"
        style={{ scrollPaddingLeft: "1rem" }}
      >
        {imageSections.map((section, i) => (
          <div
            key={section.href}
            className="snap-start flex-shrink-0 md:flex-shrink md:min-w-0 md:w-auto"
            style={{ minWidth: "62vw", width: "62vw" }}
          >
            {/* Desktop: override mobile sizing */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="relative rounded-2xl overflow-hidden w-full"
              style={{ aspectRatio: "4/5" }}
            >
              <Link to={section.href} className="block w-full h-full">
                <picture>
                  <source srcSet={section.image} type="image/webp" />
                  <img
                    src={section.fallback}
                    alt={t(section.titleKey)}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/90 via-[#110b05]/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-2xl font-bold text-[#F5F0E8] mb-1 leading-tight">
                    {t(section.titleKey)}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[#C4A97D] text-sm font-medium">
                    {exploreLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ── Icon cards — always 3-col grid ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-8 mt-3 md:mt-4">
        {iconCats.map((cat, i) => (
          <IconCategoryCard
            key={cat.href}
            cat={cat}
            index={i}
            label={iconLabels[i]}
          />
        ))}
      </div>
    </section>
  );
};

export default PhotoSections;
