import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, AlertTriangle, ExternalLink, RotateCcw, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  type SkinTone,
  type Undertone,
  type EyeColor,
  type FantasyColor,
  type UserProfile,
  type ColorRecommendation,
  getRecommendation,
  FANTASY_COLORS,
} from "@/lib/colorMatchEngine";

/* ── Step option type ──────────────────────────── */
interface StepOption<T extends string> {
  value: T;
  label: { es: string; en: string };
  desc?: { es: string; en: string };
  color?: string;
  emoji?: string;
}

/* ── Steps config ──────────────────────────────── */
const SKIN_OPTIONS: StepOption<SkinTone>[] = [
  { value: "light", label: { es: "Clara", en: "Light" }, color: "#f5dcc3", desc: { es: "Piel tipo I-II · Todo tipo de cabello: liso, ondulado, rizado", en: "Type I-II · All hair types: straight, wavy, curly" } },
  { value: "medium", label: { es: "Media", en: "Medium" }, color: "#d4a574", desc: { es: "Piel tipo III · Melocotón/beige · Cualquier textura capilar", en: "Type III · Peach/beige · Any hair texture" } },
  { value: "tan", label: { es: "Bronceada", en: "Tan" }, color: "#a0764a", desc: { es: "Piel tipo IV-V · Oliva/dorada · Incluye cabello afro y rizado", en: "Type IV-V · Olive/golden · Includes afro & curly hair" } },
  { value: "dark", label: { es: "Oscura", en: "Dark" }, color: "#6b4226", desc: { es: "Piel tipo VI · Oscura a muy oscura · Todas las texturas", en: "Type VI · Dark to very dark · All textures" } },
];

const UNDERTONE_OPTIONS: StepOption<Undertone>[] = [
  { value: "cool", label: { es: "Frío", en: "Cool" }, emoji: "💎", desc: { es: "Venas azuladas, piel rosácea. Te favorecen tonos plata.", en: "Blue-toned veins, pinkish skin. Silver tones suit you." } },
  { value: "warm", label: { es: "Cálido", en: "Warm" }, emoji: "☀️", desc: { es: "Venas verdosas, piel dorada. Te favorecen tonos oro.", en: "Green-toned veins, golden skin. Gold tones suit you." } },
  { value: "neutral", label: { es: "Neutro", en: "Neutral" }, emoji: "⚖️", desc: { es: "Mezcla de venas azules y verdes. Ambos metales te favorecen.", en: "Mix of blue and green veins. Both metals suit you." } },
];

const EYE_OPTIONS: StepOption<EyeColor>[] = [
  { value: "blue_gray", label: { es: "Azul / Gris", en: "Blue / Gray" }, color: "#7a9cc6" },
  { value: "green", label: { es: "Verde", en: "Green" }, color: "#6a9a5a" },
  { value: "hazel", label: { es: "Miel / Avellana", en: "Hazel" }, color: "#b8863a" },
  { value: "brown", label: { es: "Marrón", en: "Brown" }, color: "#6a4a2a" },
  { value: "black", label: { es: "Negro", en: "Black" }, color: "#2a2018" },
];

const LEVEL_LABELS: { es: string; en: string }[] = [
  { es: "", en: "" },
  { es: "1 — Negro", en: "1 — Black" },
  { es: "2 — Moreno", en: "2 — Darkest Brown" },
  { es: "3 — Castaño Oscuro", en: "3 — Dark Brown" },
  { es: "4 — Castaño Medio", en: "4 — Medium Brown" },
  { es: "5 — Castaño Claro", en: "5 — Light Brown" },
  { es: "6 — Rubio Oscuro", en: "6 — Dark Blonde" },
  { es: "7 — Rubio Medio", en: "7 — Medium Blonde" },
  { es: "8 — Rubio Claro", en: "8 — Light Blonde" },
  { es: "9 — Rubio Muy Claro", en: "9 — Very Light Blonde" },
  { es: "10 — Platino", en: "10 — Platinum" },
];

const LEVEL_COLORS = ["", "#0a0a0a", "#1e120a", "#3a2a1e", "#5a4a38", "#7a6a50", "#8a7a60", "#a09070", "#baa880", "#d0c0a0", "#e8dcc8"];

/* ── Loading messages ─────────────────────────── */
const LOADING_MSGS = [
  { es: "Analizando pigmentación...", en: "Analyzing pigmentation..." },
  { es: "Calculando reflejos neutralizadores...", en: "Calculating neutralizing reflects..." },
  { es: "Determinando tu estación cromática...", en: "Determining your chromatic season..." },
  { es: "Generando tu paleta ideal...", en: "Generating your ideal palette..." },
];

const AFFILIATE_TAG = "guiadelsalon-21";

/* ── Component ─────────────────────────────────── */
export default function ColorMatchPage() {
  const { lang } = useLanguage();
  const l = (obj: { es: string; en: string }) => obj[lang] || obj.es;

  const [step, setStep] = useState(0);
  const [skinTone, setSkinTone] = useState<SkinTone | null>(null);
  const [undertone, setUndertone] = useState<Undertone | null>(null);
  const [eyeColor, setEyeColor] = useState<EyeColor | null>(null);
  const [naturalLevel, setNaturalLevel] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [currentFantasy, setCurrentFantasy] = useState<FantasyColor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<ColorRecommendation | null>(null);

  const titles = [
    { es: "¿Cuál es tu tono de piel?", en: "What is your skin tone?" },
    { es: "¿Cuál es tu subtono?", en: "What is your undertone?" },
    { es: "¿De qué color son tus ojos?", en: "What is your eye color?" },
    { es: "¿Cuál es tu nivel natural de cabello?", en: "What is your natural hair level?" },
    { es: "¿Cuál es tu color actual de cabello?", en: "What is your current hair color?" },
  ];

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const step4Selected = currentLevel !== null || currentFantasy !== null;
  const canProceed = [skinTone, undertone, eyeColor, naturalLevel, step4Selected][step] !== null && [skinTone, undertone, eyeColor, naturalLevel, step4Selected][step] !== false;

  const runAnalysis = useCallback(() => {
    if (!skinTone || !undertone || !eyeColor || !naturalLevel || (!currentLevel && !currentFantasy)) return;
    setLoading(true);
    setLoadingMsg(0);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < LOADING_MSGS.length) {
        setLoadingMsg(i);
      } else {
        clearInterval(interval);
        const profile: UserProfile = {
          skinTone,
          undertone,
          eyeColor,
          naturalLevel,
          currentLevel: currentFantasy ? 0 : (currentLevel ?? naturalLevel),
          currentFantasy,
        };
        setResult(getRecommendation(profile));
        setLoading(false);
      }
    }, 900);
  }, [skinTone, undertone, eyeColor, naturalLevel, currentLevel, currentFantasy]);

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      runAnalysis();
    }
  };

  const reset = () => {
    setStep(0);
    setSkinTone(null);
    setUndertone(null);
    setEyeColor(null);
    setNaturalLevel(null);
    setCurrentLevel(null);
    setCurrentFantasy(null);
    setResult(null);
    setLoading(false);
  };

  const seasonNames: Record<string, { es: string; en: string }> = {
    winter: { es: "❄️ Invierno", en: "❄️ Winter" },
    summer: { es: "☀️ Verano", en: "☀️ Summer" },
    autumn: { es: "🍂 Otoño", en: "🍂 Autumn" },
    spring: { es: "🌸 Primavera", en: "🌸 Spring" },
  };

  const metaTitle = lang === "es"
    ? "Expert Color Matcher | Asesor de Color Capilar Profesional"
    : "Expert Color Matcher | Professional Hair Color Advisor";
  const metaDesc = lang === "es"
    ? "Descubre tu color de cabello ideal con nuestro algoritmo de visagismo profesional. Análisis de subtono, estación cromática y recomendaciones personalizadas."
    : "Discover your ideal hair color with our professional visagism algorithm. Undertone analysis, seasonal color matching, and personalized recommendations.";

  const buildAmazonUrl = (searchTerm: string) =>
    `https://www.amazon.es/s?k=${searchTerm}&tag=${AFFILIATE_TAG}`;

  // ── Loading screen ──
  if (loading) {
    return (
      <>
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDesc} />
        </Helmet>
        <div className="min-h-[70vh] flex items-center justify-center">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto rounded-full border-4 border-secondary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-secondary font-display text-lg"
              >
                {l(LOADING_MSGS[loadingMsg])}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Results screen ──
  if (result) {
    return (
      <>
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDesc} />
        </Helmet>
        <section className="container mx-auto px-4 py-12 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                {lang === "es" ? "Tu Master Color Card" : "Your Master Color Card"}
              </h1>
              <p className="text-muted-foreground text-sm">{l(seasonNames[result.season])}</p>
            </div>

            {/* Main card */}
            <Card className="p-6 md:p-8 border-secondary/30 space-y-6 relative overflow-hidden">
              {/* Color preview */}
              <div className="flex items-center gap-5">
                <div
                  className="w-24 h-24 rounded-full border-4 border-secondary/40 shadow-lg shrink-0"
                  style={{ backgroundColor: result.hexPreview }}
                />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {lang === "es" ? "Tu Tinte Ideal" : "Your Ideal Shade"}
                  </p>
                  <h2 className="font-display text-2xl text-foreground">{result.code} {l(result.name)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{l(result.description)}</p>
                </div>
              </div>

              {/* Verdict */}
              <div className="bg-accent/50 rounded-lg p-4 border border-border">
                <h3 className="font-display text-sm text-secondary mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {lang === "es" ? "Veredicto del Colorista" : "Colorist's Verdict"}
                </h3>
                <p className="text-foreground text-sm leading-relaxed">{l(result.verdict)}</p>
              </div>

              {/* Complementary */}
              <div>
                <h3 className="font-display text-sm text-muted-foreground mb-3">
                  {lang === "es" ? "Paleta Complementaria" : "Complementary Palette"}
                </h3>
                <div className="flex gap-4">
                  {result.complementary.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-border"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs text-muted-foreground text-center">{l(c.name)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decolorization warning */}
              {result.requiresDecolor && (
                <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <FlaskConical className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {lang === "es" ? "Decoloración previa necesaria" : "Prior bleaching required"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lang === "es"
                        ? "Tu color actual requiere un proceso de decoloración profesional antes de aplicar el tinte recomendado. No lo hagas en casa: visita un salón para proteger tu cabello."
                        : "Your current color requires a professional bleaching process before applying the recommended dye. Don't attempt this at home — visit a salon to protect your hair."}
                    </p>
                  </div>
                </div>
              )}

              {/* Safety warning (level jump) */}
              {result.requiresSalon && !result.requiresDecolor && (
                <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {lang === "es" ? "Cambio de nivel drástico" : "Drastic level change"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lang === "es"
                        ? `El salto de ${result.levelJump} niveles requiere un proceso técnico. Te recomendamos acudir a un salón profesional para evitar daños en el cabello.`
                        : `A jump of ${result.levelJump} levels requires a technical process. We recommend visiting a professional salon to avoid hair damage.`}
                    </p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={() => window.open(buildAmazonUrl(result.amazonSearchTerm), "_blank")}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                size="lg"
              >
                {lang === "es" ? "Ver productos recomendados en Amazon" : "See recommended products on Amazon"}
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Card>

            <Button onClick={reset} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              {lang === "es" ? "Empezar de nuevo" : "Start over"}
            </Button>
          </motion.div>
        </section>
      </>
    );
  }

  // ── Stepper ──
  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`https://pro-hair-picks.lovable.app/${lang === "es" ? "asesor-color" : "color-match"}`} />
      </Helmet>

      <section className="container mx-auto px-4 py-12 max-w-xl">
        <div className="text-center mb-8 space-y-2">
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Expert Color Matcher</h1>
          <p className="text-muted-foreground text-sm">
            {lang === "es"
              ? "Descubre tu color ideal con nuestro algoritmo de visagismo profesional"
              : "Discover your ideal color with our professional visagism algorithm"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {lang === "es"
              ? "Para todo tipo de cabello: liso, ondulado, rizado y afro"
              : "For all hair types: straight, wavy, curly & afro"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{lang === "es" ? "Paso" : "Step"} {step + 1}/{totalSteps}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <h2 className="font-display text-xl text-center text-foreground">
              {l(titles[step])}
            </h2>

            {/* Step 0: Skin tone */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {SKIN_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSkinTone(o.value)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      skinTone === o.value
                        ? "border-secondary bg-accent/60"
                        : "border-border hover:border-secondary/50 bg-card"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-border" style={{ backgroundColor: o.color }} />
                    <span className="font-bold text-foreground text-sm">{l(o.label)}</span>
                    {o.desc && <span className="text-xs text-muted-foreground text-center">{l(o.desc)}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Undertone */}
            {step === 1 && (
              <div className="grid gap-3">
                {UNDERTONE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setUndertone(o.value)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 text-left ${
                      undertone === o.value
                        ? "border-secondary bg-accent/60"
                        : "border-border hover:border-secondary/50 bg-card"
                    }`}
                  >
                    <span className="text-3xl">{o.emoji}</span>
                    <div>
                      <span className="font-bold text-foreground">{l(o.label)}</span>
                      {o.desc && <p className="text-xs text-muted-foreground mt-0.5">{l(o.desc)}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Eye color */}
            {step === 2 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {EYE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setEyeColor(o.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      eyeColor === o.value
                        ? "border-secondary bg-accent/60"
                        : "border-border hover:border-secondary/50 bg-card"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: o.color }} />
                    <span className="text-xs font-bold text-foreground text-center">{l(o.label)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Natural level */}
            {step === 3 && (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setNaturalLevel(lv)}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      naturalLevel === lv
                        ? "border-secondary bg-accent/60"
                        : "border-border hover:border-secondary/50 bg-card"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Current color (Natural + Fantasy) */}
            {step === 4 && (
              <>
                {/* Natural levels section */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {lang === "es" ? "Color natural / teñido convencional" : "Natural / conventional dyed color"}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                      <button
                        key={lv}
                        onClick={() => { setCurrentLevel(lv); setCurrentFantasy(null); }}
                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          currentLevel === lv && !currentFantasy
                            ? "border-secondary bg-accent/60"
                            : "border-border hover:border-secondary/50 bg-card"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fantasy / dyed colors section */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {lang === "es" ? "Color fantasía / teñido especial" : "Fantasy / special dyed color"}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {FANTASY_COLORS.map((fc) => (
                      <button
                        key={fc.value}
                        onClick={() => { setCurrentFantasy(fc.value); setCurrentLevel(null); }}
                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          currentFantasy === fc.value
                            ? "border-secondary bg-accent/60"
                            : "border-border hover:border-secondary/50 bg-card"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: fc.hex }} />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(fc.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {currentFantasy && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {lang === "es"
                        ? "Los colores fantasía requieren un proceso de decoloración/decapado profesional antes de aplicar un nuevo tinte. El resultado final dependerá del estado de tu fibra capilar."
                        : "Fantasy colors require a professional bleaching/stripping process before applying a new dye. The final result will depend on your hair fiber condition."}
                    </span>
                  </div>
                )}
                {!currentFantasy && naturalLevel && currentLevel && Math.abs(naturalLevel - currentLevel) > 3 && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {lang === "es"
                        ? "Tu color actual difiere en más de 3 niveles de tu natural. Ten en cuenta que esto puede requerir un proceso profesional."
                        : "Your current color differs by more than 3 levels from your natural. This may require a professional process."}
                    </span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1 gap-1">
              <ArrowLeft className="w-4 h-4" />
              {lang === "es" ? "Anterior" : "Back"}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1"
          >
            {step === totalSteps - 1
              ? (lang === "es" ? "Analizar" : "Analyze")
              : (lang === "es" ? "Siguiente" : "Next")}
            {step === totalSteps - 1 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </section>
    </>
  );
}
