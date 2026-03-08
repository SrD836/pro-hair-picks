import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Dna, Activity, Stethoscope, Pill } from "lucide-react";
import AlopeciaAnalyzer from "@/components/AlopeciaAnalyzer";
import AlopeciaExpertVerdict from "@/components/AlopeciaExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { useState } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "Piraccini, B.M. & Alessandrini, A. (2024). Androgenetic alopecia. N. Engl. J. Med., 390(11), 1020–1029." },
  { id: 2, text: "Heilmann-Heimbach, S. et al. (2022). Genetics of androgenetic alopecia. J. Invest. Dermatol., 142(3), 513–519." },
  { id: 3, text: "Almohanna, H.M. et al. (2019). The Role of Vitamins and Minerals in Hair Loss. Dermatol. Ther. (Heidelb), 9, 51–70." },
  { id: 4, text: "Cranwell, W. & Sinclair, R. (2023). Male and female pattern hair loss. Endotext." },
];

const MODULES = [
  { icon: Dna, title: "Genética familiar", desc: "Herencia paterna y materna" },
  { icon: Activity, title: "Biología capilar", desc: "DHT, folículo y ciclo de crecimiento" },
  { icon: Stethoscope, title: "Hábitos de salud", desc: "Estrés, dieta, cuero cabelludo" },
  { icon: Pill, title: "Tratamientos", desc: "Minoxidil, finasterida, PRP y más" },
];

export default function AlopeciaAnalyzerPage() {
  const [started, setStarted] = useState(false);
  const { isWizardMode, completeWizardModule } = useWizardReturn('analizador-alopecia');

  const handleWizardComplete = (summary: string, score?: number) => {
    completeWizardModule({ summary, score, rawResult: { summary } });
  };

  return (
    <>
      <SEOHead
        title="Analizador de Riesgo de Alopecia — GuiaDelSalon"
        description="¿Perderé el pelo? Análisis de riesgo de alopecia basado en genética, biología y factores modificables."
      />

      <div className="min-h-screen bg-background-light">
        {!started ? (
          <>
            <ToolHeader
              badge="TRICOLOGÍA"
              title={<>Analizador de Riesgo <span className="text-accent-orange">de Alopecia</span></>}
              subtitle="¿Perderé el pelo? La genética, la biología y los factores modificables — explicados sin rodeos."
              microTrust="~6 min · Sin registro · Tricología · Genética · Evidencia"
              onStart={() => setStarted(true)}
              startLabel="Analizar mi riesgo →"
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
              <AlopeciaAnalyzer wizardContinue={isWizardMode ? handleWizardComplete : undefined} />
              {!isWizardMode && <AlopeciaExpertVerdict />}
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
