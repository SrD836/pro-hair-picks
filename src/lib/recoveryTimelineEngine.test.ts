import { describe, it, expect } from 'vitest';
import {
  generateRecoveryCalendar,
  TREATMENT_WAIT_WEEKS,
  type RecoveryInput,
  type RecoveryPhaseRow,
  type RecoveryCalendarSuccess,
} from './recoveryTimelineEngine';

// ── Minimal mock phase data ──────────────────────────────────────────────────
// Simulates what Supabase returns. No actual DB calls.

const MOCK_PHASES: RecoveryPhaseRow[] = [
  {
    id: 'hidratacion_1_3',
    phase_type: 'hidratacion',
    damage_level_min: 1, damage_level_max: 3,
    week_start: 1, week_end: 2,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Restaurar pH y repleción de agua cortical',
    objective_simple: 'Tu cabello está bebiendo agua',
    key_ingredients: ['ceramidas', 'pantenol'],
    avoid: ['sulfatos', 'calor >150°C'],
    checkpoint: 'Cabello más suave al tacto',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reconstruccion_1_3',
    phase_type: 'reconstruccion',
    damage_level_min: 1, damage_level_max: 3,
    week_start: 3, week_end: 3,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Reposición proteica leve con aminoácidos',
    objective_simple: 'Rellenamos los huecos microscópicos',
    key_ingredients: ['keratina hidrolizada'],
    avoid: ['proteína nativa'],
    checkpoint: 'Mayor elasticidad',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sellado_1_3',
    phase_type: 'sellado',
    damage_level_min: 1, damage_level_max: 3,
    week_start: 4, week_end: 4,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Sellado de cutícula con aceites de bajo PM',
    objective_simple: 'Sellamos como barnizar madera restaurada',
    key_ingredients: ['aceite de argán', 'dimeticona'],
    avoid: ['sulfatos'],
    checkpoint: 'Brillo visible bajo luz natural',
    pending_review: true,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'hidratacion_7_9',
    phase_type: 'hidratacion',
    damage_level_min: 7, damage_level_max: 9,
    week_start: 1, week_end: 3,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Hidratación de emergencia, 3 semanas',
    objective_simple: 'Tu cabello perdió su armadura',
    key_ingredients: ['ceramidas III y VI', 'glicerina'],
    avoid: ['calor directo >120°C', 'proteína'],
    checkpoint: 'Reducción de rotura al cepillar',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reconstruccion_7_9',
    phase_type: 'reconstruccion',
    damage_level_min: 7, damage_level_max: 9,
    week_start: 4, week_end: 6,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Reconstrucción profunda con alternancia',
    objective_simple: 'Alternamos agua y proteína como capas de pintura',
    key_ingredients: ['keratina hidrolizada', 'ceramidas'],
    avoid: ['proteína nativa', 'color oxidativo'],
    checkpoint: 'Reducción de 50%+ en rotura',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sellado_7_9',
    phase_type: 'sellado',
    damage_level_min: 7, damage_level_max: 9,
    week_start: 7, week_end: 8,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Sellado final intensivo',
    objective_simple: 'El sello es permanente',
    key_ingredients: ['aceite de argán'],
    avoid: ['cualquier proceso químico'],
    checkpoint: '60%+ menos rotura que semana 1',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
];

// ── Tests ────────────────────────────────────────────────────────────────────

describe('generateRecoveryCalendar', () => {
  it('returns blocked:true for damage_level 10', () => {
    const input: RecoveryInput = {
      damage_level: 10,
      last_treatment: 'ninguno',
      hair_porosity: 'baja',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    expect(result.blocked).toBe(true);
  });

  it('returns 4 weeks for damage_level 2 (range 1-3)', () => {
    const input: RecoveryInput = {
      damage_level: 2,
      last_treatment: 'ninguno',
      hair_porosity: 'baja',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    const r = result as import('./recoveryTimelineEngine').RecoveryCalendarSuccess;
    expect(r.total_weeks).toBe(4);
    expect(r.weeks).toHaveLength(4);
  });

  it('returns 8 weeks for damage_level 8 (range 7-9)', () => {
    const input: RecoveryInput = {
      damage_level: 8,
      last_treatment: 'ninguno',
      hair_porosity: 'alta',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    const r = result as RecoveryCalendarSuccess;
    expect(r.total_weeks).toBe(8);
    expect(r.weeks).toHaveLength(8);
  });

  it('each week entry has all required fields', () => {
    const input: RecoveryInput = {
      damage_level: 2,
      last_treatment: 'tinte',
      hair_porosity: 'media',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    (result as RecoveryCalendarSuccess).weeks.forEach(week => {
      expect(week.week).toBeTypeOf('number');
      expect(week.phase).toMatch(/^(hidratacion|reconstruccion|sellado|mantenimiento)$/);
      expect(week.focus).toBeTypeOf('string');
      expect(week.focus_simple).toBeTypeOf('string');
      expect(Array.isArray(week.treatments)).toBe(true);
      expect(Array.isArray(week.avoid)).toBe(true);
      expect(week.checkpoint).toBeTypeOf('string');
      expect(typeof week.pending_review).toBe('boolean');
    });
  });

  it('next_safe_treatment_date is further away for decoloracion than tinte (same damage level)', () => {
    const base = {
      damage_level: 5,
      hair_porosity: 'media' as const,
      scalp_condition: 'normal' as const,
    };
    // Need phases for damage 4-6 range — add minimal ones to mock
    const phases46: RecoveryPhaseRow[] = [
      { ...MOCK_PHASES[0], id: 'h_4_6', damage_level_min: 4, damage_level_max: 6, week_start: 1, week_end: 2 },
      { ...MOCK_PHASES[1], id: 'r_4_6', damage_level_min: 4, damage_level_max: 6, week_start: 3, week_end: 4 },
      { ...MOCK_PHASES[2], id: 's_4_6', damage_level_min: 4, damage_level_max: 6, week_start: 5, week_end: 6 },
    ];
    const rDecoloracion = generateRecoveryCalendar({ ...base, last_treatment: 'decoloracion' }, phases46);
    const rTinte = generateRecoveryCalendar({ ...base, last_treatment: 'tinte' }, phases46);
    if (rDecoloracion.blocked || rTinte.blocked) throw new Error('should not be blocked');
    const d = rDecoloracion as RecoveryCalendarSuccess;
    const ti = rTinte as RecoveryCalendarSuccess;
    // decoloracion multiplier (3) > tinte multiplier (1), so safe date should be later
    expect(d.next_safe_treatment_date > ti.next_safe_treatment_date).toBe(true);
  });

  it('TREATMENT_WAIT_WEEKS.decoloracion is larger than TREATMENT_WAIT_WEEKS.tinte', () => {
    expect(TREATMENT_WAIT_WEEKS.decoloracion).toBeGreaterThan(TREATMENT_WAIT_WEEKS.tinte);
  });

  it('filters phases by porosity_filter when set', () => {
    const altaOnlyPhase: RecoveryPhaseRow = {
      ...MOCK_PHASES[0],
      id: 'hidratacion_alta_only',
      damage_level_min: 1, damage_level_max: 3,
      week_start: 1, week_end: 2,
      porosity_filter: ['alta'],
      objective_simple: 'Texto único para alta porosidad',
    };
    const allPhases = [...MOCK_PHASES, altaOnlyPhase];

    const resultAlta = generateRecoveryCalendar(
      { damage_level: 2, last_treatment: 'ninguno', hair_porosity: 'alta', scalp_condition: 'normal' },
      allPhases
    );
    const resultBaja = generateRecoveryCalendar(
      { damage_level: 2, last_treatment: 'ninguno', hair_porosity: 'baja', scalp_condition: 'normal' },
      allPhases
    );
    if (resultAlta.blocked || resultBaja.blocked) throw new Error('should not be blocked');
    const rAlta = resultAlta as RecoveryCalendarSuccess;
    const rBaja = resultBaja as RecoveryCalendarSuccess;
    // alta porosity result should include the alta-only phase (week 1-2)
    const altaWeek1 = rAlta.weeks.find(w => w.week === 1);
    const bajaWeek1 = rBaja.weeks.find(w => w.week === 1);
    // The alta-only phase should appear for alta but not for baja
    // (baja falls back to the general hidratacion_1_3 phase)
    expect(altaWeek1?.focus_simple).toBe('Texto único para alta porosidad');
    expect(bajaWeek1?.focus_simple).not.toBe('Texto único para alta porosidad');
  });
});
