import { useState, useCallback } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight, Sparkles, AlertTriangle, ExternalLink, RotateCcw,
  FlaskConical, HelpCircle, Snowflake, Sun, Leaf, Umbrella,
  BookOpen, Palette, ShirtIcon, ChevronRight, ChevronLeft, Check, Lightbulb, Download,
  Calendar, ShieldAlert, CheckCircle, XCircle, Minus
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import { WizardShell } from "@/components/mi-pelo/shared/WizardShell";
import { NavigationBar } from "@/components/mi-pelo/shared/NavigationBar";
import {
  type SkinTone, type EyeColor, type FantasyColor, type VeinColor,
  type JewelryPref, type ColorReaction, type Season, type UserProfile,
  type ColorRecommendation, getRecommendation, computeUndertone,
  FANTASY_COLORS, SEASON_STYLES,
} from "@/lib/colorMatchEngine";

/* ── Step option type ──────────────────────────── */
interface StepOption<T extends string> {
  value: T;
  label: { es: string; en: string };
  desc?: { es: string; en: string };
  color?: string;
  emoji?: string;
  image?: string;
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
  { value: "silver", label: { es: "Plata", en: "Silver" }, image: "/images/wizard/jewelry-silver.webp" },
  { value: "gold", label: { es: "Oro", en: "Gold" }, image: "/images/wizard/jewelry-gold.webp" },
  { value: "both", label: { es: "Ambos por igual", en: "Both equally" }, image: "/images/wizard/jewelry-both.webp" },
];

const COLOR_REACTION_OPTIONS: StepOption<ColorReaction>[] = [
  { value: "pink", label: { es: "Rosa fucsia", en: "Fuchsia pink" }, image: "/images/wizard/color-pink.webp", desc: { es: "Te ilumina más el rostro", en: "Brightens your face more" } },
  { value: "orange", label: { es: "Naranja", en: "Orange" }, image: "/images/wizard/color-orange.webp", desc: { es: "Te ilumina más el rostro", en: "Brightens your face more" } },
  { value: "both", label: { es: "Ambos", en: "Both" }, emoji: "🎨", desc: { es: "Ambos te favorecen", en: "Both flatter you" } },
];

const EYE_OPTIONS: StepOption<EyeColor>[] = [
  { value: "blue_gray", label: { es: "Azul / Gris", en: "Blue / Gray" }, color: "#7a9cc6", image: "/images/wizard/eye-blue.webp" },
  { value: "green", label: { es: "Verde", en: "Green" }, color: "#6a9a5a", image: "/images/wizard/eye-green.webp" },
  { value: "hazel", label: { es: "Miel / Avellana", en: "Hazel" }, color: "#b8863a", image: "/images/wizard/eye-hazel.webp" },
  { value: "brown", label: { es: "Marrón", en: "Brown" }, color: "#6a4a2a", image: "/images/wizard/eye-brown.webp" },
  { value: "black", label: { es: "Negro", en: "Black" }, color: "#2a2018", image: "/images/wizard/eye-black.webp" },
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

const STEP_LABELS_ES = ["Tono de piel", "Test de venas", "Test de metales", "Reacción al color", "Color de ojos", "Nivel natural", "Color actual"];
const STEP_LABELS_EN = ["Skin tone", "Vein test", "Metal test", "Color reaction", "Eye color", "Natural level", "Current color"];

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
  if (isRedheadResult(resultCode)) return linksMap.redhead[undertone]?.url || null;
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

/* ── Image card for wizard steps ────────────────── */
function ImageCard({ selected, onClick, image, label, className = '' }: {
  selected: boolean; onClick: () => void; image: string; label: string; className?: string;
}) {
  return (
    <button onClick={onClick} className={`group relative block overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 border-3 ${
      selected ? 'border-accent-orange shadow-lg ring-4 ring-accent-orange/20' : 'border-transparent hover:border-accent-orange/30'
    } ${className}`}>
      <img src={image} alt={label} className="w-full h-40 object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow-md">{label}</span>
      {selected && (
        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent-orange flex items-center justify-center shadow-md">
          <Check className="w-3.5 h-3.5 text-white" />
        </span>
      )}
    </button>
  );
}

/* ── Standard card for wizard steps ────────────── */
function WizardCard({ selected, onClick, children, className = '' }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border transition-all duration-300 bg-white ${
        selected ? 'border-accent-orange border-2 shadow-bento ring-4 ring-accent-orange/20' : 'border-[#E8E0D4] hover:border-accent-orange/30 hover:shadow-bento'
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
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [landingScroll, setLandingScroll] = useState(0);

  const titles = [
    { es: "¿Cuál es tu tono de piel?", en: "What is your skin tone?" },
    { es: "Test de venas: ¿de qué color se ven?", en: "Vein test: what color do they look?" },
    { es: "¿Qué metal te favorece más?", en: "Which metal flatters you more?" },
    { es: "¿Qué color te ilumina más el rostro?", en: "Which color brightens your face more?" },
    { es: "¿De qué color son tus ojos?", en: "What is your eye color?" },
    { es: "¿Cuál es tu nivel natural de cabello?", en: "What is your natural hair level?" },
    { es: "¿Cuál es tu color actual de cabello?", en: "What is your current hair color?" },
  ];

  const stepLabels = lang === "es" ? STEP_LABELS_ES : STEP_LABELS_EN;
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
      if (i < LOADING_MSGS.length) setLoadingMsg(i);
      else {
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
    setLoading(false); setStarted(false); setShowAllLevels(false);
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

    const skinLabels: Record<SkinTone, string> = { light: "Clara", medium: "Media", tan: "Bronceada", dark: "Oscura" };
    const veinLabels: Record<VeinColor, string> = { blue: "Azules/Moradas", green: "Verdes", mixed: "Mezcla" };
    const jewelryLabels: Record<JewelryPref, string> = { silver: "Plata", gold: "Oro", both: "Ambos" };
    const colorReactionLabels: Record<ColorReaction, string> = { pink: "Rosa fucsia", orange: "Naranja", both: "Ambos" };
    const eyeLabels: Record<EyeColor, string> = { blue_gray: "Azul/Gris", green: "Verde", hazel: "Miel", brown: "Marrón", black: "Negro" };

    const avoidTones = seasonStyle.avoidColors.map(c => l(c.name));
    const techniques = [
      { name: "Balayage / Californianas", status: "ok", note: "Muy recomendado" },
      { name: "Baño de color", status: "ok", note: "Excelente para mantenimiento" },
      { name: "Decoloración", status: "warn", note: "Solo con tratamiento previo" },
      { name: "Mechas de contraste fuerte", status: "bad", note: "No favorece tu colorimetría" },
    ];

    const handleDownloadPDF = () => {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      // Cover
      doc.setFontSize(24); doc.setTextColor(44, 34, 24);
      doc.text("GuiaDelSalon.com", 105, 40, { align: "center" });
      doc.setFontSize(18);
      doc.text("Tu Master Color Card", 105, 60, { align: "center" });
      doc.setFontSize(11); doc.setTextColor(100, 100, 100);
      doc.text("Diagnóstico de Colorimetría Profesional", 105, 72, { align: "center" });
      doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 105, 82, { align: "center" });
      doc.setDrawColor(196, 169, 125); doc.line(20, 90, 190, 90);
      // Result
      doc.setFontSize(14); doc.setTextColor(44, 34, 24);
      doc.text("TONO RECOMENDADO", 20, 105);
      doc.setFontSize(20); doc.setTextColor(232, 93, 4);
      doc.text(`${result.name.es} (${result.code})`, 20, 118);
      doc.setFontSize(11); doc.setTextColor(44, 34, 24);
      doc.text(`Estación: ${SEASON_NAMES[result.season].es}`, 20, 130);
      doc.text(`Subtono: ${undertoneLabel.es}`, 20, 138);
      doc.line(20, 145, 190, 145);
      // Profile
      doc.setFontSize(14); doc.text("TU PERFIL", 20, 158);
      doc.setFontSize(10); doc.setTextColor(80, 80, 80);
      const profileLines = [
        `Tono de piel: ${skinTone ? skinLabels[skinTone] : "-"}`,
        `Test de venas: ${veinColor ? veinLabels[veinColor] : "-"}`,
        `Metal favorito: ${jewelryPref ? jewelryLabels[jewelryPref] : "-"}`,
        `Color iluminación: ${colorReaction ? colorReactionLabels[colorReaction] : "-"}`,
        `Color de ojos: ${eyeColor ? eyeLabels[eyeColor] : "-"}`,
        `Nivel natural: ${naturalLevel ?? "-"}`,
        `Color actual: ${currentFantasy ?? (currentLevel ? LEVEL_LABELS[currentLevel]?.es : "-")}`,
      ];
      profileLines.forEach((line, i) => doc.text(line, 20, 168 + i * 8));
      // Expert Analysis
      doc.addPage();
      doc.setFontSize(14); doc.setTextColor(44, 34, 24);
      doc.text("ANÁLISIS DEL EXPERTO", 20, 25);
      doc.setFontSize(10); doc.setTextColor(80, 80, 80);
      const verdictLines = doc.splitTextToSize(result.verdict.es, 170);
      doc.text(verdictLines, 20, 38);
      // Palette
      const paletteY = 38 + verdictLines.length * 6 + 15;
      doc.setFontSize(14); doc.setTextColor(44, 34, 24);
      doc.text("TU PALETA", 20, paletteY);
      doc.setFontSize(10); doc.setTextColor(80, 80, 80);
      doc.text("Moda & Ropa: " + seasonStyle.clothingColors.map(c => c.name.es).join(", "), 20, paletteY + 12);
      doc.text("Maquillaje: " + result.complementary.map(c => c.name.es).join(", "), 20, paletteY + 22);
      doc.text("Tonos a evitar: " + avoidTones.join(", "), 20, paletteY + 32);
      // Footer
      doc.setFontSize(9); doc.setTextColor(150, 150, 150);
      doc.text("Para más información visita guiadelsalon.com", 105, 280, { align: "center" });
      doc.save("master-color-card-guiadelsalon.pdf");
    };

    return (
      <>
        <SEOHead title={metaTitle} description={metaDesc} />
        <div className="min-h-screen bg-espresso py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg mx-auto bg-background-light rounded-2xl p-8 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-espresso flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
            </div>
            {/* Title */}
            <h1 className="font-display text-3xl text-espresso text-center mb-1">
              {lang === "es" ? "Tu Master Color Card" : "Your Master Color Card"}
            </h1>
            <p className="text-espresso/50 text-sm text-center mb-8">
              {lang === "es" ? "Diagnóstico de Colorimetría Profesional" : "Professional Colorimetry Diagnosis"}
            </p>
            {/* Color circle + match badge */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full mx-auto" style={{ backgroundColor: result.hexPreview, boxShadow: `0 8px 32px ${result.hexPreview}40` }} />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent-orange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">MATCH 98%</div>
              </div>
            </div>
            {/* Tone info */}
            <div className="text-center mb-6">
              <p className="text-espresso/30 text-[10px] uppercase tracking-[0.2em] mb-2">{lang === "es" ? "TONO RECOMENDADO" : "RECOMMENDED TONE"}</p>
              <h2 className="font-display text-4xl text-espresso mb-3">{l(result.name)}</h2>
              <div className="flex justify-center gap-2">
                <span className="bg-espresso/10 text-espresso text-xs rounded-full px-3 py-1">● {l(undertoneLabel)}</span>
                <span className="bg-espresso/10 text-espresso text-xs rounded-full px-3 py-1">{result.code}</span>
              </div>
            </div>
            {/* Two-column cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-gold" />
                  <span className="text-[10px] text-espresso/40 uppercase tracking-wider font-bold">{lang === "es" ? "Análisis del Experto" : "Expert Analysis"}</span>
                </div>
                <p className="text-espresso/70 text-sm italic leading-relaxed mb-4 line-clamp-6">{l(result.verdict)}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-espresso/5">
                  <div className="w-8 h-8 rounded-full bg-espresso/10 flex items-center justify-center text-[10px] font-bold text-espresso">AG</div>
                  <div>
                    <p className="text-xs font-bold text-espresso">Ana García</p>
                    <p className="text-[10px] text-espresso/40">{lang === "es" ? "Directora Técnica" : "Technical Director"}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 relative">
                <div className="absolute top-3 right-3 bg-espresso text-cream text-[10px] font-bold px-2 py-0.5 rounded">
                  {l(SEASON_NAMES[result.season]).toUpperCase()}
                </div>
                <p className="text-[10px] text-espresso/40 uppercase tracking-wider font-bold mb-3">{lang === "es" ? "Tu Paleta" : "Your Palette"}</p>
                <div className="mb-3">
                  <p className="text-[9px] text-espresso/30 uppercase tracking-wider mb-1.5">{lang === "es" ? "MODA & ROPA" : "FASHION"}</p>
                  <div className="flex gap-2">
                    {seasonStyle.clothingColors.slice(0, 4).map((c, i) => (
                      <div key={i} className="w-9 h-9 rounded-lg border border-espresso/8" style={{ backgroundColor: c.hex }} title={l(c.name)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-espresso/30 uppercase tracking-wider mb-1.5">{lang === "es" ? "MAQUILLAJE" : "MAKEUP"}</p>
                  <div className="flex gap-2">
                    {result.complementary.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-9 h-9 rounded-lg border border-espresso/8" style={{ backgroundColor: c.hex }} title={l(c.name)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan de Mantenimiento */}
            <div className="bg-white/40 p-6 rounded-3xl border border-espresso/5 mb-4">
              <h3 className="font-bold text-xl text-espresso mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-orange" /> Plan de Mantenimiento
              </h3>
              <div className="space-y-3">
                {[
                  { n: "1", t: "Retoque de raíces", d: "Cada 4-6 semanas para tonos claros, 6-8 semanas para oscuros" },
                  { n: "2", t: "Mascarilla matizadora", d: "1 vez por semana para mantener el tono vibrante" },
                  { n: "3", t: "Protección solar capilar", d: "Obligatoria en verano para preservar el tono" },
                ].map(item => (
                  <div key={item.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-accent-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{item.n}</span>
                    <div>
                      <p className="font-semibold text-sm text-espresso">{item.t}</p>
                      <p className="text-xs text-espresso/60">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tonos a Evitar */}
            <div className="bg-white/40 p-6 rounded-3xl border border-espresso/5 mb-4">
              <h3 className="font-bold text-xl text-espresso mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-accent-orange" /> Tonos a Evitar
              </h3>
              <p className="text-sm text-espresso/70 leading-relaxed mb-3">
                Según tu colorimetría, estos tonos pueden apagar tu piel o crear contrastes poco favorecedores:
              </p>
              <div className="flex flex-wrap gap-2">
                {avoidTones.map((tone, i) => (
                  <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">{tone}</span>
                ))}
              </div>
            </div>

            {/* Técnicas Compatibles */}
            <div className="bg-white/40 p-6 rounded-3xl border border-espresso/5 mb-4">
              <h3 className="font-bold text-xl text-espresso mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-orange" /> Técnicas Compatibles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {techniques.map((t, i) => {
                  const bgClass = t.status === "ok" ? "bg-green-50 border-green-200" : t.status === "warn" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
                  const textClass = t.status === "ok" ? "text-green-800" : t.status === "warn" ? "text-amber-800" : "text-red-800";
                  const subClass = t.status === "ok" ? "text-green-700" : t.status === "warn" ? "text-amber-700" : "text-red-700";
                  const StatusIcon = t.status === "ok" ? CheckCircle : t.status === "warn" ? Minus : XCircle;
                  const iconColor = t.status === "ok" ? "text-green-500" : t.status === "warn" ? "text-amber-500" : "text-red-500";
                  return (
                    <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border ${bgClass}`}>
                      <StatusIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                      <div>
                        <p className={`text-xs font-bold ${textClass}`}>{t.name}</p>
                        <p className={`text-[10px] ${subClass}`}>{t.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warnings */}
            {result.requiresDecolor && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs mb-4">
                <FlaskConical className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-espresso/60">{lang === "es" ? "Requiere decoloración profesional" : "Requires professional bleaching"}</p>
              </div>
            )}
            {result.requiresSalon && !result.requiresDecolor && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-espresso/60">{lang === "es" ? `Salto de ${result.levelJump} niveles — visita un salón` : `${result.levelJump}-level jump — visit a salon`}</p>
              </div>
            )}

            {/* CTAs */}
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 rounded-xl bg-gold text-espresso font-semibold text-sm hover:bg-gold-light transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {lang === "es" ? "Descargar Guía Completa PDF ↓" : "Download Full PDF Guide ↓"}
            </button>

            <a
              href="#productos-recomendados"
              className="w-full py-3 rounded-xl border border-espresso/15 text-espresso/60 font-semibold text-sm hover:border-espresso/30 transition-colors flex items-center justify-center gap-2"
            >
              {lang === "es" ? "Ver Productos Recomendados →" : "View Recommended Products →"}
            </a>

            {/* Amazon CTAs */}
            {!result.requiresDecolor && !result.requiresSalon && (() => {
              const dyeUrlES = skinTone ? getDyeLink(DYE_LINKS_ES, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
              const dyeUrlUS = skinTone ? getDyeLink(DYE_LINKS_US, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
              const hasAny = dyeUrlES || dyeUrlUS;
              return hasAny ? (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  {dyeUrlES && (
                    <a href={dyeUrlES} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-orange text-white font-semibold text-sm hover:bg-accent-orange-hover transition-all">
                      🇪🇸 Amazon España <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {dyeUrlUS && (
                    <a href={dyeUrlUS} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-orange text-white font-semibold text-sm hover:bg-accent-orange-hover transition-all">
                      🇺🇸 Amazon USA <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : null;
            })()}

            {/* CTA Cizura */}
            <div className="mt-6 bg-espresso rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Para profesionales</p>
                <p className="text-cream font-bold text-lg leading-snug">¿Eres estilista? Gestiona citas, fichas de color y historial de clientes.</p>
                <p className="text-cream/50 text-sm mt-1">Cizura — software de salón español, sin comisiones</p>
              </div>
              <Link to="/gestion-peluqueria" className="whitespace-nowrap bg-gold text-espresso px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-gold-light transition-colors">
                Ver Cizura →
              </Link>
            </div>

            {/* Disclaimer */}
            <p className="text-espresso/30 text-xs text-center mt-6">
              {lang === "es"
                ? "El resultado puede variar según la calibración de tu pantalla. Consulta con tu colorista profesional."
                : "Results may vary based on screen calibration. Consult your professional colorist."}
            </p>
          </motion.div>

          {/* Products section */}
          <div id="productos-recomendados" className="max-w-3xl mx-auto mt-8 mb-12">
            <h3 className="text-2xl font-bold text-cream mb-6 text-center">
              {lang === "es" ? "Productos Recomendados para tu Diagnóstico" : "Recommended Products for Your Diagnosis"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Tinte profesional sin amoníaco", desc: "Coloración permanente con cuidado", url: `https://www.amazon.es/s?k=tinte+sin+amoniaco&tag=guiadelsalo09-21` },
                { name: "Mascarilla matizadora", desc: "Mantén el tono perfecto", url: `https://www.amazon.es/s?k=mascarilla+matizadora&tag=guiadelsalo09-21` },
                { name: "Protector térmico capilar", desc: "Protección durante el secado", url: `https://www.amazon.es/s?k=protector+termico+capilar&tag=guiadelsalo09-21` },
              ].map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="bg-mocha rounded-xl overflow-hidden border border-gold/10 hover:border-accent-orange/50 transition-all group p-5"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center mb-3">
                    <FlaskConical className="w-5 h-5 text-accent-orange" />
                  </div>
                  <p className="font-bold text-cream text-sm leading-tight mb-2 group-hover:text-accent-orange transition-colors">{p.name}</p>
                  <p className="text-cream/50 text-xs mb-3">{p.desc}</p>
                  <span className="text-accent-orange text-xs font-bold uppercase">Ver en Amazon →</span>
                </a>
              ))}
            </div>
          </div>

          {/* Reset + educational */}
          <div className="max-w-lg mx-auto mt-6">
            <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-cream/15 text-cream/40 text-sm hover:text-cream transition-colors">
              <RotateCcw className="w-4 h-4" /> {lang === "es" ? "Empezar de nuevo" : "Start over"}
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-background-light rounded-2xl p-6">
              <Colorimetry101 lang={lang} />
              <ColorMatchFAQ lang={lang} onReset={reset} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Landing ──
  if (!started) {
    const visibleLevels = [1, 3, 5, 7, 10];
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

              <h1 className="font-display text-[2.5rem] md:text-5xl font-bold text-cream mb-5 leading-[1.1] tracking-tight">
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

              {/* Color swatches carousel with arrows */}
              <div className="relative mb-10">
                <button
                  onClick={() => setLandingScroll(Math.max(0, landingScroll - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-cream/60" />
                </button>
                <div className="flex justify-center gap-3 overflow-hidden py-2 mx-10">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                    <div key={lv} className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-cream/15 shadow-lg" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                      <span className="text-[9px] text-cream/40 whitespace-nowrap">{lv}.0</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLandingScroll(Math.min(9, landingScroll + 1))}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-cream/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-cream/60" />
                </button>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="px-10 py-4 rounded-full border-2 border-gold text-gold font-bold text-lg hover:bg-gold hover:text-espresso transition-all duration-300"
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

      <WizardShell toolName="EXPERT COLOR MATCHER" currentStep={step} totalSteps={totalSteps} onClose={reset} stepLabel={stepLabels[step]}>
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
                      <div className={`w-14 h-14 rounded-full border-2 transition-all ${skinTone === o.value ? 'border-accent-orange shadow-lg' : 'border-[#E8E0D4]'}`} style={{ backgroundColor: o.color }} />
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

              {/* Step 2: Jewelry — IMAGE CARDS */}
              {step === 2 && (
                <div className="grid grid-cols-3 gap-4">
                  {JEWELRY_OPTIONS.map((o) => (
                    <ImageCard
                      key={o.value}
                      selected={jewelryPref === o.value}
                      onClick={() => setJewelryPref(o.value)}
                      image={o.image!}
                      label={l(o.label)}
                    />
                  ))}
                </div>
              )}

              {/* Step 3: Color reaction — IMAGE CARDS + icon fallback */}
              {step === 3 && (
                <div className="grid gap-4">
                  <p className="text-xs text-espresso/40 text-center mb-2">
                    {lang === "es" ? "Imagina que acercas una tela de cada color a tu rostro." : "Imagine holding a fabric of each color near your face."}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {COLOR_REACTION_OPTIONS.filter(o => o.image).map((o) => (
                      <ImageCard
                        key={o.value}
                        selected={colorReaction === o.value}
                        onClick={() => setColorReaction(o.value)}
                        image={o.image!}
                        label={l(o.label)}
                      />
                    ))}
                  </div>
                  {/* "Both" option as standard card */}
                  {COLOR_REACTION_OPTIONS.filter(o => !o.image).map((o) => (
                    <WizardCard key={o.value} selected={colorReaction === o.value} onClick={() => setColorReaction(o.value)} className="!flex-row !text-left !items-center gap-4 !p-5">
                      <Palette className="w-8 h-8 text-espresso/40" />
                      <div>
                        <span className="font-bold text-espresso text-sm">{l(o.label)}</span>
                        {o.desc && <p className="text-xs text-espresso/40 mt-0.5">{l(o.desc)}</p>}
                      </div>
                    </WizardCard>
                  ))}
                </div>
              )}

              {/* Step 4: Eye color — SQUARE IMAGE CARDS in a row */}
              {step === 4 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {EYE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setEyeColor(o.value)}
                      className="flex flex-col items-center gap-2 shrink-0"
                    >
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                        eyeColor === o.value ? 'ring-2 ring-accent-orange ring-offset-2' : 'ring-1 ring-espresso/10'
                      }`}>
                        <img src={o.image} alt={l(o.label)} className="w-full h-full object-cover" loading="lazy" />
                        {eyeColor === o.value && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-orange flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                      <span className={`text-xs text-center leading-tight ${eyeColor === o.value ? 'text-accent-orange font-bold' : 'text-espresso/50'}`}>
                        {l(o.label)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Natural level — horizontal scrollable with labels at extremes */}
              {step === 5 && (
                <div>
                  <div className="flex justify-between text-[10px] text-espresso/30 uppercase tracking-wider mb-4 px-1">
                    <span>{lang === "es" ? "MÁS OSCURO (1)" : "DARKER (1)"}</span>
                    <span>{lang === "es" ? "MÁS CLARO (10)" : "LIGHTER (10)"}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                      <button
                        key={lv}
                        onClick={() => setNaturalLevel(lv)}
                        className="flex flex-col items-center gap-1.5 shrink-0"
                      >
                        <div className={`w-12 h-12 rounded-full border-2 transition-all ${
                          naturalLevel === lv ? 'border-gold shadow-gold scale-110' : 'border-[#E8E0D4]'
                        }`} style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                        <span className={`text-[9px] text-center leading-tight ${naturalLevel === lv ? 'text-espresso font-bold' : 'text-espresso/40'}`}>
                          {l(LEVEL_LABELS[lv])}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Current color */}
              {step === 6 && (
                <>
                  <div>
                    <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-wider mb-3">
                      {lang === "es" ? "Color natural / teñido convencional" : "Natural / conventional dyed color"}
                    </p>
                    {/* Show 5 main levels by default */}
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 3, 5, 7, 10].map((lv) => (
                        <button
                          key={lv}
                          onClick={() => { setCurrentLevel(lv); setCurrentFantasy(null); }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                            currentLevel === lv && !currentFantasy
                              ? 'border-accent-orange border-2 bg-white shadow-bento'
                              : 'border-[#E8E0D4] bg-white hover:border-accent-orange/30'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                          <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                        </button>
                      ))}
                    </div>
                    {/* Expand to see all levels */}
                    {!showAllLevels ? (
                      <button
                        onClick={() => setShowAllLevels(true)}
                        className="text-accent-orange text-xs font-semibold mt-3 hover:underline"
                      >
                        {lang === "es" ? "Ver todos los niveles ↓" : "Show all levels ↓"}
                      </button>
                    ) : (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-3 grid grid-cols-5 gap-3"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).filter(lv => ![1, 3, 5, 7, 10].includes(lv)).map((lv) => (
                          <button
                            key={lv}
                            onClick={() => { setCurrentLevel(lv); setCurrentFantasy(null); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                              currentLevel === lv && !currentFantasy
                                ? 'border-accent-orange border-2 bg-white shadow-bento'
                                : 'border-[#E8E0D4] bg-white hover:border-accent-orange/30'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: LEVEL_COLORS[lv] }} />
                            <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(LEVEL_LABELS[lv])}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-wider mb-3">
                      {lang === "es" ? "Color fantasía / teñido especial" : "Fantasy / special dyed color"}
                    </p>
                    {/* Fantasy alert */}
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="text-amber-700">
                        {lang === "es" ? "Los colores fantasía requieren decoloración previa" : "Fantasy colors require prior bleaching"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {FANTASY_COLORS.map((fc) => (
                        <WizardCard key={fc.value} selected={currentFantasy === fc.value} onClick={() => { setCurrentFantasy(fc.value); setCurrentLevel(null); }} className="!p-3">
                          <div className="w-10 h-10 rounded-full border border-[#E8E0D4]" style={{ backgroundColor: fc.hex }} />
                          <span className="text-[9px] text-espresso/50 text-center leading-tight">{l(fc.label)}</span>
                        </WizardCard>
                      ))}
                    </div>
                  </div>

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
          nextLabel={step === totalSteps - 1 ? (lang === "es" ? "ANALIZAR →" : "ANALYZE →") : (lang === "es" ? "CONTINUAR →" : "CONTINUE →")}
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
