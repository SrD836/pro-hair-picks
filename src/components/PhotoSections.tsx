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
  {
    titleKey: "sections.mixed.title",
    defaultTitle: "Mixto & Unisex",
    href: "/categorias",
    image: "/images/section-mixto.webp",
    fallback: "/images/section-mixto.jpg",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const PhotoSections = () => {
  const { t } = useLanguage();
  const exploreLabel = t("bento.explore") || "Explorar";

  return (
    <section className="py-16 md:py-24 px-4 md:px-8" style={{ background: "linear-gradient(180deg, #2D2218 0%, #3E2D1F 100%)" }}>
      {/* Title */}
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
          {t("sections.exploreTitle") || "Explora Categorías"}
        </h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#C4A97D", opacity: 0.7 }}>
          {t("sections.subtitle") || "Todo lo que tu salón necesita, organizado para ti."}
        </p>
      </motion.div>

      {/* 3-column grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.href}
            variants={cardVariants}
            className="group relative rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-[3/4]"
          >
            <Link to={cat.href} className="block w-full h-full">
              {/* Image */}
              <picture>
                <source srcSet={cat.image} type="image/webp" />
                <img
                  src={cat.fallback}
                  alt={t(cat.titleKey) || cat.defaultTitle}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
              </picture>

              {/* Glassmorphism overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D2218]/80 via-[#2D2218]/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/10">
                  <h3
                    className="font-display font-bold text-lg md:text-xl mb-2 leading-tight text-[#F5F0E8]"
                  >
                    {t(cat.titleKey) || cat.defaultTitle}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C4A97D] group-hover:gap-3 transition-all duration-300"
                  >
                    {exploreLabel} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default PhotoSections;
