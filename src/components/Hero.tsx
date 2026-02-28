import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t, lang } = useLanguage();

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-5 py-20 md:py-28"
      style={{ background: "#2D2218" }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="font-display font-bold text-[#F5F0E8] leading-[1.08] mb-5"
          style={{ fontSize: "clamp(2.2rem, 7vw, 3.4rem)" }}
        >
          {lang === "es"
            ? "El catálogo profesional que tu salón necesita"
            : "The professional catalog your salon needs"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-[#F5F0E8]/60 text-sm md:text-base mb-8 leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >
          <Link
            to="/categorias"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm transition-all active:scale-95"
            style={{ background: "#C4A97D", color: "#2D2218" }}
          >
            {lang === "es" ? "Acceso al Desarrollo" : "Explore Catalog"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
