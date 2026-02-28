import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="relative overflow-hidden flex items-end" style={{ minHeight: "92svh" }}>
      {/* Background image — full bleed */}
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/images/hero-barbershop-mobile.webp"
          type="image/webp"
        />
        <source srcSet="/images/hero-barbershop.webp" type="image/webp" />
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

      {/* Gradient: dark from bottom, transparent top */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/95 via-[#110b05]/55 to-transparent" />

      {/* Content — bottom-left aligned */}
      <div className="relative z-10 w-full px-5 pb-12 pt-32 md:pb-20 md:px-14 max-w-2xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C4A97D]/35 bg-[#C4A97D]/10 mb-5 backdrop-blur-sm"
        >
          <span className="text-[#C4A97D] text-xs">🏆</span>
          <span className="text-[#F5F0E8]/90 text-xs font-medium tracking-wide">
            {t("hero.badge")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="font-display font-bold text-[#F5F0E8] leading-[1.06] mb-5"
          style={{ fontSize: "clamp(2.4rem, 8vw, 4rem)" }}
        >
          {lang === "es"
            ? "El catálogo profesional que tu salón necesita"
            : "The professional catalog your salon needs"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#F5F0E8]/65 text-sm md:text-base mb-8 leading-relaxed max-w-sm"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <Link
            to="/categorias"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C4A97D] text-[#2D2218] font-bold text-sm hover:bg-[#d4b98d] active:scale-95 transition-all"
          >
            {lang === "es" ? "Explorar Catálogo" : "Explore Catalog"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
