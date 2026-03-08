import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Dna, Activity, Stethoscope, Pill } from "lucide-react";
import AlopeciaAnalyzer from "@/components/AlopeciaAnalyzer";
import AlopeciaExpertVerdict from "@/components/AlopeciaExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
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

  return (
    <>
      <SEOHead
        title="Analizador de Riesgo de Alopecia — GuiaDelSalon"
        description="¿Perderé el pelo? Análisis de riesgo de alopecia basado en genética, biología y factores modificables."
      />

      <div className="min-h-screen bg-espresso">
        {!started ? (
          <>
            <ToolHeader
              badge="TRICOLOGÍA"
              title={<>Analizador de Riesgo <span className="text-gold">de Alopecia</span></>}
              subtitle="¿Perderé el pelo? La genética, la biología y los factores modificables — explicados sin rodeos."
              microTrust="~6 min · Sin registro · Tricología · Genética · Evidencia"
              onStart={() => setStarted(true)}
              startLabel="Analizar mi riesgo →"
            />

            <div className="max-w-3xl mx-auto px-6 py-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-gold/10 bg-gold/[0.03] hover:bg-gold/[0.06] transition-colors duration-300"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                      <m.icon className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-cream text-base mb-1">{m.title}</p>
                      <p className="text-cream/40 text-sm">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </>
        ) : (
          <div className="bg-background-light min-h-screen">
            <div className="container mx-auto px-6 py-16">
              <AlopeciaAnalyzer />
            </div>
            <AlopeciaExpertVerdict />
            <div className="container mx-auto px-6 pb-16">
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
