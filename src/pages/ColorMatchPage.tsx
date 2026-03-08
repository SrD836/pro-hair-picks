import { useState, useCallback } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, AlertTriangle, ExternalLink, RotateCcw, FlaskConical, HelpCircle, Snowflake, Sun, Leaf, Umbrella, BookOpen, Gem, Palette, ShirtIcon, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import { WizardShell } from "@/components/mi-pelo/shared/WizardShell";
import { NavigationBar } from "@/components/mi-pelo/shared/NavigationBar";
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
  { value: "light", label: { es: "Clara", en: "Light" }, color: "#f5dcc3", desc: { es: "Piel tipo I-II · Todo tipo de cabello", en: "Type I-II · All hair types" } },
  { value: "medium", label: { es: "Media", en: "Medium" }, color: "#d4a574", desc: { es: "Piel tipo III · Melocotón/beige", en: "Type III · Peach/beige" } },
  { value: "tan", label: { es: "Bronceada", en: "Tan" }, color: "#a0764a", desc: { es: "Piel tipo IV-V · Oliva/dorada", en: "Type IV-V · Olive/golden" } },
  { value: "dark", label: { es: "Oscura", en: "Dark" }, color: "#6b4226", desc: { es: "Piel tipo VI · Oscura a muy oscura", en: "Type VI · Dark to very dark" } },
];

const VEIN_OPTIONS: StepOption<VeinColor>[] = [
  { value: "blue", label: { es: "Azules / Moradas", en: "Blue / Purple" }, emoji: "💎", desc: { es: "Subtono frío", en: "Cool undertone" } },
  { value: "green", label: { es: "Verdes", en: "Green" }, emoji: "🌿", desc: { es: "Subtono cálido", en: "Warm undertone" } },
  { value: "mixed", label: { es: "Mezcla de ambas", en: "Mix of both" }, emoji: "⚖️", desc: { es: "Subtono neutro", en: "Neutral undertone" } },
];

const JEWELRY_OPTIONS: StepOption<JewelryPref>[] = [
  { value: "silver", label: { es: "Plata", en: "Silver" }, emoji: "🪙", desc: { es: "Los plateados te favorecen más", en: "Silver flatters you more" } },
  { value: "gold", label: { es: "Oro", en: "Gold" }, emoji: "✨", desc: { es: "Los dorados te favorecen más", en: "Gold flatters you more" } },
  { value: "both", label: { es: "Ambos por igual", en: "Both equally" }, emoji: "💫", desc: { es: "Ambos metales te quedan bien", en: "Both metals look good" } },
];

const COLOR_REACTION_OPTIONS: StepOption<ColorReaction>[] = [
  { value: "pink", label: { es: "Rosa fucsia", en: "Fuchsia pink" }, color: "#e91e8c", desc: { es: "Te ilumina más el rostro", en: "Brightens your face more" } },
  { value: "orange", label: { es: "Naranja", en: "Orange" }, color: "#f39c12", desc: { es: "Te ilumina más el rostro", en: "Brightens your face more" } },
  { value: "both", label: { es: "Ambos", en: "Both" }, emoji: "🎨", desc: { es: "Ambos te favorecen", en: "Both flatter you" } },
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

type AffiliateKey = "veryFair" | "fair" | "medium" | "olive" | "dark" | "veryDark" | "redhead";
type UndertoneKey = "cool" | "neutral" | "warm";

const DYE_LINKS_ES: Record<AffiliateKey, Record<UndertoneKey, { code: string; url: string }>> = {
  veryFair: { cool: { code: "10.1", url: "https://amzn.to/4kSYMER" }, neutral: { code: "10.0", url: "https://amzn.to/47aMfqy" }, warm: { code: "10.3", url: "https://amzn.to/46lQpM3" } },
  fair: { cool: { code: "8.1", url: "https://amzn.to/4aAXScI" }, neutral: { code: "8.0", url: "https://amzn.to/4aB0A1S" }, warm: { code: "8.4", url: "https://amzn.to/4b5iRo2" } },
  medium: { cool: { code: "5.1", url: "https://amzn.to/3ZUOxGo" }, neutral: { code: "5.0", url: "https://amzn.to/40upsCk" }, warm: { code: "5.3", url: "https://amzn.to/4aQHbZJ" } },
  olive: { cool: { code: "4.1", url: "https://amzn.to/40qlwT9" }, neutral: { code: "4.0", url: "https://amzn.to/4s6TMif" }, warm: { code: "4.5", url: "https://amzn.to/3ZRgjnl" } },
  dark: { cool: { code: "3.1", url: "https://amzn.to/3MObhF8" }, neutral: { code: "3.0", url: "https://amzn.to/46ojO8i" }, warm: { code: "3.4", url: "https://amzn.to/3OBga4U" } },
  veryDark: { cool: { code: "1.1", url: "https://amzn.to/3MHD36g" }, neutral: { code: "1.0", url: "https://amzn.to/3Oqhckl" }, warm: { code: "1.5", url: "https://amzn.to/4kTY5v2" } },
  redhead: { cool: { code: "6.6", url: "https://amzn.to/3OZavWo" }, neutral: { code: "7.46", url: "https://amzn.to/4bcXwIr" }, warm: { code: "8.43", url: "https://amzn.to/4c8jvlK" } },
};

const DYE_LINKS_US: Record<AffiliateKey, Record<UndertoneKey, { code: string; url: string }>> = {
  veryFair: { cool: { code: "10.1", url: "https://amzn.to/46tk1XY" }, neutral: { code: "10.0", url: "https://amzn.to/4b8o7ar" }, warm: { code: "10.3", url: "https://amzn.to/4ruzX4B" } },
  fair: { cool: { code: "8.1", url: "https://amzn.to/3P1g6eM" }, neutral: { code: "8.0", url: "https://amzn.to/4b6SyxI" }, warm: { code: "8.4", url: "https://amzn.to/4ubMBHF" } },
  medium: { cool: { code: "5.1", url: "https://amzn.to/4s27P8K" }, neutral: { code: "5.0", url: "https://amzn.to/4ciumtz" }, warm: { code: "5.3", url: "https://amzn.to/4b4fMoh" } },
  olive: { cool: { code: "4.1", url: "https://amzn.to/46KDFin" }, neutral: { code: "4.0", url: "https://amzn.to/4b8N2L6" }, warm: { code: "4.5", url: "https://amzn.to/4ciuzNn" } },
  dark: { cool: { code: "3.1", url: "https://amzn.to/4aQMS9O" }, neutral: { code: "3.0", url: "https://amzn.to/4az00Sb" }, warm: { code: "3.4", url: "https://amzn.to/4s6XN6j" } },
  veryDark: { cool: { code: "1.1", url: "https://amzn.to/4tQFT9C" }, neutral: { code: "1.0", url: "https://amzn.to/4aAGOnc" }, warm: { code: "1.5", url: "https://amzn.to/4cNcXsV" } },
  redhead: { cool: { code: "6.6", url: "https://amzn.to/4tR7TtE" }, neutral: { code: "7.46", url: "https://amzn.to/4b7FPuJ" }, warm: { code: "8.43", url: "https://amzn.to/4aCw088" } },
};

function getAffiliateKey(skinTone: SkinTone, level: number): AffiliateKey {
  if (level >= 9) return "veryFair";
  if (level >= 7) return "fair";
  if (level >= 5) return "medium";
  if (level >= 4) return "olive";
  if (level >= 2) return "dark";
  if (level >= 1) return "veryDark";
  if (skinTone === "light") return "fair";
  if (skinTone === "medium") return "medium";
  if (skinTone === "tan") return "olive";
  return "dark";
}

function isRedheadResult(code: string): boolean {
  const redCodes = ["6.6", "7.46", "8.43", "6.64", "7.64", "5.64", "6.46", "7.44", "5.6"];
  return redCodes.includes(code);
}

function getDyeLink(linksMap: Record<AffiliateKey, Record<UndertoneKey, { code: string; url: string }>>, skinTone: SkinTone, undertone: UndertoneKey, resultCode: string, level: number): string | null {
  if (isRedheadResult(resultCode)) {
    return linksMap.redhead[undertone]?.url || null;
  }
  const key = getAffiliateKey(skinTone, level);
  return linksMap[key]?.[undertone]?.url || null;
}

const SEASON_ICON_MAP: Record<Season, typeof Snowflake> = {
  winter: Snowflake, summer: Umbrella, autumn: Leaf, spring: Sun,
};

const SEASON_NAMES: Record<Season, { es: string; en: string }> = {
  winter: { es: "Invierno", en: "Winter" },
  summer: { es: "Verano", en: "Summer" },
  autumn: { es: "Otoño", en: "Autumn" },
  spring: { es: "Primavera", en: "Spring" },
};

/* ── Shared card button for wizard ─────────────── */
function WizardCard({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 bg-white ${
        selected ? 'border-accent-orange shadow-bento' : 'border-espresso/8 hover:border-accent-orange/30 hover:shadow-bento'
      } ${className}`}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent-orange flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
      {children}
    </button>
  );
}

/* ── Component ─────────────────────────────────── */
export default function ColorMatchPage() {
  const { lang } = useLanguage();
  const location = useLocation();
  const isUS = location.pathname === "/color-match";
  const activeDyeLinks = isUS ? DYE_LINKS_US : DYE_LINKS_ES;
  const l = (obj: { es: string; en: string }) => obj[lang] || obj.es;

  const [started, setStarted] = useState(false);
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
  const [direction, setDirection] = useState<1 | -1>(1);

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
          skinTone, undertone, eyeColor, naturalLevel,
          currentLevel: currentFantasy ? 0 : (currentLevel ?? naturalLevel),
          currentFantasy,
        };
        setResult(getRecommendation(profile));
        setLoading(false);
      }
    }, 800);
  }, [skinTone, veinColor, jewelryPref, colorReaction, eyeColor, naturalLevel, currentLevel, currentFantasy]);

  const handleNext = () => {
    if (step < totalSteps - 1) { setDirection(1); setStep(step + 1); }
    else runAnalysis();
  };

  const handlePrev = () => {
    if (step === 0) setStarted(false);
    else { setDirection(-1); setStep(step - 1); }
  };

  const reset = () => {
    setStep(0); setSkinTone(null); setVeinColor(null); setJewelryPref(null);
    setColorReaction(null); setEyeColor(null); setNaturalLevel(null);
    setCurrentLevel(null); setCurrentFantasy(null); setResult(null);
    setLoading(false); setStarted(false);
  };

  const computedUndertone = veinColor && jewelryPref && colorReaction
    ? computeUndertone(veinColor, jewelryPref, colorReaction) : null;
  const effectiveUndertone: UndertoneKey = computedUndertone ?? "neutral";

  const metaTitle = lang === "es"
    ? "Expert Color Matcher | Asesor de Color Capilar Profesional"
    : "Expert Color Matcher | Professional Hair Color Advisor";
  const metaDesc = lang === "es"
    ? "Descubre tu color de cabello ideal con nuestro algoritmo de visagismo profesional."
    : "Discover your ideal hair color with our professional visagism algorithm.";

  // ── Loading screen ──
  if (loading) {
    return (
      <>
        <SEOHead title={metaTitle} description={metaDesc} />
        <div className="min-h-screen bg-background-light flex items-center justify-center">
          <motion.div className="text-center space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="w-20 h-20 mx-auto rounded-full border-4 border-accent-orange border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <AnimatePresence mode="wait">
              <motion.p key={loadingMsg} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-espresso/60 font-display text-lg">
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

    const paletteSwatches = [
      result.hexPreview,
      ...result.complementary.slice(0, 5).map((c) => c.hex),
    ];

    return (
      <>
        <SEOHead title={metaTitle} description={metaDesc} />

        {/* Hero */}
        <div className="bg-espresso py-16 text-center">
          <div className="container mx-auto px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-orange mb-4">
              {lang === "es" ? "Tu Análisis Cromático" : "Your Color Analysis"}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold italic text-cream mb-4">
              {lang === "es" ? "Tu Master Color Card" : "Your Master Color Card"}
            </h1>
            <p className="text-gold text-lg font-display">
              {SEASON_STYLES[result.season].icon} {l(SEASON_NAMES[result.season])}
            </p>
          </div>
        </div>

        <section className="bg-background-light py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Bento grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expert analysis */}
                <div className="bg-white border border-espresso/8 rounded-2xl p-6 flex flex-col gap-4 shadow-bento">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-orange/10 border-2 border-accent-orange/30 flex items-center justify-center shrink-0">
                      <SeasonIcon className="w-6 h-6 text-accent-orange" />
                    </div>
                    <div>
                      <p className="text-[10px] text-espresso/40 uppercase tracking-wider">
                        {lang === "es" ? "Análisis Experto" : "Expert Analysis"}
                      </p>
                      <p className="font-display text-sm text-espresso font-bold">
                        {lang === "es" ? "Colorista Senior" : "Senior Colorist"}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 w-fit">
                    <span className="text-sm">{SEASON_STYLES[result.season].icon}</span>
                    <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">{l(SEASON_NAMES[result.season])}</span>
                  </div>
                  <blockquote className="italic text-sm text-espresso/50 leading-relaxed border-l-2 border-accent-orange/40 pl-4 flex-1">
                    {l(result.verdict)}
                  </blockquote>
                  <div className="pt-4 border-t border-espresso/8">
                    <p className="text-[10px] text-espresso/40 uppercase tracking-wider mb-1">
                      {lang === "es" ? "Subtono" : "Undertone"}
                    </p>
                    <p className="text-sm font-bold text-espresso">{l(undertoneLabel)}</p>
                    <p className="text-xs text-espresso/40 mt-1">{l(seasonStyle.contrast)}</p>
                  </div>
                </div>

                {/* Center: Color circle */}
                <div className="bg-white border border-espresso/8 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-bento">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="72" fill={result.hexPreview} />
                    <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(236,91,19,0.5)" strokeWidth="3" />
                  </svg>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 border border-accent-orange/30">
                    <Sparkles className="w-4 h-4 text-accent-orange" />
                    <span className="text-sm font-bold text-accent-orange">98% MATCH</span>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-espresso">{result.code}</p>
                    <p className="text-sm text-espresso/50">{l(result.name)}</p>
                  </div>
                  <div className="w-full bg-espresso/[0.03] rounded-xl p-4 border border-espresso/5 text-xs text-espresso/50 leading-relaxed text-center">
                    {l(result.description)}
                  </div>
                </div>

                {/* Right: Palette */}
                <div className="bg-white border border-espresso/8 rounded-2xl p-6 flex flex-col gap-4 shadow-bento">
                  <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-wider">
                    {lang === "es" ? "Tu Paleta Cromática" : "Your Color Palette"}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {paletteSwatches.slice(0, 6).map((hex, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-14 h-14 rounded-xl border border-espresso/8 shadow-sm" style={{ backgroundColor: hex }} />
                        {i === 0 && <span className="text-[10px] text-accent-orange font-bold">{lang === "es" ? "Principal" : "Main"}</span>}
                      </div>
                    ))}
                  </div>
                  {result.requiresDecolor && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                      <FlaskConical className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-espresso/60">{lang === "es" ? "Requiere decoloración profesional" : "Requires professional bleaching"}</p>
                    </div>
                  )}
                  {result.requiresSalon && !result.requiresDecolor && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-espresso/60">
                        {lang === "es" ? `Salto de ${result.levelJump} niveles — visita un salón` : `${result.levelJump}-level jump — visit a salon`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clothing + avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-espresso/8 rounded-2xl p-6 shadow-bento">
                  <h3 className="font-display text-sm text-espresso/50 mb-3 flex items-center gap-2">
                    <ShirtIcon className="w-4 h-4" />
                    {lang === "es" ? "Tus colores ideales para vestir" : "Your ideal clothing colors"}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {seasonStyle.clothingColors.map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-lg border-2 border-espresso/8 shadow-sm" style={{ backgroundColor: c.hex }} />
                        <span className="text-[10px] text-espresso/40 text-center max-w-[60px]">{l(c.name)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-espresso/8 rounded-2xl p-6 shadow-bento">
                  <h3 className="font-display text-sm text-red-400 mb-3">
                    {lang === "es" ? "🚫 Colores a evitar" : "🚫 Colors to avoid"}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {seasonStyle.avoidColors.map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 opacity-70">
                        <div className="w-10 h-10 rounded-lg border-2 border-red-200 shadow-sm relative" style={{ backgroundColor: c.hex }}>
                          <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">✕</div>
                        </div>
                        <span className="text-[10px] text-espresso/40 text-center max-w-[60px]">{l(c.name)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => toast({ title: lang === "es" ? "Próximamente" : "Coming soon", description: lang === "es" ? "La guía PDF estará disponible próximamente." : "The PDF guide will be available soon." })}
                  className="flex-1 px-6 py-4 rounded-2xl bg-accent-orange text-white font-bold text-sm hover:bg-accent-orange-hover transition-all"
                >
                  {lang === "es" ? "Descargar Guía PDF" : "Download PDF Guide"}
                </button>
                <Link to="/categorias/tintes" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-espresso/10 text-espresso font-bold text-sm hover:border-accent-orange transition-all">
                  {lang === "es" ? "Ver Productos" : "View Products"} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Amazon CTAs */}
              {!result.requiresDecolor && !result.requiresSalon && (() => {
                const dyeUrlES = skinTone ? getDyeLink(DYE_LINKS_ES, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
                const dyeUrlUS = skinTone ? getDyeLink(DYE_LINKS_US, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
                const hasAny = dyeUrlES || dyeUrlUS;
                return hasAny ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {dyeUrlES && (
                      <a href={dyeUrlES} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent-orange text-white font-bold text-sm hover:bg-accent-orange-hover transition-all">
                        🇪🇸 Amazon España <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {dyeUrlUS && (
                      <a href={dyeUrlUS} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent-orange text-white font-bold text-sm hover:bg-accent-orange-hover transition-all">
                        🇺🇸 Amazon USA <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : null;
              })()}

              <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-espresso/10 text-espresso/40 text-sm hover:text-espresso transition-colors">
                <RotateCcw className="w-4 h-4" /> {lang === "es" ? "Empezar de nuevo" : "Start over"}
              </button>

              <Colorimetry101 lang={lang} />
              <ColorMatchFAQ lang={lang} onReset={reset} />
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  // ── Landing ──
  if (!started) {
    return (
      <>
        <SEOHead title={metaTitle} description={metaDesc} />
        <div className="min-h-screen bg-background-light">
          {/* Breadcrumb */}
          <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
            <nav className="flex items-center gap-1.5 text-xs text-espresso/40">
              <Link to="/mi-pelo" className="hover:text-espresso/70 transition-colors">Mi Pelo</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-espresso/60">Expert Color Matcher</span>
            </nav>
          </div>

          {/* Hero card */}
          <div className="max-w-3xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-espresso rounded-3xl p-8 md:p-12 text-center"
            >
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-6 border border-accent-orange/30 bg-accent-orange/10 text-accent-orange">
                COLORIMETRÍA
              </span>

              <h1 className="font-display text-[2.5rem] md:text-5xl font-bold italic text-cream mb-5 leading-[1.1] tracking-tight">
                Expert Color <span className="text-accent-orange">Matcher</span>
              </h1>

              <p className="text-cream/60 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-4">
                {lang === "es"
                  ? "Descubre tu color ideal con nuestro algoritmo de visagismo profesional."
                  : "Discover your ideal color with our professional visagism algorithm."}
              </p>

              <p className="text-cream/30 text-sm mb-8">
                ~3 min · {lang === "es" ? "Sin registro · 7 pasos" : "No registration · 7 steps"}
              </p>

              {/* Color swatches preview — hair levels carousel */}
              <div className="flex justify-center gap-2.5 mb-10 overflow-x-auto scrollbar-hide py-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                  <div key={lv} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-11 h-11 rounded-full border-2 border-cream/15" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                    <span className="text-[9px] text-cream/40 whitespace-nowrap">{lv}.0</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStarted(true)}
                className="px-10 py-4 rounded-2xl bg-accent-orange text-white font-bold text-lg hover:bg-accent-orange-hover transition-all duration-300"
              >
                {lang === "es" ? "Iniciar Asesoría →" : "Start Analysis →"}
              </button>
            </motion.div>
          </div>

          <Colorimetry101 lang={lang} />
          <ColorMatchFAQ lang={lang} onReset={reset} showResetButton={false} />
        </div>
      </>
    );
  }

  // ── Wizard ──
  return (
    <>
      <SEOHead title={metaTitle} description={metaDesc} />

      <WizardShell toolName="EXPERT COLOR MATCHER" currentStep={step} totalSteps={totalSteps} onClose={reset}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Question text */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.h2
              key={`q-${step}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl md:text-[2rem] text-espresso mb-10 leading-snug tracking-tight text-center"
            >
              {l(titles[step])}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`opts-${step}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step 0: Skin tone */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {SKIN_OPTIONS.map((o) => (
                    <WizardCard key={o.value} selected={skinTone === o.value} onClick={() => setSkinTone(o.value)}>
                      <div className={`w-14 h-14 rounded-full border-2 transition-all ${skinTone === o.value ? 'border-accent-orange shadow-lg' : 'border-espresso/10'}`} style={{ backgroundColor: o.color }} />
                      <span className="text-sm font-semibold text-espresso">{l(o.label)}</span>
                      {o.desc && <span className="text-xs text-espresso/40">{l(o.desc)}</span>}
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 1: Veins */}
              {step === 1 && (
                <div className="grid gap-3">
                  <p className="text-xs text-espresso/40 text-center mb-2">
                    {lang === "es" ? "Mira la parte interior de tu muñeca bajo luz natural." : "Look at the inside of your wrist under natural light."}
                  </p>
                  {VEIN_OPTIONS.map((o) => (
                    <WizardCard key={o.value} selected={veinColor === o.value} onClick={() => setVeinColor(o.value)} className="!flex-row !text-left !items-center gap-4 !p-5">
                      <span className="text-3xl">{o.emoji}</span>
                      <div>
                        <span className="font-bold text-espresso text-sm">{l(o.label)}</span>
                        {o.desc && <p className="text-xs text-espresso/40 mt-0.5">{l(o.desc)}</p>}
                      </div>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 2: Jewelry */}
              {step === 2 && (
                <div className="grid gap-3">
                  {JEWELRY_OPTIONS.map((o) => (
                    <WizardCard key={o.value} selected={jewelryPref === o.value} onClick={() => setJewelryPref(o.value)} className="!flex-row !text-left !items-center gap-4 !p-5">
                      <span className="text-3xl">{o.emoji}</span>
                      <div>
                        <span className="font-bold text-espresso text-sm">{l(o.label)}</span>
                        {o.desc && <p className="text-xs text-espresso/40 mt-0.5">{l(o.desc)}</p>}
                      </div>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 3: Color reaction */}
              {step === 3 && (
                <div className="grid gap-3">
                  <p className="text-xs text-espresso/40 text-center mb-2">
                    {lang === "es" ? "Imagina que acercas una tela de cada color a tu rostro." : "Imagine holding a fabric of each color near your face."}
                  </p>
                  {COLOR_REACTION_OPTIONS.map((o) => (
                    <WizardCard key={o.value} selected={colorReaction === o.value} onClick={() => setColorReaction(o.value)} className="!flex-row !text-left !items-center gap-4 !p-5">
                      {o.color ? (
                        <div className={`w-12 h-12 rounded-full border-2 shrink-0 ${colorReaction === o.value ? 'border-accent-orange' : 'border-espresso/10'}`} style={{ backgroundColor: o.color }} />
                      ) : (
                        <span className="text-3xl">{o.emoji}</span>
                      )}
                      <div>
                        <span className="font-bold text-espresso text-sm">{l(o.label)}</span>
                        {o.desc && <p className="text-xs text-espresso/40 mt-0.5">{l(o.desc)}</p>}
                      </div>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 4: Eye color */}
              {step === 4 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {EYE_OPTIONS.map((o) => (
                    <WizardCard key={o.value} selected={eyeColor === o.value} onClick={() => setEyeColor(o.value)}>
                      <div className={`w-12 h-12 rounded-full border-2 ${eyeColor === o.value ? 'border-accent-orange shadow-lg' : 'border-espresso/10'}`} style={{ backgroundColor: o.color }} />
                      <span className="text-xs font-bold text-espresso text-center">{l(o.label)}</span>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 5: Natural level */}
              {step === 5 && (
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                    <WizardCard key={lv} selected={naturalLevel === lv} onClick={() => setNaturalLevel(lv)} className="!p-3">
                      <div className={`w-10 h-10 rounded-full border ${naturalLevel === lv ? 'border-accent-orange' : 'border-espresso/10'}`} style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                      <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 6: Current color */}
              {step === 6 && (
                <>
                  <div>
                    <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-wider mb-3">
                      {lang === "es" ? "Color natural / teñido convencional" : "Natural / conventional dyed color"}
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                        <WizardCard key={lv} selected={currentLevel === lv && !currentFantasy} onClick={() => { setCurrentLevel(lv); setCurrentFantasy(null); }} className="!p-3">
                          <div className="w-10 h-10 rounded-full border border-espresso/10" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                          <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                        </WizardCard>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-wider mb-3">
                      {lang === "es" ? "Color fantasía / teñido especial" : "Fantasy / special dyed color"}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {FANTASY_COLORS.map((fc) => (
                        <WizardCard key={fc.value} selected={currentFantasy === fc.value} onClick={() => { setCurrentFantasy(fc.value); setCurrentLevel(null); }} className="!p-3">
                          <div className="w-10 h-10 rounded-full border border-espresso/10" style={{ backgroundColor: fc.hex }} />
                          <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(fc.label)}</span>
                        </WizardCard>
                      ))}
                    </div>
                  </div>
                  {currentFantasy && (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-3 border border-red-200 mt-4">
                      <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{lang === "es" ? "Los colores fantasía requieren un proceso de decoloración profesional." : "Fantasy colors require professional bleaching."}</span>
                    </div>
                  )}
                  {!currentFantasy && naturalLevel && currentLevel && Math.abs(naturalLevel - currentLevel) > 3 && (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-3 border border-red-200 mt-4">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{lang === "es" ? "Tu color actual difiere en más de 3 niveles de tu natural." : "Your current color differs by more than 3 levels from your natural."}</span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <NavigationBar
          onPrev={handlePrev}
          onNext={handleNext}
          disableNext={!canProceed}
          prevLabel={lang === "es" ? "← Anterior" : "← Back"}
          nextLabel={step === totalSteps - 1 ? (lang === "es" ? "ANALIZAR →" : "ANALYZE →") : (lang === "es" ? `CONTINUAR AL PASO ${step + 2} →` : `CONTINUE TO STEP ${step + 2} →`)}
        />
      </WizardShell>
    </>
  );
}

/* ── Colorimetry 101 Section ────────────────────── */
function Colorimetry101({ lang }: { lang: "es" | "en" }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-accent-orange" />
        <h3 className="font-display text-xl text-espresso">
          {lang === "es" ? "Colorimetría 101" : "Colorimetry 101"}
        </h3>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what" className="border-espresso/10">
          <AccordionTrigger className="text-left text-sm font-medium text-espresso/70 hover:text-accent-orange transition-colors">
            {lang === "es" ? "¿Qué es la colorimetría?" : "What is colorimetry?"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-espresso/50 leading-relaxed space-y-2">
            <p>{lang === "es" ? "La colorimetría es la ciencia que estudia los colores que mejor armonizan con tu tono de piel, ojos y cabello natural. Se basa en la teoría de las 4 estaciones y en el análisis de tu subtono cutáneo." : "Colorimetry is the science that studies which colors best harmonize with your skin tone, eyes, and natural hair."}</p>
            <p>{lang === "es" ? "Conocer tu paleta personal te permite potenciar tu belleza natural, comprar de forma más inteligente y aumentar tu confianza." : "Knowing your personal palette lets you enhance your natural beauty and shop smarter."}</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="methods" className="border-espresso/10">
          <AccordionTrigger className="text-left text-sm font-medium text-espresso/70 hover:text-accent-orange transition-colors">
            {lang === "es" ? "4 métodos caseros para conocer tu subtono" : "4 home methods to find your undertone"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-espresso/50 leading-relaxed">
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>{lang === "es" ? "Test de las venas:" : "Vein test:"}</strong> {lang === "es" ? "Venas azules/moradas = frío; verdes = cálido; mezcla = neutro." : "Blue/purple veins = cool; green = warm; mixed = neutral."}</li>
              <li><strong>{lang === "es" ? "Test de la tela:" : "Fabric test:"}</strong> {lang === "es" ? "Naranja te ilumina = cálido; fucsia = frío." : "Orange brightens = warm; fuchsia = cool."}</li>
              <li><strong>{lang === "es" ? "Test del papel blanco:" : "White paper test:"}</strong> {lang === "es" ? "Piel amarillenta = cálido; rosácea = frío." : "Yellowish = warm; pinkish = cool."}</li>
              <li><strong>{lang === "es" ? "Cabello y ojos:" : "Hair & eyes:"}</strong> {lang === "es" ? "Matices dorados = cálido; ceniza = frío." : "Golden = warm; ashy = cool."}</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="why" className="border-espresso/10">
          <AccordionTrigger className="text-left text-sm font-medium text-espresso/70 hover:text-accent-orange transition-colors">
            {lang === "es" ? "¿Por qué es importante para elegir tu tinte?" : "Why does it matter for choosing your dye?"}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-espresso/50 leading-relaxed">
            <p>{lang === "es" ? "Un tinte que respete tu subtono natural hará que tu piel luzca más luminosa. La colorimetría profesional elimina las dudas." : "A dye that respects your natural undertone will make your skin glow. Professional colorimetry removes the guesswork."}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

/* ── FAQ Component ─────────────────────────────── */
const FAQ_DATA = [
  { q: { es: "¿Qué color de pelo me favorece si soy atrevido/a?", en: "What hair color flatters a bold style?" }, a: { es: "Los colores más atrevidos revelan una hermosa confianza interior. Pero un color equivocado puede apagar tu tez.", en: "Bold shades showcase your personal style. But the wrong color can wash out your complexion." } },
  { q: { es: "¿Qué aspecto tendría con el pelo castaño?", en: "What would I look like with brown hair?" }, a: { es: "Depende de tu tono de piel. Los marrones oscuros son preciosos en pieles oscuras con matices fríos.", en: "It depends on your skin tone. Dark browns look gorgeous on dark skin with cool undertones." } },
  { q: { es: "¿Qué aspecto tendría con el pelo rubio?", en: "What would I look like with blonde hair?" }, a: { es: "El color del pelo puede acentuar la belleza del color de tus ojos. Elige un color que contraste.", en: "Hair color can accentuate eye color beauty. Choose a contrasting shade." } },
];

function ColorMatchFAQ({ lang, onReset, showResetButton = true }: { lang: "es" | "en"; onReset: () => void; showResetButton?: boolean }) {
  const l = (obj: { es: string; en: string }) => obj[lang] || obj.es;
  return (
    <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-accent-orange" />
        <h3 className="font-display text-xl text-espresso">{lang === "es" ? "Preguntas frecuentes" : "FAQ"}</h3>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_DATA.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-espresso/10">
            <AccordionTrigger className="text-left text-sm font-medium text-espresso/70 hover:text-accent-orange transition-colors">{l(item.q)}</AccordionTrigger>
            <AccordionContent className="text-sm text-espresso/50 leading-relaxed">{l(item.a)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {showResetButton && (
        <button onClick={onReset} className="flex items-center gap-2 text-accent-orange/60 hover:text-accent-orange text-sm transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> {lang === "es" ? "Volver a realizar el test" : "Take the test again"}
        </button>
      )}
    </section>
  );
}
