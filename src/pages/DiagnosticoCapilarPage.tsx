import { useState, useCallback } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

// Risk visual config (colors only — text comes from i18n)
const RISK_COLORS: Record<RiskLevel, { emoji: string; color: string; bgColor: string; borderColor: string }> = {
  optimal: { emoji: "🟢", color: "text-green-400", bgColor: "bg-green-950/40", borderColor: "border-green-700" },
  caution: { emoji: "🟡", color: "text-yellow-400", bgColor: "bg-yellow-950/40", borderColor: "border-yellow-700" },
  critical: { emoji: "🔴", color: "text-red-400", bgColor: "bg-red-950/40", borderColor: "border-red-700" },
};

// ── Screen types ───────────────────────────────────────
type Screen = "intro" | "quiz" | "results";

// ── Main component ─────────────────────────────────────
export default function DiagnosticoCapilarPage() {
  const { t } = useLanguage();
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [scores, setScores] = useState<ScoreBreakdown | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { isWizardMode, completeWizardModule } = useWizardReturn('diagnostico-capilar');

  const q = QUESTIONS[currentQ];
  const selectedOption = answers[q?.id];
  const hasAnswer = selectedOption !== undefined;
  const isLastQ = currentQ === QUESTIONS.length - 1;

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

  const handleOptionSelect = useCallback(
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
    // savedSessionId removed
    setDirection(1);
    setScreen("intro");
  }, []);

  // ── Screen variants ───────────────────────────────────
  const screenVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 },
  };

  const questionVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
  };

  const moduleOfQ = q?.module;

  return (
    <>
      <SEOHead
        title={t("diagnostico.metaTitle")}
        description={t("diagnostico.metaDesc")}
      />

      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <AnimatePresence mode="wait">
            {/* ─── SCREEN 1: INTRO ─────────────────────── */}
            {screen === "intro" && (
              <motion.div
                key="intro"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <IntroScreen onStart={() => setScreen("quiz")} />
              </motion.div>
            )}

            {/* ─── SCREEN 2: QUIZ ──────────────────────── */}
            {screen === "quiz" && (
              <motion.div
                key="quiz"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("diagnostico.moduleLabel")} {moduleOfQ}:{" "}
                      {t(`diagnostico.${MODULE_KEY[moduleOfQ as 1 | 2 | 3 | 4]}`)}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {currentQ + 1} / {QUESTIONS.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary rounded-full"
                      initial={false}
                      animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Question card — animated horizontally */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={q.id}
                    custom={direction}
                    variants={questionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <QuizQuestion
                      q={localizedQ as (typeof QUESTIONS)[number]}
                      selectedOption={selectedOption}
                      onSelect={handleOptionSelect}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("diagnostico.backBtn")}
                  </button>

                  {hasAnswer && (
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button onClick={goNext} className="gap-2">
                        {isLastQ ? t("diagnostico.finishBtn") : t("diagnostico.nextBtn")}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── SCREEN 3: RESULTS ───────────────────── */}
            {screen === "results" && scores && riskLevel && (
              <motion.div
                key="results"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35 }}
              >
                <ResultsScreen
                  scores={scores}
                  riskLevel={riskLevel}
                  products={products}
                  onReset={reset}
                  isWizardMode={isWizardMode}
                  onWizardContinue={() =>
                    completeWizardModule({
                      summary: `${riskLevel} — ${scores.total} pts`,
                      score: scores.total,
                      rawResult: { scores, riskLevel },
                    })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// ── INTRO SCREEN ───────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  const { t } = useLanguage();

  const modules = [
    { labelKey: "cuticleModule", subKey: "cuticleModuleSub" },
    { labelKey: "porosityModule", subKey: "porosityModuleSub" },
    { labelKey: "elasticityModule", subKey: "elasticityModuleSub" },
    { labelKey: "scalpModule", subKey: "scalpModuleSub" },
  ];

  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🔬</div>
      <div className="flex justify-center mb-4">
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          {t("diagnostico.badge")}
        </Badge>
      </div>
      <h1 className="font-bold text-3xl md:text-4xl text-foreground mb-4 leading-tight">
        {t("diagnostico.title")}{" "}
        <span className="text-secondary">{t("diagnostico.titleHighlight")}</span>
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-10">
        {t("diagnostico.subtitle")}
      </p>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {modules.map((m) => (
          <div
            key={m.labelKey}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left"
          >
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t(`diagnostico.${m.labelKey}`)}</p>
              <p className="text-xs text-muted-foreground">{t(`diagnostico.${m.subKey}`)}</p>
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onStart} className="w-full sm:w-auto px-10 text-base">
        {t("diagnostico.startBtn")}
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">{t("diagnostico.timeNote")}</p>
    </div>
  );
}

// ── QUIZ QUESTION ──────────────────────────────────────
function QuizQuestion({
  q,
  selectedOption,
  onSelect,
}: {
  q: (typeof QUESTIONS)[number];
  selectedOption: string | undefined;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-5">{q.text}</h2>

      {/* Protocol box */}
      {q.protocol && (
        <div className="mb-5 flex gap-3 p-4 rounded-xl border border-secondary/30 bg-secondary/5 text-sm text-muted-foreground">
          <span className="shrink-0 text-base">🧪</span>
          <p>{q.protocol}</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt) => {
          const isSelected = selectedOption === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={[
                "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                isSelected
                  ? "border-secondary bg-secondary/10 text-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-secondary/60 hover:bg-secondary/5",
              ].join(" ")}
            >
              <span
                className={[
                  "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors duration-200",
                  isSelected
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-background text-muted-foreground",
                ].join(" ")}
              >
                {opt.value}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── RESULTS SCREEN ─────────────────────────────────────
function ResultsScreen({
  scores,
  riskLevel,
  products,
  onReset,
  isWizardMode,
  onWizardContinue,
}: {
  scores: ScoreBreakdown;
  riskLevel: RiskLevel;
  products: Product[];
  onReset: () => void;
  isWizardMode?: boolean;
  onWizardContinue?: () => void;
}) {
  const { t, lang } = useLanguage();
  const colors = RISK_COLORS[riskLevel];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const modules: { labelKey: string; score: number; max: number; module: 1 | 2 | 3 | 4 }[] = [
    { labelKey: "cuticleModule", score: scores.cuticle, max: MODULE_MAX[1], module: 1 },
    { labelKey: "porosityModule", score: scores.porosity, max: MODULE_MAX[2], module: 2 },
    { labelKey: "elasticityModule", score: scores.elasticity, max: MODULE_MAX[3], module: 3 },
    { labelKey: "scalpModule", score: scores.scalp, max: MODULE_MAX[4], module: 4 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {t("diagnostico.resultsTitle")}
        </h2>
        <p className="text-muted-foreground text-sm">{t("diagnostico.resultsSubtitle")}</p>
      </div>

      {/* Semaphore card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`rounded-2xl border-2 p-8 text-center ${colors.bgColor} ${colors.borderColor}`}
      >
        <div className="text-5xl mb-3">{colors.emoji}</div>
        <div className={`text-3xl font-extrabold mb-1 ${colors.color}`}>
          {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
        </div>
        <div className="text-muted-foreground text-sm mb-4">
          {t(`diagnostico.risk${capitalize(riskLevel)}Range`)}
        </div>
        <div className="text-5xl font-black text-foreground">
          {scores.total}
          <span className="text-2xl font-normal text-muted-foreground"> {t("diagnostico.pts")}</span>
        </div>
      </motion.div>

      {/* Module breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {modules.map((m, i) => {
          const pct = Math.min(100, (m.score / m.max) * 100);
          return (
            <motion.div
              key={m.module}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-secondary shrink-0" />
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {t(`diagnostico.${m.labelKey}`)}
                </p>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-bold text-foreground">{m.score}</span>
                <span className="text-xs text-muted-foreground">/ {m.max}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action protocol */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground mb-1">{t("diagnostico.actionProtocol")}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}
        </p>
      </div>

      {/* Product recommendations */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">{t("diagnostico.productsTitle")}</h3>
        <div className="space-y-3">
          {products.map((product, i) => (
            <motion.a
              key={product.asin}
              href={lang === 'en' ? product.urlEN : product.urlES}
              target="_blank"
              rel="nofollow noopener noreferrer"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-secondary/60 hover:bg-secondary/5 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-secondary">
                  {t("diagnostico.amazonCta")}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Bibliography */}
      <details className="group rounded-xl border border-border bg-card overflow-hidden">
        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-foreground select-none list-none hover:bg-secondary/5 transition-colors">
          <span><span aria-hidden="true">📚</span> {t("diagnostico.bibliographyTitle")}</span>
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">{t("diagnostico.bibliographySee")}</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">{t("diagnostico.bibliographyHide")}</span>
        </summary>
        <ol className="px-5 pb-5 pt-2 space-y-3 text-xs text-muted-foreground leading-relaxed list-decimal list-inside marker:font-semibold marker:text-foreground">
          <li>
            Gavazzoni Dias, M.F.R. et al. (2014). The Shampoo pH can Affect the Hair Fiber: Myth or Reality?{" "}
            <em>International Journal of Trichology</em>, 6(3), 95–99.{" "}
            <a
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4171909/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-2 hover:opacity-80"
            >
              PMC4171909
            </a>
          </li>
          <li>
            Bolduc, C. & Shapiro, J. (2022). Hair care products: Waving, straightening, conditioning,
            and coloring. <em>Surgical & Cosmetic Dermatology</em>, 14(1), 4–14.
          </li>
          <li>
            Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair.{" "}
            <em>Polymers</em> (MDPI/Springer, 6th ed.). PMC open-access chapter on cuticle porosity.{" "}
            <a
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10054080/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-2 hover:opacity-80"
            >
              PMC10054080
            </a>
          </li>
          <li>
            Pinheiro, M.V. et al. (2025). Assessment of Hair Fiber Integrity After Chemical Treatments.{" "}
            <em>Cosmetics</em> (MDPI), 12(3), 93.{" "}
            <a
              href="https://www.mdpi.com/2079-9284/12/3/93"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-2 hover:opacity-80"
            >
              mdpi.com/2079-9284/12/3/93
            </a>
          </li>
          <li>
            Society of Cosmetic Chemists (NYSCC). (2024). Hair Porosity and Elasticity: Measurement
            Methods and Clinical Relevance. Annual Symposium Proceedings.
          </li>
        </ol>
      </details>

      {/* Repeat */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          {t("diagnostico.resetBtn")}
        </Button>
      </div>

      {isWizardMode && onWizardContinue && (
        <div className="flex justify-center pt-2">
          <Button onClick={onWizardContinue} className="gap-2">
            Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
