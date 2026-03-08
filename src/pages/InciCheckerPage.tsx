import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Search, Beaker, AlertTriangle, Shield } from "lucide-react";
import InciChecker from "@/components/InciChecker";
import InciExpertVerdict from "@/components/InciExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useState, useRef } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "SCCS (2023). Opinion on PPD and related substances in hair dye products.", url: "https://ec.europa.eu/health/scientific_committees/consumer_safety_en" },
  { id: 2, text: "CIR Expert Panel (2024). Safety Assessment of Cosmetic Ingredients.", url: "https://www.cir-safety.org/" },
  { id: 3, text: "ECHA (2023). REACH Regulation substance evaluations." },
  { id: 4, text: "FDA (2024). Cosmetic Ingredient Review Reports." },
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
              ? "Escáner de seguridad de ingredientes cosméticos con datos verificados de SCCS, CIR, ECHA y FDA (2022–2026)."
              : "Cosmetic ingredient safety scanner with verified data from SCCS, CIR, ECHA and FDA (2022–2026)."
          }
          microTrust={`~2 min · Sin registro · ${lang === "es" ? "Datos de SCCS, CIR, ECHA y FDA" : "SCCS, CIR, ECHA & FDA data"}`}
          onStart={handleStart}
          startLabel={lang === "es" ? "Analizar ingredientes →" : "Analyze ingredients →"}
        />

        {/* Module preview */}
        {!started && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { icon: Search, title: lang === "es" ? "Búsqueda individual" : "Individual search", desc: lang === "es" ? "Busca un ingrediente por nombre INCI" : "Search by INCI name" },
                { icon: Beaker, title: lang === "es" ? "Escáner de lista INCI" : "INCI list scanner", desc: lang === "es" ? "Pega una lista completa para analizar" : "Paste a full list to analyze" },
                { icon: AlertTriangle, title: lang === "es" ? "Perfiles de riesgo" : "Risk profiles", desc: lang === "es" ? "Embarazo, alergias, cuero sensible" : "Pregnancy, allergies, sensitive scalp" },
                { icon: Shield, title: lang === "es" ? "Regulación UE" : "EU regulation", desc: lang === "es" ? "Restricciones y concentraciones máximas" : "Restrictions and max concentrations" },
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
        )}

        {/* Checker */}
        {started && (
          <div ref={checkerRef} className="py-10 md:py-14" style={{ background: "linear-gradient(180deg, #2D2218 0%, #F5F0E8 120px)" }}>
            <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                <InciChecker />
              </motion.div>

              {/* Risk legend */}
              <div className="flex flex-wrap gap-4 text-xs text-espresso/65">
                <span className="font-semibold text-espresso/40 uppercase tracking-wider text-[10px]">Leyenda:</span>
                {[["🔴", "Evitar — riesgo documentado"], ["🟡", "Precaución — condición específica"], ["🟢", "Sin restricción especial"]].map(([emoji, label]) => (
                  <span key={label} className="flex items-center gap-1.5"><span>{emoji}</span><span>{label}</span></span>
                ))}
              </div>

              <InciExpertVerdict />
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
