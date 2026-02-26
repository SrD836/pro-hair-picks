import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

// ─── Treatment options ────────────────────────────────────────────────────────

const TREATMENTS = [
  {
    id: "decoloracion",
    label: "Decoloración / Tinte Oxidativo",
    agent: "H₂O₂ (6–12%)",
    icon: "🔆",
  },
  {
    id: "alisado_keratina",
    label: "Alisado de Keratina / Orgánico",
    agent: "Ácido Glioxílico, Carbocisteína",
    icon: "🌿",
  },
  {
    id: "alisado_naoh",
    label: "Alisado Permanente (Hidróxido)",
    agent: "NaOH — pH 12–14",
    icon: "⚗️",
  },
  {
    id: "alisado_tioglicolato",
    label: "Relajante Capilar",
    agent: "Tioglicolato de Amonio",
    icon: "🧪",
  },
  {
    id: "henna_natural",
    label: "Henna Natural (Lawsona)",
    agent: "Lawsonia inermis",
    icon: "🌺",
  },
  {
    id: "henna_metalica",
    label: "Henna Compuesta / Tinte Metálico",
    agent: "Sales de Pb, Ag, Cu",
    icon: "⚠️",
  },
] as const;

type TreatmentId = (typeof TREATMENTS)[number]["id"];

// ─── Compatibility theme config ───────────────────────────────────────────────

const COMPAT_CONFIG: Record<
  Compatibility,
  {
    label: string;
    emoji: string;
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    icon: React.ReactNode;
  }
> = {
  green: {
    label: "SEGURO",
    emoji: "🟢",
    border: "border-[#2D5016]",
    bg: "bg-[rgba(45,80,22,0.05)]",
    badgeBg: "bg-[#2D5016]",
    badgeText: "text-[#F5F0E8]",
    icon: <CheckCircle2 className="w-5 h-5 text-[#2D5016]" />,
  },
  yellow: {
    label: "PRECAUCIÓN",
    emoji: "🟡",
    border: "border-[#C4A97D]",
    bg: "bg-[rgba(196,169,125,0.08)]",
    badgeBg: "bg-[#C4A97D]",
    badgeText: "text-[#2D2218]",
    icon: <AlertTriangle className="w-5 h-5 text-[#C4A97D]" />,
  },
  red: {
    label: "INCOMPATIBLE",
    emoji: "🔴",
    border: "border-[#8B0000]",
    bg: "bg-[rgba(139,0,0,0.05)]",
    badgeBg: "bg-[#8B0000]",
    badgeText: "text-[#F5F0E8]",
    icon: <AlertTriangle className="w-5 h-5 text-[#8B0000]" />,
  },
};

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
  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TreatmentSelect({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: TreatmentId | "";
  onChange: (v: TreatmentId) => void;
  exclude?: TreatmentId;
}) {
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
          <option value="" disabled>
            Selecciona un tratamiento…
          </option>
          {TREATMENTS.filter((t) => t.id !== exclude).map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A97D]" />
      </div>
      {value && (
        <p className="text-xs text-[#F5F0E8]/50">
          {TREATMENTS.find((t) => t.id === value)?.agent}
        </p>
      )}
    </div>
  );
}

function ResultCard({ data }: { data: CompatibilityRecord }) {
  const [techOpen, setTechOpen] = useState(false);
  const theme = COMPAT_CONFIG[data.compatibility];

  return (
    <motion.div
      key={`${data.treatment_done}-${data.treatment_desired}`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`
        rounded-2xl border-2 p-6 space-y-5
        ${theme.border} ${theme.bg}
      `}
    >
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`
            inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            text-sm font-bold tracking-wider
            ${theme.badgeBg} ${theme.badgeText}
          `}
        >
          {theme.icon}
          {theme.label}
        </span>

        {data.wait_weeks != null && data.wait_weeks > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2218] border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Espera mínima: {data.wait_weeks}{" "}
            {data.wait_weeks === 1 ? "semana" : "semanas"}
          </span>
        )}

        {data.strand_test && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2218] border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-semibold">
            <FlaskConical className="w-3.5 h-3.5" />
            Prueba de mechón obligatoria
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
          ¿Qué significa para ti?
        </p>
        <p className="text-sm text-[#F5F0E8]/80 leading-relaxed italic">
          &ldquo;{data.simple_explanation}&rdquo;
        </p>
      </div>

      {/* Technical explanation — collapsible */}
      <div>
        <button
          onClick={() => setTechOpen((o) => !o)}
          className="
            flex items-center gap-2 text-xs font-bold uppercase tracking-widest
            text-[#C4A97D]/70 hover:text-[#C4A97D] transition-colors
          "
        >
          <BookOpen className="w-3.5 h-3.5" />
          Explicación técnica (profesionales)
          {techOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
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
          <span className="font-bold text-[#C4A97D]/50">Fuente: </span>
          {data.source}
        </p>
      )}

      {/* CTA */}
      <div className="rounded-xl bg-[#C4A97D]/10 border border-[#C4A97D]/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <MessageCircle className="w-5 h-5 text-[#C4A97D] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-[#F5F0E8]/70">
          ¿Tienes dudas sobre tu caso específico?{" "}
          <strong className="text-[#C4A97D]">
            Consulta con tu estilista profesional
          </strong>{" "}
          — solo un experto puede evaluar el estado real de tu cabello.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChemicalCompatibilityAnalyzer() {
  const [treatmentDone, setTreatmentDone] = useState<TreatmentId | "">("");
  const [treatmentDesired, setTreatmentDesired] = useState<TreatmentId | "">(
    ""
  );

  const bothSelected = treatmentDone !== "" && treatmentDesired !== "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chemical-compatibility", treatmentDone, treatmentDesired],
    queryFn: () =>
      fetchCompatibility(
        treatmentDone as TreatmentId,
        treatmentDesired as TreatmentId
      ),
    enabled: bothSelected,
    staleTime: 1000 * 60 * 60, // 1 hour — this data changes rarely
  });

  return (
    <section
      className="w-full"
      aria-label="Analizador de Compatibilidad Química Capilar"
    >
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
          Herramienta profesional
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4 leading-tight">
          Analizador de Compatibilidad Química
        </h2>
        <p className="text-[#F5F0E8]/60 text-base max-w-2xl mx-auto leading-relaxed">
          Selecciona el tratamiento realizado en los últimos 6 meses y el
          tratamiento deseado hoy. La herramienta consulta nuestra base de datos
          basada en literatura científica con revisión por pares (2018–2026).
        </p>
      </motion.div>

      {/* ── Selector card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="
          rounded-2xl border border-[#C4A97D]/20
          bg-gradient-to-b from-[#2D2218] to-[#1a1410]
          p-6 md:p-8 mb-6 shadow-card
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TreatmentSelect
            label="Tratamiento realizado (últimos 6 meses)"
            value={treatmentDone}
            onChange={(v) => {
              setTreatmentDone(v);
              if (v === treatmentDesired) setTreatmentDesired("");
            }}
          />
          <TreatmentSelect
            label="Tratamiento deseado hoy"
            value={treatmentDesired}
            onChange={setTreatmentDesired}
            exclude={undefined}
          />
        </div>

        {/* Quick guide */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["green", "yellow", "red"] as Compatibility[]).map((c) => {
            const t = COMPAT_CONFIG[c];
            return (
              <div
                key={c}
                className={`
                  rounded-xl border p-3
                  ${t.border} ${t.bg}
                `}
              >
                <p className="text-lg mb-1">{t.emoji}</p>
                <p className={`text-xs font-bold ${t.badgeText === "text-[#F5F0E8]" ? "text-[#F5F0E8]" : "text-[#2D2218]"}`}>
                  {t.label}
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
            <span className="text-sm">Consultando base de datos científica…</span>
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
              Error al consultar los datos:{" "}
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
          </motion.div>
        )}

        {data && !isLoading && (
          <ResultCard key={`${treatmentDone}-${treatmentDesired}`} data={data} />
        )}

        {!bothSelected && !data && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              rounded-2xl border border-dashed border-[#C4A97D]/20
              bg-[#2D2218]/30 p-10 text-center
            "
          >
            <FlaskConical className="w-10 h-10 text-[#C4A97D]/30 mx-auto mb-4" />
            <p className="text-sm text-[#F5F0E8]/40">
              Selecciona ambos tratamientos para ver el análisis de
              compatibilidad
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expert Verdict section ─────────────────────────────── */}
      <div className="mt-16">
        <ExpertVerdict />
      </div>
    </section>
  );
}
