import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Search, Beaker, AlertTriangle, Shield } from "lucide-react";
import InciChecker from "@/components/InciChecker";
import InciExpertVerdict from "@/components/InciExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useRef } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "SCCS (2023). Opinion on PPD and related substances in hair dye products.", url: "https://ec.europa.eu/health/scientific_committees/consumer_safety_en" },
  { id: 2, text: "CIR Expert Panel (2024). Safety Assessment of Cosmetic Ingredients.", url: "https://www.cir-safety.org/" },
  { id: 3, text: "ECHA (2023). REACH Regulation substance evaluations." },
  { id: 4, text: "FDA (2024). Cosmetic Ingredient Review Reports." },
];

const MODULES = [
  { icon: Search, title: { es: "Búsqueda individual", en: "Individual search" }, desc: { es: "Busca un ingrediente por nombre INCI", en: "Search by INCI name" } },
  { icon: Beaker, title: { es: "Escáner de lista INCI", en: "INCI list scanner" }, desc: { es: "Pega una lista completa para analizar", en: "Paste a full list to analyze" } },
  { icon: AlertTriangle, title: { es: "Perfiles de riesgo", en: "Risk profiles" }, desc: { es: "Embarazo, alergias, cuero sensible", en: "Pregnancy, allergies, sensitive scalp" } },
  { icon: Shield, title: { es: "Regulación UE", en: "EU regulation" }, desc: { es: "Restricciones y concentraciones máximas", en: "Restrictions and max concentrations" } },
];

export default function InciCheckerPage() {
  const { lang } = useLanguage();
  const [started, setStarted] = useState(false);
  const checkerRef = useRef<HTMLDivElement>(null);

  const title = lang === "es"
    ? "INCI-Check Profesional — Escáner de Ingredientes"
    : "Professional INCI-Check — Ingredient Scanner";
  const desc = lang === "es"
    ? "Analiza la seguridad de ingredientes cosméticos: PPD, sulfatos, parabenos, siliconas y más."
    : "Analyze the safety of cosmetic ingredients: PPD, sulfates, parabens, silicones and more.";

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => checkerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <>
      <SEOHead title={`${title} | GuiaDelSalon.com`} description={desc} />

      <div className="min-h-screen bg-espresso">
        <ToolHeader
          badge="SEGURIDAD"
          title={
            lang === "es"
              ? <>INCI-Check <span className="text-gold">Profesional</span></>
              : <>Professional <span className="text-gold">INCI-Check</span></>
          }
          subtitle={
            lang === "es"
              ? "Escáner de seguridad de ingredientes cosméticos con datos verificados de SCCS, CIR, ECHA y FDA."
              : "Cosmetic ingredient safety scanner with verified data from SCCS, CIR, ECHA and FDA."
          }
          microTrust={`~2 min · ${lang === "es" ? "Datos de SCCS, CIR, ECHA y FDA" : "SCCS, CIR, ECHA & FDA data"}`}
          onStart={handleStart}
          startLabel={lang === "es" ? "Analizar ingredientes →" : "Analyze ingredients →"}
        />

        {/* Module preview — big visual cards */}
        {!started && (
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
              {MODULES.map((m, i) => (
                <motion.div
                  key={m.title.es}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-gold/10 bg-gold/[0.03] hover:bg-gold/[0.06] transition-colors duration-300"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                    <m.icon className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <p className="font-semibold text-cream text-base mb-1">{m.title[lang as 'es' | 'en'] ?? m.title.es}</p>
                    <p className="text-cream/40 text-sm">{m.desc[lang as 'es' | 'en'] ?? m.desc.es}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <BibliographyDrawer references={REFERENCES} />
          </div>
        )}

        {/* Checker */}
        {started && (
          <div ref={checkerRef} className="py-12 md:py-16" style={{ background: "linear-gradient(180deg, #2D2218 0%, #F5F0E8 120px)" }}>
            <div className="container mx-auto px-6 md:px-8 max-w-3xl space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                <InciChecker />
              </motion.div>

              <InciExpertVerdict />
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
