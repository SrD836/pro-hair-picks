import { useState, useCallback } from "react";
import { generateRecoveryPDF } from "@/lib/pdfGenerators";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Download,
  Droplets,
  Leaf,
  RefreshCw,
  Shield,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  generateRecoveryCalendar,
  type RecoveryPhaseRow,
  type WeekEntry,
  type RecoveryCalendarSuccess,
  type LastTreatment,
  type HairPorosity,
  type ScalpCondition,
  type PhaseType,
} from "@/lib/recoveryTimelineEngine";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  const key = "recovery_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/** Convert 'dd/MM/yyyy' → 'yyyy-MM-dd' for DB storage */
function toISODate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

// ── Phase config ──────────────────────────────────────────────────────────────

interface PhaseConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

const PHASE_CONFIG: Record<PhaseType, PhaseConfig> = {
  hidratacion: {
    label: "Hidratación",
    icon: <Droplets className="w-4 h-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    dotColor: "bg-blue-500",
  },
  reconstruccion: {
    label: "Reconstrucción",
    icon: <Shield className="w-4 h-4" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    dotColor: "bg-orange-500",
  },
  sellado: {
    label: "Sellado",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-[#C4A97D]",
    bgColor: "bg-[#C4A97D]/10",
    borderColor: "border-[#C4A97D]/30",
    dotColor: "bg-[#C4A97D]",
  },
  mantenimiento: {
    label: "Mantenimiento",
    icon: <Leaf className="w-4 h-4" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    dotColor: "bg-green-500",
  },
};

// ── Damage level label ────────────────────────────────────────────────────────

function getDamageLevelLabel(level: number): string {
  if (level <= 3) return "Cabello sano o con daño leve";
  if (level <= 6) return "Daño moderado, pérdida de brillo y elasticidad";
  if (level <= 9) return "Daño severo, rotura y porosidad alta";
  return "Daño extremo — requiere consulta profesional urgente";
}

function getDamageLevelColor(level: number): string {
  if (level <= 3) return "text-green-400";
  if (level <= 6) return "text-yellow-400";
  if (level <= 9) return "text-orange-400";
  return "text-red-500";
}

// ── Week Detail Dialog ────────────────────────────────────────────────────────

interface WeekDetailDialogProps {
  week: WeekEntry | null;
  open: boolean;
  onClose: () => void;
}

function WeekDetailDialog({ week, open, onClose }: WeekDetailDialogProps) {
  if (!week) return null;
  const cfg = PHASE_CONFIG[week.phase];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          max-w-lg bg-[#1a1410] border border-[#C4A97D]/20 text-[#F5F0E8]
          max-h-[90vh] overflow-y-auto
        "
      >
        <DialogHeader>
          <div className={`inline-flex items-center gap-2 mb-2 ${cfg.color}`}>
            {cfg.icon}
            <span className="text-xs font-bold uppercase tracking-widest">
              Semana {week.week} · {cfg.label}
            </span>
          </div>
          <DialogTitle className="font-display text-xl font-bold text-[#F5F0E8] leading-snug text-left">
            {week.focus_simple}
          </DialogTitle>
          <DialogDescription className="text-[#F5F0E8]/50 text-xs leading-relaxed text-left mt-1">
            {week.focus}
          </DialogDescription>
        </DialogHeader>

        {/* Key ingredients */}
        {week.treatments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
              Ingredientes clave
            </p>
            <div className="flex flex-wrap gap-2">
              {week.treatments.map((ingredient) => (
                <span
                  key={ingredient}
                  className={`
                    inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    border ${cfg.borderColor} ${cfg.bgColor} ${cfg.color}
                  `}
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avoid */}
        {week.avoid.length > 0 && (
          <div className="rounded-xl border border-red-800/40 bg-red-900/10 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
              🚫 Evitar esta semana
            </p>
            <ul className="space-y-1">
              {week.avoid.map((item) => (
                <li key={item} className="text-sm text-red-300/80 flex items-start gap-2">
                  <span className="mt-0.5 text-red-500 shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkpoint */}
        {week.checkpoint && (
          <div className="rounded-xl border border-[#C4A97D]/20 bg-[#C4A97D]/5 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-2 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5" />
              Punto de control
            </p>
            <p className="text-sm text-[#F5F0E8]/75 leading-relaxed">{week.checkpoint}</p>
          </div>
        )}

        {week.pending_review && (
          <p className="text-[10px] text-[#F5F0E8]/30 italic border-t border-[#C4A97D]/10 pt-3">
            Protocolo pendiente de revisión por especialista
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Timeline Node (desktop) ───────────────────────────────────────────────────

interface TimelineNodeProps {
  week: WeekEntry;
  index: number;
  total: number;
  onClick: () => void;
}

function TimelineNode({ week, index, total, onClick }: TimelineNodeProps) {
  const cfg = PHASE_CONFIG[week.phase];
  const isLast = index === total - 1;

  return (
    <div className="flex items-center">
      {/* Node + label */}
      <div className="flex flex-col items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={onClick}
          className={`
            w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5
            border-2 cursor-pointer transition-all shadow-md
            ${cfg.bgColor} ${cfg.borderColor} ${cfg.color}
            hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C4A97D]/50
          `}
          aria-label={`Semana ${week.week}: ${cfg.label}`}
        >
          {cfg.icon}
          <span className="text-[10px] font-bold">S{week.week}</span>
        </motion.button>
        <span className={`text-[10px] font-semibold text-center max-w-[60px] leading-tight ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="w-8 h-0.5 bg-gradient-to-r from-[#C4A97D]/30 to-[#C4A97D]/10 mx-1 shrink-0" />
      )}
    </div>
  );
}

// ── Week Card (mobile) ────────────────────────────────────────────────────────

interface WeekCardProps {
  week: WeekEntry;
  onClick: () => void;
}

function WeekCard({ week, onClick }: WeekCardProps) {
  const cfg = PHASE_CONFIG[week.phase];

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`
        w-full text-left rounded-xl border p-4 flex items-start gap-4 cursor-pointer
        transition-all ${cfg.bgColor} ${cfg.borderColor}
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C4A97D]/50
      `}
      aria-label={`Semana ${week.week}: ${cfg.label} — ${week.focus_simple}`}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center shrink-0
        border ${cfg.borderColor} ${cfg.color}
      `}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4A97D]">
            S{week.week}
          </span>
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
        <p className="text-sm font-semibold text-[#F5F0E8]/90 leading-snug line-clamp-2">
          {week.focus_simple}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#C4A97D]/50 shrink-0 mt-1" />
    </motion.button>
  );
}

// ── Maintenance Card ──────────────────────────────────────────────────────────

interface MaintenanceCardProps {
  maintenance: WeekEntry;
  onClick: () => void;
}

function MaintenanceCard({ maintenance, onClick }: MaintenanceCardProps) {
  const cfg = PHASE_CONFIG["mantenimiento"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-[#F5F0E8] text-base">Mantenimiento continuo</h3>
          <p className="text-xs text-green-400 font-medium">Después del calendario</p>
        </div>
      </div>

      <p className="text-sm text-[#F5F0E8]/80 leading-relaxed mb-4">
        {maintenance.focus_simple}
      </p>

      {maintenance.treatments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {maintenance.treatments.map((ingredient) => (
            <span
              key={ingredient}
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                border ${cfg.borderColor} ${cfg.bgColor} ${cfg.color}
              `}
            >
              {ingredient}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onClick}
        className="text-xs text-green-400/70 hover:text-green-400 transition-colors underline underline-offset-2"
      >
        Ver protocolo completo
      </button>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type ViewState = "form" | "blocked" | "calendar";

export default function RecoveryTimeline() {
  // ── Form state
  const [damageLevel, setDamageLevel] = useState<number>(5);
  const [lastTreatment, setLastTreatment] = useState<LastTreatment | "">("");
  const [porosity, setPorosity] = useState<HairPorosity | "">("");
  const [scalp, setScalp] = useState<ScalpCondition | "">("");

  // ── View state
  const [view, setView] = useState<ViewState>("form");
  const [calendar, setCalendar] = useState<RecoveryCalendarSuccess | null>(null);

  // ── Dialog state
  const [selectedWeek, setSelectedWeek] = useState<WeekEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Fetch phases
  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ["recovery_phases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("recovery_phases").select("*");
      if (error) throw error;
      return data as RecoveryPhaseRow[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // ── Persist calendar mutation
  const { mutate: persistCalendar } = useMutation({
    mutationFn: async (cal: RecoveryCalendarSuccess) => {
      const sessionId = getOrCreateSessionId();
      const { error } = await supabase.from("recovery_calendars").insert({
        user_session: sessionId,
        damage_level: damageLevel,
        last_treatment: lastTreatment as string,
        hair_porosity: porosity as string,
        scalp_condition: scalp as string,
        calendar_json: cal as unknown as Json,
        next_safe_treatment_date: toISODate(cal.next_safe_treatment_date),
      });
      if (error) throw error;
    },
  });

  // ── Submit form
  const handleSubmit = useCallback(() => {
    if (!lastTreatment || !porosity || !scalp) return;

    const result = generateRecoveryCalendar(
      {
        damage_level: damageLevel,
        last_treatment: lastTreatment as LastTreatment,
        hair_porosity: porosity as HairPorosity,
        scalp_condition: scalp as ScalpCondition,
      },
      phases
    );

    if (result.blocked) {
      setView("blocked");
      return;
    }

    const successResult = result as RecoveryCalendarSuccess;
    setCalendar(successResult);
    setView("calendar");
    persistCalendar(successResult);
  }, [damageLevel, lastTreatment, porosity, scalp, phases, persistCalendar]);

  // ── Reset
  const handleReset = useCallback(() => {
    setView("form");
    setCalendar(null);
    setSelectedWeek(null);
    setDialogOpen(false);
  }, []);

  // ── Open week dialog
  const openWeek = useCallback((week: WeekEntry) => {
    setSelectedWeek(week);
    setDialogOpen(true);
  }, []);

  const isFormComplete =
    lastTreatment !== "" && porosity !== "" && scalp !== "" && damageLevel !== 10;
  const isSubmitDisabled = !isFormComplete || phasesLoading;

  // ─────────────────────────────────────────────────────────────────────────────
  // FORM VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <>
        <style>{`
          @media print {
            nav, footer, .no-print { display: none !important; }
            .print-content { display: block !important; }
          }
        `}</style>

        <section className="w-full space-y-8" aria-label="Generador de calendario de recuperación capilar">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center px-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4A97D]/10 border border-[#C4A97D]/30 text-[#C4A97D] text-xs font-bold uppercase tracking-widest mb-5">
              <Calendar className="w-3.5 h-3.5" />
              Calendario Personalizado
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-4 leading-tight">
              Tu plan de recuperación capilar
            </h2>
            <p className="text-[#F5F0E8]/60 text-base max-w-2xl mx-auto leading-relaxed">
              Responde 4 preguntas y genera un calendario semana a semana adaptado al estado real de tu cabello.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-[#C4A97D]/20 bg-gradient-to-b from-[#2D2218] to-[#1a1410] p-6 md:p-8 shadow-card space-y-8"
          >
            {/* Damage level slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                  Nivel de daño capilar
                </label>
                <span className={`text-2xl font-bold tabular-nums ${getDamageLevelColor(damageLevel)}`}>
                  {damageLevel}
                  <span className="text-sm font-normal text-[#F5F0E8]/40">/10</span>
                </span>
              </div>

              <Slider
                min={1}
                max={10}
                step={1}
                value={[damageLevel]}
                onValueChange={([v]) => setDamageLevel(v)}
                className="w-full [&_[data-radix-slider-track]]:bg-[#C4A97D]/20 [&_[data-radix-slider-range]]:bg-[#C4A97D] [&_[data-radix-slider-thumb]]:border-[#C4A97D] [&_[data-radix-slider-thumb]]:bg-[#2D2218]"
              />

              <div className={`rounded-xl p-3 text-sm font-medium leading-relaxed ${
                damageLevel === 10
                  ? "bg-red-900/20 border border-red-700/40 text-red-300"
                  : "bg-[#2D2218]/60 border border-[#C4A97D]/15 text-[#F5F0E8]/70"
              }`}>
                {damageLevel === 10 && <AlertTriangle className="w-4 h-4 inline mr-2 text-red-400" />}
                {getDamageLevelLabel(damageLevel)}
              </div>

              {damageLevel === 10 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-700/40 bg-red-900/20 p-4 text-center"
                >
                  <p className="text-sm text-red-300 mb-3">
                    Con este nivel de daño necesitas diagnóstico presencial antes de cualquier protocolo.
                  </p>
                  <a
                    href="/diagnostico-capilar"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-800 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Ir al diagnóstico profesional
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </motion.div>
              )}
            </div>

            {/* Last treatment */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                Último tratamiento químico
              </label>
              <Select
                value={lastTreatment}
                onValueChange={(v) => setLastTreatment(v as LastTreatment)}
                disabled={damageLevel === 10}
              >
                <SelectTrigger className="w-full bg-[#2D2218] border-[#C4A97D]/30 text-[#F5F0E8] focus:ring-[#C4A97D]/50 h-12">
                  <SelectValue placeholder="Selecciona el último tratamiento" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2218] border-[#C4A97D]/20 text-[#F5F0E8]">
                  <SelectItem value="decoloracion">Decoloración / Aclaramiento</SelectItem>
                  <SelectItem value="tinte">Tinte / Coloración</SelectItem>
                  <SelectItem value="alisado_quimico">Alisado químico (NaOH / tioglicolato)</SelectItem>
                  <SelectItem value="permanente">Permanente / Rizado</SelectItem>
                  <SelectItem value="plex">Tratamiento Plex (Olaplex, etc.)</SelectItem>
                  <SelectItem value="calor_excesivo">Daño por calor excesivo</SelectItem>
                  <SelectItem value="ninguno">Ninguno / Solo daño físico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Porosity */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                Porosidad del cabello
              </label>
              <Select
                value={porosity}
                onValueChange={(v) => setPorosity(v as HairPorosity)}
                disabled={damageLevel === 10}
              >
                <SelectTrigger className="w-full bg-[#2D2218] border-[#C4A97D]/30 text-[#F5F0E8] focus:ring-[#C4A97D]/50 h-12">
                  <SelectValue placeholder="Selecciona la porosidad" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2218] border-[#C4A97D]/20 text-[#F5F0E8]">
                  <SelectItem value="baja">
                    Baja — el cabello tarda mucho en mojarse
                  </SelectItem>
                  <SelectItem value="media">
                    Media — absorbe y retiene la humedad con normalidad
                  </SelectItem>
                  <SelectItem value="alta">
                    Alta — se moja rápido pero se seca muy rápido también
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[#F5F0E8]/35 leading-relaxed">
                Test rápido: sumerge un cabello en agua. Si flota, porosidad baja. Si se hunde lento, media. Si cae al fondo de inmediato, alta.
              </p>
            </div>

            {/* Scalp */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                Estado del cuero cabelludo
              </label>
              <Select
                value={scalp}
                onValueChange={(v) => setScalp(v as ScalpCondition)}
                disabled={damageLevel === 10}
              >
                <SelectTrigger className="w-full bg-[#2D2218] border-[#C4A97D]/30 text-[#F5F0E8] focus:ring-[#C4A97D]/50 h-12">
                  <SelectValue placeholder="Selecciona el estado del cuero cabelludo" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D2218] border-[#C4A97D]/20 text-[#F5F0E8]">
                  <SelectItem value="normal">Normal — sin irritación ni exceso de grasa</SelectItem>
                  <SelectItem value="sensible">Sensible — se irrita con facilidad</SelectItem>
                  <SelectItem value="dermatitis">Dermatitis seborreica — descamación y picor</SelectItem>
                  <SelectItem value="graso">Graso — raíces grasas a las 24-48h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-base transition-all
                flex items-center justify-center gap-3
                ${isSubmitDisabled
                  ? "bg-[#C4A97D]/20 text-[#C4A97D]/40 cursor-not-allowed"
                  : "bg-[#C4A97D] text-[#2D2218] hover:bg-[#d4b98d] shadow-md hover:shadow-lg cursor-pointer"
                }
              `}
            >
              {phasesLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#2D2218]/30 border-t-[#2D2218] animate-spin" />
                  Cargando protocolos…
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Generar mi calendario de recuperación
                </>
              )}
            </button>
          </motion.div>
        </section>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BLOCKED VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (view === "blocked") {
    return (
      <section className="w-full" aria-label="Nivel de daño extremo">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-red-700/50 bg-red-900/10 p-8 text-center space-y-6 max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-[#F5F0E8]">
              Daño extremo detectado
            </h3>
            <p className="text-[#F5F0E8]/70 text-sm leading-relaxed">
              Este nivel de daño requiere diagnóstico profesional presencial antes de iniciar cualquier protocolo de recuperación.
            </p>
          </div>

          <a
            href="/diagnostico-capilar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Ir al diagnóstico capilar
            <ChevronRight className="w-4 h-4" />
          </a>

          <button
            onClick={handleReset}
            className="block mx-auto text-sm text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70 transition-colors underline underline-offset-2"
          >
            Nuevo diagnóstico
          </button>
        </motion.div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CALENDAR VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (!calendar) return null;

  return (
    <>
      <style>{`
        @media print {
          nav, footer, .no-print { display: none !important; }
          .print-content { display: block !important; }
          body { background: white !important; color: black !important; }
          [data-radix-dialog-overlay],
          [data-radix-dialog-content],
          [data-radix-popper-content-wrapper] { display: none !important; }
        }
      `}</style>

      <section className="w-full space-y-8 print-content" aria-label="Calendario de recuperación capilar">
        <AnimatePresence mode="wait">
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-[#C4A97D]/15 border border-[#C4A97D]/30 text-[#C4A97D] px-4 py-1.5 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {calendar.total_weeks} semanas de recuperación
                </Badge>
                <Badge className="bg-[#2D2218] border border-[#C4A97D]/20 text-[#F5F0E8]/70 px-4 py-1.5 text-xs font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Próximo tratamiento: {calendar.next_safe_treatment_date}
                </Badge>
              </div>

              <div className="flex gap-3 no-print">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C4A97D]/20 text-[#F5F0E8]/60 text-sm hover:text-[#F5F0E8] hover:border-[#C4A97D]/40 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nuevo diagnóstico
                </button>
                <button
                  onClick={() => calendar && generateRecoveryPDF({
                    totalWeeks: calendar.total_weeks,
                    nextSafeDate: calendar.next_safe_treatment_date,
                    primaryConcern: PHASE_CONFIG[calendar.weeks[0]?.phase]?.label ?? '',
                    weeks: calendar.weeks.map(w => ({
                      week: w.week,
                      label: PHASE_CONFIG[w.phase]?.label ?? w.phase,
                      focus: w.focus_simple || w.focus,
                      treatments: w.treatments,
                    })),
                    maintenance: calendar.maintenance ? {
                      label: 'Mantenimiento',
                      focus: calendar.maintenance.focus_simple || calendar.maintenance.focus,
                    } : undefined,
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C4A97D]/15 border border-[#C4A97D]/30 text-[#C4A97D] text-sm font-semibold hover:bg-[#C4A97D]/25 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar mi calendario
                </button>
              </div>
            </div>

            {/* Timeline — Desktop */}
            {calendar.weeks.length > 0 && (
              <>
                <div className="hidden md:block">
                  <div className="rounded-2xl border border-[#C4A97D]/20 bg-gradient-to-b from-[#2D2218] to-[#1a1410] p-6 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-6">
                      Línea de tiempo
                    </p>
                    <div className="flex items-start overflow-x-auto pb-2">
                      {calendar.weeks.map((week, index) => (
                        <TimelineNode
                          key={week.week}
                          week={week}
                          index={index}
                          total={calendar.weeks.length}
                          onClick={() => openWeek(week)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline — Mobile */}
                <div className="md:hidden space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                    Semanas de recuperación
                  </p>
                  {calendar.weeks.map((week) => (
                    <WeekCard
                      key={week.week}
                      week={week}
                      onClick={() => openWeek(week)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Maintenance section */}
            {calendar.maintenance && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]">
                  Mantenimiento
                </p>
                <MaintenanceCard
                  maintenance={calendar.maintenance}
                  onClick={() => openWeek(calendar.maintenance!)}
                />
              </div>
            )}

            {/* Download CTA (bottom) */}
            <div className="no-print flex justify-center pt-2">
              <button
                onClick={() => calendar && generateRecoveryPDF({
                  totalWeeks: calendar.total_weeks,
                  nextSafeDate: calendar.next_safe_treatment_date,
                  primaryConcern: PHASE_CONFIG[calendar.weeks[0]?.phase]?.label ?? '',
                  weeks: calendar.weeks.map(w => ({
                    week: w.week,
                    label: PHASE_CONFIG[w.phase]?.label ?? w.phase,
                    focus: w.focus_simple || w.focus,
                    treatments: w.treatments,
                  })),
                  maintenance: calendar.maintenance ? {
                    label: 'Mantenimiento',
                    focus: calendar.maintenance.focus_simple || calendar.maintenance.focus,
                  } : undefined,
                })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C4A97D] text-[#2D2218] font-semibold hover:bg-[#d4b98d] transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Descargar mi calendario
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Week detail dialog */}
      <WeekDetailDialog
        week={selectedWeek}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
