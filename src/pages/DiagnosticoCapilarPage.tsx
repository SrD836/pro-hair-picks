import { useState, useCallback, useMemo } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Droplets, Activity, ScanSearch, FlaskConical, ExternalLink,
  RotateCcw, ArrowRight, Download, Check,
} from "lucide-react";
import { generateDiagnosticoPDF } from "@/lib/pdfGenerators";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  QUESTIONS, calculateScores, getRiskLevel, getProductRecommendations,
  type RiskLevel, type ScoreBreakdown, type Product,
} from "@/lib/diagnosticoCapilarEngine";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { DimensionCard } from "@/components/mi-pelo/shared/DimensionCard";

import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { MiniExpertTip } from "@/components/mi-pelo/shared/MiniExpertTip";
import { WizardShell } from "@/components/mi-pelo/shared/WizardShell";
import { NavigationBar } from "@/components/mi-pelo/shared/NavigationBar";
import { CizuraCTA } from "@/components/mi-pelo/shared/CizuraCTA";

/* ── Image map per question ─────────────────────── */
const QUESTION_IMAGES: Record<string, Record<string, string>> = {
  q1_1: { // Test del Tacto Proximal-Distal
    A: "/images/diagnostico/dc_tacto_a.jpg",
    B: "/images/diagnostico/dc_tacto_b.jpg",
    C: "/images/diagnostico/dc_tacto_c.jpg",
    D: "/images/diagnostico/dc_tacto_d.jpg",
  },
  q1_2: { // Índice de Brillo Visual
    A: "/images/diagnostico/dc_brillo_a.jpg",
    B: "/images/diagnostico/dc_brillo_b.jpg",
    C: "/images/diagnostico/dc_brillo_c.jpg",
    D: "/images/diagnostico/dc_brillo_d.jpg",
  },
  q2_1: { // Test de Flotación
    A: "/images/diagnostico/dc_flotacion_a.jpg",
    B: "/images/diagnostico/dc_flotacion_b.jpg",
    C: "/images/diagnostico/dc_flotacion_c.jpg",
    D: "/images/diagnostico/dc_flotacion_d.jpg",
  },
  q2_2: { // Velocidad de Absorción
    A: "/images/diagnostico/dc_absorcion_a.jpg",
    B: "/images/diagnostico/dc_absorcion_b.jpg",
    C: "/images/diagnostico/dc_absorcion_c.jpg",
    D: "/images/diagnostico/dc_absorcion_d.jpg",
  },
  q2_3: { // Historial de Tratamientos Oxidativos
    A: "/images/diagnostico/dc_historial_a.jpg",
    B: "/images/diagnostico/dc_historial_b.jpg",
    C: "/images/diagnostico/dc_historial_c.jpg",
    D: "/images/diagnostico/dc_historial_d.jpg",
    E: "/images/diagnostico/dc_historial_e.jpg",
  },
  q3_1: { // Test de Elasticidad en Mojado
    A: "/images/diagnostico/dc_elasticidad_a.jpg",
    B: "/images/diagnostico/dc_elasticidad_b.jpg",
    C: "/images/diagnostico/dc_elasticidad_c.jpg",
    D: "/images/diagnostico/dc_elasticidad_d.jpg",
  },
  q3_2: { // Exposición al Calor
    A: "/images/diagnostico/dc_calor_a.jpg",
    B: "/images/diagnostico/dc_calor_b.jpg",
    C: "/images/diagnostico/dc_calor_c.jpg",
    D: "/images/diagnostico/dc_calor_d.jpg",
  },
  q3_3: { // Rotura Mecánica
    A: "/images/diagnostico/dc_rotura_a.jpg",
    B: "/images/diagnostico/dc_rotura_b.jpg",
    C: "/images/diagnostico/dc_rotura_c.jpg",
    D: "/images/diagnostico/dc_rotura_d.jpg",
  },
  q4_1: { // Producción de Sebo
    A: "/images/diagnostico/dc_sebo_a.jpg",
    B: "/images/diagnostico/dc_sebo_b.jpg",
    C: "/images/diagnostico/dc_sebo_c.jpg",
    D: "/images/diagnostico/dc_sebo_d.jpg",
  },
  q4_2: { // Barrera del Cuero Cabelludo
    A: "/images/diagnostico/dc_barrera_a.jpg",
    B: "/images/diagnostico/dc_barrera_b.jpg",
    C: "/images/diagnostico/dc_barrera_c.jpg",
    D: "/images/diagnostico/dc_barrera_d.jpg",
  },
  q4_3: { // Productos y pH
    A: "/images/diagnostico/dc_productos_a.jpg",
    B: "/images/diagnostico/dc_productos_b.jpg",
    C: "/images/diagnostico/dc_productos_c.jpg",
  },
  q4_4: { // Frecuencia de Lavado
    A: "/images/diagnostico/dc_lavado_a.jpg",
    B: "/images/diagnostico/dc_lavado_b.jpg",
    C: "/images/diagnostico/dc_lavado_c.jpg",
    D: "/images/diagnostico/dc_lavado_d.jpg",
  },
};

const STEP_LABELS = [
  "Test del tacto", "Brillo visual", "Test de flotación", "Absorción",
  "Historial químico", "Elasticidad", "Calor", "Rotura mecánica",
  "Sebo", "Barrera", "Productos", "Frecuencia lavado",
];

function getSessionId(): string {
  const key = "diag_session_id";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

type Screen = "intro" | "quiz" | "results";
const TOTAL_SCORE_MAX = 65;

const MODULE_ICONS: Record<1 | 2 | 3 | 4, LucideIcon> = { 1: Layers, 2: Droplets, 3: Activity, 4: ScanSearch };
const MODULE_LABELS: Record<1 | 2 | 3 | 4, string> = { 1: "cuticleModule", 2: "porosityModule", 3: "elasticityModule", 4: "scalpModule" };
const MODULE_QUOTES: Record<1 | 2 | 3 | 4, string> = {
  1: "La cutícula es la primera línea de defensa del cabello.",
  2: "La porosidad determina cómo el cabello absorbe y retiene los productos.",
  3: "La elasticidad sana permite estirarse hasta un 30% sin romperse.",
  4: "El cuero cabelludo es el ecosistema de todo.",
};

const REFERENCES: BibReference[] = [
  { id: 1, text: "Gavazzoni Dias, M.F.R. et al. (2014). The Shampoo pH can Affect the Hair Fiber. Int. J. Trichology, 6(3), 95–99." },
  { id: 2, text: "Bolduc, C. & Shapiro, J. (2022). Hair care products. Surgical & Cosmetic Dermatology, 14(1), 4–14." },
  { id: 3, text: "Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair. Springer, 6th ed." },
  { id: 4, text: "Pinheiro, M.V. et al. (2025). Assessment of Hair Fiber Integrity. Cosmetics (MDPI), 12(3), 93." },
  { id: 5, text: "Society of Cosmetic Chemists (NYSCC). (2024). Hair Porosity and Elasticity. Annual Symposium." },
];

export default function DiagnosticoCapilarPage() {
  const { t, lang } = useLanguage();
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [scores, setScores] = useState<ScoreBreakdown | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { isWizardMode, completeWizardModule } = useWizardReturn("diagnostico-capilar");

  const q = QUESTIONS[currentQ];
  const selectedValue = answers[q?.id];
  const hasAnswer = selectedValue !== undefined;
  const isLastQ = currentQ === QUESTIONS.length - 1;
  const moduleOfQ = q?.module as 1 | 2 | 3 | 4 | undefined;
  const images = q ? QUESTION_IMAGES[q.id] : undefined;

  const localizedQ = q ? {
    ...q,
    text: t(`diagnostico.${q.id}Text`),
    protocol: q.protocol ? t(`diagnostico.${q.id}Protocol`) : undefined,
    options: q.options.map((opt) => ({ ...opt, label: t(`diagnostico.${q.id}${opt.value}`) })),
  } : q;

  const expertQuote = moduleOfQ !== undefined ? MODULE_QUOTES[moduleOfQ] : MODULE_QUOTES[1];

  const { damageScore } = useMemo(() => {
    const answered = Object.keys(answers).length;
    if (answered === 0) return { damageScore: 50 };
    const partial = calculateScores(answers).total;
    const proportionalMax = (answered / QUESTIONS.length) * TOTAL_SCORE_MAX;
    const score = Math.round(100 - Math.min(100, (partial / Math.max(1, proportionalMax)) * 100));
    return { damageScore: score };
  }, [answers]);

  const saveSession = useCallback(
    async (fa: Record<string, string>, fs: ScoreBreakdown, fr: RiskLevel, fp: Product[]) => {
      const sessionId = getSessionId();
      try {
        await (supabase.from as any)("hair_diagnostic_sessions").insert({
          user_session_id: sessionId,
          cuticle_score: fs.cuticle, porosity_score: fs.porosity,
          elasticity_score: fs.elasticity, scalp_score: fs.scalp,
          total_score: fs.total, risk_level: fr, answers: fa,
          product_recommendations: fp.map((p) => p.asin),
        });
      } catch { /* best-effort */ }
    }, [],
  );

  const goNext = useCallback(async () => {
    if (!hasAnswer) return;
    if (isLastQ) {
      const fa = { ...answers };
      const fs = calculateScores(fa);
      const fr = getRiskLevel(fs.total);
      const fp = getProductRecommendations(fr);
      setScores(fs); setRiskLevel(fr); setProducts(fp);
      await saveSession(fa, fs, fr, fp);
      setScreen("results");
    } else {
      setDirection(1); setCurrentQ((n) => n + 1);
    }
  }, [hasAnswer, isLastQ, answers, saveSession]);

  const goBack = useCallback(() => {
    if (currentQ === 0) setScreen("intro");
    else { setDirection(-1); setCurrentQ((n) => n - 1); }
  }, [currentQ]);

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }, [q?.id]);

  const reset = useCallback(() => {
    setCurrentQ(0); setAnswers({}); setScores(null);
    setRiskLevel(null); setProducts([]); setDirection(1); setScreen("intro");
  }, []);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const healthPct = scores ? Math.round((scores.total / TOTAL_SCORE_MAX) * 100) : 0;
  const modules = scores ? [
    { labelKey: "cuticleModule", score: scores.cuticle, max: 12, icon: Layers },
    { labelKey: "porosityModule", score: scores.porosity, max: 20, icon: Droplets },
    { labelKey: "elasticityModule", score: scores.elasticity, max: 21, icon: Activity },
    { labelKey: "scalpModule", score: scores.scalp, max: 12, icon: ScanSearch },
  ] : [];

  return (
    <>
      <SEOHead title={t("diagnostico.metaTitle")} description={t("diagnostico.metaDesc")} />

      {/* ─── INTRO ─── */}
      {screen === "intro" && (
        <div className="min-h-screen bg-background-light">
          <ToolHeader
            badge="CIENTÍFICO"
            title={<>Diagnóstico <span className="text-accent-orange">Capilar</span></>}
            subtitle={t("diagnostico.subtitle")}
            microTrust="~8 min · Sin registro · Protocolo clínico aplicado"
            onStart={() => setScreen("quiz")}
            startLabel={`${t("diagnostico.startBtn")} →`}
          />
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
              {([1, 2, 3, 4] as const).map((mod, i) => {
                const Icon = MODULE_ICONS[mod];
                return (
                  <motion.div key={mod} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-espresso/8 bg-white hover:shadow-bento transition-all duration-300">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
                      <Icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-espresso text-base mb-1">{t(`diagnostico.${MODULE_LABELS[mod]}`)}</p>
                      <p className="text-espresso/40 text-sm">{t(`diagnostico.${MODULE_LABELS[mod]}Sub`)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <BibliographyDrawer references={REFERENCES} />
          </div>
        </div>
      )}

      {/* ─── QUIZ ─── */}
      {screen === "quiz" && (
        <WizardShell
          toolName="DIAGNÓSTICO CAPILAR"
          currentStep={currentQ}
          totalSteps={QUESTIONS.length}
          onClose={() => setScreen("intro")}
          stepLabel={STEP_LABELS[currentQ]}
        >
          

          <div className="max-w-2xl mx-auto px-6 py-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.h2
                key={q.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl md:text-[2rem] text-espresso mb-10 leading-snug tracking-tight text-center"
              >
                {localizedQ.text}
              </motion.h2>
            </AnimatePresence>

            {localizedQ.protocol && (
              <div className="flex gap-3 p-4 rounded-xl border border-accent-orange/20 bg-accent-orange/5 text-sm text-espresso/60 mb-8">
                <span className="shrink-0">🧪</span>
                <p>{localizedQ.protocol}</p>
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={q.id + '-opts'}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`grid gap-4 mb-8 ${images ? 'grid-cols-2' : 'grid-cols-1'}`}
              >
                {localizedQ.options.map((opt) => {
                  const img = images?.[opt.value];
                  const selected = selectedValue === opt.value;

                  if (img) {
                    // Image card variant
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                          selected
                            ? 'border-2 border-accent-orange ring-1 ring-accent-orange/30'
                            : 'border border-espresso/10 hover:border-accent-orange/50'
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-mocha">
                          <img
                            src={img}
                            alt={opt.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="eager"
                            decoding="async"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.endsWith('/placeholder.svg')) return;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          {selected && (
                            <div className="absolute top-3 right-3 bg-accent-orange text-white p-1.5 rounded-full z-10">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                            <p className="text-white font-bold text-sm leading-tight">{opt.label}</p>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  // Text card variant (no image)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`relative flex items-center text-left gap-4 p-5 rounded-2xl border transition-all duration-300 bg-white ${
                        selected
                          ? 'border-accent-orange border-2 shadow-bento ring-4 ring-accent-orange/20'
                          : 'border-espresso/8 hover:border-accent-orange/30 hover:shadow-bento'
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent-orange flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <span className="text-espresso text-sm leading-relaxed">{opt.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <MiniExpertTip tip={expertQuote} className="mb-6" />

            {currentQ >= 2 && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-espresso/30 text-xs">Salud</span>
                <div className="flex-1 h-2 bg-espresso/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-orange rounded-full transition-all duration-700" style={{ width: `${damageScore}%` }} />
                </div>
                <span className="text-espresso/50 font-mono text-xs tabular-nums">{damageScore}%</span>
              </div>
            )}
          </div>

          <NavigationBar
            onPrev={goBack}
            onNext={goNext}
            disableNext={!hasAnswer}
            prevLabel={t("diagnostico.backBtn")}
            nextLabel={isLastQ ? t("diagnostico.finishBtn") : `CONTINUAR AL PASO ${currentQ + 2} →`}
          />
        </WizardShell>
      )}

      {/* ─── RESULTS ─── */}
      {screen === "results" && scores && riskLevel && (
        <div className="min-h-screen bg-espresso text-cream font-sans flex flex-col items-center py-12 px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4 ring-1 ring-gold/20">
              <ScanSearch className="w-6 h-6 text-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 italic tracking-tight">
              Tu Pasaporte Capilar
            </h1>
            <p className="text-lg text-cream/60">Diagnóstico Capilar Profesional</p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            className="bg-cream rounded-[2rem] p-6 md:p-10 shadow-2xl text-espresso w-full max-w-3xl"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Score Circle */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                <svg className="w-44 h-44 md:w-56 md:h-56" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" className="text-espresso/5" strokeWidth="12" />
                  <motion.circle
                    cx="100" cy="100" r="85" fill="none"
                    strokeWidth="12" strokeLinecap="round"
                    className={healthPct >= 70 ? 'text-damage-low' : healthPct >= 40 ? 'text-damage-med' : 'text-damage-high'}
                    stroke="currentColor"
                    strokeDasharray={2 * Math.PI * 85}
                    strokeDashoffset={2 * Math.PI * 85 * (1 - healthPct / 100)}
                    transform="rotate(-90 100 100)"
                    initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - healthPct / 100) }}
                    transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <text x="100" y="95" textAnchor="middle" className="fill-espresso font-display font-bold" fontSize="48">
                    {healthPct}
                  </text>
                  <text x="100" y="120" textAnchor="middle" className="fill-espresso/40 font-medium uppercase tracking-widest" fontSize="11">
                    / 100
                  </text>
                </svg>
                <div className={`absolute bottom-2 right-2 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg ${
                  healthPct >= 70 ? 'bg-damage-low' : healthPct >= 40 ? 'bg-damage-med' : 'bg-damage-high'
                }`}>
                  {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
                </div>
              </div>
              <span className="text-accent-orange font-bold tracking-[0.2em] text-xs uppercase mb-2">SALUD CAPILAR</span>
              <h2 className="text-2xl md:text-3xl font-bold font-display">
                {healthPct >= 70 ? 'Cabello Saludable' : healthPct >= 40 ? 'Cabello Comprometido' : 'Cabello en Riesgo'}
              </h2>
            </div>

            {/* Dimension Scores Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {modules.map((m, i) => {
                const pct = Math.round((m.score / m.max) * 100);
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.labelKey}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-white/40 p-4 md:p-5 rounded-2xl border border-espresso/5"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-accent-orange" />
                      </div>
                      <span className="text-sm font-semibold flex-1">{t(`diagnostico.${m.labelKey}`)}</span>
                      <span className={`text-lg font-bold font-display tabular-nums ${
                        pct >= 70 ? 'text-damage-low' : pct >= 40 ? 'text-damage-med' : 'text-damage-high'
                      }`}>
                        {m.score}<span className="text-espresso/20 text-xs font-normal">/{m.max}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-espresso/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          pct >= 70 ? 'bg-damage-low' : pct >= 40 ? 'bg-damage-med' : 'bg-damage-high'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Expert Analysis + Protocol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/40 p-6 rounded-3xl border border-espresso/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="text-accent-orange w-5 h-5" /> Protocolo de Acción
                </h3>
                <p className="text-sm leading-relaxed opacity-80">
                  {t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}
                </p>
              </div>

              <div className="bg-white/40 p-6 rounded-3xl border border-espresso/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FlaskConical className="text-accent-orange w-5 h-5" /> {t("diagnostico.productsTitle")}
                </h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map((product) => (
                    <a
                      key={product.asin}
                      href={lang === "en" ? product.urlEN : product.urlES}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0 mt-2" />
                      <div>
                        <p className="text-sm font-semibold group-hover:text-accent-orange transition-colors">{product.name}</p>
                        <p className="text-xs opacity-50 mt-0.5 line-clamp-1">{product.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Extra products */}
            {products.length > 3 && (
              <div className="space-y-3 mb-8">
                {products.slice(3).map((product, i) => (
                  <motion.a key={product.asin} href={lang === "en" ? product.urlEN : product.urlES}
                    target="_blank" rel="nofollow noopener noreferrer"
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-espresso/5 bg-white/30 hover:border-accent-orange/30 transition-all group">
                    <div className="p-2 rounded-lg bg-accent-orange/10 text-accent-orange shrink-0 mt-0.5"><FlaskConical className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold group-hover:text-accent-orange transition-colors">{product.name}</p>
                      <p className="text-xs opacity-50 mt-0.5 leading-relaxed line-clamp-2">{product.description}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-accent-orange">{t("diagnostico.amazonCta")} <ExternalLink className="w-3 h-3" /></span>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4">
              <button onClick={() => window.print()}
                className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg">
                Descargar Informe PDF <Download className="w-5 h-5" />
              </button>
              <button onClick={reset}
                className="w-full bg-transparent text-accent-orange border-2 border-accent-orange/30 hover:bg-accent-orange/5 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3">
                <RotateCcw className="w-4 h-4" /> {t("diagnostico.resetBtn")}
              </button>
            </div>
          </motion.div>

          {/* Below card: wizard continue + bibliography */}
          <div className="w-full max-w-3xl mt-10 space-y-6">
            {isWizardMode && (
              <button
                onClick={() => completeWizardModule({ summary: `${riskLevel} — ${scores.total} pts`, score: scores.total, rawResult: { scores, riskLevel } })}
                className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-accent-orange text-white font-bold hover:bg-accent-orange-hover transition-all">
                Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <BibliographyDrawer references={REFERENCES} />
          </div>
        </div>
      )}
    </>
  );
}
