import { useState, useRef } from "react";
import { generateAlopeciaPDF } from "@/lib/pdfGenerators";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AlopeciaInput, AlopeciaReport } from "@/lib/generateAlopeciaReport";
import { generateAlopeciaReport } from "@/lib/generateAlopeciaReport";
import type { Json } from "@/integrations/supabase/types";

// ── Supabase row types ─────────────────────────────────────────────────────────

interface AlopeciaFactor {
  id: string;
  factor_id: string;
  category: string;
  factor_name: string;
  factor_technical: string;
  factor_simple: string;
  evidence_level: "A" | "B" | "C";
  modifiable: boolean;
  applies_to: string;
  impact_magnitude: string;
  sources: Json | null;
  pending_verification: boolean;
  created_at: string | null;
}

interface AlopeciaDbTreatment {
  id: string;
  treatment_id: string;
  name: string;
  type: string;
  evidence_level: "A" | "B" | "C";
  effective_stages_hamilton: number[];
  effective_stages_ludwig: number[];
  applies_to: string;
  time_to_results_months: number | null;
  requires_maintenance: boolean;
  contraindications: string[];
  avg_cost_spain_eur: number | null;
  realistic_expectation: string;
  sources: Json | null;
  pending_verification: boolean;
  created_at: string | null;
}

interface AlopeciaMyth {
  id: string;
  myth_id: string;
  myth_statement: string;
  verdict: "mito" | "parcialmente_cierto" | "confirmado";
  verdict_simple: string;
  scientific_explanation: string;
  study_reference: Json | null;
  common_in_profiles: string[];
  created_at: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  const key = "alopecia_session_id";
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
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[level]}`}
    >
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

// ── Applies-to badge ───────────────────────────────────────────────────────────

function AppliesToBadge({ appliesTo }: { appliesTo: string }) {
  const label =
    appliesTo === "male"
      ? "Hombres"
      : appliesTo === "female"
      ? "Mujeres"
      : "Ambos";
  return (
    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
      {label}
    </span>
  );
}

// ── Myth verdict badge ─────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: AlopeciaMyth["verdict"] }) {
  const config = {
    mito: {
      label: "🔴 MITO",
      cls: "bg-red-50 border-red-300 text-red-700",
    },
    parcialmente_cierto: {
      label: "🟡 PARCIALMENTE CIERTO",
      cls: "bg-amber-50 border-[#C4A97D] text-amber-800",
    },
    confirmado: {
      label: "🟢 CONFIRMADO",
      cls: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
  };
  const c = config[verdict];
  return (
    <span
      className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

// ── Section 1: Scientific Library ─────────────────────────────────────────────

type LibraryTab = "causas" | "tratamientos" | "mitos";

const LIBRARY_TABS: { key: LibraryTab; label: string }[] = [
  { key: "causas", label: "Causas y Biología" },
  { key: "tratamientos", label: "Tratamientos" },
  { key: "mitos", label: "Mitos vs. Ciencia" },
];

function AlopeciaFactorCard({ factor }: { factor: AlopeciaFactor }) {
  const [expanded, setExpanded] = useState(false);
  const sourceStr =
    factor.sources && typeof factor.sources === "object" && !Array.isArray(factor.sources)
      ? (factor.sources as Record<string, string>)["doi"] ?? null
      : null;

  return (
    <div className="bg-white border border-[#2D2218]/10 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <EvidenceBadge level={factor.evidence_level} />
          <ModifiableBadge modifiable={factor.modifiable} />
          <AppliesToBadge appliesTo={factor.applies_to} />
        </div>
        <h4 className="font-display font-bold text-[#2D2218] text-sm leading-snug mb-2">
          {factor.factor_name}
        </h4>
        <p className="text-sm text-[#2D2218]/75 leading-relaxed">
          {factor.factor_simple}
        </p>
        {factor.factor_technical && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#C4A97D] font-medium hover:text-[#2D2218] transition-colors"
            >
              {expanded ? "Ocultar detalle" : "Ver detalle técnico"}
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
                  <div className="mt-2 border-t border-[#2D2218]/8 pt-2">
                    <p className="text-xs text-[#2D2218]/60 leading-relaxed">
                      {factor.factor_technical}
                    </p>
                    {sourceStr && (
                      <p className="mt-1 text-[10px] text-[#C4A97D]/80 font-mono">
                        DOI: {sourceStr}
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

type TreatmentSexFilter = "todos" | "male" | "female";
type TreatmentTypeFilter =
  | "todos"
  | "farmacologico"
  | "procedimiento"
  | "cosmético"
  | "nutraceutico";
type EvidenceFilter = "todos" | "A" | "B" | "C";

function TreatmentsTab({
  treatments,
}: {
  treatments: AlopeciaDbTreatment[];
}) {
  const [sexFilter, setSexFilter] = useState<TreatmentSexFilter>("todos");
  const [typeFilter, setTypeFilter] = useState<TreatmentTypeFilter>("todos");
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("todos");

  const filtered = treatments.filter((t) => {
    if (sexFilter !== "todos" && t.applies_to !== "both" && t.applies_to !== sexFilter)
      return false;
    if (typeFilter !== "todos" && t.type !== typeFilter) return false;
    if (evidenceFilter !== "todos" && t.evidence_level !== evidenceFilter) return false;
    return true;
  });

  const formatStages = (hamilton: number[], ludwig: number[]) => {
    const parts: string[] = [];
    if (hamilton.length > 0)
      parts.push(`Hamilton ${hamilton.map((n) => ["I", "II", "III", "IV", "V", "VI", "VII"][n - 1] ?? n).join("-")}`);
    if (ludwig.length > 0)
      parts.push(`Ludwig ${ludwig.map((n) => ["I", "II", "III"][n - 1] ?? n).join("-")}`);
    return parts.join(" / ") || "—";
  };

  return (
    <div>
      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1">
          {(["todos", "male", "female"] as TreatmentSexFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setSexFilter(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                sexFilter === v
                  ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                  : "bg-white text-[#2D2218]/65 border-[#2D2218]/15 hover:border-[#C4A97D]"
              }`}
            >
              {v === "todos" ? "Todos" : v === "male" ? "Hombres" : "Mujeres"}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["todos", "farmacologico", "procedimiento", "cosmético", "nutraceutico"] as TreatmentTypeFilter[]).map((v) => {
            const TYPE_LABELS: Record<TreatmentTypeFilter, string> = {
              todos: "Todos",
              farmacologico: "Farmacológico",
              procedimiento: "Procedimiento",
              cosmético: "Cosmético",
              nutraceutico: "Nutraceutico",
            };
            return (
              <button
                key={v}
                onClick={() => setTypeFilter(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize ${
                  typeFilter === v
                    ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                    : "bg-white text-[#2D2218]/65 border-[#2D2218]/15 hover:border-[#C4A97D]"
                }`}
              >
                {TYPE_LABELS[v]}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          {(["todos", "A", "B", "C"] as EvidenceFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setEvidenceFilter(v)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                evidenceFilter === v
                  ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                  : "bg-white text-[#2D2218]/65 border-[#2D2218]/15 hover:border-[#C4A97D]"
              }`}
            >
              {v === "todos" ? "Todos" : `Ev. ${v}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[#2D2218]/50 text-center py-8">
          Sin resultados para los filtros seleccionados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#2D2218]/10">
          <table className="w-full text-sm">
            <thead className="bg-[#2D2218]/5 border-b border-[#2D2218]/10">
              <tr>
                {["Tratamiento", "Evidencia", "Estadios eficaz", "Tiempo", "Coste ES", "Mantenimiento"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold uppercase tracking-widest text-[#2D2218]/55 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2218]/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F0E8]/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#2D2218] leading-snug">{t.name}</p>
                    <p className="text-[11px] text-[#2D2218]/50 mt-0.5">{t.realistic_expectation}</p>
                  </td>
                  <td className="px-4 py-3">
                    <EvidenceBadge level={t.evidence_level} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2D2218]/70">
                    {formatStages(t.effective_stages_hamilton, t.effective_stages_ludwig)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2D2218]/70">
                    {t.time_to_results_months != null
                      ? `${t.time_to_results_months} meses`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2D2218]/70">
                    {t.type === "procedimiento"
                      ? "Precio variable"
                      : t.avg_cost_spain_eur != null
                      ? `${t.avg_cost_spain_eur}€/mes`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#2D2218]/70">
                    {t.requires_maintenance ? "Sí (continuo)" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MythCard({ myth }: { myth: AlopeciaMyth }) {
  const [expanded, setExpanded] = useState(false);
  const verdictBg = {
    mito: "bg-red-50 border-red-200",
    parcialmente_cierto: "bg-amber-50 border-amber-200",
    confirmado: "bg-emerald-50 border-emerald-200",
  };
  const studyRef =
    myth.study_reference &&
    typeof myth.study_reference === "object" &&
    !Array.isArray(myth.study_reference)
      ? (myth.study_reference as Record<string, string>)
      : null;

  return (
    <div className={`border rounded-xl overflow-hidden ${verdictBg[myth.verdict]}`}>
      <div className="p-4">
        <div className="mb-3">
          <VerdictBadge verdict={myth.verdict} />
        </div>
        <p className="font-semibold text-[#2D2218] text-sm leading-snug mb-2">
          "{myth.myth_statement}"
        </p>
        <p className="text-sm text-[#2D2218]/75 leading-relaxed">
          {myth.verdict_simple}
        </p>
        {myth.scientific_explanation && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-[#C4A97D] font-medium hover:text-[#2D2218] transition-colors"
            >
              {expanded ? "Ocultar explicación" : "Ver explicación científica"}
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
                  <div className="mt-2 border-t border-[#2D2218]/10 pt-2 space-y-2">
                    <p className="text-xs text-[#2D2218]/65 leading-relaxed">
                      {myth.scientific_explanation}
                    </p>
                    {studyRef && studyRef["doi"] && (
                      <p className="text-[10px] text-[#C4A97D]/80 font-mono">
                        Ref: {studyRef["doi"]}
                      </p>
                    )}
                    {studyRef && studyRef["title"] && !studyRef["doi"] && (
                      <p className="text-[10px] text-[#2D2218]/45 italic">
                        {studyRef["title"]}
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
  treatments,
  myths,
  loading,
}: {
  factors: AlopeciaFactor[];
  treatments: AlopeciaDbTreatment[];
  myths: AlopeciaMyth[];
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("causas");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {LIBRARY_TABS.map((tab) => (
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
            {activeTab === "causas" && (
              <div className="grid md:grid-cols-2 gap-4">
                {factors.map((factor) => (
                  <motion.div
                    key={factor.id}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 16 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlopeciaFactorCard factor={factor} />
                  </motion.div>
                ))}
                {factors.length === 0 && (
                  <p className="text-sm text-[#2D2218]/50 col-span-2 text-center py-8">
                    Cargando factores…
                  </p>
                )}
              </div>
            )}

            {activeTab === "tratamientos" && (
              <TreatmentsTab treatments={treatments} />
            )}

            {activeTab === "mitos" && (
              <div className="grid md:grid-cols-2 gap-4">
                {myths.map((myth) => (
                  <motion.div
                    key={myth.id}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 16 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <MythCard myth={myth} />
                  </motion.div>
                ))}
                {myths.length === 0 && (
                  <p className="text-sm text-[#2D2218]/50 col-span-2 text-center py-8">
                    Cargando mitos…
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

// ── Section 2: Diagnostic Form (4-step stepper) ────────────────────────────────

const defaultInput: AlopeciaInput = {
  age: 30,
  sex: "male",
  current_hairloss_stage: "ninguna",
  hamilton_self_reported: null,
  ludwig_self_reported: null,
  father_bald: false,
  mother_father_bald: false,
  siblings_bald: false,
  hairloss_onset_age: null,
  stress_level: 5,
  diet_quality: "buena",
  smoker: false,
  known_deficiencies: ["ninguna"],
  scalp_condition: "normal",
  current_treatments: ["ninguno"],
};

const STAGE_OPTIONS: { value: AlopeciaInput["current_hairloss_stage"]; label: string; sublabel: string }[] = [
  { value: "ninguna", label: "Sin pérdida apreciable", sublabel: "Cabello denso y estable" },
  { value: "leve", label: "Pérdida inicial", sublabel: "Apenas visible, zonas finas" },
  { value: "moderada", label: "Pérdida notable", sublabel: "Cambio estético perceptible" },
  { value: "avanzada", label: "Pérdida significativa", sublabel: "Zonas amplias afectadas" },
];

const HAMILTON_OPTIONS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "🟢", label: "Sin pérdida visible" },
  { value: 2, emoji: "🟡", label: "Entradas leves en sienes" },
  { value: 3, emoji: "⚠️", label: "Entradas profundas / inicio coronilla" },
  { value: 4, emoji: "🔴", label: "Pérdida fronto-temporal + coronilla separadas" },
  { value: 5, emoji: "🔴", label: "Banda fina entre zonas" },
  { value: 6, emoji: "🔴", label: "Zonas fusionadas, pérdida amplia" },
  { value: 7, emoji: "🔴", label: "Solo franja lateral restante" },
];

const LUDWIG_OPTIONS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "🟡", label: "Ensanchamiento leve en la raya central" },
  { value: 2, emoji: "⚠️", label: "Ensanchamiento marcado, pérdida de volumen" },
  { value: 3, emoji: "🔴", label: "Pérdida severa en zona frontoparietal" },
];

const DIET_OPTIONS: { value: AlopeciaInput["diet_quality"]; label: string }[] = [
  { value: "deficiente", label: "Deficiente (comida procesada, poco variada)" },
  { value: "regular", label: "Regular" },
  { value: "buena", label: "Buena" },
  { value: "óptima", label: "Óptima (dieta mediterránea)" },
];

const SCALP_OPTIONS: { value: AlopeciaInput["scalp_condition"]; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "seborreico", label: "Seborreico (grasa, descamación)" },
  { value: "sensible", label: "Sensible (irritación frecuente)" },
  { value: "psoriasis", label: "Psoriasis en cuero cabelludo" },
];

const DEFICIENCY_OPTIONS: { value: AlopeciaInput["known_deficiencies"][number]; label: string }[] = [
  { value: "hierro", label: "Déficit de hierro (confirmado por analítica)" },
  { value: "vitamina_d", label: "Déficit de vitamina D" },
  { value: "zinc", label: "Déficit de zinc" },
  { value: "ninguna", label: "Sin déficits conocidos" },
];

const TREATMENT_OPTIONS: { value: AlopeciaInput["current_treatments"][number]; label: string }[] = [
  { value: "minoxidil", label: "Minoxidil (tópico u oral)" },
  { value: "finasterida", label: "Finasterida" },
  { value: "prp", label: "PRP (plasma rico en plaquetas)" },
  { value: "suplementos", label: "Suplementos (biotina, zinc, etc.)" },
  { value: "ninguno", label: "Ningún tratamiento activo" },
];

function StepIndicator({ step }: { step: number }) {
  const steps = ["Perfil básico", "Historial familiar", "Hábitos y salud", "Tratamientos"];
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
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
              className={`text-[10px] font-medium hidden sm:block transition-colors whitespace-nowrap ${
                step === i + 1
                  ? "text-[#2D2218]"
                  : step > i + 1
                  ? "text-[#C4A97D]"
                  : "text-[#2D2218]/30"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 sm:w-12 mb-4 transition-colors shrink-0 ${
                step > i + 1 ? "bg-[#C4A97D]" : "bg-[#C4A97D]/20"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AlopeciaForm({
  onSubmit,
}: {
  onSubmit: (input: AlopeciaInput) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AlopeciaInput>(defaultInput);

  const update = <K extends keyof AlopeciaInput>(key: K, value: AlopeciaInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDeficiency = (val: AlopeciaInput["known_deficiencies"][number]) => {
    setForm((prev) => {
      if (val === "ninguna") return { ...prev, known_deficiencies: ["ninguna"] };
      const current = prev.known_deficiencies.filter((d) => d !== "ninguna");
      const next = current.includes(val) ? current.filter((d) => d !== val) : [...current, val];
      return { ...prev, known_deficiencies: next.length === 0 ? ["ninguna"] : next };
    });
  };

  const toggleTreatment = (val: AlopeciaInput["current_treatments"][number]) => {
    setForm((prev) => {
      if (val === "ninguno") return { ...prev, current_treatments: ["ninguno"] };
      const current = prev.current_treatments.filter((t) => t !== "ninguno");
      const next = current.includes(val) ? current.filter((t) => t !== val) : [...current, val];
      return { ...prev, current_treatments: next.length === 0 ? ["ninguno"] : next };
    });
  };

  const isFinasteridaFemale =
    form.sex === "female" && form.current_treatments.includes("finasterida");

  const stressColor =
    form.stress_level >= 8
      ? "text-red-600"
      : form.stress_level >= 5
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div>
      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        {/* ── Step 1: Perfil básico ── */}
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
                Edad
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={18}
                  max={75}
                  value={form.age}
                  onChange={(e) => update("age", Math.max(18, Math.min(75, Number(e.target.value))))}
                  className="w-20 border border-[#2D2218]/20 rounded-lg px-3 py-2 text-[#2D2218] font-bold text-lg text-center focus:outline-none focus:border-[#C4A97D]"
                />
                <span className="text-xs text-[#2D2218]/40">años (18-75)</span>
              </div>
            </div>

            {/* Sex */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Sexo biológico
              </label>
              <div className="flex gap-3">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => update("sex", s)}
                    className={`flex-1 py-4 text-sm font-bold rounded-xl border-2 transition-all ${
                      form.sex === s
                        ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                        : "bg-[#F5F0E8] text-[#2D2218] border-[#2D2218]/20 hover:border-[#C4A97D]"
                    }`}
                  >
                    {s === "male" ? "Hombre" : "Mujer"}
                  </button>
                ))}
              </div>
            </div>

            {/* Current hairloss stage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Pérdida capilar actual
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("current_hairloss_stage", opt.value)}
                    className={`rounded-xl px-3 py-3 text-left border-2 transition-all ${
                      form.current_hairloss_stage === opt.value
                        ? "bg-[#F5F0E8] border-[#C4A97D]"
                        : "bg-white border-gray-200 hover:border-[#C4A97D]/50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#2D2218]">{opt.label}</p>
                    <p className="text-[11px] text-[#2D2218]/50 mt-0.5">{opt.sublabel}</p>
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

        {/* ── Step 2: Historial familiar ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* father_bald */}
            <button
              onClick={() => update("father_bald", !form.father_bald)}
              className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all ${
                form.father_bald
                  ? "bg-[#F5F0E8] border-[#C4A97D]"
                  : "bg-white border-gray-200 hover:border-[#C4A97D]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    form.father_bald ? "bg-[#C4A97D] border-[#C4A97D]" : "border-gray-300"
                  }`}
                >
                  {form.father_bald && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D2218]">
                    Mi padre tiene calvicie significativa
                  </p>
                </div>
              </div>
            </button>

            {/* mother_father_bald */}
            <button
              onClick={() => update("mother_father_bald", !form.mother_father_bald)}
              className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all ${
                form.mother_father_bald
                  ? "bg-[#F5F0E8] border-[#C4A97D]"
                  : "bg-white border-gray-200 hover:border-[#C4A97D]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    form.mother_father_bald ? "bg-[#C4A97D] border-[#C4A97D]" : "border-gray-300"
                  }`}
                >
                  {form.mother_father_bald && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2D2218]">
                    Mi abuelo materno tiene/tenía calvicie
                  </p>
                  <p className="text-[11px] text-[#2D2218]/50 mt-0.5">
                    El gen AR del cromosoma X viene de tu madre
                  </p>
                </div>
              </div>
            </button>

            {/* siblings_bald */}
            <button
              onClick={() => update("siblings_bald", !form.siblings_bald)}
              className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all ${
                form.siblings_bald
                  ? "bg-[#F5F0E8] border-[#C4A97D]"
                  : "bg-white border-gray-200 hover:border-[#C4A97D]/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    form.siblings_bald ? "bg-[#C4A97D] border-[#C4A97D]" : "border-gray-300"
                  }`}
                >
                  {form.siblings_bald && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <p className="text-sm font-semibold text-[#2D2218]">
                  Hermanos/as con calvicie visible
                </p>
              </div>
            </button>

            {/* hairloss_onset_age — only if stage !== "ninguna" */}
            {form.current_hairloss_stage !== "ninguna" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-2">
                  ¿A qué edad notaste la caída? (años)
                </label>
                <input
                  type="number"
                  min={10}
                  max={form.age}
                  value={form.hairloss_onset_age ?? ""}
                  placeholder="ej. 24"
                  onChange={(e) =>
                    update(
                      "hairloss_onset_age",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-32 border border-[#2D2218]/20 rounded-lg px-3 py-2 text-[#2D2218] font-bold focus:outline-none focus:border-[#C4A97D]"
                />
              </div>
            )}

            {/* Stage selector: Hamilton or Ludwig */}
            {form.current_hairloss_stage !== "ninguna" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                  {form.sex === "male"
                    ? "Estadio Hamilton-Norwood (autoevaluación)"
                    : "Estadio Ludwig (autoevaluación)"}
                </label>
                {form.sex === "male" ? (
                  <div className="space-y-2">
                    {HAMILTON_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("hamilton_self_reported", opt.value)}
                        className={`w-full text-left rounded-lg px-4 py-2.5 border transition-all flex items-center gap-3 ${
                          form.hamilton_self_reported === opt.value
                            ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                            : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="font-semibold text-xs">
                          {["I", "II", "III", "IV", "V", "VI", "VII"][opt.value - 1]}
                        </span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {LUDWIG_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("ludwig_self_reported", opt.value)}
                        className={`w-full text-left rounded-lg px-4 py-2.5 border transition-all flex items-center gap-3 ${
                          form.ludwig_self_reported === opt.value
                            ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                            : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="font-semibold text-xs">
                          {["I", "II", "III"][opt.value - 1]}
                        </span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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

        {/* ── Step 3: Hábitos y salud ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* stress_level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-2">
                Nivel de estrés crónico{" "}
                <span className={`ml-2 font-bold ${stressColor}`}>
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
                <span>Sin estrés</span>
                <span>Estrés máximo</span>
              </div>
            </div>

            {/* diet_quality */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Calidad de la alimentación
              </label>
              <select
                value={form.diet_quality}
                onChange={(e) =>
                  update("diet_quality", e.target.value as AlopeciaInput["diet_quality"])
                }
                className="w-full border border-[#2D2218]/20 rounded-lg px-3 py-2.5 text-sm text-[#2D2218] focus:outline-none focus:border-[#C4A97D] bg-white"
              >
                {DIET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* smoker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Hábito tabáquico
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
                    {val ? "Fumador/a" : "No fumador/a"}
                  </button>
                ))}
              </div>
            </div>

            {/* known_deficiencies */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Déficits nutricionales conocidos
              </label>
              <div className="space-y-2">
                {DEFICIENCY_OPTIONS.map(({ value, label }) => {
                  const active = form.known_deficiencies.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleDeficiency(value)}
                      className={`w-full text-left rounded-lg px-4 py-2.5 border transition-all flex items-center gap-3 ${
                        active
                          ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                          : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? "bg-[#C4A97D] border-[#C4A97D]" : "border-current opacity-40"
                        }`}
                      >
                        {active && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="text-sm">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* scalp_condition */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Estado del cuero cabelludo
              </label>
              <select
                value={form.scalp_condition}
                onChange={(e) =>
                  update("scalp_condition", e.target.value as AlopeciaInput["scalp_condition"])
                }
                className="w-full border border-[#2D2218]/20 rounded-lg px-3 py-2.5 text-sm text-[#2D2218] focus:outline-none focus:border-[#C4A97D] bg-white"
              >
                {SCALP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#2D2218] text-[#F5F0E8] font-bold uppercase tracking-widest rounded-xl hover:bg-[#3d3025] transition-colors text-sm"
              >
                Siguiente →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Tratamientos actuales ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2D2218]/60 mb-3">
                Tratamientos actuales
              </label>
              <div className="space-y-2">
                {TREATMENT_OPTIONS.map(({ value, label }) => {
                  const active = form.current_treatments.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleTreatment(value)}
                      className={`w-full text-left rounded-lg px-4 py-2.5 border transition-all flex items-center gap-3 ${
                        active
                          ? "bg-[#2D2218] text-[#F5F0E8] border-[#2D2218]"
                          : "bg-white text-[#2D2218]/70 border-[#2D2218]/15 hover:border-[#C4A97D]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? "bg-[#C4A97D] border-[#C4A97D]" : "border-current opacity-40"
                        }`}
                      >
                        {active && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="text-sm">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finasterida contraindication alert */}
            <AnimatePresence>
              {isFinasteridaFemale && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border-2 border-red-500 bg-red-50 px-5 py-4"
                >
                  <p className="text-sm font-bold text-red-700 mb-1">
                    ⚠️ Contraindicación absoluta
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed mb-2">
                    La finasterida está contraindicada en mujeres embarazadas o que puedan quedarse embarazadas. Consulta con tu médico antes de continuar cualquier tratamiento.
                  </p>
                  <a
                    href="https://www.ema.europa.eu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-700 underline font-medium"
                  >
                    Ver ficha técnica EMA →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
              >
                ← Anterior
              </button>
              <button
                onClick={() => onSubmit(form)}
                disabled={isFinasteridaFemale}
                className={`flex-1 py-4 font-bold uppercase tracking-widest rounded-xl transition-colors text-sm ${
                  isFinasteridaFemale
                    ? "bg-[#2D2218]/20 text-[#2D2218]/30 cursor-not-allowed"
                    : "bg-[#C4A97D] text-[#2D2218] hover:bg-[#b89868]"
                }`}
              >
                Generar Informe →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section 3: Risk Report ─────────────────────────────────────────────────────

const RISK_LEVEL_CONFIG = {
  bajo: {
    label: "Riesgo Bajo",
    cls: "bg-green-50 border-green-700 text-green-800",
    barColor: "bg-green-500",
  },
  moderado: {
    label: "Riesgo Moderado",
    cls: "bg-amber-50 border-[#C4A97D] text-amber-800",
    barColor: "bg-[#C4A97D]",
  },
  alto: {
    label: "Riesgo Alto",
    cls: "bg-red-50 border-red-500 text-red-700",
    barColor: "bg-red-500",
  },
  muy_alto: {
    label: "Riesgo Muy Alto",
    cls: "bg-red-100 border-red-800 text-red-900",
    barColor: "bg-red-800",
  },
};

const RISK_TYPE_LABELS: Record<AlopeciaReport["risk_type"], string> = {
  genetico_predominante: "Alopecia genética predominante",
  mixto: "Alopecia mixta (Genética + Ambiental)",
  ambiental_reversible: "Caída capilar ambiental (potencialmente reversible)",
};

const TREATMENT_TYPE_LABELS: Record<string, string> = {
  farmacologico: "Farmacológico",
  procedimiento: "Procedimiento clínico",
  cosmético: "Cosmético",
  nutraceutico: "Nutraceutico",
};

function RiskReport({
  report,
  onReset,
}: {
  report: AlopeciaReport;
  onReset: () => void;
}) {
  const isUrgent = report.recommended_action === "dermatologo_urgente";
  const riskCfg = RISK_LEVEL_CONFIG[report.risk_level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
      id="alopecia-report-print"
    >
      {/* Urgent CTA — shown BEFORE the full report when muy_alto + dermatologo_urgente */}
      {isUrgent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border-2 border-red-500 bg-red-50 px-5 py-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">
                ACCIÓN RECOMENDADA: Consulta dermatológica urgente
              </p>
              <p className="text-xs text-red-700 leading-relaxed mb-3">
                Tu perfil sugiere alopecia prematura o de rápida progresión. El diagnóstico clínico precoz amplía significativamente las opciones de tratamiento.
              </p>
              <button className="px-4 py-2 bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-800 transition-colors">
                Consultar con dermatólogo
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Score + risk level header */}
      <div className="rounded-2xl border border-[#2D2218]/15 bg-white overflow-hidden">
        <div className="bg-[#2D2218] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-1">
            Informe de riesgo — GuiaDelSalon.com
          </p>
          <h3 className="font-display text-xl font-bold text-[#F5F0E8]">
            Analizador de Alopecia
          </h3>
        </div>

        <div className="px-5 py-5">
          {/* Score circle + bar */}
          <div className="flex items-center gap-5 mb-5">
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-[#C4A97D] bg-[#F5F0E8] shrink-0">
              <span className="font-display text-2xl font-bold text-[#2D2218] leading-none">
                {report.risk_score}
              </span>
              <span className="text-[10px] text-[#2D2218]/50 font-medium">/100</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${riskCfg.cls}`}
                >
                  {riskCfg.label}
                </span>
              </div>
              <div className="h-2.5 bg-[#2D2218]/8 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${riskCfg.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${report.risk_score}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#2D2218]/55">
                {RISK_TYPE_LABELS[report.risk_type]}
              </p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2D2218]/8">
            {[
              { label: "Genético", value: report._genetic_score, max: 50 },
              { label: "Inicio", value: report._onset_score, max: 25 },
              { label: "Externo", value: report._external_score, max: 25 },
            ].map(({ label, value, max }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D2218]/45 mb-1">
                  {label}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#2D2218]/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C4A97D] rounded-full"
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#2D2218]">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Possible hormonal cause info box */}
      {report.possible_hormonal_cause && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
          <p className="text-sm font-bold text-sky-800 mb-1">
            Posible causa hormonal detectada
          </p>
          <p className="text-xs text-sky-700 leading-relaxed">
            Tu perfil puede tener causa hormonal. Te recomendamos una analítica (hormonas tiroideas, andrógenos, ferritina) antes de iniciar tratamiento para descartar causas tratables.
          </p>
        </div>
      )}

      {/* Modifiable factors */}
      {report.modifiable_factors.length > 0 && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-3">
            ✅ Factores que puedes modificar:
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
            ⚠️ Factores no modificables:
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

      {/* Evidence-based options */}
      {report.evidence_based_options.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/50 mb-3">
            Opciones con respaldo científico
          </p>
          <div className="space-y-2">
            {report.evidence_based_options.map((opt) => (
              <div
                key={opt.id}
                className="bg-white border border-[#2D2218]/10 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-[#2D2218] leading-snug">
                    {opt.name}
                  </p>
                  <div className="flex gap-1.5 shrink-0">
                    <EvidenceBadge level={opt.evidence_level} />
                    {opt.type && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2D2218]/8 text-[#2D2218]/60 border border-[#2D2218]/10">
                        {TREATMENT_TYPE_LABELS[opt.type] ?? opt.type}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#2D2218]/60 leading-relaxed italic">
                  {opt.realistic_expectation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Myth alerts */}
      {report.myth_alerts.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/50 mb-3">
            🔔 Alertas sobre mitos frecuentes en tu perfil
          </p>
          <div className="space-y-2">
            {report.myth_alerts.map((alert, i) => (
              <div
                key={i}
                className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed"
              >
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated progression */}
      <div className="rounded-xl bg-[#2D2218]/5 border border-[#2D2218]/10 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2D2218]/45 mb-2">
          Progresión estimada
        </p>
        <p className="text-sm text-[#2D2218]/70 leading-relaxed italic">
          {report.estimated_progression}
        </p>
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

      {/* Disclaimer */}
      <div className="rounded-xl bg-[#F5F0E8] border border-[#C4A97D]/30 px-5 py-4">
        <p className="text-xs text-[#2D2218]/65 leading-relaxed">
          <span className="font-bold text-[#2D2218]/80">⚕️ Aviso médico:</span>{" "}
          Este análisis es orientativo y no constituye diagnóstico médico. Consulta con un dermatólogo o tricólogo para evaluación clínica. Si estás en tratamiento farmacológico, consulta con tu médico antes de realizar cambios.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={onReset}
          className="flex-1 py-3 border border-[#2D2218]/20 text-[#2D2218]/70 text-sm font-medium rounded-xl hover:border-[#2D2218] transition-colors"
        >
          Nuevo análisis
        </button>
        <button
          onClick={() => generateAlopeciaPDF({
            riskLevel: report.risk_level,
            riskScore: report.risk_score,
            riskType: report.risk_type,
            estimatedProgression: report.estimated_progression,
            modifiableFactors: report.modifiable_factors,
            nonModifiableFactors: report.non_modifiable_factors,
            recommendedAction: report.recommended_action,
            evidenceOptions: report.evidence_based_options.map(o => ({ name: o.name, realistic_expectation: o.realistic_expectation })),
            realisticExpectations: report.realistic_expectations,
            mythAlerts: report.myth_alerts,
          })}
          className="flex-1 py-3 bg-[#C4A97D] text-[#2D2218] font-bold uppercase tracking-widest rounded-xl hover:bg-[#b89868] transition-colors text-sm"
        >
          Descargar Informe PDF
        </button>
      </div>
    </motion.div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

type MainView = "library" | "form" | "report";

interface AlopeciaAnalyzerProps {
  wizardContinue?: (summary: string, score?: number) => void;
}

export default function AlopeciaAnalyzer({ wizardContinue }: AlopeciaAnalyzerProps = {}) {
  const [view, setView] = useState<MainView>("library");
  const [report, setReport] = useState<AlopeciaReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch factors
  const { data: factors = [], isLoading: factorsLoading } = useQuery({
    queryKey: ["alopecia_factors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alopecia_factors")
        .select("*")
        .order("evidence_level")
        .order("category");
      if (error) throw error;
      return data as AlopeciaFactor[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch treatments
  const { data: treatments = [], isLoading: treatmentsLoading } = useQuery({
    queryKey: ["alopecia_treatments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alopecia_treatments")
        .select("*");
      if (error) throw error;
      return data as AlopeciaDbTreatment[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch myths
  const { data: myths = [], isLoading: mythsLoading } = useQuery({
    queryKey: ["alopecia_myths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alopecia_myths")
        .select("*");
      if (error) throw error;
      return data as AlopeciaMyth[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Persist report
  const { mutate: persistReport } = useMutation({
    mutationFn: async ({
      input,
      result,
    }: {
      input: AlopeciaInput;
      result: AlopeciaReport;
    }) => {
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from("alopecia_reports").insert({
        session_id: sessionId,
        input_data: input as unknown as Json,
        risk_level: result.risk_level,
        risk_score: result.risk_score,
        recommended_action: result.recommended_action,
        evidence_based_options: result.evidence_based_options as unknown as Json,
        myth_alerts: result.myth_alerts,
      });
      if (error) console.warn("Alopecia report persist error:", error.message);
    },
  });

  const handleFormSubmit = (input: AlopeciaInput) => {
    const result = generateAlopeciaReport(input);
    setReport(result);
    setView("report");
    persistReport({ input, result });
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleReset = () => {
    setReport(null);
    setView("form");
  };

  const navItems: { key: MainView; label: string }[] = [
    { key: "library", label: "Biblioteca científica" },
    { key: "form", label: "Análisis personalizado" },
    ...(report ? [{ key: "report" as MainView, label: "Mi informe" }] : []),
  ];

  const libraryLoading = factorsLoading || treatmentsLoading || mythsLoading;

  return (
    <>
      <style>{`
        @media print {
          nav, .hero-section, .library-section, .form-section, .print\\:hidden { display: none !important; }
          #alopecia-report-print { display: block !important; }
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
            className="library-section"
          >
            <ScientificLibrary
              factors={factors}
              treatments={treatments}
              myths={myths}
              loading={libraryLoading}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => setView("form")}
                className="px-8 py-4 bg-[#2D2218] text-[#F5F0E8] font-bold uppercase tracking-widest rounded-xl hover:bg-[#3d3025] transition-colors text-sm"
              >
                Analizar mi riesgo →
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
            className="form-section"
          >
            <AlopeciaForm onSubmit={handleFormSubmit} />
          </motion.div>
        )}

        {view === "report" && report && (
          <motion.div
            key="report"
            ref={reportRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <RiskReport report={report} onReset={handleReset} />
            {wizardContinue && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => wizardContinue(
                    `Riesgo ${report.risk_level} — ${report.risk_score}/100`,
                    report.risk_score
                  )}
                  className="px-8 py-4 bg-accent-orange text-white font-bold uppercase tracking-widest rounded-xl hover:bg-accent-orange-hover transition-colors text-sm flex items-center gap-2"
                >
                  Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
