-- ============================================================
-- Alopecia Risk Analyzer — GuiaDelSalon.com
-- Migration: 20260301000001
-- ============================================================

-- ── Tabla 1: alopecia_factors ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alopecia_factors (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  factor_id       text NOT NULL UNIQUE,
  category        text NOT NULL CHECK (category IN ('biologico','genetico','externo','tratamiento')),
  factor_name     text NOT NULL,
  factor_technical text NOT NULL,
  factor_simple   text NOT NULL,
  evidence_level  text NOT NULL CHECK (evidence_level IN ('A','B','C')),
  modifiable      boolean NOT NULL DEFAULT false,
  applies_to      text NOT NULL CHECK (applies_to IN ('male','female','both')),
  impact_magnitude text NOT NULL CHECK (impact_magnitude IN ('alto','moderado','bajo')),
  sources         jsonb,
  pending_verification boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Tabla 2: alopecia_treatments ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.alopecia_treatments (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_id              text NOT NULL UNIQUE,
  name                      text NOT NULL,
  type                      text NOT NULL CHECK (type IN ('farmacologico','procedimiento','cosmético','nutraceutico')),
  evidence_level            text NOT NULL CHECK (evidence_level IN ('A','B','C')),
  effective_stages_hamilton  integer[] NOT NULL DEFAULT '{}',
  effective_stages_ludwig    integer[] NOT NULL DEFAULT '{}',
  applies_to                text NOT NULL CHECK (applies_to IN ('male','female','both')),
  time_to_results_months    integer,
  requires_maintenance      boolean NOT NULL DEFAULT true,
  contraindications         text[] NOT NULL DEFAULT '{}',
  avg_cost_spain_eur        integer,
  realistic_expectation     text NOT NULL,
  sources                   jsonb,
  pending_verification      boolean NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);

-- ── Tabla 3: alopecia_myths ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alopecia_myths (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  myth_id               text NOT NULL UNIQUE,
  myth_statement        text NOT NULL,
  verdict               text NOT NULL CHECK (verdict IN ('mito','parcialmente_cierto','confirmado')),
  verdict_simple        text NOT NULL,
  scientific_explanation text NOT NULL,
  study_reference       jsonb,
  common_in_profiles    text[] NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ── Tabla 4: alopecia_reports (privada por session) ──────────
CREATE TABLE IF NOT EXISTS public.alopecia_reports (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id            text NOT NULL,
  input_data            jsonb NOT NULL,
  risk_level            text NOT NULL,
  risk_score            integer NOT NULL,
  recommended_action    text NOT NULL,
  evidence_based_options jsonb NOT NULL DEFAULT '[]',
  myth_alerts           text[] NOT NULL DEFAULT '{}',
  generated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alopecia_factors_applies_evidence
  ON public.alopecia_factors (applies_to, evidence_level);

CREATE INDEX IF NOT EXISTS idx_alopecia_factors_category
  ON public.alopecia_factors (category);

CREATE INDEX IF NOT EXISTS idx_alopecia_treatments_applies_evidence
  ON public.alopecia_treatments (applies_to, evidence_level);

CREATE INDEX IF NOT EXISTS idx_alopecia_reports_session
  ON public.alopecia_reports (session_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_alopecia_factors_fts
  ON public.alopecia_factors USING gin(to_tsvector('spanish', factor_name || ' ' || factor_technical));

CREATE INDEX IF NOT EXISTS idx_alopecia_treatments_fts
  ON public.alopecia_treatments USING gin(to_tsvector('spanish', name));

CREATE INDEX IF NOT EXISTS idx_alopecia_myths_fts
  ON public.alopecia_myths USING gin(to_tsvector('spanish', myth_statement));

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.alopecia_factors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alopecia_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alopecia_myths      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alopecia_reports    ENABLE ROW LEVEL SECURITY;

-- Tablas públicas (solo lectura)
CREATE POLICY "alopecia_factors_public_read"
  ON public.alopecia_factors FOR SELECT USING (true);

CREATE POLICY "alopecia_treatments_public_read"
  ON public.alopecia_treatments FOR SELECT USING (true);

CREATE POLICY "alopecia_myths_public_read"
  ON public.alopecia_myths FOR SELECT USING (true);

-- alopecia_reports: insert anónimo + select propio por session_id
CREATE POLICY "alopecia_reports_insert"
  ON public.alopecia_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "alopecia_reports_select_own"
  ON public.alopecia_reports FOR SELECT
  USING (session_id = current_setting('app.session_id', true));
