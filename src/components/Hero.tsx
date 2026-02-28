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

      {/* Uniform dark overlay — centre-weighted vignette */}
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(45,34,24,0.55)_100%)]" />

      <div className="container mx-auto px-4 py-24 md:py-36 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary text-xs font-semibold uppercase tracking-widest">{t("hero.badge")}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.05] max-w-3xl"
        >
          {t("hero.titleWords").split(",").join(" ")}{" "}
          <span className="shimmer-gold">{t("hero.titleHighlight")}</span>{" "}
          {t("hero.titleEnd")}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          <Link
            to="/categorias/clippers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 transition-colors group"
          >
            {lang === "es" ? "Explorar catálogo" : "Explore Catalog"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
