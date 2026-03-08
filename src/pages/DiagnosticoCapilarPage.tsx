import { useState, useCallback, useMemo } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Droplets,
  Activity,
  ScanSearch,
  FlaskConical,
  ExternalLink,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  QUESTIONS,
  calculateScores,
  getRiskLevel,
  getProductRecommendations,
  type RiskLevel,
  type ScoreBreakdown,
  type Product,
} from "@/lib/diagnosticoCapilarEngine";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { ProgressBar } from "@/components/mi-pelo/shared/ProgressBar";
import { OptionCard } from "@/components/mi-pelo/shared/OptionCard";
import { DamageMeter } from "@/components/mi-pelo/shared/DamageMeter";
import { ExpertPanel } from "@/components/mi-pelo/shared/ExpertPanel";
import { StepFooter } from "@/components/mi-pelo/shared/StepFooter";
import { CizuraCTA } from "@/components/mi-pelo/shared/CizuraCTA";

// ── Session ID helper ──────────────────────────────────
function getSessionId(): string {
  const key = "diag_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Module key map ─────────────────────────────────────
const MODULE_KEY: Record<1 | 2 | 3 | 4, string> = {
  1: "cuticleModule",
  2: "porosityModule",
  3: "elasticityModule",
  4: "scalpModule",
};

const MODULE_MAX: Record<1 | 2 | 3 | 4, number> = {
  1: 12,
  2: 20,
  3: 21,
  4: 12,
};

// ── Screen types ───────────────────────────────────────
type Screen = "intro" | "quiz" | "results";

// ── New constants ──────────────────────────────────────
const TOTAL_SCORE_MAX = 65;

const MODULE_ICONS: Record<1 | 2 | 3 | 4, LucideIcon> = {
  1: Layers,
  2: Droplets,
  3: Activity,
  4: ScanSearch,
};

const MODULE_QUOTES: Record<1 | 2 | 3 | 4, string> = {
  1: "La cutícula es la primera línea de defensa del cabello. Una cutícula abierta libera humedad y proteínas esenciales con cada lavado.",
  2: "La porosidad determina cómo el cabello absorbe y retiene los productos. Alta porosidad requiere sellantes como aceites pesados.",
  3: "La elasticidad sana permite estirarse hasta un 30% sin romperse. Por debajo del 15%, el cabello entra en zona de riesgo de rotura.",
  4: "El cuero cabelludo es el ecosistema de todo. Un pH desequilibrado o exceso de sebo afecta directamente al ciclo de crecimiento.",
};

// ── Main component ─────────────────────────────────────
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

  // Localize question text & options from i18n
  const localizedQ = q
    ? {
        ...q,
        text: t(`diagnostico.${q.id}Text`),
        protocol: q.protocol ? t(`diagnostico.${q.id}Protocol`) : undefined,
        options: q.options.map((opt) => ({
          ...opt,
          label: t(`diagnostico.${q.id}${opt.value}`),
        })),
      }
    : q;

  // Expert quote for current module
  const expertQuote =
    moduleOfQ !== undefined ? MODULE_QUOTES[moduleOfQ] : MODULE_QUOTES[1];

  // Real-time damage score
  const { damageScore } = useMemo(() => {
    const answered = Object.keys(answers).length;
    if (answered === 0) return { damageScore: 50 };
    const partial = calculateScores(answers).total;
    const proportionalMax = (answered / QUESTIONS.length) * TOTAL_SCORE_MAX;
    const score = Math.round(
      100 - Math.min(100, (partial / Math.max(1, proportionalMax)) * 100),
    );
    return { damageScore: score };
  }, [answers]);

  // ── Save to Supabase ──────────────────────────────────
  const saveSession = useCallback(
    async (
      finalAnswers: Record<string, string>,
      finalScores: ScoreBreakdown,
      finalRiskLevel: RiskLevel,
      finalProducts: Product[],
    ) => {
      const sessionId = getSessionId();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from as any)("hair_diagnostic_sessions").insert({
          user_session_id: sessionId,
          cuticle_score: finalScores.cuticle,
          porosity_score: finalScores.porosity,
          elasticity_score: finalScores.elasticity,
          scalp_score: finalScores.scalp,
          total_score: finalScores.total,
          risk_level: finalRiskLevel,
          answers: finalAnswers,
          product_recommendations: finalProducts.map((p) => p.asin),
        });
      } catch {
        // best-effort
      }
    },
    [],
  );

  // ── Navigation ────────────────────────────────────────
  const goNext = useCallback(async () => {
    if (!hasAnswer) return;
    if (isLastQ) {
      const finalAnswers = { ...answers };
      const finalScores = calculateScores(finalAnswers);
      const finalRiskLevel = getRiskLevel(finalScores.total);
      const finalProducts = getProductRecommendations(finalRiskLevel);
      setScores(finalScores);
      setRiskLevel(finalRiskLevel);
      setProducts(finalProducts);
      await saveSession(finalAnswers, finalScores, finalRiskLevel, finalProducts);
      setScreen("results");
    } else {
      setDirection(1);
      setCurrentQ((n) => n + 1);
    }
  }, [hasAnswer, isLastQ, answers, saveSession]);

  const goBack = useCallback(() => {
    if (currentQ === 0) {
      setScreen("intro");
    } else {
      setDirection(-1);
      setCurrentQ((n) => n - 1);
    }
  }, [currentQ]);

  const handleSelect = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [q.id]: value }));
    },
    [q?.id],
  );

  const reset = useCallback(() => {
    setCurrentQ(0);
    setAnswers({});
    setScores(null);
    setRiskLevel(null);
    setProducts([]);
    setDirection(1);
    setScreen("intro");
  }, []);

  // ── Results derived values ─────────────────────────────
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const healthPct = scores ? Math.round((scores.total / TOTAL_SCORE_MAX) * 100) : 0;
  const modules = scores
    ? [
        { labelKey: "cuticleModule", score: scores.cuticle, max: 12, icon: Layers },
        { labelKey: "porosityModule", score: scores.porosity, max: 20, icon: Droplets },
        { labelKey: "elasticityModule", score: scores.elasticity, max: 21, icon: Activity },
        { labelKey: "scalpModule", score: scores.scalp, max: 12, icon: ScanSearch },
      ]
    : [];

  // Icon for current quiz question options
  const QuizIcon: LucideIcon = moduleOfQ ? MODULE_ICONS[moduleOfQ] : FlaskConical;

  // Unused variable reference to suppress TS — MODULE_KEY used in legacy,
  // keep for type safety: reference to silence unused warning
  void MODULE_KEY;

  return (
    <>
      <SEOHead
        title={t("diagnostico.metaTitle")}
        description={t("diagnostico.metaDesc")}
      />

      <div className="min-h-screen bg-background-light text-espresso">
        {/* Header toolbar */}
        <div className="border-b border-espresso/10 bg-background-light/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-gold" />
            <span className="font-display text-base font-semibold text-espresso">
              Diagnóstico Capilar
            </span>
            {screen === "quiz" && (
              <span className="ml-auto text-xs text-espresso/50 uppercase tracking-widest">
                Paso {currentQ + 1} / {QUESTIONS.length}
              </span>
            )}
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* ─── INTRO SCREEN ─────────────────────────── */}
          {screen === "intro" && (
            <>
              {/* Hero */}
              <div className="mb-8 rounded-2xl bg-espresso overflow-hidden aspect-[21/9] relative flex items-end p-8">
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent" />
                <div className="relative z-10">
                  <h1 className="font-display text-3xl md:text-4xl font-bold italic text-cream">
                    {t("diagnostico.title")}
                  </h1>
                  <p className="text-cream/80 mt-2 text-sm md:text-base max-w-xl">
                    {t("diagnostico.subtitle")}
                  </p>
                </div>
              </div>

              {/* White card with module preview + start button */}
              <div className="bg-white rounded-2xl p-8 border border-gold/10">
                <p className="text-xs font-bold uppercase tracking-widest text-gold mb-6">
                  4 módulos de análisis
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {([1, 2, 3, 4] as const).map((mod) => {
                    const Icon = MODULE_ICONS[mod];
                    const labelKey = [
                      "cuticleModule",
                      "porosityModule",
                      "elasticityModule",
                      "scalpModule",
                    ][mod - 1];
                    const subKey = [
                      "cuticleModuleSub",
                      "porosityModuleSub",
                      "elasticityModuleSub",
                      "scalpModuleSub",
                    ][mod - 1];
                    return (
                      <div
                        key={mod}
                        className="flex items-center gap-4 p-5 rounded-2xl border border-gold/10 bg-background-light/50"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gold shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-espresso text-sm">
                            {t(`diagnostico.${labelKey}`)}
                          </p>
                          <p className="text-espresso/60 text-xs mt-0.5">
                            {t(`diagnostico.${subKey}`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setScreen("quiz")}
                  className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-espresso text-cream font-bold hover:bg-espresso/90 transition-all"
                >
                  {t("diagnostico.startBtn")} <ArrowRight className="w-4 h-4" />
                </button>
                <p className="mt-4 text-xs text-espresso/50 text-center">
                  {t("diagnostico.timeNote")}
                </p>
              </div>
            </>
          )}

          {/* ─── QUIZ SCREEN ──────────────────────────── */}
          {screen === "quiz" && (
            <>
              {/* CizuraCTA shown when entering step 4 */}
              {currentQ === 3 && <CizuraCTA className="mb-6" />}

              {/* White card */}
              <div className="bg-white rounded-2xl p-6 md:p-10 border border-gold/10">
                <ProgressBar
                  current={currentQ + 1}
                  total={QUESTIONS.length}
                  className="mb-8"
                />

                {/* Question title — animated */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.h2
                    key={q.id + "-title"}
                    custom={direction}
                    initial={{ opacity: 0, x: (direction as number) * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: (direction as number) * -40 }}
                    transition={{ duration: 0.2 }}
                    className="text-espresso text-2xl md:text-3xl font-bold mb-4 leading-snug"
                  >
                    {localizedQ.text}
                  </motion.h2>
                </AnimatePresence>

                {/* Protocol box */}
                {localizedQ.protocol && (
                  <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5 text-sm text-espresso/70 mb-6">
                    <span className="shrink-0">🧪</span>
                    <p>{localizedQ.protocol}</p>
                  </div>
                )}

                {/* Two-column grid: options (8 cols) + sidebar (4 cols) for steps 3+ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Options */}
                  <div className="lg:col-span-8">
                    <div
                      role="radiogroup"
                      aria-label={localizedQ.text}
                      className="space-y-3 mb-6"
                    >
                      <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                          key={q.id}
                          custom={direction}
                          initial={{ opacity: 0, x: (direction as number) * 60 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: (direction as number) * -60 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-3"
                        >
                          {localizedQ.options.map((opt) => (
                            <OptionCard
                              key={opt.value}
                              name={q.id}
                              value={opt.value}
                              label={opt.label}
                              icon={<QuizIcon className="w-4 h-4" />}
                              checked={selectedValue === opt.value}
                              onChange={handleSelect}
                            />
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <StepFooter
                      onPrev={goBack}
                      onNext={goNext}
                      disablePrev={false}
                      disableNext={!hasAnswer}
                      prevLabel={t("diagnostico.backBtn")}
                      nextLabel={
                        isLastQ
                          ? t("diagnostico.finishBtn")
                          : t("diagnostico.nextBtn")
                      }
                    />
                  </div>

                  {/* Sidebar — only from step 3 onward (currentQ >= 2) */}
                  {currentQ >= 2 && (
                    <div className="lg:col-span-4 flex flex-col gap-5">
                      <DamageMeter score={damageScore} />
                      <ExpertPanel tip={expertQuote} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── RESULTS SCREEN ───────────────────────── */}
          {screen === "results" && scores && riskLevel && (
            <>
              {/* Results hero */}
              <div className="relative mb-8 rounded-2xl overflow-hidden bg-espresso py-16 px-8 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-espresso via-espresso/90 to-espresso/80" />
                <div className="relative z-10">
                  <span className="text-gold uppercase tracking-[0.3em] text-xs mb-4 font-semibold block">
                    Resultados del Diagnóstico
                  </span>
                  <h1 className="text-cream text-4xl md:text-5xl mb-4 italic font-display font-bold">
                    Pasaporte Capilar
                  </h1>
                  <p className="text-cream/80 max-w-lg mx-auto text-base leading-relaxed">
                    {t("diagnostico.resultsSubtitle")}
                  </p>
                </div>
              </div>

              {/* Two-column layout: main + sidebar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main col (2/3) */}
                <div className="md:col-span-2 space-y-6">
                  {/* Module bento cards */}
                  <div className="bg-white rounded-2xl p-6 border border-gold/10">
                    <h3 className="font-bold text-espresso text-lg mb-4">
                      Resumen del Perfil
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {modules.map((m) => {
                        const pct = Math.round((m.score / m.max) * 100);
                        return (
                          <motion.div
                            key={m.labelKey}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-background-light p-5 rounded-2xl border border-gold/10"
                          >
                            <m.icon className="w-5 h-5 text-gold mb-3" />
                            <p className="text-[10px] uppercase tracking-wider text-espresso/60 mb-1">
                              {t(`diagnostico.${m.labelKey}`)}
                            </p>
                            <p className="font-bold text-lg text-espresso">
                              {m.score}
                              <span className="text-espresso/40 text-sm font-normal">
                                /{m.max}
                              </span>
                            </p>
                            <div className="mt-2 h-1 bg-gold/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gold rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Protocol */}
                  <div className="bg-white rounded-2xl border border-gold/10 p-6">
                    <p className="text-sm font-semibold text-espresso mb-2">
                      {t("diagnostico.actionProtocol")}
                    </p>
                    <p className="text-sm text-espresso/70 leading-relaxed">
                      {t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}
                    </p>
                  </div>

                  {/* Products */}
                  <div>
                    <h3 className="text-lg font-bold text-espresso mb-4">
                      {t("diagnostico.productsTitle")}
                    </h3>
                    <div className="space-y-3">
                      {products.map((product, i) => (
                        <motion.a
                          key={product.asin}
                          href={lang === "en" ? product.urlEN : product.urlES}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="flex items-start gap-4 p-4 rounded-xl border border-gold/10 bg-background-light/50 hover:border-gold/40 hover:bg-background-light transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0 mt-0.5">
                            <FlaskConical className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-espresso group-hover:text-gold transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-espresso/60 mt-0.5 leading-relaxed line-clamp-2">
                              {product.description}
                            </p>
                            <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-gold">
                              {t("diagnostico.amazonCta")}{" "}
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Bibliography */}
                  <details className="group rounded-xl border border-gold/10 bg-background-light/50 overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-espresso select-none list-none hover:bg-background-light transition-colors">
                      <span>
                        <span aria-hidden="true">📚</span>{" "}
                        {t("diagnostico.bibliographyTitle")}
                      </span>
                      <span className="text-espresso/40 text-xs font-normal group-open:hidden">
                        {t("diagnostico.bibliographySee")}
                      </span>
                      <span className="text-espresso/40 text-xs font-normal hidden group-open:inline">
                        {t("diagnostico.bibliographyHide")}
                      </span>
                    </summary>
                    <ol className="px-5 pb-5 pt-2 space-y-3 text-xs text-espresso/60 leading-relaxed list-decimal list-inside">
                      <li>
                        Gavazzoni Dias, M.F.R. et al. (2014). The Shampoo pH can
                        Affect the Hair Fiber. <em>Int. J. Trichology</em>, 6(3),
                        95–99.
                      </li>
                      <li>
                        Bolduc, C. &amp; Shapiro, J. (2022). Hair care products.{" "}
                        <em>Surgical &amp; Cosmetic Dermatology</em>, 14(1), 4–14.
                      </li>
                      <li>
                        Robbins, C.R. (2023). Chemical and Physical Behavior of
                        Human Hair. Springer, 6th ed.
                      </li>
                      <li>
                        Pinheiro, M.V. et al. (2025). Assessment of Hair Fiber
                        Integrity. <em>Cosmetics</em> (MDPI), 12(3), 93.
                      </li>
                      <li>
                        Society of Cosmetic Chemists (NYSCC). (2024). Hair
                        Porosity and Elasticity. Annual Symposium.
                      </li>
                    </ol>
                  </details>
                </div>

                {/* Sidebar (1/3) */}
                <div className="flex flex-col gap-6">
                  {/* Score circle */}
                  <div className="bg-espresso text-cream p-8 rounded-2xl flex flex-col items-center text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">
                      Nivel de Salud Capilar
                    </p>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="stroke-cream/10"
                          fill="none"
                          strokeWidth="2"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="stroke-gold"
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${healthPct}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold font-display">
                          {healthPct}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold uppercase tracking-wide mb-3">
                      {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
                    </span>
                  </div>
                  <ExpertPanel tip={MODULE_QUOTES[4]} />
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gold/20 text-espresso font-semibold hover:bg-background-light transition-all text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> {t("diagnostico.resetBtn")}
                </button>
                {isWizardMode && (
                  <button
                    onClick={() =>
                      completeWizardModule({
                        summary: `${riskLevel} — ${scores.total} pts`,
                        score: scores.total,
                        rawResult: { scores, riskLevel },
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-espresso text-cream font-bold hover:bg-espresso/90 transition-all"
                  >
                    Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
