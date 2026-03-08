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
              subtitle="¿Perderé el pelo? La genética, la biología y los factores modificables de tu calvicie — explicados sin rodeos."
              microTrust="~6 min · Sin registro · Tricología · Genética · Evidencia"
              onStart={() => setStarted(true)}
              startLabel="Analizar mi riesgo →"
            />

            <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: Dna, title: "Genética familiar", desc: "Herencia paterna y materna" },
                  { icon: Activity, title: "Biología capilar", desc: "DHT, folículo y ciclo de crecimiento" },
                  { icon: Stethoscope, title: "Hábitos de salud", desc: "Estrés, dieta, cuero cabelludo" },
                  { icon: Pill, title: "Tratamientos", desc: "Minoxidil, finasterida, PRP y más" },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-4 p-5 rounded-xl border border-gold/20 bg-espresso/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold shrink-0">
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-cream text-sm">{m.title}</p>
                      <p className="text-cream/50 text-xs mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </>
        ) : (
          <div className="bg-background-light min-h-screen">
            <div className="container mx-auto px-4 py-12">
              <AlopeciaAnalyzer />
            </div>
            <AlopeciaExpertVerdict />
            <div className="container mx-auto px-4 pb-12">
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
