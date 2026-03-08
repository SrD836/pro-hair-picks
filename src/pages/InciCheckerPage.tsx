import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Search, Beaker, AlertTriangle, Shield } from "lucide-react";
import InciChecker from "@/components/InciChecker";
import InciExpertVerdict from "@/components/InciExpertVerdict";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useRef } from "react";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";

const REFERENCES: BibReference[] = [
  { id: 1, text: "SCCS (2023). Opinion on PPD and related substances in hair dye products.", url: "https://ec.europa.eu/health/scientific_committees/consumer_safety_en" },
  { id: 2, text: "CIR Expert Panel (2024). Safety Assessment of Cosmetic Ingredients.", url: "https://www.cir-safety.org/" },
  { id: 3, text: "ECHA (2023). REACH Regulation substance evaluations." },
  { id: 4, text: "FDA (2024). Cosmetic Ingredient Review Reports." },
];

const MODULES = [
  { icon: Search, title: { es: "Búsqueda individual", en: "Individual search" }, desc: { es: "Busca un ingrediente por nombre INCI", en: "Search by INCI name" } },
  { icon: Beaker, title: { es: "Escáner de lista INCI", en: "INCI list scanner" }, desc: { es: "Pega una lista completa de ingredientes", en: "Paste a full ingredient list" } },
  { icon: AlertTriangle, title: { es: "Perfiles de riesgo", en: "Risk profiles" }, desc: { es: "Embarazo, alergias, cuero cabelludo sensible", en: "Pregnancy, allergies, sensitive scalp" } },
  { icon: Shield, title: { es: "Regulación UE", en: "EU regulation" }, desc: { es: "Restricciones REACH y normativa vigente", en: "REACH restrictions and current regulations" } },
];

export default function InciCheckerPage() {
  const { lang } = useLanguage();
  const [started, setStarted] = useState(false);
  const checkerRef = useRef<HTMLDivElement>(null);

  const title = lang === "es" ? "INCI-Check Profesional" : "Professional INCI-Check";
  const desc = lang === "es"
    ? "Analiza la seguridad de ingredientes cosméticos con datos verificados."
    : "Analyze the safety of cosmetic ingredients with verified data.";

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => checkerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <>
      <SEOHead title={`${title} | GuiaDelSalon.com`} description={desc} />

      <div className="min-h-screen bg-background-light">
        {!started ? (
          <>
            <ToolHeader
              badge={lang === "es" ? "SEGURIDAD COSMÉTICA" : "COSMETIC SAFETY"}
              title={<>INCI-Check <span className="text-accent-orange">{lang === "es" ? "Profesional" : "Professional"}</span></>}
              subtitle={lang === "es"
                ? "Escáner de seguridad de ingredientes cosméticos con datos verificados de fuentes científicas."
                : "Cosmetic ingredient safety scanner with verified scientific data."}
              microTrust={`~2 min · ${lang === "es" ? "Datos SCCS, CIR, ECHA y FDA" : "SCCS, CIR, ECHA & FDA data"}`}
              onStart={handleStart}
              startLabel={lang === "es" ? "Analizar ingredientes →" : "Analyze ingredients →"}
            />

            <div className="max-w-3xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.title.es}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-espresso/8 bg-white hover:shadow-bento transition-all duration-300"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
                      <m.icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-espresso text-base mb-1">
                        {m.title[lang as 'es' | 'en'] ?? m.title.es}
                      </p>
                      <p className="text-espresso/40 text-sm">
                        {m.desc[lang as 'es' | 'en'] ?? m.desc.es}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </>
        ) : (
          <div ref={checkerRef} className="bg-background-light min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStarted(false)}
                className="text-espresso/40 hover:text-espresso text-sm transition-colors"
              >
                ← {lang === "es" ? "Volver" : "Back"}
              </motion.button>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <InciChecker />
              </motion.div>

              <InciExpertVerdict />

              <div className="flex justify-center pb-8">
                <BibliographyDrawer references={REFERENCES} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
