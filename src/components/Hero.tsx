import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
      {/* Background image — responsive picture */}
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/images/hero-barbershop-mobile.webp"
          type="image/webp"
        />
        <source
          srcSet="/images/hero-barbershop.webp"
          type="image/webp"
        />
        <img
          src="/images/hero-barbershop.webp"
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>

      {/* Left-to-right espresso overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/20" />

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-xs font-semibold uppercase tracking-widest">{t("hero.badge")}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.05]"
          >
            {t("hero.titleWords").split(",").join(" ")}{" "}
            <span className="shimmer-gold">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.titleEnd")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link
              to="/categorias/clippers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 transition-colors group"
            >
              {lang === "es" ? "Explorar catálogo" : "Explore Catalog"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
