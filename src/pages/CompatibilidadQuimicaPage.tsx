import { SEOHead } from "@/components/seo/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import ChemicalCompatibilityAnalyzer from "@/components/ChemicalCompatibilityAnalyzer";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function CompatibilidadQuimicaPage() {
  const { t } = useLanguage();
  const [started, setStarted] = useState(false);
  const analyzerRef = useRef<HTMLDivElement>(null);
  const { isWizardMode, completeWizardModule } = useWizardReturn('compatibilidad-quimica');

  const handleWizardComplete = (summary: string) => {
    completeWizardModule({ summary, rawResult: { summary } });
  };

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => analyzerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <>
      <SEOHead
        title={t("quimica.pageTitle")}
        description={t("quimica.pageDesc")}
      />

      <div className="min-h-screen bg-background-light">
        {!started ? (
          <ToolHeader
            badge="QUÍMICA"
            title={<>{t("quimica.heroTitle")} <span className="text-accent-orange">{t("quimica.heroTitleHighlight")}</span></>}
            subtitle={t("quimica.heroSubtitle")}
            microTrust="~2 min · Sin registro · Datos verificados"
            onStart={handleStart}
            startLabel={`${t("quimica.heroBadge")} →`}
          />
        ) : (
          <div ref={analyzerRef} className="bg-background-light min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-12">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStarted(false)}
                className="text-espresso/40 hover:text-espresso text-sm transition-colors mb-8"
              >
                ← Volver
              </motion.button>
              <ChemicalCompatibilityAnalyzer />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
