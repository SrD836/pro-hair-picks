import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, AlertTriangle, ExternalLink, Beaker, Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InciRisks {
  irritation: "low" | "moderate" | "high";
  sensitization: "low" | "moderate" | "high";
  endocrine_disruption: "no" | "suspected" | "confirmed";
  respiratory: "low" | "moderate" | "high";
  carcinogenicity: "no" | "iarc_2b" | "iarc_2a" | "iarc_1";
}

interface InciProfile {
  level: "green" | "yellow" | "red";
  note: string;
}

interface InciSource {
  organism: string;
  document: string;
  year: number;
  url?: string;
}

export interface InciIngredient {
  id: string;
  inci_name: string;
  common_name: string;
  cas_number?: string;
  category: string;
  function_technical?: string;
  function_simple?: string;
  risks?: InciRisks;
  benefits_technical?: string;
  profile_sensitive_scalp?: InciProfile;
  profile_allergy?: InciProfile;
  profile_pregnancy?: InciProfile;
  eu_restriction?: string;
  max_concentration_eu?: string;
  sources?: InciSource[];
  pending_review?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2 };

function getWorstLevel(ing: InciIngredient): "red" | "yellow" | "green" {
  const levels = [
    ing.profile_sensitive_scalp?.level,
    ing.profile_allergy?.level,
    ing.profile_pregnancy?.level,
  ].filter(Boolean) as string[];
  return (levels.sort((a, b) => RISK_ORDER[a] - RISK_ORDER[b])[0] ?? "green") as "red" | "yellow" | "green";
}

const LEVEL_EMOJI: Record<string, string> = { red: "🔴", yellow: "🟡", green: "🟢" };

const CATEGORY_LABELS: Record<string, string> = {
  colorant: "Colorante",
  preservative: "Conservante",
  surfactant: "Surfactante",
  conditioning: "Acondicionador",
  solvent: "Solvente",
  alkaline_agent: "Agente alcalino",
};

const RISK_LEVEL_ES: Record<string, string> = { low: "Bajo", moderate: "Moderado", high: "Alto" };
const CARCINOGEN_ES: Record<string, string> = {
  no: "No clasificado",
  iarc_2b: "IARC Grupo 2B (posible)",
  iarc_2a: "IARC Grupo 2A (probable)",
  iarc_1: "IARC Grupo 1 ⚠️ Carcinógeno conocido",
};
const ENDOCRINE_ES: Record<string, string> = {
  no: "No documentada",
  suspected: "Sospechada",
  confirmed: "Confirmada",
};

// card styling by worst level
const CARD_STYLE: Record<string, { border: string; bg: string; badge: string }> = {
  red: {
    border: "border-red-700",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-800 border-red-300",
  },
  yellow: {
    border: "border-[#C4A97D]",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
  },
  green: {
    border: "border-green-700",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-800 border-green-300",
  },
};

// ─── IngredientCard ───────────────────────────────────────────────────────────

function IngredientCard({ ingredient, index = 0 }: { ingredient: InciIngredient; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const worst = getWorstLevel(ingredient);
  const style = CARD_STYLE[worst];
  const catLabel = CATEGORY_LABELS[ingredient.category] ?? ingredient.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`rounded-2xl border-2 ${style.border} ${style.bg} overflow-hidden`}
    >
      {/* Header */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-[#2D2218] text-base md:text-lg leading-tight block">
              {ingredient.inci_name}
            </span>
            {ingredient.common_name !== ingredient.inci_name && (
              <span className="text-[#2D2218]/60 text-xs mt-0.5 block">{ingredient.common_name}</span>
            )}
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${style.badge}`}
          >
            {catLabel}
          </span>
        </div>

        {/* Simple description */}
        {ingredient.function_simple && (
          <p className="text-[#2D2218]/75 text-sm leading-relaxed mb-3 italic">
            "{ingredient.function_simple}"
          </p>
        )}

        {/* Profile indicators */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Cuero sensible", icon: "👤", profile: ingredient.profile_sensitive_scalp },
            { label: "Alergia", icon: "⚠️", profile: ingredient.profile_allergy },
            { label: "Embarazo", icon: "🤰", profile: ingredient.profile_pregnancy },
          ].map(({ label, icon, profile }) =>
            profile ? (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/70 border border-[#2D2218]/10"
                title={profile.note}
              >
                <span className="text-xs">{icon}</span>
                <span className="text-[10px] font-semibold text-[#2D2218]/70">{label}</span>
                <span className="text-xs">{LEVEL_EMOJI[profile.level]}</span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Expandable technical section */}
      <div className="border-t border-[#2D2218]/10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 md:px-5 py-2.5 text-xs font-semibold text-[#2D2218]/60 hover:text-[#2D2218] transition-colors"
        >
          <span>{expanded ? "Ocultar análisis técnico" : "Ver análisis técnico completo"}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-5 pb-5 space-y-4 text-sm text-[#2D2218]">
                {/* Profiles detail */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D]">Perfiles de riesgo</p>
                  {[
                    { label: "👤 Cuero cabelludo sensible", profile: ingredient.profile_sensitive_scalp },
                    { label: "⚠️ Alergia de contacto", profile: ingredient.profile_allergy },
                    { label: "🤰 Embarazo / Lactancia", profile: ingredient.profile_pregnancy },
                  ].map(({ label, profile }) =>
                    profile ? (
                      <div key={label} className="flex gap-2.5">
                        <span className="shrink-0 text-base leading-snug">{LEVEL_EMOJI[profile.level]}</span>
                        <div>
                          <span className="font-semibold text-xs">{label}: </span>
                          <span className="text-xs text-[#2D2218]/75">{profile.note}</span>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Function technical */}
                {ingredient.function_technical && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-1">Función técnica</p>
                    <p className="text-xs text-[#2D2218]/75 leading-relaxed">{ingredient.function_technical}</p>
                  </div>
                )}

                {/* Risk table */}
                {ingredient.risks && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-2">Perfil de riesgos</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        ["Irritación", RISK_LEVEL_ES[ingredient.risks.irritation]],
                        ["Sensibilización", RISK_LEVEL_ES[ingredient.risks.sensitization]],
                        ["Toxicidad resp.", RISK_LEVEL_ES[ingredient.risks.respiratory]],
                        ["Disrupción endocrina", ENDOCRINE_ES[ingredient.risks.endocrine_disruption]],
                        ["Carcinogenicidad", CARCINOGEN_ES[ingredient.risks.carcinogenicity]],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs border-b border-[#2D2218]/08 py-0.5">
                          <span className="text-[#2D2218]/60">{k}</span>
                          <span
                            className={`font-semibold ${
                              v?.includes("Alto") || v?.includes("IARC Grupo 1") || v?.includes("Confirmada")
                                ? "text-red-700"
                                : v?.includes("Moderado") || v?.includes("Sospechada")
                                ? "text-amber-700"
                                : "text-green-700"
                            }`}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {ingredient.benefits_technical && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-1">Beneficios técnicos</p>
                    <p className="text-xs text-[#2D2218]/75 leading-relaxed">{ingredient.benefits_technical}</p>
                  </div>
                )}

                {/* EU restriction */}
                {ingredient.eu_restriction && (
                  <div className="rounded-lg bg-white/60 border border-[#2D2218]/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-1">
                      Restricciones UE vigentes
                    </p>
                    <p className="text-xs text-[#2D2218]/80 leading-relaxed">{ingredient.eu_restriction}</p>
                    {ingredient.max_concentration_eu && (
                      <p className="text-xs font-semibold text-[#2D2218] mt-1">
                        Concentración máxima: {ingredient.max_concentration_eu}
                      </p>
                    )}
                  </div>
                )}

                {/* Sources */}
                {ingredient.sources && ingredient.sources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D] mb-1.5">Fuentes</p>
                    <div className="space-y-1">
                      {ingredient.sources.map((src, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[#2D2218]/65">
                          <span className="font-semibold shrink-0">{src.organism} {src.year}:</span>
                          {src.url ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#C4A97D] transition-colors inline-flex items-center gap-0.5 underline underline-offset-2"
                            >
                              {src.document}
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ) : (
                            <span>{src.document}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ingredient.cas_number && (
                  <p className="text-[10px] text-[#2D2218]/35">CAS: {ingredient.cas_number}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InciChecker() {
  const [mode, setMode] = useState<"individual" | "scanner">("individual");

  // Mode 1 — individual search
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<InciIngredient[]>([]);
  const [selected, setSelected] = useState<InciIngredient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mode 2 — scanner
  const [scanInput, setScanInput] = useState("");
  const [scanResults, setScanResults] = useState<InciIngredient[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // Cache all ingredients for scanner matching
  const [allIngredients, setAllIngredients] = useState<InciIngredient[]>([]);

  useEffect(() => {
    supabase
      .from("inci_ingredients")
      .select("*")
      .then(({ data }) => {
        if (data) setAllIngredients(data as InciIngredient[]);
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("inci_ingredients")
        .select("*")
        .or(`inci_name.ilike.%${query}%,common_name.ilike.%${query}%`)
        .limit(8);
      setSuggestions((data as InciIngredient[]) ?? []);
      setShowDropdown(true);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (ing: InciIngredient) => {
    setSelected(ing);
    setQuery(ing.inci_name);
    setShowDropdown(false);
  };

  // Scanner
  const handleScan = async () => {
    const tokens = scanInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length >= 3);

    if (tokens.length === 0) return;
    setIsScanning(true);
    setScanDone(false);

    const matched: InciIngredient[] = [];
    const seen = new Set<string>();

    for (const token of tokens) {
      const lower = token.toLowerCase();
      const found = allIngredients.find(
        (ing) =>
          !seen.has(ing.id) &&
          (ing.inci_name.toLowerCase().includes(lower) ||
            ing.common_name.toLowerCase().includes(lower) ||
            lower.includes(ing.inci_name.toLowerCase().split(" ")[0].toLowerCase()))
      );
      if (found) {
        matched.push(found);
        seen.add(found.id);
      }
    }

    // Sort red → yellow → green
    matched.sort((a, b) => RISK_ORDER[getWorstLevel(a)] - RISK_ORDER[getWorstLevel(b)]);

    setScanResults(matched);
    setIsScanning(false);
    setScanDone(true);
  };

  // Badge for most vulnerable profile
  const worstBadge = () => {
    if (!scanResults.length) return null;
    const worst = getWorstLevel(scanResults[0]);
    if (worst === "red")
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 bg-red-100 border border-red-300 px-3 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          Perfil más vulnerable afectado: se detectaron ingredientes de riesgo alto
        </span>
      );
    if (worst === "yellow")
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          Atención: se detectaron ingredientes que requieren precaución
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
        Lista analizada: sin ingredientes de riesgo alto detectados
      </span>
    );
  };

  return (
    <div className="bg-[#F5F0E8] rounded-3xl border border-[#2D2218]/10 overflow-hidden">
      {/* Mode selector */}
      <div className="flex border-b border-[#2D2218]/10">
        {[
          { id: "individual" as const, label: "Búsqueda individual", icon: <Search className="w-4 h-4" /> },
          { id: "scanner" as const, label: "Escáner de lista INCI", icon: <Scan className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
              mode === tab.id
                ? "bg-[#2D2218] text-[#F5F0E8]"
                : "text-[#2D2218]/60 hover:text-[#2D2218] hover:bg-[#2D2218]/05"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === "individual" ? "Buscar" : "Escanear"}</span>
          </button>
        ))}
      </div>

      <div className="p-5 md:p-7">
        <AnimatePresence mode="wait">
          {/* ── MODE 1: Individual search ────────────────────────────────── */}
          {mode === "individual" && (
            <motion.div
              key="individual"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[#2D2218]/55 text-sm mb-4">
                Busca un ingrediente por su nombre INCI o nombre común para obtener su ficha de seguridad completa.
              </p>

              <div ref={searchRef} className="relative mb-6">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2218]/40" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelected(null);
                    }}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder="Ej: Sodium Lauryl Sulfate, PPD, Methylparaben…"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#2D2218]/15 text-sm text-[#2D2218] placeholder:text-[#2D2218]/35 focus:outline-none focus:border-[#C4A97D] focus:ring-2 focus:ring-[#C4A97D]/20 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#C4A97D] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <AnimatePresence>
                  {showDropdown && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#2D2218]/12 shadow-lg overflow-hidden"
                    >
                      {suggestions.map((ing) => (
                        <button
                          key={ing.id}
                          onClick={() => handleSelect(ing)}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#F5F0E8] transition-colors"
                        >
                          <div>
                            <span className="text-sm font-semibold text-[#2D2218]">{ing.inci_name}</span>
                            <span className="text-xs text-[#2D2218]/50 ml-2">{ing.common_name}</span>
                          </div>
                          <span className="text-xs text-[#2D2218]/40 shrink-0 ml-2">
                            {LEVEL_EMOJI[getWorstLevel(ing)]}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selected && <IngredientCard ingredient={selected} />}

              {!selected && query.length === 0 && (
                <div className="text-center py-8 text-[#2D2218]/30">
                  <Beaker className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── MODE 2: INCI list scanner ─────────────────────────────────── */}
          {mode === "scanner" && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[#2D2218]/55 text-sm mb-4">
                Pega la lista de ingredientes de un producto (separados por comas, tal como aparecen en el envase).
                El escáner los cruza contra la base de datos y los ordena de mayor a menor riesgo.
              </p>

              <textarea
                value={scanInput}
                onChange={(e) => {
                  setScanInput(e.target.value);
                  setScanDone(false);
                }}
                rows={5}
                placeholder="Ej: Aqua, Sodium Lauryl Sulfate, Methylparaben, Propylparaben, Dimethicone, p-Phenylenediamine…"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#2D2218]/15 text-sm text-[#2D2218] placeholder:text-[#2D2218]/35 focus:outline-none focus:border-[#C4A97D] focus:ring-2 focus:ring-[#C4A97D]/20 transition-all resize-none mb-4 leading-relaxed"
              />

              <button
                onClick={handleScan}
                disabled={isScanning || scanInput.trim().length < 3}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#2D2218", color: "#F5F0E8" }}
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#F5F0E8] border-t-transparent rounded-full animate-spin" />
                    Analizando…
                  </span>
                ) : (
                  "Analizar lista INCI"
                )}
              </button>

              {scanDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  {/* Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D]">Resultado</p>
                      <p className="text-sm text-[#2D2218]/70">
                        {scanResults.length > 0
                          ? `${scanResults.length} ingrediente${scanResults.length > 1 ? "s" : ""} identificado${scanResults.length > 1 ? "s" : ""} en la base de datos`
                          : "No se identificaron ingredientes conocidos en la lista"}
                      </p>
                    </div>
                    {worstBadge()}
                  </div>

                  {scanResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {scanResults.map((ing, i) => (
                        <IngredientCard key={ing.id} ingredient={ing} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#2D2218]/30">
                      <p className="text-sm">
                        La base de datos cubre los ingredientes más comunes en productos capilares profesionales.
                        Los ingredientes no encontrados no están en la base de datos actual.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
