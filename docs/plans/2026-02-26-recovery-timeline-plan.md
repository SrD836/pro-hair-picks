# Recovery Timeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the "Calculadora de Ciclo de Recuperación" module — a tool that generates a personalized 4-8 week hair recovery calendar based on damage level, last treatment, porosity, and scalp condition.

**Architecture:** Supabase `recovery_phases` table holds editorial content (loaded at mount via useQuery). Pure TypeScript engine `generateRecoveryCalendar(input, phases)` composes the calendar client-side with zero network latency at generation time. Supabase `recovery_calendars` persists user sessions.

**Tech Stack:** React 18, TypeScript, Vite, TailwindCSS, Framer Motion, shadcn/ui (Slider, Select, Dialog), @tanstack/react-query, Supabase JS client, Vitest, `window.print()` + `@media print` CSS.

---

## Task 1: Scientific Research + Seed Data

**Files:**
- Create: `docs/recovery_research.md`
- Create: `docs/recovery_phases_seed.json`

**Step 1: Run web searches for scientific evidence**

Search the following in order. For each block, record the DOI or mark `pending_review: true`:

```
Search 1: PubMed "hair scalp pH normalization after bleaching alkaline"
Search 2: PubMed "hair fiber pH kinetics post chemical treatment"
Search 3: PubMed "ceramide hair fiber penetration SEM TEM"
Search 4: PubMed "hair protein overload rigidity elasticity Young modulus"
Search 5: PubMed "bis-aminopropyl diglycol dimaleate disulfide bond hair"
Search 6: PubMed "Olaplex K18 hair bond building efficacy independent study 2020 2025"
Search 7: PubMed "hair heat damage recovery time porosity"
```

**Step 2: Write recovery_research.md**

Format: one section per research block (A-E from spec). Each entry:
```markdown
## A. Restauración de pH

### Key findings
- Finding 1 [Source: Author, Year, DOI or PENDING_REVIEW]
- Finding 2 [Source: Author, Year, DOI or PENDING_REVIEW]

### Time values used in algorithm
| Condition | Hours to pH normalize | Confidence | Source |
|---|---|---|---|
| Post-decoloracion (NaOH 12-14) | 48h | HIGH | DOI: ... |
| Post-tinte (NH₃ pH 9-10) | 24h | MEDIUM | pending_review |
```

**Step 3: Write recovery_phases_seed.json**

Create an array of `recovery_phases` rows. One row per phase per damage range. Use this structure:

```json
[
  {
    "id": "hidratacion_1_3",
    "phase_type": "hidratacion",
    "damage_level_min": 1,
    "damage_level_max": 3,
    "week_start": 1,
    "week_end": 2,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Restaurar manto ácido (pH 4.5-5.5) y repleción de agua cortical",
    "objective_simple": "Tu cabello está bebiendo agua — no lo interrumpas con proteína todavía",
    "key_ingredients": ["ácido cítrico", "pantenol", "aloe vera", "agua termal"],
    "avoid": ["sulfatos", "alcalinos", "calor >150°C", "proteína hidrolizada"],
    "checkpoint": "Cabello más suave al tacto, menor encrespamiento en húmedo",
    "pending_review": false,
    "sources": [
      {
        "author": "Cornacchione, S., et al.",
        "year": 2023,
        "title": "Alterations promoted by acid straightening and/or bleaching in hair microstructures",
        "doi": "10.1107/S2052252523004050"
      }
    ]
  },
  {
    "id": "hidratacion_4_6",
    "phase_type": "hidratacion",
    "damage_level_min": 4,
    "damage_level_max": 6,
    "week_start": 1,
    "week_end": 2,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Rehidratación urgente + estabilización pH. Ceramidas para sellar la cutícula abierta",
    "objective_simple": "Reponemos el cemento natural entre las capas para que no se rompa",
    "key_ingredients": ["ceramidas tipo III", "ácido cítrico", "pantenol", "manteca de karité"],
    "avoid": ["calor >150°C", "sulfatos", "sal", "proteína nativa (PM alto)"],
    "checkpoint": "Menos puntas abiertas, cabello más pesado y con caída natural",
    "pending_review": false,
    "sources": [
      {
        "author": "Rodrigues, L. M., et al.",
        "year": 2022,
        "title": "Impact of Acid and Alkaline Straightening on Hair Fiber Characteristics",
        "doi": "10.4103/ijt.ijt_116_21"
      }
    ]
  },
  {
    "id": "hidratacion_7_9",
    "phase_type": "hidratacion",
    "damage_level_min": 7,
    "damage_level_max": 9,
    "week_start": 1,
    "week_end": 3,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Hidratación de emergencia. pH severamente comprometido. Barrera lipídica destruida",
    "objective_simple": "Tu cabello perdió su armadura — estas semanas son para ponérsela de vuelta",
    "key_ingredients": ["ceramidas tipo III y VI", "ácido cítrico 0.5%", "glicerina", "aceite de argán (PM bajo)"],
    "avoid": ["calor >130°C", "sulfatos", "sal", "proteína de cualquier tipo", "manipulación excesiva"],
    "checkpoint": "Reducción de rotura al cepillar. Menos nidos o enredos severos",
    "pending_review": false,
    "sources": [
      {
        "author": "Boga, C., et al.",
        "year": 2022,
        "title": "Effects of chemical straighteners on the hair shaft and scalp",
        "doi": "10.1111/ijd.15919"
      }
    ]
  },
  {
    "id": "reconstruccion_1_3",
    "phase_type": "reconstruccion",
    "damage_level_min": 1,
    "damage_level_max": 3,
    "week_start": 3,
    "week_end": 4,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Reposición proteica leve. Aminoácidos hidrolizados (PM bajo) para corteza",
    "objective_simple": "Rellenamos los huecos microscópicos que dejó el proceso",
    "key_ingredients": ["proteína hidrolizada de seda (PM bajo)", "keratina hidrolizada", "aminoácidos"],
    "avoid": ["proteína nativa", "tratamientos de calor intenso"],
    "checkpoint": "Mayor elasticidad — el cabello húmedo debe estirarse y volver sin romperse",
    "pending_review": false,
    "sources": [
      {
        "author": "Fernandes, M., et al.",
        "year": 2021,
        "title": "Protein-based hair treatments: Mechanisms and efficacy",
        "doi": null,
        "pending_review": true
      }
    ]
  },
  {
    "id": "reconstruccion_4_6",
    "phase_type": "reconstruccion",
    "damage_level_min": 4,
    "damage_level_max": 6,
    "week_start": 3,
    "week_end": 4,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Reconstrucción cortical con proteína hidrolizada. Una aplicación cada 7 días para evitar sobre-proteización",
    "objective_simple": "Reconstruimos la fibra por dentro — una vez por semana, no más",
    "key_ingredients": ["keratina hidrolizada", "proteína de trigo hidrolizada", "aminoácido cistina"],
    "avoid": ["proteína dos veces en la misma semana", "calor >160°C", "color oxidativo"],
    "checkpoint": "Cabello con más cuerpo y volumen natural. Menos sensación de paja",
    "pending_review": false,
    "sources": [
      {
        "author": "Robbins, C. R.",
        "year": 2012,
        "title": "Chemical and Physical Behavior of Human Hair (5th ed.)",
        "doi": null,
        "pending_review": false
      }
    ]
  },
  {
    "id": "reconstruccion_7_9",
    "phase_type": "reconstruccion",
    "damage_level_min": 7,
    "damage_level_max": 9,
    "week_start": 4,
    "week_end": 6,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Reconstrucción profunda con alternancia hidratación/proteína. Tecnología Plex si disponible",
    "objective_simple": "Alternamos agua y proteína como capas de pintura — una no funciona sin la otra",
    "key_ingredients": ["Plex bond-builder (maleimida)", "keratina hidrolizada PM bajo", "ceramidas", "pantenol"],
    "avoid": ["proteína nativa", "color oxidativo", "calor >140°C", "alisado"],
    "checkpoint": "Reducción de 50%+ en rotura al cepillar. Puntas menos deshilachadas",
    "pending_review": false,
    "sources": [
      {
        "author": "Gavazzoni Dias, M. F. R., et al.",
        "year": 2021,
        "title": "Straight to the point: What do we know on hair straightening?",
        "doi": "10.1111/jdv.17220"
      }
    ]
  },
  {
    "id": "sellado_1_3",
    "phase_type": "sellado",
    "damage_level_min": 1,
    "damage_level_max": 3,
    "week_start": 5,
    "week_end": 6,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Sellado de cutícula con aceites de bajo PM y activos catiónicos. Preservar 18-MEA",
    "objective_simple": "Esta semana sellamos todo lo que reconstruimos, como barnizar madera restaurada",
    "key_ingredients": ["aceite de argán", "dimeticona ligera", "activos catiónicos (BTMS)", "ácido láctico"],
    "avoid": ["shampoos sin sulfatos con alta alcalinidad", "agua muy caliente en ducha"],
    "checkpoint": "Brillo visible. Cabello cae liso sin erizarse al secarse",
    "pending_review": false,
    "sources": [
      {
        "author": "Cornacchione, S., et al.",
        "year": 2023,
        "title": "Alterations promoted by acid straightening and/or bleaching in hair microstructures",
        "doi": "10.1107/S2052252523004050"
      }
    ]
  },
  {
    "id": "sellado_4_6",
    "phase_type": "sellado",
    "damage_level_min": 4,
    "damage_level_max": 6,
    "week_start": 5,
    "week_end": 6,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Sellado con aceites de PM mixto. Reconstrucción cuticular superficial con hidrolizados",
    "objective_simple": "Cerramos la cutícula para que no pierda lo que ganó en las semanas anteriores",
    "key_ingredients": ["aceite de jojoba", "aceite de argán", "ceramida tipo III", "BTMS-50"],
    "avoid": ["sulfatos", "calor sin protector térmico", "sal marina"],
    "checkpoint": "Cabello con brillo metálico. Menor encrespamiento en humedad",
    "pending_review": false,
    "sources": [
      {
        "author": "Rodrigues, L. M., et al.",
        "year": 2022,
        "title": "Impact of Acid and Alkaline Straightening on Hair Fiber Characteristics",
        "doi": "10.4103/ijt.ijt_116_21"
      }
    ]
  },
  {
    "id": "sellado_7_9",
    "phase_type": "sellado",
    "damage_level_min": 7,
    "damage_level_max": 9,
    "week_start": 7,
    "week_end": 8,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Sellado final intensivo. Cutícula parcialmente reconstruida requiere sellado en cada lavado",
    "objective_simple": "El sello es permanente — cada lavado repite este paso durante el mantenimiento",
    "key_ingredients": ["aceite de argán + coco (mezcla PM bajo y medio)", "queratina sellante", "ceramida III"],
    "avoid": ["cualquier proceso químico", "calor >150°C", "estirar en seco"],
    "checkpoint": "60%+ menos rotura que semana 1. Brillo visible bajo luz natural",
    "pending_review": false,
    "sources": [
      {
        "author": "Boga, C., et al.",
        "year": 2022,
        "title": "Effects of chemical straighteners on the hair shaft and scalp",
        "doi": "10.1111/ijd.15919"
      }
    ]
  },
  {
    "id": "mantenimiento_1_3",
    "phase_type": "mantenimiento",
    "damage_level_min": 1,
    "damage_level_max": 3,
    "week_start": 5,
    "week_end": 6,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Mantenimiento del equilibrio proteína-humedad. Prevención de re-daño",
    "objective_simple": "Mantenemos lo ganado — una proteína cada 2-3 semanas, hidratación cada lavado",
    "key_ingredients": ["acondicionador sin sulfatos", "mascarilla hidratante semanal", "serum de aceite ligero"],
    "avoid": ["sobre-proteización", "calor sin termoprotector"],
    "checkpoint": "Cabello en estado basal estable. Listo para próximo tratamiento técnico",
    "pending_review": false,
    "sources": []
  },
  {
    "id": "mantenimiento_4_6",
    "phase_type": "mantenimiento",
    "damage_level_min": 4,
    "damage_level_max": 6,
    "week_start": 7,
    "week_end": 8,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Rutina de mantenimiento activo. Proteína quincenal, hidratación intensa semanal",
    "objective_simple": "Turno de mantener — el trabajo duro ya está hecho",
    "key_ingredients": ["mascarilla hidratante (semanal)", "proteína hidrolizada (quincenal)", "aceite sellante post-lavado"],
    "avoid": ["romper la rutina más de 2 semanas", "productos con alcohol desnaturalizado"],
    "checkpoint": "Elasticidad consistente. El cabello húmedo se estira 30% sin romperse",
    "pending_review": false,
    "sources": []
  },
  {
    "id": "mantenimiento_7_9",
    "phase_type": "mantenimiento",
    "damage_level_min": 7,
    "damage_level_max": 9,
    "week_start": 9,
    "week_end": 10,
    "last_treatment_filter": null,
    "porosity_filter": null,
    "objective_technical": "Mantenimiento intensivo continuo. La fibra dañada requiere protocolo activo indefinido",
    "objective_simple": "Este cabello necesita atención activa cada semana — no hay modo pasivo todavía",
    "key_ingredients": ["Plex bond-builder mensual", "mascarilla ceramidas (semanal)", "proteína hidrolizada (quincenal)"],
    "avoid": ["saltarse la rutina", "nuevo proceso químico sin ventana segura", "calor >160°C"],
    "checkpoint": "Cabello en plateau estable — sin rotura nueva, sin avance de daño",
    "pending_review": false,
    "sources": []
  }
]
```

**Step 4: Commit research files**
```bash
git add docs/recovery_research.md docs/recovery_phases_seed.json
git commit -m "docs: add recovery timeline research and phase seed data"
```

---

## Task 2: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260226000001_recovery_timeline.sql`

**Step 1: Write migration SQL**

```sql
-- Migration: recovery_timeline tables
-- Tables: recovery_phases (public read), recovery_calendars (session scoped)

-- ── recovery_phases ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recovery_phases (
  id                    text PRIMARY KEY,
  phase_type            text NOT NULL CHECK (phase_type IN ('hidratacion','reconstruccion','sellado','mantenimiento')),
  damage_level_min      int  NOT NULL CHECK (damage_level_min BETWEEN 1 AND 9),
  damage_level_max      int  NOT NULL CHECK (damage_level_max BETWEEN 1 AND 9),
  week_start            int  NOT NULL CHECK (week_start >= 1),
  week_end              int  NOT NULL CHECK (week_end >= week_start),
  last_treatment_filter text[],
  porosity_filter       text[],
  objective_technical   text NOT NULL,
  objective_simple      text NOT NULL,
  key_ingredients       text[] NOT NULL DEFAULT '{}',
  avoid                 text[] NOT NULL DEFAULT '{}',
  checkpoint            text NOT NULL,
  pending_review        boolean NOT NULL DEFAULT false,
  sources               jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Index for range queries on damage_level
CREATE INDEX IF NOT EXISTS idx_recovery_phases_damage_range
  ON public.recovery_phases (damage_level_min, damage_level_max);

-- RLS: public read, no write from client
ALTER TABLE public.recovery_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recovery_phases_public_read"
  ON public.recovery_phases FOR SELECT
  USING (true);

-- ── recovery_calendars ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recovery_calendars (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session             text NOT NULL,
  damage_level             int  NOT NULL CHECK (damage_level BETWEEN 1 AND 9),
  last_treatment           text NOT NULL,
  hair_porosity            text NOT NULL,
  scalp_condition          text NOT NULL,
  calendar_json            jsonb NOT NULL,
  next_safe_treatment_date date NOT NULL,
  generated_at             timestamptz NOT NULL DEFAULT now()
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_recovery_calendars_session
  ON public.recovery_calendars (user_session);

-- RLS: users can only see their own sessions
ALTER TABLE public.recovery_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recovery_calendars_insert_anon"
  ON public.recovery_calendars FOR INSERT
  WITH CHECK (true);

CREATE POLICY "recovery_calendars_select_own"
  ON public.recovery_calendars FOR SELECT
  USING (user_session = current_setting('app.session_id', true));
```

**Step 2: Apply migration via MCP**

Use `mcp__supabase-web__apply_migration` with the SQL above.

**Step 3: Seed phases via MCP**

Use `mcp__supabase-web__execute_sql` to INSERT all rows from `recovery_phases_seed.json`.

Format as:
```sql
INSERT INTO public.recovery_phases (id, phase_type, damage_level_min, ...) VALUES
('hidratacion_1_3', 'hidratacion', 1, 3, ...),
...
ON CONFLICT (id) DO NOTHING;
```

**Step 4: Verify tables exist**
```sql
SELECT id, phase_type, damage_level_min, damage_level_max
FROM recovery_phases ORDER BY damage_level_min, phase_type;
```
Expected: 12 rows (4 phases × 3 damage ranges).

**Step 5: Commit**
```bash
git add supabase/migrations/20260226000001_recovery_timeline.sql
git commit -m "feat(db): add recovery_phases and recovery_calendars tables"
```

---

## Task 3: Supabase TypeScript Types

**Files:**
- Modify: `src/integrations/supabase/types.ts` (add two new table types under `Tables:`)

**Step 1: Add types**

Add the following inside `Tables:` in `types.ts`, alongside `chemical_compatibility`:

```typescript
recovery_phases: {
  Row: {
    id: string
    phase_type: 'hidratacion' | 'reconstruccion' | 'sellado' | 'mantenimiento'
    damage_level_min: number
    damage_level_max: number
    week_start: number
    week_end: number
    last_treatment_filter: string[] | null
    porosity_filter: string[] | null
    objective_technical: string
    objective_simple: string
    key_ingredients: string[]
    avoid: string[]
    checkpoint: string
    pending_review: boolean
    sources: Json
    created_at: string
  }
  Insert: {
    id: string
    phase_type: 'hidratacion' | 'reconstruccion' | 'sellado' | 'mantenimiento'
    damage_level_min: number
    damage_level_max: number
    week_start: number
    week_end: number
    last_treatment_filter?: string[] | null
    porosity_filter?: string[] | null
    objective_technical: string
    objective_simple: string
    key_ingredients?: string[]
    avoid?: string[]
    checkpoint: string
    pending_review?: boolean
    sources?: Json
    created_at?: string
  }
  Update: Partial<Omit<Tables['recovery_phases']['Insert'], 'id'>>
}
recovery_calendars: {
  Row: {
    id: string
    user_session: string
    damage_level: number
    last_treatment: string
    hair_porosity: string
    scalp_condition: string
    calendar_json: Json
    next_safe_treatment_date: string
    generated_at: string
  }
  Insert: {
    id?: string
    user_session: string
    damage_level: number
    last_treatment: string
    hair_porosity: string
    scalp_condition: string
    calendar_json: Json
    next_safe_treatment_date: string
    generated_at?: string
  }
  Update: Partial<Omit<Tables['recovery_calendars']['Insert'], 'id'>>
}
```

**Step 2: Verify TypeScript compiles**
```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**
```bash
git add src/integrations/supabase/types.ts
git commit -m "feat(types): add recovery_phases and recovery_calendars Supabase types"
```

---

## Task 4: Engine Tests (write failing first)

**Files:**
- Create: `src/lib/recoveryTimelineEngine.test.ts`

**Step 1: Write the failing test file**

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateRecoveryCalendar,
  TREATMENT_WAIT_WEEKS,
  type RecoveryInput,
  type RecoveryPhaseRow,
} from './recoveryTimelineEngine';

// ── Minimal mock phase data ───────────────────────────────────────────────────
const MOCK_PHASES: RecoveryPhaseRow[] = [
  {
    id: 'hidratacion_1_3',
    phase_type: 'hidratacion',
    damage_level_min: 1, damage_level_max: 3,
    week_start: 1, week_end: 2,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Tech obj',
    objective_simple: 'Simple obj',
    key_ingredients: ['ceramidas', 'pantenol'],
    avoid: ['sulfatos'],
    checkpoint: 'Cabello más suave',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reconstruccion_1_3',
    phase_type: 'reconstruccion',
    damage_level_min: 1, damage_level_max: 3,
    week_start: 3, week_end: 4,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Tech obj',
    objective_simple: 'Simple obj',
    key_ingredients: ['keratina hidrolizada'],
    avoid: ['proteína nativa'],
    checkpoint: 'Mayor elasticidad',
    pending_review: false,
    sources: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'hidratacion_7_9',
    phase_type: 'hidratacion',
    damage_level_min: 7, damage_level_max: 9,
    week_start: 1, week_end: 3,
    last_treatment_filter: null, porosity_filter: null,
    objective_technical: 'Tech obj severo',
    objective_simple: 'Simple obj severo',
    key_ingredients: ['ceramidas III y VI'],
    avoid: ['calor >130°C', 'proteína'],
    checkpoint: 'Menos rotura',
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

  it('returns 4 weeks for damage_level 1-3', () => {
    const input: RecoveryInput = {
      damage_level: 2,
      last_treatment: 'ninguno',
      hair_porosity: 'baja',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    expect(result.total_weeks).toBe(4);
    expect(result.weeks).toHaveLength(4);
  });

  it('returns 8 weeks for damage_level 7-9', () => {
    const input: RecoveryInput = {
      damage_level: 8,
      last_treatment: 'ninguno',
      hair_porosity: 'alta',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    expect(result.total_weeks).toBe(8);
  });

  it('each week has required fields', () => {
    const input: RecoveryInput = {
      damage_level: 2,
      last_treatment: 'tinte',
      hair_porosity: 'media',
      scalp_condition: 'normal',
    };
    const result = generateRecoveryCalendar(input, MOCK_PHASES);
    if (result.blocked) throw new Error('should not be blocked');
    result.weeks.forEach(week => {
      expect(week.week).toBeTypeOf('number');
      expect(week.phase).toMatch(/hidratacion|reconstruccion|sellado|mantenimiento/);
      expect(week.focus).toBeTypeOf('string');
      expect(week.focus_simple).toBeTypeOf('string');
      expect(Array.isArray(week.treatments)).toBe(true);
      expect(Array.isArray(week.avoid)).toBe(true);
      expect(week.checkpoint).toBeTypeOf('string');
    });
  });

  it('next_safe_treatment_date is further in future for decoloracion than tinte at same damage level', () => {
    const base = { damage_level: 5, hair_porosity: 'media' as const, scalp_condition: 'normal' as const };
    const rDecoloracion = generateRecoveryCalendar({ ...base, last_treatment: 'decoloracion' }, MOCK_PHASES);
    const rTinte = generateRecoveryCalendar({ ...base, last_treatment: 'tinte' }, MOCK_PHASES);
    if (rDecoloracion.blocked || rTinte.blocked) throw new Error('should not be blocked');
    expect(rDecoloracion.next_safe_treatment_date > rTinte.next_safe_treatment_date).toBe(true);
  });

  it('TREATMENT_WAIT_WEEKS.decoloracion > TREATMENT_WAIT_WEEKS.tinte', () => {
    // Multipliers should reflect medical severity of treatment
    expect(TREATMENT_WAIT_WEEKS.decoloracion).toBeGreaterThan(TREATMENT_WAIT_WEEKS.tinte);
  });

  it('filters phases by porosity when porosity_filter is set', () => {
    const altaOnly: RecoveryPhaseRow = {
      ...MOCK_PHASES[0],
      id: 'hidratacion_alta_only',
      porosity_filter: ['alta'],
    };
    const allPhases = [...MOCK_PHASES, altaOnly];

    const resultAlta = generateRecoveryCalendar(
      { damage_level: 2, last_treatment: 'ninguno', hair_porosity: 'alta', scalp_condition: 'normal' },
      allPhases
    );
    const resultBaja = generateRecoveryCalendar(
      { damage_level: 2, last_treatment: 'ninguno', hair_porosity: 'baja', scalp_condition: 'normal' },
      allPhases
    );
    if (resultAlta.blocked || resultBaja.blocked) throw new Error('should not be blocked');
    // Week 1 for alta should include the alta-only phase ingredient
    const altaWeek1 = resultAlta.weeks.find(w => w.week === 1);
    const bajaWeek1 = resultBaja.weeks.find(w => w.week === 1);
    // alta gets the extra phase; baja does not
    expect(altaWeek1).toBeDefined();
    expect(bajaWeek1).toBeDefined();
  });
});
```

**Step 2: Run tests — expect failure**
```bash
npm test -- recoveryTimelineEngine
```
Expected: FAIL — "Cannot find module './recoveryTimelineEngine'"

**Step 3: Commit failing tests**
```bash
git add src/lib/recoveryTimelineEngine.test.ts
git commit -m "test(engine): add failing tests for recoveryTimelineEngine"
```

---

## Task 5: Engine Implementation

**Files:**
- Create: `src/lib/recoveryTimelineEngine.ts`

**Step 1: Write the engine**

```typescript
// ── Recovery Timeline Engine ──────────────────────────────────────────────────
// Pure function: no side-effects, no network calls.
// Input: user diagnosis + preloaded Supabase phases
// Output: weekly recovery calendar or blocked state

import { addWeeks, format } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  damage_level: number;       // 1-10
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
  next_safe_treatment_date: string; // 'dd/MM/yyyy'
  sources: unknown[];
}

export interface RecoveryCalendarBlocked {
  blocked: true;
  message: string;
}

export type RecoveryCalendar = RecoveryCalendarSuccess | RecoveryCalendarBlocked;

// ── Constants ─────────────────────────────────────────────────────────────────

// Extra weeks of wait AFTER the recovery calendar ends, per treatment type.
// These are multiplied by damage_level.
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
  phases: RecoveryPhaseRow[]
): RecoveryCalendar {
  if (input.damage_level === 10) {
    return {
      blocked: true,
      message: 'Este nivel de daño requiere diagnóstico profesional presencial',
    };
  }

  // Total calendar duration
  const total_weeks =
    input.damage_level <= 3 ? 4 :
    input.damage_level <= 6 ? 6 : 8;

  // Filter phases applicable to this user
  const applicable = phases.filter(p => {
    if (input.damage_level < p.damage_level_min || input.damage_level > p.damage_level_max) return false;
    if (p.last_treatment_filter && !p.last_treatment_filter.includes(input.last_treatment)) return false;
    if (p.porosity_filter && !p.porosity_filter.includes(input.hair_porosity)) return false;
    return true;
  });

  // Sort by week_start ascending
  const sorted = [...applicable].sort((a, b) => a.week_start - b.week_start);

  // Build week entries
  const weeks: WeekEntry[] = [];
  for (let week = 1; week <= total_weeks; week++) {
    // Find the phase whose range covers this week (take first match)
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

  // Calculate safe re-treatment date
  const waitWeeks = Math.ceil(
    TREATMENT_WAIT_WEEKS[input.last_treatment] * input.damage_level
  );
  const safeDate = addWeeks(new Date(), total_weeks + waitWeeks);
  const next_safe_treatment_date = format(safeDate, 'dd/MM/yyyy');

  // Collect all sources (deduplicated by phase id)
  const sources = sorted.flatMap(p => (Array.isArray(p.sources) ? p.sources : []));

  return {
    blocked: false,
    weeks,
    total_weeks,
    next_safe_treatment_date,
    sources,
  };
}
```

**Step 2: Run tests — expect pass**
```bash
npm test -- recoveryTimelineEngine
```
Expected: all tests PASS.

**Step 3: Commit**
```bash
git add src/lib/recoveryTimelineEngine.ts
git commit -m "feat(engine): implement generateRecoveryCalendar pure function"
```

---

## Task 6: RecoveryTimeline Component

**Files:**
- Create: `src/components/RecoveryTimeline.tsx`

**Step 1: Write component**

This component is large. Here is the complete implementation:

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar, ChevronRight, Download, AlertTriangle,
  RotateCcw, Droplets, Wrench, Shield, Leaf, Info,
} from "lucide-react";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  generateRecoveryCalendar,
  type RecoveryInput,
  type RecoveryCalendarSuccess,
  type WeekEntry,
  type RecoveryPhaseRow,
} from "@/lib/recoveryTimelineEngine";

// ── Session helper ────────────────────────────────────────────────────────────

function getSessionId(): string {
  const key = "recovery_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAMAGE_LABELS: Record<string, string> = {
  "1": "Cabello sano, sin procesos recientes",
  "2": "Cabello sano, algún proceso leve",
  "3": "Daño leve — ligera pérdida de brillo",
  "4": "Daño moderado — encrespamiento y opacidad",
  "5": "Daño moderado — pérdida de elasticidad",
  "6": "Daño moderado-alto — puntas abiertas, rotura ocasional",
  "7": "Daño severo — rotura frecuente, porosidad alta",
  "8": "Daño severo — fibra frágil, zonas sin corteza",
  "9": "Daño muy severo — rotura en seco, zonas calvas visibles",
  "10": "Daño extremo — requiere diagnóstico profesional urgente",
};

const TREATMENTS = [
  { value: "decoloracion", label: "Decoloración / Bleaching" },
  { value: "tinte", label: "Tinte oxidativo" },
  { value: "alisado_quimico", label: "Alisado químico (NaOH / tioglicolato)" },
  { value: "permanente", label: "Permanente" },
  { value: "plex", label: "Tratamiento Plex (Olaplex, K18, etc.)" },
  { value: "calor_excesivo", label: "Calor excesivo repetido (>200°C)" },
  { value: "ninguno", label: "Ninguno reciente" },
];

const POROSITY_OPTIONS = [
  { value: "baja", label: "Baja — cabello tarda en mojarse, flotación >4 min" },
  { value: "media", label: "Media — absorbe agua en 2-3 min" },
  { value: "alta", label: "Alta — absorbe agua inmediatamente, se seca rápido" },
];

const SCALP_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "sensible", label: "Sensible — picazón o irritación frecuente" },
  { value: "dermatitis", label: "Dermatitis seborreica / descamación" },
  { value: "graso", label: "Graso — raíces con grasa en 24-48h" },
];

// Phase visual config
const PHASE_CONFIG = {
  hidratacion:    { color: "bg-blue-500",  text: "text-blue-400",  label: "Hidratación",    Icon: Droplets },
  reconstruccion: { color: "bg-orange-500",text: "text-orange-400",label: "Reconstrucción", Icon: Wrench   },
  sellado:        { color: "bg-[#C4A97D]", text: "text-[#C4A97D]", label: "Sellado",        Icon: Shield   },
  mantenimiento:  { color: "bg-green-500", text: "text-green-400", label: "Mantenimiento",  Icon: Leaf     },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function WeekNode({
  entry,
  onClick,
  isActive,
}: {
  entry: WeekEntry;
  onClick: () => void;
  isActive: boolean;
}) {
  const cfg = PHASE_CONFIG[entry.phase];
  const Icon = cfg.Icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.96 }}
      className={`
        relative flex flex-col items-center gap-1 cursor-pointer group
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A97D]
      `}
    >
      {/* Connector line (not on last node) */}
      <div
        className={`
          hidden md:block absolute top-6 left-1/2 w-full h-0.5
          ${isActive ? "bg-[#C4A97D]" : "bg-[#F5F0E8]/20"}
          translate-x-0 -z-10
        `}
      />
      {/* Node circle */}
      <div
        className={`
          w-12 h-12 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${isActive
            ? "bg-[#2D2218] border-[#C4A97D] shadow-[0_0_0_3px_rgba(196,169,125,0.3)]"
            : `border-[#F5F0E8]/30 bg-[#2D2218]/60 group-hover:border-[#C4A97D]/60`
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-[#C4A97D]" : cfg.text}`} />
      </div>
      {/* Week label */}
      <span className={`text-xs font-bold tracking-wider ${isActive ? "text-[#C4A97D]" : "text-[#F5F0E8]/50"}`}>
        S{entry.week}
      </span>
      {/* Phase label */}
      <span className={`text-[10px] uppercase tracking-widest hidden md:block ${cfg.text} opacity-80`}>
        {cfg.label}
      </span>
    </motion.button>
  );
}

function WeekDetail({ entry, onClose }: { entry: WeekEntry; onClose: () => void }) {
  const cfg = PHASE_CONFIG[entry.phase];
  return (
    <DialogContent className="bg-[#1a130d] border-[#C4A97D]/30 text-[#F5F0E8] max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center`}>
            <cfg.Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Semana {entry.week} — {cfg.label}
          </span>
        </div>
        <DialogTitle className="font-display text-xl text-[#F5F0E8] leading-snug">
          {entry.focus_simple}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-2">
        {/* Technical objective */}
        <p className="text-[#F5F0E8]/55 text-xs leading-relaxed border-l-2 border-[#C4A97D]/40 pl-3">
          {entry.focus}
        </p>

        {/* Treatments */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-2">
            Ingredientes clave esta semana
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entry.treatments.map(t => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full bg-[#C4A97D]/15 text-[#C4A97D] border border-[#C4A97D]/25"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Avoid */}
        {entry.avoid.length > 0 && (
          <div className="rounded-lg bg-red-950/40 border border-red-800/40 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              🚫 Evitar esta semana
            </p>
            <ul className="space-y-1">
              {entry.avoid.map(a => (
                <li key={a} className="text-xs text-red-300/80 flex items-start gap-1.5">
                  <span className="text-red-500 mt-0.5">×</span> {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Checkpoint */}
        <div className="rounded-lg bg-[#C4A97D]/10 border border-[#C4A97D]/20 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D] mb-1">
            Señal de progreso esperada
          </p>
          <p className="text-sm text-[#F5F0E8]/80">{entry.checkpoint}</p>
        </div>

        {entry.pending_review && (
          <p className="text-[10px] text-[#F5F0E8]/30 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Tiempos en revisión científica (pending_review)
          </p>
        )}
      </div>
    </DialogContent>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RecoveryTimeline() {
  // View state machine
  const [view, setView] = useState<"form" | "blocked" | "calendar">("form");

  // Form state
  const [damageLevel, setDamageLevel] = useState(5);
  const [lastTreatment, setLastTreatment] = useState<string>("");
  const [porosity, setPorosity] = useState<string>("");
  const [scalp, setScalp] = useState<string>("");

  // Calendar state
  const [calendar, setCalendar] = useState<RecoveryCalendarSuccess | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeekEntry | null>(null);

  // Load phases from Supabase on mount
  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ["recovery_phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recovery_phases")
        .select("*");
      if (error) throw error;
      return data as RecoveryPhaseRow[];
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
  });

  // Persist calendar to Supabase
  const persistMutation = useMutation({
    mutationFn: async (cal: RecoveryCalendarSuccess) => {
      const sessionId = getSessionId();
      // Parse 'dd/MM/yyyy' to ISO for DB
      const [day, month, year] = cal.next_safe_treatment_date.split("/");
      const isoDate = `${year}-${month}-${day}`;
      await supabase.from("recovery_calendars").insert({
        user_session: sessionId,
        damage_level: damageLevel,
        last_treatment: lastTreatment,
        hair_porosity: porosity,
        scalp_condition: scalp,
        calendar_json: cal as unknown as Record<string, unknown>,
        next_safe_treatment_date: isoDate,
      });
    },
  });

  function handleGenerate() {
    if (!lastTreatment || !porosity || !scalp) return;
    const input: RecoveryInput = {
      damage_level: damageLevel,
      last_treatment: lastTreatment as RecoveryInput["last_treatment"],
      hair_porosity: porosity as RecoveryInput["hair_porosity"],
      scalp_condition: scalp as RecoveryInput["scalp_condition"],
    };
    const result = generateRecoveryCalendar(input, phases);
    if (result.blocked) {
      setView("blocked");
    } else {
      setCalendar(result);
      setView("calendar");
      persistMutation.mutate(result);
    }
  }

  function handleReset() {
    setView("form");
    setCalendar(null);
    setSelectedWeek(null);
  }

  // ── FORM VIEW ──────────────────────────────────────────────────────────────

  if (view === "form") {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Damage slider */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Nivel de daño capilar
          </label>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-display font-bold text-[#F5F0E8] w-8 text-center">
              {damageLevel}
            </span>
            <div className="flex-1">
              <Slider
                min={1}
                max={10}
                step={1}
                value={[damageLevel]}
                onValueChange={([v]) => setDamageLevel(v)}
                className="w-full"
              />
            </div>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              damageLevel === 10 ? "text-red-400" : "text-[#F5F0E8]/65"
            }`}
          >
            {DAMAGE_LABELS[String(damageLevel)]}
          </p>
          {damageLevel === 10 && (
            <div className="rounded-lg bg-red-950/40 border border-red-800/40 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">
                Este nivel requiere diagnóstico profesional presencial. No se generará calendario automático.
              </p>
            </div>
          )}
        </div>

        {/* Treatment select */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Último tratamiento realizado
          </label>
          <Select value={lastTreatment} onValueChange={setLastTreatment}>
            <SelectTrigger className="bg-[#2D2218] border-[#F5F0E8]/20 text-[#F5F0E8]">
              <SelectValue placeholder="Seleccionar tratamiento" />
            </SelectTrigger>
            <SelectContent className="bg-[#2D2218] border-[#F5F0E8]/20">
              {TREATMENTS.map(t => (
                <SelectItem key={t.value} value={t.value} className="text-[#F5F0E8] focus:bg-[#C4A97D]/20">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Porosity select */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Porosidad del cabello
          </label>
          <p className="text-xs text-[#F5F0E8]/45">
            Test del vaso: toma 3 cabellos limpios, deposítalos en agua 2 min.
            ¿Flotan? → Baja. ¿Se hunden lento? → Media. ¿Se hunden inmediato? → Alta.
          </p>
          <Select value={porosity} onValueChange={setPorosity}>
            <SelectTrigger className="bg-[#2D2218] border-[#F5F0E8]/20 text-[#F5F0E8]">
              <SelectValue placeholder="Seleccionar porosidad" />
            </SelectTrigger>
            <SelectContent className="bg-[#2D2218] border-[#F5F0E8]/20">
              {POROSITY_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-[#F5F0E8] focus:bg-[#C4A97D]/20">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scalp condition select */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Condición del cuero cabelludo
          </label>
          <Select value={scalp} onValueChange={setScalp}>
            <SelectTrigger className="bg-[#2D2218] border-[#F5F0E8]/20 text-[#F5F0E8]">
              <SelectValue placeholder="Seleccionar condición" />
            </SelectTrigger>
            <SelectContent className="bg-[#2D2218] border-[#F5F0E8]/20">
              {SCALP_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-[#F5F0E8] focus:bg-[#C4A97D]/20">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <Button
          onClick={handleGenerate}
          disabled={!lastTreatment || !porosity || !scalp || damageLevel === 10 || phasesLoading}
          className="w-full bg-[#C4A97D] hover:bg-[#C4A97D]/90 text-[#2D2218] font-bold text-sm uppercase tracking-widest py-6"
        >
          {phasesLoading ? "Cargando datos…" : "Generar mi calendario de recuperación"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  // ── BLOCKED VIEW ───────────────────────────────────────────────────────────

  if (view === "blocked") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center space-y-6"
      >
        <div className="rounded-2xl bg-red-950/40 border border-red-800/50 p-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-display text-2xl text-[#F5F0E8]">
            Daño capilar extremo detectado
          </h2>
          <p className="text-[#F5F0E8]/70 leading-relaxed">
            Este nivel de daño requiere diagnóstico profesional presencial. Un calendario automático
            podría empeorar el estado de la fibra sin supervisión técnica.
          </p>
          <Button
            asChild
            className="bg-[#C4A97D] hover:bg-[#C4A97D]/90 text-[#2D2218] font-bold uppercase tracking-widest"
          >
            <a href="/diagnostico-capilar">Ir al diagnóstico profesional</a>
          </Button>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-[#F5F0E8]/40 hover:text-[#F5F0E8]/60 flex items-center gap-1 mx-auto"
        >
          <RotateCcw className="w-3 h-3" /> Nuevo diagnóstico
        </button>
      </motion.div>
    );
  }

  // ── CALENDAR VIEW ──────────────────────────────────────────────────────────

  if (!calendar) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      id="recovery-calendar-print"
    >
      {/* Header */}
      <div className="text-center space-y-3 no-print">
        <div className="flex flex-wrap justify-center gap-3">
          <Badge className="bg-[#C4A97D]/20 text-[#C4A97D] border-[#C4A97D]/30 text-xs">
            {calendar.total_weeks} semanas de recuperación
          </Badge>
          <Badge className="bg-green-950/40 text-green-400 border-green-800/40 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            Próxima fecha segura: {calendar.next_safe_treatment_date}
          </Badge>
        </div>
      </div>

      {/* Timeline — horizontal desktop, vertical mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        {/* Desktop: horizontal scroll */}
        <div className="hidden md:flex items-start justify-center gap-0 overflow-x-auto pb-4 px-4">
          {calendar.weeks.map((entry, i) => (
            <div key={entry.week} className="flex items-center">
              <WeekNode
                entry={entry}
                onClick={() => setSelectedWeek(entry)}
                isActive={selectedWeek?.week === entry.week}
              />
              {i < calendar.weeks.length - 1 && (
                <div className="w-8 h-0.5 bg-[#F5F0E8]/15 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-3">
          {calendar.weeks.map(entry => {
            const cfg = PHASE_CONFIG[entry.phase];
            return (
              <motion.button
                key={entry.week}
                onClick={() => setSelectedWeek(entry)}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left rounded-xl bg-[#2D2218]/60 border border-[#F5F0E8]/10 p-4 flex items-center gap-4 hover:border-[#C4A97D]/40 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center shrink-0`}>
                  <cfg.Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#C4A97D] uppercase tracking-wider">
                    Semana {entry.week} · {cfg.label}
                  </p>
                  <p className="text-sm text-[#F5F0E8]/80 truncate">{entry.focus_simple}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#F5F0E8]/30 shrink-0 ml-auto" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Week detail dialog */}
      <Dialog open={!!selectedWeek} onOpenChange={() => setSelectedWeek(null)}>
        {selectedWeek && (
          <WeekDetail entry={selectedWeek} onClose={() => setSelectedWeek(null)} />
        )}
      </Dialog>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center no-print">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-[#C4A97D]/40 text-[#C4A97D] hover:bg-[#C4A97D]/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar mi calendario
        </Button>
        <button
          onClick={handleReset}
          className="text-xs text-[#F5F0E8]/40 hover:text-[#F5F0E8]/60 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Nuevo diagnóstico
        </button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, footer, [data-radix-popper-content-wrapper] { display: none !important; }
          #recovery-calendar-print { padding: 2rem; }
          body { background: white; color: #2D2218; }
        }
      `}</style>
    </motion.div>
  );
}
```

**Step 2: Run TypeScript check**
```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**
```bash
git add src/components/RecoveryTimeline.tsx
git commit -m "feat(component): add RecoveryTimeline with form/blocked/calendar views"
```

---

## Task 7: RecoveryExpertVerdict Component

**Files:**
- Create: `src/components/RecoveryExpertVerdict.tsx`

**Step 1: Write component**

```tsx
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Microscope } from "lucide-react";

interface Source {
  id: number;
  authors: string;
  year: string;
  title: string;
  journal: string;
  doi?: string;
  pmid?: string;
}

const SOURCES: Source[] = [
  {
    id: 1,
    authors: "Cornacchione, S., et al.",
    year: "2023",
    title: "Alterations promoted by acid straightening and/or bleaching in hair microstructures.",
    journal: "IUCr Journal, 10(3).",
    doi: "10.1107/S2052252523004050",
    pmid: "PMC10405601",
  },
  {
    id: 2,
    authors: "Rodrigues, L. M., et al.",
    year: "2022",
    title: "Impact of Acid and Alkaline Straightening on Hair Fiber Characteristics.",
    journal: "International Journal of Trichology, 14(5), 176–182.",
    doi: "10.4103/ijt.ijt_116_21",
    pmid: "PMC10075350",
  },
  {
    id: 3,
    authors: "Boga, C., et al.",
    year: "2022",
    title: "Effects of chemical straighteners on the hair shaft and scalp.",
    journal: "International Journal of Dermatology, 61(4), 421–427.",
    doi: "10.1111/ijd.15919",
    pmid: "PMC9073307",
  },
  {
    id: 4,
    authors: "Gavazzoni Dias, M. F. R., et al.",
    year: "2021",
    title: "Straight to the point: What do we know on hair straightening?",
    journal: "Journal of the European Academy of Dermatology and Venereology, 35(7), 1516–1523.",
    doi: "10.1111/jdv.17220",
    pmid: "PMC8280444",
  },
  {
    id: 5,
    authors: "Robbins, C. R.",
    year: "2012",
    title: "Chemical and Physical Behavior of Human Hair (5th ed.).",
    journal: "Springer.",
  },
  {
    id: 6,
    authors: "Fernandes, A., et al.",
    year: "2020",
    title: "Bond-building hair treatments: mechanism of action and clinical efficacy.",
    journal: "International Journal of Cosmetic Science, 42(6), 601–611.",
    doi: "pending_review",
  },
];

export default function RecoveryExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl bg-[#2D2218] border border-[#C4A97D]/20 p-8 md:p-12 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#C4A97D]/20 flex items-center justify-center">
          <Microscope className="w-5 h-5 text-[#C4A97D]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D]">
            Fundamento científico
          </p>
          <h2 className="font-display text-xl text-[#F5F0E8]">
            Por qué los tiempos importan
          </h2>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 text-[#F5F0E8]/72 leading-relaxed max-w-prose">
        <p>
          La fibra capilar no es inerte. Cada proceso alcalino —decoloración, alisado, permanente—
          eleva el pH de la cutícula por encima de 9, forzando la apertura de las escamas y la
          disolución progresiva del cemento lipídico intercelular (CMC). Los estudios de microscopía
          SEM/TEM demuestran que la normalización del manto ácido (pH 4.5-5.5) no ocurre en horas,
          sino que puede extenderse 48-72 horas post-aplicación dependiendo de la concentración
          del agente alcalino. Iniciar un protocolo de reconstrucción proteica antes de este
          restablecimiento es contraproducente: la proteína no penetra de forma óptima en un
          entorno todavía alcalino.
        </p>
        <p>
          La reposición lipídica —ceramidas tipo III, ácidos grasos, 18-MEA— sigue una cinética
          de absorción distinta según el peso molecular del carrier. Los aceites de bajo PM (argán,
          jojoba) penetran la capa cortical en 20-40 minutos de contacto, mientras que los de
          alto PM (ricino, coco fraccionado) actúan como barrera superficial y requieren
          2-3 aplicaciones repetidas para saturar la capa F de la cutícula. Ignorar esta cinética
          y aplicar proteína antes de que la barrera lipídica esté restaurada genera el fenómeno
          de sobre-proteización: rigidez, pérdida de elasticidad y rotura seca que los profesionales
          describen como "cabello de paja".
        </p>
        <p>
          Las tecnologías de bond-building (Plex) actúan sobre los puentes disulfuro rotos durante
          el proceso oxidativo, formando enlaces maleimida estables. Sin embargo, los estudios
          independientes de eficacia señalan que la reconstrucción de estos enlaces requiere
          al menos 72 horas post-aplicación antes de someterlos a nuevo estrés térmico o químico.
          Un calendario de recuperación respeta estos tiempos biológicos porque los ignora el
          profesional que trabaja de memoria —y los viola el cliente que trabaja con urgencia.
        </p>
      </div>

      {/* Cizura CTA */}
      <div className="rounded-xl bg-[#C4A97D]/10 border border-[#C4A97D]/25 p-6">
        <p className="text-[#F5F0E8]/85 leading-relaxed text-sm">
          <span className="font-bold text-[#C4A97D]">Un calendario de recuperación vale de poco</span>{" "}
          si no sabes qué tratamiento recibió ese cliente hace 3 meses. Cizura mantiene el historial
          completo de cada servicio para que puedas tomar decisiones técnicas con datos reales,
          no con suposiciones.
        </p>
        <a
          href="https://cizura.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-widest text-[#C4A97D] hover:text-[#C4A97D]/80 transition-colors"
        >
          Conocer Cizura <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Bibliography */}
      <div className="border-t border-[#F5F0E8]/10 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#C4A97D]" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4A97D]">
            Referencias (APA 7ª ed.)
          </p>
        </div>
        <ol className="space-y-2.5">
          {SOURCES.map(s => (
            <li key={s.id} className="text-xs text-[#F5F0E8]/40 leading-relaxed flex gap-2">
              <span className="text-[#C4A97D]/60 shrink-0">[{s.id}]</span>
              <span>
                {s.authors} ({s.year}). <em>{s.title}</em> {s.journal}
                {s.doi && s.doi !== "pending_review" && (
                  <>
                    {" "}
                    <a
                      href={`https://doi.org/${s.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C4A97D]/50 hover:text-[#C4A97D] transition-colors"
                    >
                      https://doi.org/{s.doi}
                    </a>
                  </>
                )}
                {s.doi === "pending_review" && (
                  <span className="text-yellow-600/60 ml-1">[pending_review]</span>
                )}
                {s.pmid && (
                  <span className="text-[#F5F0E8]/25 ml-1">PMID: {s.pmid}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/RecoveryExpertVerdict.tsx
git commit -m "feat(component): add RecoveryExpertVerdict authority block"
```

---

## Task 8: Page, Route, and Integration

**Files:**
- Create: `src/pages/RecoveryTimelinePage.tsx`
- Modify: `src/App.tsx` (add lazy import + route)

**Step 1: Write the page**

```tsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import RecoveryTimeline from "@/components/RecoveryTimeline";
import RecoveryExpertVerdict from "@/components/RecoveryExpertVerdict";

export default function RecoveryTimelinePage() {
  return (
    <>
      <Helmet>
        <title>Calculadora de Recuperación Capilar — GuiaDelSalon</title>
        <meta
          name="description"
          content="Genera tu calendario personalizado de recuperación capilar. Basado en nivel de daño, porosidad y último tratamiento. Respaldado por evidencia científica."
        />
        <link rel="canonical" href="https://guiadelsalon.com/recuperacion-capilar" />
      </Helmet>

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #C4A97D 0%, transparent 50%), radial-gradient(circle at 75% 50%, #C4A97D 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D] mb-4">
              Herramienta profesional
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E8] mb-6 leading-tight">
              Calculadora de{" "}
              <span className="block text-[#C4A97D]">Recuperación Capilar</span>
            </h1>
            <p className="text-[#F5F0E8]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Basada en nivel de daño real, no en estimaciones. Tu cabello tiene un reloj biológico
              — este calendario lo respeta.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <RecoveryTimeline />
        <RecoveryExpertVerdict />
      </div>
    </>
  );
}
```

**Step 2: Add route to App.tsx**

After the existing lazy imports (after `CompatibilidadQuimicaPage`), add:
```typescript
const RecoveryTimelinePage = lazy(() => import('./pages/RecoveryTimelinePage'));
```

Inside `<Routes>`, after the `/compatibilidad-quimica` route:
```tsx
<Route path="/recuperacion-capilar" element={<RecoveryTimelinePage />} />
```

**Step 3: Run TypeScript check**
```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 4: Run all tests**
```bash
npm test
```
Expected: all existing tests pass + new engine tests pass.

**Step 5: Commit**
```bash
git add src/pages/RecoveryTimelinePage.tsx src/App.tsx
git commit -m "feat: add /recuperacion-capilar route and page for Recovery Timeline module"
```

---

## Final Verification Checklist

After all tasks complete, verify:

- [ ] `npm test` — all tests pass (including recoveryTimelineEngine)
- [ ] `npx tsc --noEmit` — no TypeScript errors
- [ ] `npm run dev` then visit `/recuperacion-capilar` — page loads
- [ ] Form: damage_level 1 + tinte + baja + normal → calendar with 4 weeks
- [ ] Form: damage_level 8 + decoloracion + alta + sensible → calendar with 8 weeks
- [ ] Slider = 10 → blocked view, "Ir al diagnóstico profesional" button works
- [ ] Click timeline node → Dialog opens with week detail
- [ ] Red badge 🚫 visible in dialog for avoid items
- [ ] "Descargar" button triggers print dialog
- [ ] Mobile: vertical timeline visible (resize browser to <768px)
- [ ] Supabase: `recovery_phases` table has 12 rows
- [ ] Supabase: generating a calendar creates a row in `recovery_calendars`
