import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="relative overflow-hidden flex items-center" style={{ minHeight: "92svh" }}>
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80&auto=format&fit=crop"
        srcSet="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=75&auto=format&fit=crop 800w, https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80&auto=format&fit=crop 1920w"
        sizes="100vw"
        alt="Peluquero profesional trabajando en un salón de peluquería"
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Multi-layer gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#110b05]/95 via-[#110b05]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#110b05]/60 via-transparent to-[#110b05]/20" />
      {/* Bottom gradient bridge into PhotoSections */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #1a1008)" }}
      />

      {/* Animated gold accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 bottom-0 w-1 origin-top"
        style={{ background: "linear-gradient(180deg, transparent, #C4A97D, transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8 flex justify-center"
        >
          <img
            src="/logo-160.webp"
            srcSet="/logo-160.webp 1x, /logo-240.webp 2x"
            alt="Guía del Salón"
            width={160}
            height={80}
            className="h-24 w-auto brightness-0 invert opacity-90 drop-shadow-[0_4px_24px_rgba(196,169,125,0.25)]"
            loading="eager"
            decoding="sync"
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
          style={{ background: "rgba(196,169,125,0.12)", border: "1px solid rgba(196,169,125,0.30)" }}
        >
          <Star className="w-3 h-3 fill-[#C4A97D] text-[#C4A97D]" />
          <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
            {t("hero.badge")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="font-display font-bold text-[#F5F0E8] leading-[1.04] mb-5"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)" }}
        >
          {lang === "es" ? (
            <>El catálogo que tu<br /><span style={{ color: "#C4A97D" }}>salón necesita</span></>
          ) : (
            <>The catalog your<br /><span style={{ color: "#C4A97D" }}>salon needs</span></>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38 }}
          className="text-[#F5F0E8]/65 text-sm md:text-base mb-9 leading-relaxed max-w-sm"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            to="/categorias"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(196,169,125,0.4)] group"
            style={{ background: "#C4A97D", color: "#2D2218" }}
          >
            {t("footer.ctaButton")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-5 mt-8"
        >
          {[
            { num: "431+", label: t("hero.productsAnalyzed").split(" ").slice(-1)[0] || (lang === "es" ? "Productos" : "Products") },
            { num: "47", label: t("hero.categories") },
            { num: "100%", label: lang === "es" ? "Gratis" : "Free" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="font-display font-bold text-[#C4A97D] text-lg leading-none">{stat.num}</span>
              <span className="text-[#F5F0E8]/40 text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
