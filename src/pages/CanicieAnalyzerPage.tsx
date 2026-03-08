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
        description="Descubre si tu canicie tiene origen genético, ambiental o mixto. Diagnóstico basado en biología del melanocito."
      />

      <div className="min-h-screen bg-espresso">
        {!started ? (
          <>
            <ToolHeader
              badge="CIENTÍFICO"
              title={<>Analizador de <span className="text-gold">Salud del Melanocito</span></>}
              subtitle="Diagnóstico basado en biología real. Sin promesas de inversión de la canicie establecida. Solo honestidad científica y recomendaciones que puedes actuar hoy."
              microTrust="~5 min · Sin registro · Basado en evidencia A/B/C"
              onStart={() => setStarted(true)}
              startLabel="Comenzar análisis →"
            />

            <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: Dna, title: "Factores genéticos", desc: "Historial familiar y predisposición" },
                  { icon: Brain, title: "Factores biológicos", desc: "Estrés oxidativo y melanocitos" },
                  { icon: Sun, title: "Factores externos", desc: "UV, tabaco, contaminación" },
                  { icon: Utensils, title: "Nutrición", desc: "Déficits de B12, hierro, cobre, zinc" },
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
            <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
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
