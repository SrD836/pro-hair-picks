import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Search, Beaker, AlertTriangle, Shield, ArrowRight } from "lucide-react";
import InciChecker from "@/components/InciChecker";
import InciExpertVerdict from "@/components/InciExpertVerdict";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "SCCS (2023). Opinion on PPD and related substances in hair dye products.", url: "https://ec.europa.eu/health/scientific_committees/consumer_safety_en" },
  { id: 2, text: "CIR Expert Panel (2024). Safety Assessment of Cosmetic Ingredients.", url: "https://www.cir-safety.org/" },
  { id: 3, text: "ECHA (2023). REACH Regulation substance evaluations." },
  { id: 4, text: "FDA (2024). Cosmetic Ingredient Review Reports." },
];

const MODULES = [
  { icon: Search, title: { es: "Búsqueda individual", en: "Individual search" }, desc: { es: "Busca un ingrediente por nombre INCI y obtén su ficha completa", en: "Search by INCI name and get the full safety card" } },
  { icon: Beaker, title: { es: "Escáner de lista INCI", en: "INCI list scanner" }, desc: { es: "Pega una lista completa de ingredientes para analizar el producto entero", en: "Paste a full ingredient list to analyze the whole product" } },
  { icon: AlertTriangle, title: { es: "Perfiles de riesgo", en: "Risk profiles" }, desc: { es: "Embarazo, alergias, cuero cabelludo sensible — alertas personalizadas", en: "Pregnancy, allergies, sensitive scalp — personalized alerts" } },
  { icon: Shield, title: { es: "Regulación UE", en: "EU regulation" }, desc: { es: "Restricciones REACH, concentraciones máximas y normativa vigente", en: "REACH restrictions, max concentrations and current regulations" } },
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

        {/* ── HERO ─────────────────────────────────────────────── */}
        {!started && (
          <div className="relative overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(196,169,125,0.06) 0%, transparent 70%)"
            }} />

            {/* Breadcrumb */}
            <div className="max-w-4xl mx-auto px-6 pt-8 pb-2">
              <nav className="flex items-center gap-1.5 text-xs text-cream/40">
                <Link to="/mi-pelo" className="hover:text-cream/70 transition-colors">Mi Pelo</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-cream/60">INCI-Check</span>
              </nav>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-8 pb-20">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                {/* Badge */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-8 border border-gold/20 bg-gold/5 text-gold">
                  {lang === "es" ? "SEGURIDAD COSMÉTICA" : "COSMETIC SAFETY"}
                </span>

                {/* Title */}
                <h1 className="font-display text-5xl md:text-7xl font-bold italic text-cream mb-6 leading-[1.05] tracking-tight">
                  {lang === "es" ? (
                    <>INCI-Check<br /><span className="text-gold">Profesional</span></>
                  ) : (
                    <>Professional<br /><span className="text-gold">INCI-Check</span></>
                  )}
                </h1>

                {/* Subtitle */}
                <p className="text-cream/50 text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-4">
                  {lang === "es"
                    ? "Escáner de seguridad de ingredientes cosméticos con datos verificados de fuentes científicas."
                    : "Cosmetic ingredient safety scanner with verified scientific data."
                  }
                </p>

                {/* Micro-trust */}
                <p className="text-cream/25 text-sm mb-12">
                  ~2 min · {lang === "es" ? "Datos SCCS, CIR, ECHA y FDA" : "SCCS, CIR, ECHA & FDA data"}
                </p>

                {/* CTA */}
                <button
                  onClick={handleStart}
                  className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-gold text-espresso font-bold text-lg hover:bg-gold-light transition-all duration-300 hover:shadow-[0_8px_40px_-8px_rgba(196,169,125,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  {lang === "es" ? "Analizar ingredientes" : "Analyze ingredients"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>

            {/* ── MODULE CARDS ─────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.title.es}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative p-8 md:p-10 rounded-3xl border border-gold/[0.08] bg-gold/[0.02] hover:bg-gold/[0.05] hover:border-gold/20 transition-all duration-500 cursor-default"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10 group-hover:bg-gold/15 transition-colors duration-300">
                        <m.icon className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-cream text-base mb-1.5">
                          {m.title[lang as 'es' | 'en'] ?? m.title.es}
                        </p>
                        <p className="text-cream/35 text-sm leading-relaxed">
                          {m.desc[lang as 'es' | 'en'] ?? m.desc.es}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <BibliographyDrawer references={REFERENCES} />
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKER ──────────────────────────────────────────── */}
        {started && (
          <div ref={checkerRef}>
            {/* Transition gradient from espresso to cream */}
            <div className="pt-8 pb-16 md:pb-20" style={{
              background: "linear-gradient(180deg, #2D2218 0%, #F5F0E8 200px)"
            }}>
              <div className="max-w-3xl mx-auto px-6 space-y-16">
                {/* Back link */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setStarted(false)}
                  className="text-cream/40 hover:text-cream text-sm transition-colors"
                >
                  ← {lang === "es" ? "Volver" : "Back"}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <InciChecker />
                </motion.div>

                <InciExpertVerdict />

                <div className="flex justify-center pb-8">
                  <BibliographyDrawer references={REFERENCES} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
