import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Zap, Armchair } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// ---------------------------------------------------------------------------
// PhotoCard — row 1
// ---------------------------------------------------------------------------

interface PhotoCardProps {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  imageWebp: string;
  index: number;
}

function PhotoCard({ title, subtitle, href, imageSrc, imageWebp, index }: PhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer"
    >
      <Link to={href} className="block w-full h-full">
        <picture>
          <source srcSet={imageWebp} type="image/webp" />
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </picture>
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">{title}</h3>
          <span className="inline-flex items-center gap-1 text-secondary text-sm font-semibold">
            {subtitle}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// IconCard — row 2
// ---------------------------------------------------------------------------

interface IconCardProps {
  title: string;
  href: string;
  icon: React.ElementType;
  index: number;
}

function IconCard({ title, href, icon: Icon, index }: IconCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, borderColor: "rgba(196,169,125,0.5)", transition: { duration: 0.2 } }}
      className="rounded-2xl border border-secondary/15 bg-card p-6 flex flex-col items-center gap-3 cursor-pointer"
    >
      <Link to={href} className="flex flex-col items-center gap-3 w-full">
        <div className="p-3 rounded-xl bg-secondary/10">
          <Icon className="w-7 h-7 text-secondary" />
        </div>
        <span className="font-display text-base font-semibold text-foreground">{title}</span>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PhotoSections — main export
// ---------------------------------------------------------------------------

const PhotoSections = () => {
  const { t } = useLanguage();

  const photoCards = [
    {
      title: t("sections.barber.title"),
      subtitle: t("sections.barber.cta"),
      href: "/categorias/clippers",
      imageSrc: "/images/section-barber.jpg",
      imageWebp: "/images/section-barber.webp",
    },
    {
      title: t("sections.salon.title"),
      subtitle: t("sections.salon.cta"),
      href: "/categorias/secadores-profesionales",
      imageSrc: "/images/section-salon.jpg",
      imageWebp: "/images/section-salon.webp",
    },
    {
      title: t("sections.mixed.title"),
      subtitle: t("sections.mixed.cta"),
      href: "/categorias/capas-y-delantales",
      imageSrc: "/images/section-mixto.jpg",
      imageWebp: "/images/section-mixto.webp",
    },
  ];

  const iconCards = [
    { title: "Clippers",   href: "/categorias/clippers",                       icon: Scissors },
    { title: "Trimmers",   href: "/categorias/trimmers",                        icon: Zap },
    { title: "Furniture",  href: "/categorias/sillones-de-barbero-hidraulico",  icon: Armchair },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      {/* Section heading */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10"
      >
        Explore Categories
      </motion.h2>

      {/* Row 1 — photo cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {photoCards.map((card, i) => (
          <PhotoCard key={card.href} {...card} index={i} />
        ))}
      </div>

      {/* Row 2 — icon cards */}
      <div className="grid grid-cols-3 gap-4">
        {iconCards.map((card, i) => (
          <IconCard key={card.href} {...card} index={i} />
        ))}
      </div>
    </section>
  );
};

export default PhotoSections;
