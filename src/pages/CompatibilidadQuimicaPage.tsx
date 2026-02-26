import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import ChemicalCompatibilityAnalyzer from "@/components/ChemicalCompatibilityAnalyzer";

export default function CompatibilidadQuimicaPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t("quimica.pageTitle")}</title>
        <meta name="description" content={t("quimica.pageDesc")} />
        <link rel="canonical" href="https://guiadelsalon.com/compatibilidad-quimica" />
      </Helmet>

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #C4A97D 0%, transparent 50%), radial-gradient(circle at 75% 50%, #C4A97D 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D] mb-4">
              {t("quimica.heroBadge")}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E8] mb-6 leading-tight">
              {t("quimica.heroTitle")}
              <span className="block text-[#C4A97D]">
                {t("quimica.heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-[#F5F0E8]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {t("quimica.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <ChemicalCompatibilityAnalyzer />
      </div>
    </>
  );
}
