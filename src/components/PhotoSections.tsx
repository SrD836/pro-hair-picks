import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const categories = [
  {
    titleKey: "sections.barber.title",
    defaultTitle: "Barbershop & Men",
    href: "/hombre",
    image: "/images/section-barber.webp",
    fallback: "/images/section-barber.jpg",
  },
  {
    titleKey: "sections.salon.title",
    defaultTitle: "Hair Salon & Women",
    href: "/mujer",
    image: "/images/section-salon.webp",
    fallback: "/images/section-salon.jpg",
  },
];

const PhotoSections = () => {
  const { t } = useLanguage();
  const exploreLabel = t("bento.explore") || "Explore";

  return (
    <section className="py-12 md:py-16 px-4 md:px-8" style={{ background: "#F5F0E8" }}>
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-3"
      >
        <h2
          className="font-display font-bold mb-1"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#2D2218" }}
        >
          {t("sections.exploreTitle") || "Explore Categorías"}
        </h2>
        <p className="text-xs" style={{ color: "#2D2218", opacity: 0.45 }}>
          {t("sections.subtitle") || "Finín a: 1px espresso borders, 12px border-radius."}
        </p>
      </motion.div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto mt-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.href}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #2D2218" }}
          >
            <Link to={cat.href} className="block group">
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <picture>
                  <source srcSet={cat.image} type="image/webp" />
                  <img
                    src={cat.fallback}
                    alt={t(cat.titleKey) || cat.defaultTitle}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </picture>
              </div>

              {/* Label */}
              <div className="p-3" style={{ background: "#F5F0E8" }}>
                <h3
                  className="font-display font-bold text-sm md:text-base mb-1 leading-tight"
                  style={{ color: "#2D2218" }}
                >
                  {t(cat.titleKey) || cat.defaultTitle}
                </h3>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                  style={{ color: "#C4A97D" }}
                >
                  {exploreLabel} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PhotoSections;
