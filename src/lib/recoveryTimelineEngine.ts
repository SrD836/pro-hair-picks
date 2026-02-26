// ── Recovery Timeline Engine ─────────────────────────────────────────────────
// Pure function: no side-effects, no network calls.
// Receives preloaded Supabase phases as parameter.

import { addWeeks, format } from 'date-fns';

// ── Types ────────────────────────────────────────────────────────────────────

export type LastTreatment =
  | 'decoloracion'
  | 'tinte'
  | 'alisado_quimico'
  | 'permanente'
  | 'plex'
  | 'calor_excesivo'
  | 'ninguno';

export type HairPorosity = 'baja' | 'media' | 'alta';
export type ScalpCondition = 'normal' | 'sensible' | 'dermatitis' | 'graso';
export type PhaseType = 'hidratacion' | 'reconstruccion' | 'sellado' | 'mantenimiento';

export interface RecoveryInput {
  damage_level: number;        // 1-10
  last_treatment: LastTreatment;
  hair_porosity: HairPorosity;
  scalp_condition: ScalpCondition;
}

export interface RecoveryPhaseRow {
  id: string;
  phase_type: PhaseType;
  damage_level_min: number;
  damage_level_max: number;
  week_start: number;
  week_end: number;
  last_treatment_filter: string[] | null;
  porosity_filter: string[] | null;
  objective_technical: string;
  objective_simple: string;
  key_ingredients: string[];
  avoid: string[];
  checkpoint: string;
  pending_review: boolean;
  sources: unknown;
  created_at: string;
}

export interface WeekEntry {
  week: number;
  phase: PhaseType;
  focus: string;
  focus_simple: string;
  treatments: string[];
  avoid: string[];
  checkpoint: string;
  pending_review: boolean;
}

export interface RecoveryCalendarSuccess {
  blocked: false;
  weeks: WeekEntry[];
  total_weeks: number;
  next_safe_treatment_date: string;  // 'dd/MM/yyyy'
  maintenance: WeekEntry | null;     // ongoing maintenance guidance (separate from calendar)
  sources: unknown[];
}

export interface RecoveryCalendarBlocked {
  blocked: true;
  message: string;
}

export type RecoveryCalendar = RecoveryCalendarSuccess | RecoveryCalendarBlocked;

// ── Constants ────────────────────────────────────────────────────────────────

// Extra weeks of wait AFTER the calendar ends, multiplied by damage_level
export const TREATMENT_WAIT_WEEKS: Record<LastTreatment, number> = {
  decoloracion:    3,
  alisado_quimico: 2,
  permanente:      2,
  tinte:           1,
  plex:            0.5,
  calor_excesivo:  1,
  ninguno:         0,
};

// ── Core function ─────────────────────────────────────────────────────────────

export function generateRecoveryCalendar(
  input: RecoveryInput,
  phases: RecoveryPhaseRow[],
  today: Date = new Date()
): RecoveryCalendar {
  if (input.damage_level === 10) {
    return {
      blocked: true,
      message: 'Este nivel de daño requiere diagnóstico profesional presencial',
    };
  }

  // Calendar duration by damage level
  const total_weeks =
    input.damage_level <= 3 ? 4 :
    input.damage_level <= 6 ? 6 : 8;

  // Filter applicable phases for this user (all phase types)
  const applicable = phases.filter(p => {
    if (input.damage_level < p.damage_level_min || input.damage_level > p.damage_level_max) return false;
    if (p.last_treatment_filter !== null && !p.last_treatment_filter.includes(input.last_treatment)) return false;
    if (p.porosity_filter !== null && !p.porosity_filter.includes(input.hair_porosity)) return false;
    return true;
  });

  // Separate mantenimiento from active phases
  const activePhases = applicable.filter(p => p.phase_type !== 'mantenimiento');
  const maintenancePhaseRow = applicable.find(p => p.phase_type === 'mantenimiento') ?? null;

  // Sort active phases by week_start ascending.
  // When week_start is equal, more specific (filtered) phases take priority over general ones.
  const sorted = [...activePhases].sort((a, b) => {
    if (a.week_start !== b.week_start) return a.week_start - b.week_start;
    // Filtered phases (more specific) take priority over general phases
    const aSpecific = a.porosity_filter !== null || a.last_treatment_filter !== null ? -1 : 0;
    const bSpecific = b.porosity_filter !== null || b.last_treatment_filter !== null ? -1 : 0;
    return aSpecific - bSpecific;
  });

  // Build week entries for weeks 1..total_weeks
  const weeks: WeekEntry[] = [];
  for (let week = 1; week <= total_weeks; week++) {
    const phase = sorted.find(p => p.week_start <= week && p.week_end >= week);
    if (!phase) continue;
    weeks.push({
      week,
      phase: phase.phase_type,
      focus: phase.objective_technical,
      focus_simple: phase.objective_simple,
      treatments: phase.key_ingredients,
      avoid: phase.avoid,
      checkpoint: phase.checkpoint,
      pending_review: phase.pending_review,
    });
  }

  // Extract maintenance guidance (separate from calendar)
  const maintenance: WeekEntry | null = maintenancePhaseRow
    ? {
        week: maintenancePhaseRow.week_start,
        phase: 'mantenimiento',
        focus: maintenancePhaseRow.objective_technical,
        focus_simple: maintenancePhaseRow.objective_simple,
        treatments: maintenancePhaseRow.key_ingredients,
        avoid: maintenancePhaseRow.avoid,
        checkpoint: maintenancePhaseRow.checkpoint,
        pending_review: maintenancePhaseRow.pending_review,
      }
    : null;

  // Calculate next safe re-treatment date
  const waitWeeks = Math.ceil(
    TREATMENT_WAIT_WEEKS[input.last_treatment] * input.damage_level
  );
  const safeDate = addWeeks(today, total_weeks + waitWeeks);
  const next_safe_treatment_date = format(safeDate, 'dd/MM/yyyy');

  // Collect unique sources from all applicable phases
  const sources = applicable.flatMap(p => (Array.isArray(p.sources) ? p.sources : []));

  return {
    blocked: false,
    weeks,
    total_weeks,
    next_safe_treatment_date,
    maintenance,
    sources,
  };
}
