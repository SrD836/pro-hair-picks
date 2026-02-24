import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, AlertTriangle, ExternalLink, RotateCcw, FlaskConical, HelpCircle, Snowflake, Sun, Leaf, Umbrella, BookOpen, Gem, Palette, ShirtIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  type SkinTone,
  type EyeColor,
  type FantasyColor,
  type VeinColor,
  type JewelryPref,
  type ColorReaction,
  type Season,
  type UserProfile,
  type ColorRecommendation,
  getRecommendation,
  computeUndertone,
  FANTASY_COLORS,
  SEASON_STYLES,
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

const VEIN_OPTIONS: StepOption<VeinColor>[] = [
  { value: "blue", label: { es: "Azules / Moradas", en: "Blue / Purple" }, emoji: "💎", desc: { es: "Tus venas se ven azuladas o moradas → Subtono frío", en: "Your veins look blue or purple → Cool undertone" } },
  { value: "green", label: { es: "Verdes", en: "Green" }, emoji: "🌿", desc: { es: "Tus venas se ven verdosas → Subtono cálido", en: "Your veins look greenish → Warm undertone" } },
  { value: "mixed", label: { es: "Mezcla de ambas", en: "Mix of both" }, emoji: "⚖️", desc: { es: "Ves tanto azul como verde → Subtono neutro", en: "You see both blue and green → Neutral undertone" } },
];

const JEWELRY_OPTIONS: StepOption<JewelryPref>[] = [
  { value: "silver", label: { es: "Plata", en: "Silver" }, emoji: "🪙", desc: { es: "Los accesorios plateados te favorecen más", en: "Silver accessories flatter you more" } },
  { value: "gold", label: { es: "Oro", en: "Gold" }, emoji: "✨", desc: { es: "Los accesorios dorados te favorecen más", en: "Gold accessories flatter you more" } },
  { value: "both", label: { es: "Ambos por igual", en: "Both equally" }, emoji: "💫", desc: { es: "Ambos metales te quedan bien", en: "Both metals look good on you" } },
];

const COLOR_REACTION_OPTIONS: StepOption<ColorReaction>[] = [
  { value: "pink", label: { es: "Rosa fucsia", en: "Fuchsia pink" }, color: "#e91e8c", desc: { es: "Este color te ilumina más el rostro", en: "This color brightens your face more" } },
  { value: "orange", label: { es: "Naranja", en: "Orange" }, color: "#f39c12", desc: { es: "Este color te ilumina más el rostro", en: "This color brightens your face more" } },
  { value: "both", label: { es: "Ambos", en: "Both" }, emoji: "🎨", desc: { es: "Ambos colores te favorecen por igual", en: "Both colors flatter you equally" } },
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

const LOADING_MSGS = [
  { es: "Analizando pigmentación...", en: "Analyzing pigmentation..." },
  { es: "Evaluando test de venas y metales...", en: "Evaluating vein and metals test..." },
  { es: "Calculando reflejos neutralizadores...", en: "Calculating neutralizing reflects..." },
  { es: "Determinando tu estación cromática...", en: "Determining your chromatic season..." },
  { es: "Generando tu paleta ideal...", en: "Generating your ideal palette..." },
];

const AFFILIATE_TAG = "guiadelsalon-21";

const SEASON_ICON_MAP: Record<Season, typeof Snowflake> = {
  winter: Snowflake,
  summer: Umbrella,
  autumn: Leaf,
  spring: Sun,
};

const SEASON_NAMES: Record<Season, { es: string; en: string }> = {
  winter: { es: "Invierno", en: "Winter" },
  summer: { es: "Verano", en: "Summer" },
  autumn: { es: "Otoño", en: "Autumn" },
  spring: { es: "Primavera", en: "Spring" },
};

/* ── Component ─────────────────────────────────── */
export default function ColorMatchPage() {
  const { lang } = useLanguage();
  const l = (obj: { es: string; en: string }) => obj[lang] || obj.es;

  const [step, setStep] = useState(0);
  const [skinTone, setSkinTone] = useState<SkinTone | null>(null);
  const [veinColor, setVeinColor] = useState<VeinColor | null>(null);
  const [jewelryPref, setJewelryPref] = useState<JewelryPref | null>(null);
  const [colorReaction, setColorReaction] = useState<ColorReaction | null>(null);
  const [eyeColor, setEyeColor] = useState<EyeColor | null>(null);
  const [naturalLevel, setNaturalLevel] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [currentFantasy, setCurrentFantasy] = useState<FantasyColor | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<ColorRecommendation | null>(null);

  // Steps: 0=Skin, 1=Veins, 2=Jewelry, 3=ColorReaction, 4=Eyes, 5=NaturalLevel, 6=CurrentColor
  const titles = [
    { es: "¿Cuál es tu tono de piel?", en: "What is your skin tone?" },
    { es: "Test de venas: ¿de qué color se ven?", en: "Vein test: what color do they look?" },
    { es: "¿Qué metal te favorece más?", en: "Which metal flatters you more?" },
    { es: "¿Qué color te ilumina más el rostro?", en: "Which color brightens your face more?" },
    { es: "¿De qué color son tus ojos?", en: "What is your eye color?" },
    { es: "¿Cuál es tu nivel natural de cabello?", en: "What is your natural hair level?" },
    { es: "¿Cuál es tu color actual de cabello?", en: "What is your current hair color?" },
  ];

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  const step6Selected = currentLevel !== null || currentFantasy !== null;
  const selections = [skinTone, veinColor, jewelryPref, colorReaction, eyeColor, naturalLevel, step6Selected];
  const canProceed = selections[step] !== null && selections[step] !== false;

  const runAnalysis = useCallback(() => {
    if (!skinTone || !veinColor || !jewelryPref || !colorReaction || !eyeColor || !naturalLevel || (!currentLevel && !currentFantasy)) return;
    setLoading(true);
    setLoadingMsg(0);

    const undertone = computeUndertone(veinColor, jewelryPref, colorReaction);

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
    }, 800);
  }, [skinTone, veinColor, jewelryPref, colorReaction, eyeColor, naturalLevel, currentLevel, currentFantasy]);

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else runAnalysis();
  };

  const reset = () => {
    setStep(0);
    setSkinTone(null);
    setVeinColor(null);
    setJewelryPref(null);
    setColorReaction(null);
    setEyeColor(null);
    setNaturalLevel(null);
    setCurrentLevel(null);
    setCurrentFantasy(null);
    setResult(null);
    setLoading(false);
  };

  const metaTitle = lang === "es"
    ? "Expert Color Matcher | Asesor de Color Capilar Profesional"
    : "Expert Color Matcher | Professional Hair Color Advisor";
  const metaDesc = lang === "es"
    ? "Descubre tu color de cabello ideal con nuestro algoritmo de visagismo profesional. Análisis de subtono, estación cromática y recomendaciones personalizadas."
    : "Discover your ideal hair color with our professional visagism algorithm. Undertone analysis, seasonal color matching, and personalized recommendations.";

  const buildAmazonUrl = (searchTerm: string) =>
    `https://www.amazon.es/s?k=${searchTerm}&tag=${AFFILIATE_TAG}`;

  // Computed undertone for display
  const computedUndertone = veinColor && jewelryPref && colorReaction
    ? computeUndertone(veinColor, jewelryPref, colorReaction) : null;

  // ── Loading screen ──
  if (loading) {
    return (
      <>
        <Helmet><title>{metaTitle}</title><meta name="description" content={metaDesc} /></Helmet>
        <div className="min-h-[70vh] flex items-center justify-center">
          <motion.div className="text-center space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="w-20 h-20 mx-auto rounded-full border-4 border-secondary border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <AnimatePresence mode="wait">
              <motion.p key={loadingMsg} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-secondary font-display text-lg">
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
    const SeasonIcon = SEASON_ICON_MAP[result.season];
    const seasonStyle = SEASON_STYLES[result.season];
    const undertoneLabel = computedUndertone === "cool"
      ? { es: "Frío", en: "Cool" }
      : computedUndertone === "warm"
        ? { es: "Cálido", en: "Warm" }
        : { es: "Neutro", en: "Neutral" };

    return (
      <>
        <Helmet><title>{metaTitle}</title><meta name="description" content={metaDesc} /></Helmet>
        <section className="container mx-auto px-4 py-12 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header with season icon */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 border-2 border-secondary/30 mx-auto">
                <SeasonIcon className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                {lang === "es" ? "Tu Master Color Card" : "Your Master Color Card"}
              </h1>
              <p className="text-secondary font-display text-lg">
                {SEASON_STYLES[result.season].icon} {l(SEASON_NAMES[result.season])}
              </p>
              <p className="text-xs text-muted-foreground">{l(seasonStyle.contrast)}</p>
            </div>

            {/* Main card */}
            <Card className="p-6 md:p-8 border-secondary/30 space-y-6 relative overflow-hidden">
              {/* Color preview */}
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-full border-4 border-secondary/40 shadow-lg shrink-0" style={{ backgroundColor: result.hexPreview }} />
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

              {/* Undertone explanation */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-secondary" />
                  {lang === "es" ? `Tu subtono: ${l(undertoneLabel)}` : `Your undertone: ${l(undertoneLabel)}`}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "es"
                    ? "Tu subtono es constante y no cambia con el bronceado ni la edad. Es la base de tu análisis cromático y determina qué colores armonizan con tu piel de forma natural. Todas las recomendaciones de tinte, ropa y maquillaje parten de este dato."
                    : "Your undertone is constant — it doesn't change with tanning or age. It's the foundation of your color analysis and determines which colors naturally harmonize with your skin. All dye, clothing, and makeup recommendations are based on this."}
                </p>
              </div>

              {/* Complementary hair palette */}
              <div>
                <h3 className="font-display text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  {lang === "es" ? "Paleta Complementaria de Tintes" : "Complementary Dye Palette"}
                </h3>
                <div className="flex gap-4">
                  {result.complementary.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full border-2 border-border" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs text-muted-foreground text-center">{l(c.name)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clothing colors */}
              <div>
                <h3 className="font-display text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <ShirtIcon className="w-4 h-4" />
                  {lang === "es" ? "Tus colores ideales para vestir" : "Your ideal clothing colors"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {seasonStyle.clothingColors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] text-muted-foreground text-center max-w-[60px]">{l(c.name)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors to avoid */}
              <div>
                <h3 className="font-display text-sm text-destructive/80 mb-3">
                  {lang === "es" ? "🚫 Colores a evitar" : "🚫 Colors to avoid"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {seasonStyle.avoidColors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 opacity-70">
                      <div className="w-10 h-10 rounded-lg border-2 border-destructive/30 shadow-sm relative" style={{ backgroundColor: c.hex }}>
                        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">✕</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center max-w-[60px]">{l(c.name)}</span>
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

            {/* Colorimetry 101 */}
            <Colorimetry101 lang={lang} />

            {/* FAQ Section */}
            <ColorMatchFAQ lang={lang} onReset={reset} />
          </motion.div>
        </section>
      </>
    );
  }

  // ── Generic option renderer ──
  const renderOptionCards = <T extends string>(
    options: StepOption<T>[],
    selected: T | null,
    onSelect: (v: T) => void,
    layout: "grid" | "list" = "list"
  ) => (
    <div className={layout === "grid" ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`p-4 rounded-lg border-2 transition-all flex ${layout === "grid" ? "flex-col items-center gap-2" : "items-center gap-4 text-left"} ${
            selected === o.value
              ? "border-secondary bg-accent/60"
              : "border-border hover:border-secondary/50 bg-card"
          }`}
        >
          {o.emoji && <span className="text-3xl">{o.emoji}</span>}
          {o.color && !o.emoji && (
            <div className={`${layout === "grid" ? "w-14 h-14" : "w-12 h-12"} rounded-full border-2 border-border shrink-0`} style={{ backgroundColor: o.color }} />
          )}
          <div className={layout === "grid" ? "text-center" : ""}>
            <span className="font-bold text-foreground text-sm">{l(o.label)}</span>
            {o.desc && <p className="text-xs text-muted-foreground mt-0.5">{l(o.desc)}</p>}
          </div>
        </button>
      ))}
    </div>
  );

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
            <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
            <h2 className="font-display text-xl text-center text-foreground">{l(titles[step])}</h2>

            {/* Step 0: Skin tone */}
            {step === 0 && renderOptionCards<SkinTone>(SKIN_OPTIONS, skinTone, setSkinTone, "grid")}

            {/* Step 1: Veins */}
            {step === 1 && (
              <>
                <p className="text-xs text-muted-foreground text-center">
                  {lang === "es"
                    ? "Mira la parte interior de tu muñeca bajo luz natural y observa el color de tus venas."
                    : "Look at the inside of your wrist under natural light and observe your vein color."}
                </p>
                {renderOptionCards<VeinColor>(VEIN_OPTIONS, veinColor, setVeinColor)}
              </>
            )}

            {/* Step 2: Jewelry */}
            {step === 2 && renderOptionCards<JewelryPref>(JEWELRY_OPTIONS, jewelryPref, setJewelryPref)}

            {/* Step 3: Color reaction */}
            {step === 3 && (
              <>
                <p className="text-xs text-muted-foreground text-center">
                  {lang === "es"
                    ? "Imagina que acercas una tela de cada color a tu rostro. ¿Cuál te ilumina más?"
                    : "Imagine holding a fabric of each color near your face. Which one brightens you more?"}
                </p>
                {renderOptionCards<ColorReaction>(COLOR_REACTION_OPTIONS, colorReaction, setColorReaction)}
              </>
            )}

            {/* Step 4: Eye color */}
            {step === 4 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {EYE_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => setEyeColor(o.value)} className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${eyeColor === o.value ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}>
                    <div className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: o.color }} />
                    <span className="text-xs font-bold text-foreground text-center">{l(o.label)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Natural level */}
            {step === 5 && (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                  <button key={lv} onClick={() => setNaturalLevel(lv)} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${naturalLevel === lv ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}>
                    <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Current color (Natural + Fantasy) */}
            {step === 6 && (
              <>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {lang === "es" ? "Color natural / teñido convencional" : "Natural / conventional dyed color"}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                      <button key={lv} onClick={() => { setCurrentLevel(lv); setCurrentFantasy(null); }} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${currentLevel === lv && !currentFantasy ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}>
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {lang === "es" ? "Color fantasía / teñido especial" : "Fantasy / special dyed color"}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {FANTASY_COLORS.map((fc) => (
                      <button key={fc.value} onClick={() => { setCurrentFantasy(fc.value); setCurrentLevel(null); }} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${currentFantasy === fc.value ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}>
                        <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: fc.hex }} />
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{l(fc.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {currentFantasy && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{lang === "es" ? "Los colores fantasía requieren un proceso de decoloración/decapado profesional antes de aplicar un nuevo tinte." : "Fantasy colors require a professional bleaching/stripping process before applying a new dye."}</span>
                  </div>
                )}
                {!currentFantasy && naturalLevel && currentLevel && Math.abs(naturalLevel - currentLevel) > 3 && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{lang === "es" ? "Tu color actual difiere en más de 3 niveles de tu natural. Ten en cuenta que esto puede requerir un proceso profesional." : "Your current color differs by more than 3 levels from your natural. This may require a professional process."}</span>
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
          <Button onClick={handleNext} disabled={!canProceed} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1">
            {step === totalSteps - 1 ? (lang === "es" ? "Analizar" : "Analyze") : (lang === "es" ? "Siguiente" : "Next")}
            {step === totalSteps - 1 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Colorimetry 101 on stepper */}
        <Colorimetry101 lang={lang} />

        {/* FAQ on stepper page */}
        <ColorMatchFAQ lang={lang} onReset={reset} showResetButton={false} />
      </section>
    </>
  );
}

/* ── Colorimetry 101 Section ────────────────────── */
function Colorimetry101({ lang }: { lang: "es" | "en" }) {
  return (
    <section className="mt-12 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-secondary" />
        <h3 className="font-display text-xl text-foreground">
          {lang === "es" ? "Colorimetría 101" : "Colorimetry 101"}
        </h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what" className="border-border">
          <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-secondary transition-colors">
            {lang === "es" ? "¿Qué es la colorimetría?" : "What is colorimetry?"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              {lang === "es"
                ? "La colorimetría es la ciencia que estudia los colores que mejor armonizan con tu tono de piel, ojos y cabello natural. Se basa en la teoría de las 4 estaciones (Invierno, Verano, Otoño, Primavera) y en el análisis de tu subtono cutáneo."
                : "Colorimetry is the science that studies which colors best harmonize with your skin tone, eyes, and natural hair. It's based on the 4-season theory (Winter, Summer, Autumn, Spring) and your skin undertone analysis."}
            </p>
            <p>
              {lang === "es"
                ? "Conocer tu paleta personal te permite potenciar tu belleza natural, comprar de forma más inteligente (ropa, maquillaje, tinte) y aumentar tu confianza al saber que cada elección cromática te favorece."
                : "Knowing your personal palette lets you enhance your natural beauty, shop smarter (clothing, makeup, hair dye), and boost your confidence by knowing every color choice flatters you."}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="methods" className="border-border">
          <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-secondary transition-colors">
            {lang === "es" ? "4 métodos caseros para conocer tu subtono" : "4 home methods to find your undertone"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>{lang === "es" ? "Test de las venas:" : "Vein test:"}</strong>{" "}
                {lang === "es"
                  ? "Mira la parte interior de tu muñeca bajo luz natural. Venas azules/moradas = frío; verdes = cálido; mezcla = neutro."
                  : "Look at your inner wrist under natural light. Blue/purple veins = cool; green = warm; mixed = neutral."}
              </li>
              <li>
                <strong>{lang === "es" ? "Test de la tela:" : "Fabric test:"}</strong>{" "}
                {lang === "es"
                  ? "Acerca una tela naranja y una rosa fucsia a tu rostro. Si el naranja te ilumina = cálido; si el fucsia = frío."
                  : "Hold orange and fuchsia fabric near your face. If orange brightens you = warm; if fuchsia = cool."}
              </li>
              <li>
                <strong>{lang === "es" ? "Test del papel blanco:" : "White paper test:"}</strong>{" "}
                {lang === "es"
                  ? "Coloca un folio blanco junto a tu cara. Si tu piel parece amarillenta = cálido; rosácea = frío; sin cambio notable = neutro."
                  : "Hold white paper next to your face. If your skin looks yellowish = warm; pinkish = cool; no noticeable change = neutral."}
              </li>
              <li>
                <strong>{lang === "es" ? "Cabello y ojos:" : "Hair & eyes:"}</strong>{" "}
                {lang === "es"
                  ? "Si tu pelo y ojos naturales tienen matices dorados = cálido. Si tienen matices ceniza o azulados = frío."
                  : "If your natural hair and eyes have golden tones = warm. If they have ashy or bluish tones = cool."}
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="why" className="border-border">
          <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-secondary transition-colors">
            {lang === "es" ? "¿Por qué es importante para elegir tu tinte?" : "Why does it matter for choosing your dye?"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              {lang === "es"
                ? "Un tinte que respete tu subtono natural hará que tu piel luzca más luminosa, tus ojos resalten y tu aspecto general sea más armónico. Por el contrario, un color que choque con tu subtono puede apagar tu tez, hacer que parezcas cansado/a o envejecer tu aspecto. La colorimetría profesional elimina las dudas y te permite acertar siempre."
                : "A dye that respects your natural undertone will make your skin glow, your eyes pop, and your overall look more harmonious. Conversely, a color that clashes with your undertone can dull your complexion, make you look tired, or age your appearance. Professional colorimetry removes the guesswork and helps you get it right every time."}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

/* ── FAQ Component ─────────────────────────────── */
const FAQ_DATA = [
  {
    q: { es: "Busco un peinado que se adapte a mi estilo atrevido. ¿Qué color de pelo me favorece?", en: "I'm looking for a hairstyle that suits my bold style. What hair color flatters me?" },
    a: { es: "Para ti, el pelo no es sólo un color, es una declaración. Los colores más atrevidos muestran tu estilo personal y revelan una hermosa confianza interior. Pero no olvides que un color de pelo equivocado puede apagar tu tez.", en: "For you, hair isn't just a color — it's a statement. The boldest shades showcase your personal style and reveal a beautiful inner confidence. But don't forget that the wrong hair color can wash out your complexion." },
  },
  {
    q: { es: "¿Qué aspecto tendría con el pelo castaño?", en: "What would I look like with brown hair?" },
    a: { es: "Depende de tu tono de piel. Por ejemplo, los marrones oscuros y los dorados son preciosos si tienes la piel oscura con matices fríos y neutros. Pero algunos marrones pueden hacer que las pieles claras con matices fríos parezcan apagadas.", en: "It depends on your skin tone. For instance, dark browns and golden tones look gorgeous on dark skin with cool and neutral undertones. However, some browns can make light skin with cool undertones look dull." },
  },
  {
    q: { es: "¿Qué aspecto tendría con el pelo rubio?", en: "What would I look like with blonde hair?" },
    a: { es: "La tez no es lo único que hay que tener en cuenta. El color del pelo también puede acentuar la belleza del color de tus ojos. Elige un color que contraste, como el rubio caramelo para los ojos azules o el rojo suave para los ojos verde esmeralda.", en: "Complexion isn't the only thing to consider. Hair color can also accentuate the beauty of your eye color. Choose a contrasting shade — like caramel blonde for blue eyes or soft red for emerald green eyes." },
  },
];

function ColorMatchFAQ({ lang, onReset, showResetButton = true }: { lang: "es" | "en"; onReset: () => void; showResetButton?: boolean }) {
  const l = (obj: { es: string; en: string }) => obj[lang] || obj.es;

  return (
    <section className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-secondary" />
        <h3 className="font-display text-xl text-foreground">
          {lang === "es" ? "¿Qué color de pelo me favorece?" : "What hair color flatters me?"}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {lang === "es" ? "Preguntas y Respuestas" : "Questions & Answers"}
      </p>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_DATA.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border">
            <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:text-secondary transition-colors">
              {l(item.q)}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {l(item.a)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showResetButton && (
        <Button onClick={onReset} variant="ghost" size="sm" className="gap-2 text-secondary hover:text-secondary/80">
          <RotateCcw className="w-3.5 h-3.5" />
          {lang === "es" ? "Volver a realizar el test" : "Take the test again"}
        </Button>
      )}
    </section>
  );
}
