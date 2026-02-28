import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Clock,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import ExpertVerdict from "./ExpertVerdict";

// ─── Types ────────────────────────────────────────────────────────────────────

type Compatibility = "green" | "yellow" | "red";

interface CompatibilityRecord {
  treatment_done: string;
  treatment_desired: string;
  compatibility: Compatibility;
  wait_weeks: number | null;
  strand_test: boolean;
  risk_summary: string;
  technical_explanation: string;
  simple_explanation: string;
  source: string | null;
}

const TREATMENT_IDS = [
  "decoloracion",
  "alisado_keratina",
  "alisado_naoh",
  "alisado_tioglicolato",
  "henna_natural",
  "henna_metalica",
] as const;

type TreatmentId = (typeof TREATMENT_IDS)[number];

// ─── Supabase fetch ───────────────────────────────────────────────────────────

async function fetchCompatibility(
  done: TreatmentId,
  desired: TreatmentId
): Promise<CompatibilityRecord | null> {
  const { data, error } = await supabase
    .from("chemical_compatibility")
    .select("*")
    .eq("treatment_done", done)
    .eq("treatment_desired", desired)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as CompatibilityRecord | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TreatmentSelect({
  label,
  value,
  onChange,
  placeholder,
  treatments,
}: {
  label: string;
  value: TreatmentId | "";
  onChange: (v: TreatmentId) => void;
  placeholder: string;
  treatments: { id: TreatmentId; icon: string; label: string; agent: string }[];
}) {
  const selected = treatments.find((t) => t.id === value);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TreatmentId)}
          className="
            w-full appearance-none rounded-lg border border-[#C4A97D]/30
            bg-[#2D2218] text-[#F5F0E8] px-4 py-3 pr-10
            font-sans text-sm focus:outline-none focus:ring-2
            focus:ring-[#C4A97D]/60 focus:border-[#C4A97D]
            transition-colors cursor-pointer
          "
        >
          <option value="" disabled>{placeholder}</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A97D]" />
      </div>
      {selected && (
        <p className="text-xs text-[#F5F0E8]/50">{selected.agent}</p>
      )}
    </div>
  );
}

function ResultCard({
  data,
  compatConfig,
}: {
  data: CompatibilityRecord;
  compatConfig: ReturnType<typeof buildCompatConfig>;
}) {
  const { t } = useLanguage();
  const [techOpen, setTechOpen] = useState(false);
  const theme = compatConfig[data.compatibility];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border-2 p-6 space-y-5 ${theme.border} ${theme.bg}`}
    >
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
        >
          {theme.icon}
          {theme.label}
        </span>

        {data.wait_weeks != null && data.wait_weeks > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2218] border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            {t("quimica.waitLabel")} {data.wait_weeks}{" "}
            {data.wait_weeks === 1 ? t("quimica.waitWeek") : t("quimica.waitWeeks")}
          </span>
        )}

        {data.strand_test && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2218] border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-semibold">
            <FlaskConical className="w-3.5 h-3.5" />
            {t("quimica.strandTest")}
          </span>
        )}
      </div>

      {/* Risk summary */}
      <p className="text-sm font-semibold text-[#F5F0E8]/90 leading-relaxed">
        {data.risk_summary}
      </p>

      {/* Simple explanation */}
      <div className="rounded-xl bg-[#2D2218]/60 border border-[#C4A97D]/15 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-2">
          {t("quimica.forClientLabel")}
        </p>
        <p className="text-sm text-[#F5F0E8]/80 leading-relaxed italic">
          &ldquo;{data.simple_explanation}&rdquo;
        </p>
      </div>

      {/* Technical explanation — collapsible */}
      <div>
        <button
          onClick={() => setTechOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C4A97D]/70 hover:text-[#C4A97D] transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {t("quimica.techLabel")}
          {techOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {techOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-xs text-[#F5F0E8]/60 leading-relaxed font-mono">
                {data.technical_explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Source footnote */}
      {data.source && (
        <p className="text-[10px] text-[#F5F0E8]/35 border-t border-[#C4A97D]/10 pt-3 leading-relaxed">
          <span className="font-bold text-[#C4A97D]/50">{t("quimica.sourceLabel")} </span>
          {data.source}
        </p>
      )}

      {/* CTA */}
      <div className="rounded-xl bg-[#C4A97D]/10 border border-[#C4A97D]/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <MessageCircle className="w-5 h-5 text-[#C4A97D] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-[#F5F0E8]/70">
          {t("quimica.ctaText")}{" "}
          <strong className="text-[#C4A97D]">{t("quimica.ctaHighlight")}</strong>{" "}
          {t("quimica.ctaSuffix")}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Config builder (needs t() so must be inside component) ──────────────────

function buildCompatConfig(t: (k: string) => string) {
  return {
    green: {
      label: t("quimica.legendSafe"),
      emoji: "🟢",
      border: "border-[#2D5016]",
      bg: "bg-[rgba(45,80,22,0.05)]",
      badgeBg: "bg-[#2D5016]",
      badgeText: "text-[#F5F0E8]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#2D5016]" />,
    },
    yellow: {
      label: t("quimica.legendCaution"),
      emoji: "🟡",
      border: "border-[#C4A97D]",
      bg: "bg-[rgba(196,169,125,0.08)]",
      badgeBg: "bg-[#C4A97D]",
      badgeText: "text-[#2D2218]",
      icon: <AlertTriangle className="w-5 h-5 text-[#C4A97D]" />,
    },
    red: {
      label: t("quimica.legendIncompatible"),
      emoji: "🔴",
      border: "border-[#8B0000]",
      bg: "bg-[rgba(139,0,0,0.05)]",
      badgeBg: "bg-[#8B0000]",
      badgeText: "text-[#F5F0E8]",
      icon: <AlertTriangle className="w-5 h-5 text-[#8B0000]" />,
    },
  } as const;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChemicalCompatibilityAnalyzer() {
  const { t } = useLanguage();
  const [treatmentDone, setTreatmentDone] = useState<TreatmentId | "">("");
  const [treatmentDesired, setTreatmentDesired] = useState<TreatmentId | "">("");

  const bothSelected = treatmentDone !== "" && treatmentDesired !== "";
  const compatConfig = buildCompatConfig(t);

  // Build treatment list from i18n keys
  const treatments: { id: TreatmentId; icon: string; label: string; agent: string }[] = [
    { id: "decoloracion",       icon: "🔆", label: t("quimica.treatmentDecoloracion"),   agent: t("quimica.treatmentDecoloracionAgent") },
    { id: "alisado_keratina",   icon: "🌿", label: t("quimica.treatmentKeratina"),        agent: t("quimica.treatmentKeratinaAgent") },
    { id: "alisado_naoh",       icon: "⚗️", label: t("quimica.treatmentNaoh"),            agent: t("quimica.treatmentNaohAgent") },
    { id: "alisado_tioglicolato", icon: "🧪", label: t("quimica.treatmentTio"),           agent: t("quimica.treatmentTioAgent") },
    { id: "henna_natural",      icon: "🌺", label: t("quimica.treatmentHennaNatural"),    agent: t("quimica.treatmentHennaNaturalAgent") },
    { id: "henna_metalica",     icon: "⚠️", label: t("quimica.treatmentHennaMetalica"),  agent: t("quimica.treatmentHennaMetalicaAgent") },
  ];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chemical-compatibility", treatmentDone, treatmentDesired],
    queryFn: () =>
      fetchCompatibility(treatmentDone as TreatmentId, treatmentDesired as TreatmentId),
    enabled: bothSelected,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <section className="w-full" aria-label={t("quimica.analyzerTitle")}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 px-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4A97D]/10 border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-bold uppercase tracking-widest mb-5">
          <FlaskConical className="w-3.5 h-3.5" />
          {t("quimica.toolBadge")}
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4 leading-tight">
          {t("quimica.analyzerTitle")}
        </h2>
        <p className="text-[#F5F0E8]/60 text-base max-w-2xl mx-auto leading-relaxed">
          {t("quimica.analyzerSubtitle")}
        </p>
      </motion.div>

      {/* ── Selector card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-[#C4A97D]/20 bg-gradient-to-b from-[#2D2218] to-[#1a1410] p-6 md:p-8 mb-6 shadow-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TreatmentSelect
            label={t("quimica.labelDone")}
            value={treatmentDone}
            onChange={(v) => {
              setTreatmentDone(v);
              if (v === treatmentDesired) setTreatmentDesired("");
            }}
            placeholder={t("quimica.placeholder")}
            treatments={treatments}
          />
          <TreatmentSelect
            label={t("quimica.labelDesired")}
            value={treatmentDesired}
            onChange={setTreatmentDesired}
            placeholder={t("quimica.placeholder")}
            treatments={treatments}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["green", "yellow", "red"] as Compatibility[]).map((c) => {
            const cfg = compatConfig[c];
            return (
              <div key={c} className={`rounded-xl border p-3 ${cfg.border} ${cfg.bg}`}>
                <p className="text-lg mb-1">{cfg.emoji}</p>
                <p className={`text-xs font-bold ${cfg.badgeText === "text-[#F5F0E8]" ? "text-[#F5F0E8]" : "text-[#2D2218]"}`}>
                  {cfg.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Result area ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isLoading && bothSelected && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12 gap-3 text-[#C4A97D]/70"
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#C4A97D]/30 border-t-[#C4A97D] animate-spin" />
            <span className="text-sm">{t("quimica.loadingText")}</span>
          </motion.div>
        )}

        {isError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-[#8B0000]/40 bg-[rgba(139,0,0,0.05)] p-5 text-center"
          >
            <p className="text-sm text-[#F5F0E8]/70">
              {t("quimica.errorText")}{" "}
              {error instanceof Error ? error.message : "—"}
            </p>
          </motion.div>
        )}

        {data && !isLoading && (
          <ResultCard
            key={`${treatmentDone}-${treatmentDesired}`}
            data={data}
            compatConfig={compatConfig}
          />
        )}

        {!bothSelected && !data && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-dashed border-[#C4A97D]/20 bg-[#2D2218]/30 p-10 text-center"
          >
            <FlaskConical className="w-10 h-10 text-[#C4A97D]/30 mx-auto mb-4" />
            <p className="text-sm text-[#F5F0E8]/40">{t("quimica.emptyText")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expert Verdict ─────────────────────────────────────── */}
      <div className="mt-16">
        <ExpertVerdict />
      </div>
    </section>
  );
}
