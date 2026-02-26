# Recovery Timeline — Calculadora de Ciclo de Recuperación
**Date:** 2026-02-26
**Project:** GuiaDelSalon / pro-hair-picks
**Status:** Approved

---

## Overview

Módulo interactivo que genera un calendario personalizado de recuperación capilar (4-8 semanas) basado en nivel de daño, último tratamiento, porosidad y condición del cuero cabelludo. Incluye bloque de autoridad científica con bibliografía APA 7ª ed. y CTA a Cizura.

---

## Architecture

### Files to create

```
src/
├── lib/
│   └── recoveryTimelineEngine.ts        # Pure algorithm — no side-effects
├── components/
│   ├── RecoveryTimeline.tsx              # Form + calendar visualization
│   └── RecoveryExpertVerdict.tsx         # Authority block + bibliography
├── pages/
│   └── RecoveryTimelinePage.tsx          # Lazy page + SEO

supabase/migrations/
└── 20260226000001_recovery_timeline.sql  # Tables + RLS + indexes

docs/
├── recovery_research.md                  # Scientific research by block
└── recovery_phases_seed.json             # Seed data for Supabase
```

### Data flow

```
Supabase recovery_phases (preloaded on mount via useQuery)
        ↓
[FORM] damage_level + last_treatment + hair_porosity + scalp_condition
        ↓
generateRecoveryCalendar(input, phases) → RecoveryCalendar  [pure TS]
        ↓
[VISUALIZATION] Timeline + week detail Dialog
        ↓
Supabase recovery_calendars (persist user session)
```

---

## Database Schema

### `recovery_phases` — public read, editor-managed

```sql
CREATE TABLE recovery_phases (
  id                   text PRIMARY KEY,
  phase_type           text NOT NULL CHECK (phase_type IN ('hidratacion','reconstruccion','sellado','mantenimiento')),
  damage_level_min     int NOT NULL CHECK (damage_level_min BETWEEN 1 AND 10),
  damage_level_max     int NOT NULL CHECK (damage_level_max BETWEEN 1 AND 10),
  week_start           int NOT NULL,
  week_end             int NOT NULL,
  last_treatment_filter text[],          -- null = applies to all
  porosity_filter      text[],           -- null = applies to all
  objective_technical  text NOT NULL,
  objective_simple     text NOT NULL,
  key_ingredients      text[] NOT NULL,
  avoid                text[] NOT NULL,
  checkpoint           text NOT NULL,
  pending_review       boolean DEFAULT false,
  sources              jsonb DEFAULT '[]'::jsonb,
  created_at           timestamptz DEFAULT now()
);
```

RLS: SELECT public (no auth required).
Index: `(damage_level_min, damage_level_max)` for range queries.

### `recovery_calendars` — user session scoped

```sql
CREATE TABLE recovery_calendars (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session              text NOT NULL,
  damage_level              int NOT NULL,
  last_treatment            text NOT NULL,
  hair_porosity             text NOT NULL,
  scalp_condition           text NOT NULL,
  calendar_json             jsonb NOT NULL,
  next_safe_treatment_date  date NOT NULL,
  generated_at              timestamptz DEFAULT now()
);
```

RLS: INSERT unrestricted (anon). SELECT filtered by `user_session` passed as app config.

---

## Algorithm — `generateRecoveryCalendar`

### Types

```typescript
type LastTreatment = 'decoloracion' | 'tinte' | 'alisado_quimico' | 'permanente'
                   | 'plex' | 'calor_excesivo' | 'ninguno';
type HairPorosity = 'baja' | 'media' | 'alta';
type ScalpCondition = 'normal' | 'sensible' | 'dermatitis' | 'graso';
type PhaseType = 'hidratacion' | 'reconstruccion' | 'sellado' | 'mantenimiento';

interface RecoveryInput {
  damage_level: number;        // 1-10
  last_treatment: LastTreatment;
  hair_porosity: HairPorosity;
  scalp_condition: ScalpCondition;
}

interface WeekEntry {
  week: number;
  phase: PhaseType;
  focus: string;               // technical objective
  focus_simple: string;        // client-facing language
  treatments: string[];        // key ingredients
  avoid: string[];
  checkpoint: string;          // expected visual/tactile signal
  pending_review: boolean;
}

interface RecoveryCalendar {
  blocked: false;
  weeks: WeekEntry[];
  total_weeks: number;
  next_safe_treatment_date: string; // ISO date
  sources: Source[];
} | { blocked: true; message: string; }
```

### Logic (pseudocode)

```
IF damage_level == 10:
  RETURN { blocked: true }

// Total duration by damage level
total_weeks = damage_level ≤ 3 ? 4 : damage_level ≤ 6 ? 6 : 8

// Filter applicable phases from Supabase data
phases = recovery_phases WHERE:
  damage_level_min ≤ damage_level ≤ damage_level_max
  AND (last_treatment_filter IS NULL OR last_treatment IN last_treatment_filter)
  AND (porosity_filter IS NULL OR hair_porosity IN porosity_filter)

// Sort by week_start
phases.sort(week_start ASC)

// Treatment wait multipliers (in extra weeks after calendar)
treatment_wait = {
  decoloracion:    damage_level * 3,
  alisado_quimico: damage_level * 2,
  permanente:      damage_level * 2,
  tinte:           damage_level * 1,
  plex:            ceil(damage_level / 2),
  calor_excesivo:  damage_level * 1,
  ninguno:         0
}

safe_date = today + (total_weeks + treatment_wait[last_treatment]) weeks

// Build week entries
FOR week 1..total_weeks:
  phase = first phase WHERE week_start ≤ week ≤ week_end
  APPEND WeekEntry from phase data

RETURN { weeks, total_weeks, next_safe_treatment_date: safe_date, sources }
```

---

## React Component — `RecoveryTimeline.tsx`

### State machine

```
'form' → submit → ('blocked' if level=10) | 'calendar'
'calendar' → "Nuevo diagnóstico" → 'form'
```

### View: FORM
- Radix Slider 1-10, dynamic label by range:
  - 1-3: "Cabello sano o con daño leve"
  - 4-6: "Daño moderado, pérdida de brillo y elasticidad"
  - 7-9: "Daño severo, rotura y porosidad alta"
  - 10: "Daño extremo — consulta profesional urgente" (form disabled)
- Select: último tratamiento (8 options)
- Select: porosidad (with water-glass test guide in tooltip/accordion)
- Select: condición del cuero cabelludo
- CTA button "Generar mi calendario de recuperación"

### View: BLOCKED (level=10)
- Alert box espresso background
- "Este nivel de daño requiere diagnóstico profesional presencial"
- Secondary CTA → `/diagnostico-capilar`

### View: CALENDAR
- Header: damage level badge + "X semanas de recuperación"
- Badge: "Próxima fecha segura para tratamiento: DD/MM/YYYY"
- **Desktop:** horizontal timeline with snap scroll, nodes = weeks
- **Mobile:** vertical timeline
- Node colors by phase:
  - `hidratacion` → slate-blue
  - `reconstruccion` → orange-500
  - `sellado` → gold #C4A97D
  - `mantenimiento` → green-500
- Active/hover node: espresso #2D2218 bg, cream text
- Click node → Radix Dialog with week detail:
  - `focus_simple` (large), `focus` (small technical)
  - `treatments` list
  - Red badge strip: `avoid` items
  - `checkpoint` callout
- "Descargar mi calendario" → `window.print()`
- `@media print` CSS hides nav/form, shows full calendar table

### Animations
- `motion.div whileInView viewport={{once:true}}` for timeline entrance
- Node hover: scale 1.1, transition spring

---

## `RecoveryExpertVerdict.tsx`

- Background #2D2218, text cream, accents gold
- 3 paragraphs on biological hair recovery timescales
- Full APA 7th bibliography from research
- Cizura CTA paragraph (verbatim from spec)

---

## Deliverables checklist

- [ ] `recovery_research.md` — scientific research + sources APA
- [ ] `recovery_phases_seed.json` — Supabase seed data
- [ ] `supabase/migrations/20260226000001_recovery_timeline.sql`
- [ ] `src/lib/recoveryTimelineEngine.ts`
- [ ] `src/components/RecoveryTimeline.tsx`
- [ ] `src/components/RecoveryExpertVerdict.tsx`
- [ ] `src/pages/RecoveryTimelinePage.tsx`
- [ ] Route added to `App.tsx` at `/recuperacion-capilar`
- [ ] Type added to `src/integrations/supabase/types.ts`

---

## Constraints

- `damage_level = 10` → blocked, no calendar generated
- `pending_review: true` on any field without verified source
- PDF via `window.print()` + `@media print` CSS only
- Tailwind only, no custom CSS files
- All UI text in Spanish, all DB field names in English
- Framer Motion `whileInView` for scroll animations
