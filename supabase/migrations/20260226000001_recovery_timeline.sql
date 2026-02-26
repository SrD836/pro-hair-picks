-- Migration: recovery_timeline tables
-- recovery_phases: editorial content, public read
-- recovery_calendars: user-generated, session scoped

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

CREATE INDEX IF NOT EXISTS idx_recovery_phases_damage_range
  ON public.recovery_phases (damage_level_min, damage_level_max);

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

CREATE INDEX IF NOT EXISTS idx_recovery_calendars_session
  ON public.recovery_calendars (user_session);

ALTER TABLE public.recovery_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recovery_calendars_insert_anon"
  ON public.recovery_calendars FOR INSERT
  WITH CHECK (user_session <> '' AND user_session IS NOT NULL);

CREATE POLICY "recovery_calendars_select_own"
  ON public.recovery_calendars FOR SELECT
  USING (user_session = current_setting('app.session_id', true));
