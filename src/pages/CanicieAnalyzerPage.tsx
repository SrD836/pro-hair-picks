import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Brain, Dna, Sun, Utensils } from "lucide-react";
import CanicieAnalyzer from "@/components/CanicieAnalyzer";
import CanicieExpertVerdict from "@/components/CanicieExpertVerdict";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useState } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "Tobin, D.J. (2021). The biology of hair pigmentation. Exp. Dermatol., 30(S1), 8–12." },
  { id: 2, text: "Kumar, A.B. et al. (2018). Premature Graying of Hair: Review with Updates. Int. J. Trichology, 10(5), 198–203." },
  { id: 3, text: "Shi, Y. et al. (2021). Oxidative stress, melanocyte stem cells, and canities. J. Invest. Dermatol., 141(4), 767–770." },
];

const MODULES = [
  { icon: Dna, title: "Factores genéticos", desc: "Historial familiar y predisposición" },
  { icon: Brain, title: "Factores biológicos", desc: "Estrés oxidativo y melanocitos" },
  { icon: Sun, title: "Factores externos", desc: "UV, tabaco, contaminación" },
  { icon: Utensils, title: "Nutrición", desc: "Déficits de B12, hierro, cobre, zinc" },
];

export default function CanicieAnalyzerPage() {
  const { isWizardMode, completeWizardModule } = useWizardReturn('analizador-canicie');
  const [started, setStarted] = useState(false);

  const handleWizardComplete = (summary: string, score?: number) => {
    completeWizardModule({ summary, score, rawResult: { summary } });
  };

  return (
    <>
      <SEOHead
        title="Analizador de Canicie — GuiaDelSalon"
        description="Descubre si tu canicie tiene origen genético, ambiental o mixto."
      />

      <div className="min-h-screen bg-background-light">
        {!started ? (
          <>
            <ToolHeader
              badge="CIENTÍFICO"
              title={<>Analizador de <span className="text-accent-orange">Salud del Melanocito</span></>}
              subtitle="Diagnóstico basado en biología real. Sin promesas de inversión de la canicie establecida. Solo honestidad científica."
              microTrust="~5 min · Sin registro · Evidencia A/B/C"
              onStart={() => setStarted(true)}
              startLabel="Comenzar análisis →"
            />

            <div className="max-w-3xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-espresso/8 bg-white hover:shadow-bento transition-all duration-300"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
                      <m.icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-espresso text-base mb-1">{m.title}</p>
                      <p className="text-espresso/40 text-sm">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </>
        ) : (
          <div className="bg-background-light min-h-screen">
            <div className="container mx-auto px-6 py-12 max-w-3xl space-y-12">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStarted(false)}
                className="text-espresso/40 hover:text-espresso text-sm transition-colors"
              >
                ← Volver
              </motion.button>
              <CanicieAnalyzer wizardContinue={isWizardMode ? handleWizardComplete : undefined} />
              {!isWizardMode && <CanicieExpertVerdict />}
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
