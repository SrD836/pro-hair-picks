import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  QUESTIONS,
  calculateScores,
  getRiskLevel,
  getProductRecommendations,
  CIZURA_BRIDGE,
  type RiskLevel,
  type ScoreBreakdown,
  type Product,
} from "@/lib/diagnosticoCapilarEngine";

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

// ── Risk config ────────────────────────────────────────
const RISK_CONFIG: Record<RiskLevel, {
  emoji: string;
  label: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  protocol: string;
}> = {
  optimal: {
    emoji: "🟢",
    label: "ÓPTIMO",
    range: "0–15 pts",
    color: "text-green-400",
    bgColor: "bg-green-950/40",
    borderColor: "border-green-700",
    protocol:
      "Tu cabello está en excelente estado. Mantén tu rutina actual con productos de mantenimiento y protección. Realiza un diagnóstico de seguimiento en 3 meses.",
  },
  caution: {
    emoji: "🟡",
    label: "PRECAUCIÓN",
    range: "16–35 pts",
    color: "text-yellow-400",
    bgColor: "bg-yellow-950/40",
    borderColor: "border-yellow-700",
    protocol:
      "Tu cabello muestra señales tempranas de daño. Introduce tratamientos reparadores 1–2 veces por semana y reduce el uso de herramientas térmicas. Realiza un seguimiento en 4–6 semanas.",
  },
  critical: {
    emoji: "🔴",
    label: "CRÍTICO",
    range: "36+ pts",
    color: "text-red-400",
    bgColor: "bg-red-950/40",
    borderColor: "border-red-700",
    protocol:
      "Tu cabello presenta daño severo que requiere intervención inmediata. Sigue el protocolo de tratamiento intensivo, evita procesos químicos adicionales y consulta con un profesional capilar.",
  },
};

// Module names
const MODULE_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: "Cutícula",
  2: "Porosidad",
  3: "Elasticidad",
  4: "Cuero Cabelludo",
};

const MODULE_MAX: Record<1 | 2 | 3 | 4, number> = {
  1: 12,
  2: 20,
  3: 21,
  4: 12,
};

// ── Screen types ───────────────────────────────────────
type Screen = "intro" | "quiz" | "results";

// ── Main component ─────────────────────────────────────
export default function DiagnosticoCapilarPage() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = back
  const [scores, setScores] = useState<ScoreBreakdown | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const q = QUESTIONS[currentQ];
  const selectedOption = answers[q?.id];
  const hasAnswer = selectedOption !== undefined;
  const isLastQ = currentQ === QUESTIONS.length - 1;

  // ── Save to Supabase ──────────────────────────────────
  const saveSession = useCallback(async (
    finalAnswers: Record<string, string>,
    finalScores: ScoreBreakdown,
    finalRiskLevel: RiskLevel,
    finalProducts: Product[],
  ) => {
    const sessionId = getSessionId();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from as any)("hair_diagnostic_sessions").insert({
        user_session_id: sessionId,
        cuticle_score: finalScores.cuticle,
        porosity_score: finalScores.porosity,
        elasticity_score: finalScores.elasticity,
        scalp_score: finalScores.scalp,
        total_score: finalScores.total,
        risk_level: finalRiskLevel,
        answers: finalAnswers,
        cizura_cta_shown: true,
        product_recommendations: finalProducts.map((p) => p.asin),
      }).select("id").single();
      if (data?.id) setSavedSessionId(data.id);
    } catch {
      // best-effort — don't block UI
    }
  }, []);

  // ── Track Cizura click ────────────────────────────────
  const handleCizuraClick = useCallback(async () => {
    if (!savedSessionId) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)("hair_diagnostic_sessions")
        .update({ cizura_cta_clicked: true })
        .eq("id", savedSessionId);
    } catch {
      // best-effort
    }
  }, [savedSessionId]);

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

  const handleOptionSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }, [q?.id]);

  const reset = useCallback(() => {
    setCurrentQ(0);
    setAnswers({});
    setScores(null);
    setRiskLevel(null);
    setProducts([]);
    setSavedSessionId(null);
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
      <Helmet>
        <title>Diagnóstico Capilar Profesional | GuiaDelSalon.com</title>
        <meta
          name="description"
          content="Test científico de 12 preguntas que evalúa cutícula, porosidad, elasticidad y cuero cabelludo. Obtén tu protocolo de tratamiento personalizado en 4 minutos."
        />
      </Helmet>

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
                      Módulo {moduleOfQ}: {MODULE_NAMES[moduleOfQ as 1 | 2 | 3 | 4]}
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
                      q={q}
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
                    Volver
                  </button>

                  {hasAnswer && (
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button onClick={goNext} className="gap-2">
                        {isLastQ ? "Ver resultado" : "Siguiente"}
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
                  onCizuraClick={handleCizuraClick}
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
  const modules = [
    { label: "Cutícula", sub: "Integridad estructural" },
    { label: "Porosidad", sub: "Absorción y retención" },
    { label: "Elasticidad", sub: "Resistencia y rotura" },
    { label: "Cuero Cabelludo", sub: "Barrera y microbioma" },
  ];

  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🔬</div>
      <div className="flex justify-center mb-4">
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          Diagnóstico Científico
        </Badge>
      </div>
      <h1 className="font-bold text-3xl md:text-4xl text-foreground mb-4 leading-tight">
        Diagnóstico Capilar{" "}
        <span className="text-secondary">Profesional</span>
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-10">
        Test científico de 12 preguntas que evalúa el estado real de tu cabello
        en cuatro dimensiones clínicas para darte un protocolo de tratamiento
        personalizado.
      </p>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {modules.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-left"
          >
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onStart} className="w-full sm:w-auto px-10 text-base">
        Comenzar diagnóstico
      </Button>

      <p className="mt-4 text-xs text-muted-foreground">
        ~4 minutos · Sin registro · Protocolo clínico aplicado
      </p>
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
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-5">
        {q.text}
      </h2>

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
  onCizuraClick,
}: {
  scores: ScoreBreakdown;
  riskLevel: RiskLevel;
  products: Product[];
  onReset: () => void;
  onCizuraClick: () => void;
}) {
  const cfg = RISK_CONFIG[riskLevel];

  const modules: { label: string; score: number; max: number; module: 1 | 2 | 3 | 4 }[] = [
    { label: "Cutícula", score: scores.cuticle, max: MODULE_MAX[1], module: 1 },
    { label: "Porosidad", score: scores.porosity, max: MODULE_MAX[2], module: 2 },
    { label: "Elasticidad", score: scores.elasticity, max: MODULE_MAX[3], module: 3 },
    { label: "Cuero Cabelludo", score: scores.scalp, max: MODULE_MAX[4], module: 4 },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Tu resultado capilar
        </h2>
        <p className="text-muted-foreground text-sm">
          Basado en protocolo clínico de 4 módulos
        </p>
      </div>

      {/* Semaphore card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`rounded-2xl border-2 p-8 text-center ${cfg.bgColor} ${cfg.borderColor}`}
      >
        <div className="text-5xl mb-3">{cfg.emoji}</div>
        <div className={`text-3xl font-extrabold mb-1 ${cfg.color}`}>
          {cfg.label}
        </div>
        <div className="text-muted-foreground text-sm mb-4">{cfg.range}</div>
        <div className="text-5xl font-black text-foreground">
          {scores.total}
          <span className="text-2xl font-normal text-muted-foreground"> pts</span>
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
                  {m.label}
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
        <p className="text-sm font-semibold text-foreground mb-1">Protocolo de acción</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{cfg.protocol}</p>
      </div>

      {/* Product recommendations */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          Productos recomendados para tu diagnóstico
        </h3>
        <div className="space-y-3">
          {products.map((product, i) => (
            <motion.a
              key={product.asin}
              href={`https://amazon.es/dp/${product.asin}?tag=${product.tag}`}
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
                  Ver precio en Amazon
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Cizura CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 text-center"
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {CIZURA_BRIDGE[riskLevel]}
        </p>
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto gap-2"
        >
          <a
            href="https://cizura.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCizuraClick}
          >
            Probar Cizura gratis
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </motion.div>

      {/* Bibliography */}
      <details className="group rounded-xl border border-border bg-card overflow-hidden">
        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-foreground select-none list-none hover:bg-secondary/5 transition-colors">
          <span><span aria-hidden="true">📚</span> Bibliografía científica</span>
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">Ver fuentes</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Ocultar</span>
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
          Repetir diagnóstico
        </Button>
      </div>
    </div>
  );
}
