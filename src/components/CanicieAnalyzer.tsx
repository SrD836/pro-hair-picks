import { useState } from "react";
import { generateCaniciePDF } from "@/lib/pdfGenerators";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  generateCanicieReport,
  type CanicieInput,
  type CanicieReport,
  type CaniciePercentage,
  type DietQuality,
  type KnownDeficiency,
} from "@/lib/generateCanicieReport";
import type { Json } from "@/integrations/supabase/types";

// ── Supabase row types ─────────────────────────────────────────────────────────

interface CanicieFactor {
  id: string;
  category: "biologico" | "genetico" | "externo" | "estructural";
  factor_name: string;
  factor_technical: string | null;
  factor_simple: string | null;
  evidence_level: "A" | "B" | "C";
  modifiable: boolean;
  impact_magnitude: "alto" | "moderado" | "bajo" | null;
  sources: Json | null;
}

interface CanicieMyth {
  id: string;
  myth_statement: string;
  verdict: "mito" | "parcialmente_cierto" | "confirmado";
  verdict_simple: string | null;
  scientific_explanation: string | null;
  nuance: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  const key = "canicie_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Evidence badge ─────────────────────────────────────────────────────────────

function EvidenceBadge({ level }: { level: "A" | "B" | "C" }) {
  const styles = {
    A: "bg-[#C4A97D]/15 text-[#2D2218] border border-[#C4A97D]",
    B: "bg-gray-100 text-gray-600 border border-gray-300",
    C: "bg-gray-50 text-gray-400 border border-gray-200",
  };
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[level]}`}>
      Evidencia {level}
    </span>
  );
}

// ── Modifiable badge ───────────────────────────────────────────────────────────

function ModifiableBadge({ modifiable }: { modifiable: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        modifiable
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {modifiable ? "✓ Modificable" : "✗ No modificable"}
    </span>
  );
}

// ── Myth verdict badge ─────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: CanicieMyth["verdict"] }) {
  const config = {
    mito: {
      label: "🔴 MITO",
      cls: "bg-red-50 border-red-300 text-red-700",
    },
    parcialmente_cierto: {
      label: "🟡 PARCIAL",
      cls: "bg-amber-50 border-[#C4A97D] text-amber-800",
    },
    confirmado: {
      label: "🟢 CONFIRMADO",
      cls: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
  };
  const c = config[verdict];
  return (
    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ── Impact dot ─────────────────────────────────────────────────────────────────

function ImpactDot({ magnitude }: { magnitude: "alto" | "moderado" | "bajo" | null }) {
  const colors = {
    alto: "bg-red-400",
    moderado: "bg-amber-400",
    bajo: "bg-emerald-400",
  };
  if (!magnitude) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[#2D2218]/50 font-medium uppercase tracking-wider">
      <span className={`w-2 h-2 rounded-full ${colors[magnitude]}`} />
      Impacto {magnitude}
    </span>
  );
}

// ── Section 1: Scientific Library ─────────────────────────────────────────────

const CATEGORY_TABS = [
  { key: "biological", label: "Causas Biológicas", categories: ["biologico", "genetico"] },
  { key: "external", label: "Factores Externos", categories: ["externo"] },
  { key: "myths", label: "Mitos vs. Ciencia", categories: [] },
] as const;

type LibraryTab = (typeof CATEGORY_TABS)[number]["key"];

function FactorCard({ factor }: { factor: CanicieFactor }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-[#2D2218]/10 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <EvidenceBadge level={factor.evidence_level} />
          <ModifiableBadge modifiable={factor.modifiable} />
          {factor.impact_magnitude && <ImpactDot magnitude={factor.impact_magnitude} />}
        </div>
        <h4 className="font-display font-bold text-[#2D2218] text-sm leading-snug mb-2">
          {factor.factor_name}
        </h4>
        {factor.factor_simple && (
          <p className="text-sm text-[#2D2218]/75 leading-relaxed">
            {factor.factor_simple}
          </p>
        )}
        {factor.factor_technical && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#C4A97D] font-medium hover:text-[#2D2218] transition-colors"
            >
              {expanded ? "Ver menos" : "Ver explicación técnica"}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-xs text-[#2D2218]/60 leading-relaxed border-t border-[#2D2218]/8 pt-2">
                    {factor.factor_technical}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

function MythCard({ myth }: { myth: CanicieMyth }) {
  const [expanded, setExpanded] = useState(false);
  const verdictBg = {
    mito: "bg-red-50 border-red-200",
    parcialmente_cierto: "bg-amber-50 border-amber-200",
    confirmado: "bg-emerald-50 border-emerald-200",
  };
  return (
    <div className={`border rounded-xl overflow-hidden ${verdictBg[myth.verdict]}`}>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <VerdictBadge verdict={myth.verdict} />
        </div>
        <p className="font-semibold text-[#2D2218] text-sm leading-snug mb-2">
          "{myth.myth_statement}"
        </p>
        {myth.verdict_simple && (
          <p className="text-sm text-[#2D2218]/75 leading-relaxed">
            {myth.verdict_simple}
          </p>
        )}
        {(myth.scientific_explanation || myth.nuance) && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#C4A97D] font-medium hover:text-[#2D2218] transition-colors"
            >
              {expanded ? "Ocultar fundamento" : "Ver fundamento científico"}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 border-t border-[#2D2218]/10 pt-2">
                    {myth.scientific_explanation && (
                      <p className="text-xs text-[#2D2218]/65 leading-relaxed">
                        {myth.scientific_explanation}
                      </p>
                    )}
                    {myth.nuance && (
                      <p className="text-xs text-[#2D2218]/50 italic leading-relaxed">
                        Matiz: {myth.nuance}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

function ScientificLibrary({
  factors,
  myths,
  loading,
}: {
  factors: CanicieFactor[];
  myths: CanicieMyth[];
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("biological");

  const filteredFactors = factors.filter((f) => {
    const tab = CATEGORY_TABS.find((t) => t.key === activeTab);
    return tab?.categories.includes(f.category as never) ?? false;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                : "bg-white text-[#2D2218]/65 border-[#2D2218]/15 hover:border-[#C4A97D] hover:text-[#2D2218]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#2D2218]/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "myths" ? (
              <div className="grid md:grid-cols-2 gap-4">
                {myths.map((myth) => (
                  <MythCard key={myth.id} myth={myth} />
                ))}
                {myths.length === 0 && (
                  <p className="text-sm text-[#2D2218]/50 col-span-2 text-center py-8">
                    Cargando mitos…
                  </p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredFactors.map((factor) => (
                  <FactorCard key={factor.id} factor={factor} />
                ))}
                {filteredFactors.length === 0 && (
                  <p className="text-sm text-[#2D2218]/50 col-span-2 text-center py-8">
                    Sin datos disponibles para esta categoría.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Section 2: Diagnostic Form ─────────────────────────────────────────────────

const PERCENTAGE_OPTIONS: CaniciePercentage[] = ["0-25", "25-50", "50-75", "75-100"];
const PERCENTAGE_LABELS: Record<CaniciePercentage, string> = {
  "0-25": "Menos del 25%",
  "25-50": "25–50%",
  "50-75": "50–75%",
  "75-100": "Más del 75%",
};

const DIET_OPTIONS: DietQuality[] = ["deficiente", "regular", "buena", "óptima"];
const DIET_LABELS: Record<DietQuality, string> = {
  deficiente: "Deficiente (comida rápida, ultra-procesados)",
  regular: "Regular (algún déficit, poca variedad)",
  buena: "Buena (variada, con proteína y vegetales)",
  óptima: "Óptima (consciente, equilibrada)",
};

const DEFICIENCY_OPTIONS: { value: KnownDeficiency; label: string }[] = [
  { value: "b12", label: "Vitamina B12" },
  { value: "hierro", label: "Hierro / Ferritina" },
  { value: "cobre", label: "Cobre" },
  { value: "zinc", label: "Zinc" },
  { value: "ninguna", label: "Ninguna / No sé" },
];

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Datos personales", "Hábitos", "Historial capilar"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === i + 1
                  ? "bg-[#2D2218] text-[#F5F0E8] scale-110"
                  : step > i + 1
                  ? "bg-[#C4A97D] text-[#2D2218]"
                  : "bg-[#F5F0E8] border-2 border-[#C4A97D]/30 text-[#2D2218]/35"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block transition-colors ${
                step === i + 1 ? "text-[#2D2218]" : step > i + 1 ? "text-[#C4A97D]" : "text-[#2D2218]/30"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-10 sm:w-16 mb-4 transition-colors ${
                step > i + 1 ? "bg-[#C4A97D]" : "bg-[#C4A97D]/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface FormData {
  age: number;
  canicie_onset_age: number;
  canicie_percentage: CaniciePercentage;
  stress_level: number;
  diet_quality: DietQuality;
  smoker: boolean;
  known_deficiencies: KnownDeficiency[];
  family_history: boolean;
  hair_texture_change: boolean;
}

const DEFAULT_FORM: FormData = {
  age: 35,
  canicie_onset_age: 30,
  canicie_percentage: "0-25",
  stress_level: 5,
  diet_quality: "regular",
  smoker: false,
  known_deficiencies: ["ninguna"],
  family_history: false,
  hair_texture_change: false,
};

function DiagnosticForm({
  onSubmit,
}: {
  onSubmit: (input: CanicieInput) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [earlyAlert, setEarlyAlert] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "canicie_onset_age") {
      setEarlyAlert((value as number) < 20);
    }
  };

  const toggleDeficiency = (val: KnownDeficiency) => {
    setForm((prev) => {
      if (val === "ninguna") return { ...prev, known_deficiencies: ["ninguna"] };
      const current = prev.known_deficiencies.filter((d) => d !== "ninguna");
      const next = current.includes(val)
        ? current.filter((d) => d !== val)
        : [...current, val];
      return { ...prev, known_deficiencies: next.length === 0 ? ["ninguna"] : next };
    });
  };

  const handleSubmit = () => {
    onSubmit(form as CanicieInput);
  };

  return (
    <div>
      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        {/* ── Step 1: Personal data ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-2">
                Tu edad actual
              </label>
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl font-bold text-[#2D2218] w-12">
                  {form.age}
                </span>
                <input
                  type="range"
                  min={18}
                  max={80}
                  value={form.age}
                  onChange={(e) => update("age", Number(e.target.value))}
                  className="flex-1 accent-[#2D2218]"
                />
                <span className="text-xs text-[#2D2218]/40">80</span>
              </div>
            </div>

            {/* Onset age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-2">
                Edad en que aparecieron las primeras canas
              </label>
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl font-bold text-[#2D2218] w-12">
                  {form.canicie_onset_age}
                </span>
                <input
                  type="range"
                  min={12}
                  max={form.age}
                  value={form.canicie_onset_age}
                  onChange={(e) => update("canicie_onset_age", Number(e.target.value))}
                  className="flex-1 accent-[#2D2218]"
                />
                <span className="text-xs text-[#2D2218]/40">{form.age}</span>
              </div>
              {earlyAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800"
                >
                  ⚠️ La canicie antes de los 20 años puede tener causas médicas. Consulta con un dermatólogo o tricólogo.
                </motion.div>
              )}
            </div>

            {/* Canicie percentage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Porcentaje de canas visible actualmente
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERCENTAGE_OPTIONS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => update("canicie_percentage", pct)}
                    className={`rounded-lg px-3 py-3 text-sm font-medium text-left border transition-all ${
                      form.canicie_percentage === pct
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                    }`}
                  >
                    {PERCENTAGE_LABELS[pct]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#2D2218] text-[#F5F0E8] font-bold uppercase tracking-widest rounded-xl hover:bg-[#3d3025] transition-colors text-sm"
            >
              Siguiente →
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Habits ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stress */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-2">
                Nivel de estrés crónico{" "}
                <span
                  className={`ml-2 font-bold ${
                    form.stress_level >= 7
                      ? "text-red-500"
                      : form.stress_level >= 5
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {form.stress_level}/10
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={form.stress_level}
                onChange={(e) => update("stress_level", Number(e.target.value))}
                className="w-full accent-[#2D2218]"
              />
              <div className="flex justify-between text-xs text-[#2D2218]/40 mt-1">
                <span>Tranquilo</span>
                <span>Muy alto</span>
              </div>
            </div>

            {/* Diet */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Calidad de tu alimentación
              </label>
              <div className="space-y-2">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => update("diet_quality", d)}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium text-left border transition-all ${
                      form.diet_quality === d
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                    }`}
                  >
                    {DIET_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                ¿Fumas actualmente?
              </label>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => update("smoker", val)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                      form.smoker === val
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                    }`}
                  >
                    {val ? "Sí" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* Deficiencies */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Déficits nutricionales conocidos (analítica)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEFICIENCY_OPTIONS.map(({ value, label }) => {
                  const active = form.known_deficiencies.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleDeficiency(value)}
                      className={`rounded-lg px-3 py-2.5 text-sm font-medium text-left border transition-all ${
                        active
                          ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                          : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#2D2218] text-[#F5F0E8] font-bold uppercase tracking-widest rounded-xl hover:bg-[#3d3025] transition-colors text-sm"
              >
                Siguiente →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Hair history ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Family history */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-1">
                ¿Padres o abuelos con canicie temprana?
              </label>
              <p className="text-xs text-[#2D2218]/45 mb-3">
                Antes de los 35 años
              </p>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => update("family_history", val)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                      form.family_history === val
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                    }`}
                  >
                    {val ? "Sí" : "No"}
                  </button>
                ))}
              </div>
            </div>

            {/* Texture change */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-1">
                ¿El pelo canoso tiene textura diferente?
              </label>
              <p className="text-xs text-[#2D2218]/45 mb-3">
                Más seco, más grueso, difícil de hidratar, frizz mayor
              </p>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => update("hair_texture_change", val)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                      form.hair_texture_change === val
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                    }`}
                  >
                    {val ? "Sí" : "No"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-[#C4A97D] text-[#2D2218] font-bold uppercase tracking-widest rounded-xl hover:bg-[#b89868] transition-colors text-sm"
              >
                Generar informe →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section 3: Diagnostic Report ──────────────────────────────────────────────

const TYPE_LABELS: Record<CanicieReport["canicie_type"], string> = {
  genética_predominante: "Genética predominante",
  mixta: "Mixta (Genética + Ambiental)",
  ambiental_predominante: "Ambiental predominante",
};

const ONSET_LABELS: Record<CanicieReport["onset_classification"], string> = {
  prematura: "Prematura (antes de los 25 años)",
  temprana: "Temprana (25–35 años)",
  normal: "Normal (después de los 35)",
};

const PRIORITY_COLORS = {
  alta: "border-l-red-400 bg-red-50",
  media: "border-l-amber-400 bg-amber-50",
  baja: "border-l-[#C4A97D] bg-[#C4A97D]/8",
};

function DiagnosticReport({
  report,
  onReset,
  hideDownload,
}: {
  report: CanicieReport;
  onReset: () => void;
  hideDownload?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
      id="canicie-report-print"
    >
      {/* Header card */}
      <div className="rounded-2xl border border-[#2D2218]/15 bg-white overflow-hidden">
        <div className="bg-[#2D2218] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-1">
            Informe de diagnóstico — GuiaDelSalon.com
          </p>
          <h3 className="font-display text-xl font-bold text-[#F5F0E8]">
            TIPO DE CANICIE: {TYPE_LABELS[report.canicie_type]}
          </h3>
        </div>
        <div className="px-5 py-3 border-b border-[#2D2218]/8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/50 mb-1">
            Clasificación de aparición
          </p>
          <p className="text-sm font-semibold text-[#2D2218]">
            {ONSET_LABELS[report.onset_classification]}
          </p>
        </div>

        {/* Weight visualization */}
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D2218]/45 mb-1">
              Peso genético
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#2D2218]/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D2218] rounded-full transition-all"
                  style={{ width: `${report.genetic_weight * 10}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#2D2218]">
                {report.genetic_weight}/10
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D2218]/45 mb-1">
              Peso ambiental
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#2D2218]/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C4A97D] rounded-full transition-all"
                  style={{ width: `${report.environmental_weight * 10}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#2D2218]">
                {report.environmental_weight}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Early alert */}
      {report.early_medical_alert && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 px-5 py-4">
          <p className="text-sm font-bold text-amber-800 mb-1">
            ⚠️ Alerta: canicie antes de los 20 años
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            La canicie antes de los 20 años puede tener causas médicas tratables (déficit de B12, enfermedad tiroidea, síndrome de Werner). Consulta con un dermatólogo o tricólogo.
          </p>
        </div>
      )}

      {/* Modifiable factors */}
      {report.modifiable_factors.length > 0 && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            ✅ Puedes actuar sobre:
          </p>
          <ul className="space-y-1.5">
            {report.modifiable_factors.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-emerald-800">
                <span className="shrink-0 mt-0.5">·</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-modifiable factors */}
      {report.non_modifiable_factors.length > 0 && (
        <div className="rounded-xl bg-[#2D2218]/5 border border-[#2D2218]/15 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
            ⚠️ No puedes cambiar:
          </p>
          <ul className="space-y-1.5">
            {report.non_modifiable_factors.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#2D2218]/75">
                <span className="shrink-0 mt-0.5">·</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structural care */}
      {report.structural_care_needed && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700 mb-1">
            💆 Cuidado estructural necesario: Sí
          </p>
          <p className="text-sm text-sky-800 leading-relaxed">
            Tu pelo canoso necesita hidratación lipídica activa (ceramidas, 18-MEA, aceites ligeros) y protección UV. Sin melanina, la fibra pierde su fotoprotector natural.
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/50 mb-3">
          Recomendaciones por prioridad
        </p>
        <div className="space-y-2">
          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`border-l-4 rounded-r-lg px-4 py-3 ${PRIORITY_COLORS[rec.priority]}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    rec.priority === "alta"
                      ? "bg-red-100 text-red-700"
                      : rec.priority === "media"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-[#C4A97D]/20 text-[#2D2218]/70"
                  }`}
                >
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} prioridad
                </span>
              </div>
              <p className="text-sm font-semibold text-[#2D2218] mb-0.5">{rec.action}</p>
              <p className="text-xs text-[#2D2218]/60 leading-relaxed">{rec.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Realistic expectations */}
      <div className="rounded-xl bg-[#2D2218] px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-2">
          Expectativa realista
        </p>
        <p className="text-sm text-[#F5F0E8]/85 leading-relaxed italic">
          "{report.realistic_expectations}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={onReset}
          className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
        >
          Nuevo diagnóstico
        </button>
        {!hideDownload && (
          <button
            onClick={() => generateCaniciePDF({
              canicieType: report.canicie_type,
              onsetClassification: report.onset_classification,
              geneticWeight: report.genetic_weight,
              environmentalWeight: report.environmental_weight,
              modifiableFactors: report.modifiable_factors,
              nonModifiableFactors: report.non_modifiable_factors,
              structuralCareNeeded: report.structural_care_needed,
              recommendations: report.recommendations,
              realisticExpectations: report.realistic_expectations,
            })}
            className="flex-1 py-3 bg-[#C4A97D] text-[#2D2218] font-bold uppercase tracking-widest rounded-xl hover:bg-[#b89868] transition-colors text-sm"
          >
            Descargar PDF
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

type MainView = "library" | "form" | "report";

interface CanicieAnalyzerProps {
  wizardContinue?: (summary: string, score?: number) => void;
}

export default function CanicieAnalyzer({ wizardContinue }: CanicieAnalyzerProps = {}) {
  const [view, setView] = useState<MainView>("library");
  const [report, setReport] = useState<CanicieReport | null>(null);

  // Fetch factors
  const { data: factors = [], isLoading: factorsLoading } = useQuery({
    queryKey: ["canicie_factors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canicie_factors")
        .select("*")
        .order("category");
      if (error) throw error;
      return data as CanicieFactor[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch myths
  const { data: myths = [], isLoading: mythsLoading } = useQuery({
    queryKey: ["canicie_myths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("canicie_myths")
        .select("*");
      if (error) throw error;
      return data as CanicieMyth[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Persist report
  const { mutate: persistReport } = useMutation({
    mutationFn: async ({
      input,
      result,
    }: {
      input: CanicieInput;
      result: CanicieReport;
    }) => {
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from("canicie_reports").insert({
        session_id: sessionId,
        input_data: input as unknown as Json,
        canicie_type: result.canicie_type,
        onset_classification: result.onset_classification,
        modifiable_factors: result.modifiable_factors as unknown as Json,
        non_modifiable_factors: result.non_modifiable_factors as unknown as Json,
        structural_care_needed: result.structural_care_needed,
        recommendations: result.recommendations as unknown as Json,
        realistic_expectations: result.realistic_expectations,
      });
      if (error) console.warn("Report persist error:", error.message);
    },
  });

  const handleFormSubmit = (input: CanicieInput) => {
    const result = generateCanicieReport(input);
    setReport(result);
    setView("report");
    persistReport({ input, result });
  };

  const handleReset = () => {
    setReport(null);
    setView("form");
  };

  const navItems: { key: MainView; label: string }[] = [
    { key: "library", label: "Biblioteca científica" },
    { key: "form", label: "Diagnóstico personalizado" },
    ...(report ? [{ key: "report" as MainView, label: "Mi informe" }] : []),
  ];

  return (
    <>
      <style>{`
        @media print {
          nav, footer, .print\\:hidden { display: none !important; }
          #canicie-report-print { display: block !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      {/* Section nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {navItems.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
              view === key
                ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                : "bg-white text-[#2D2218]/65 border-[#2D2218]/15 hover:border-[#C4A97D] hover:text-[#2D2218]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "library" && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ScientificLibrary
              factors={factors}
              myths={myths}
              loading={factorsLoading || mythsLoading}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => setView("form")}
                className="px-8 py-4 bg-[#2D2218] text-[#F5F0E8] font-bold uppercase tracking-widest rounded-xl hover:bg-[#3d3025] transition-colors text-sm"
              >
                Ir a mi diagnóstico personalizado →
              </button>
            </div>
          </motion.div>
        )}

        {view === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <DiagnosticForm onSubmit={handleFormSubmit} />
          </motion.div>
        )}

        {view === "report" && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <DiagnosticReport report={report} onReset={handleReset} hideDownload={!!wizardContinue} />
            {wizardContinue && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => wizardContinue(
                    `Canicie ${report.canicie_type} — G:${report.genetic_weight}/10 A:${report.environmental_weight}/10`,
                    report.genetic_weight,
                    {
                      canicieType: report.canicie_type,
                      onsetClassification: report.onset_classification,
                      geneticWeight: report.genetic_weight,
                      environmentalWeight: report.environmental_weight,
                      modifiableFactors: report.modifiable_factors,
                      nonModifiableFactors: report.non_modifiable_factors,
                      structuralCareNeeded: report.structural_care_needed,
                      recommendations: report.recommendations,
                      realisticExpectations: report.realistic_expectations,
                    }
                  )}
                  className="gap-2"
                >
                  Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
