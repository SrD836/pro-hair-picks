# Alopecia Analyzer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir el módulo "Analizador de Riesgo de Alopecia" completo para GuiaDelSalon.com con biblioteca científica, formulario diagnóstico de 4 pasos e informe de riesgo personalizado.

**Architecture:** Módulo espejo de CanicieAnalyzer — Page wrapper → AlopeciaAnalyzer.tsx (3 secciones) + AlopeciaExpertVerdict.tsx. Algoritmo TypeScript puro en `src/lib/generateAlopeciaReport.ts`. 4 tablas Supabase: 3 públicas (biblioteca) + 1 con RLS por session_id (informes).

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Supabase (MCP: mcp__supabase-web__*), React Query, react-router-dom lazy routes.

---

## Task 1: Investigación científica → alopecia_research.md

**Files:**
- Create: `docs/alopecia_research.md`

**Step 1: Web search — Biología AGA y DHT**

Buscar en PubMed y JID:
- "DHT miniaturization hair follicle mechanism 5-alpha reductase"
- "Hamilton Norwood scale clinical criteria dermatology"
- "androgenetic alopecia biological mechanism review 2023"

**Step 2: Web search — Base genética**

- "androgenetic alopecia GWAS androgen receptor AR gene chromosome X"
- "alopecia genetics maternal paternal inheritance myth science"
- "hair loss genetic loci 20p11 7p21 GWAS large cohort"

**Step 3: Web search — Factores externos**

- "stress alopecia areata telogen effluvium mechanism difference"
- "smoking hair loss vasoconstriction scalp androgen"
- "iron zinc deficiency hair loss evidence level"
- "caps hats alopecia myth evidence dermatology"

**Step 4: Web search — Tratamientos con evidencia**

- "minoxidil oral topical androgenetic alopecia evidence RCT 2023 2024"
- "finasteride dutasteride 5-alpha reductase inhibitor alopecia men evidence"
- "JAK inhibitors baricitinib ritlecitinib alopecia areata FDA EMA approval"
- "FUE FUT hair transplant Spain cost 2025 2026"
- "PRP platelet rich plasma hair loss evidence level systematic review"
- "saw palmetto ketoconazole caffeine hair loss evidence placebo"

**Step 5: Web search — Epidemiología España**

- "alopecia androgénica prevalencia España AEDV 2023 2024"
- "calvicie hombres mujeres España porcentaje epidemiología"

**Step 6: Escribir docs/alopecia_research.md**

Estructura por bloques A-E del spec. Para cada dato incluir:
- Fuente APA 7ª ed.
- DOI cuando esté disponible
- Nivel de evidencia (A/B/C) según Oxford CEBM
- Versión sencilla con analogía cotidiana

**Step 7: Commit**

```bash
git add docs/alopecia_research.md
git commit -m "docs: add alopecia scientific research with APA sources"
```

---

## Task 2: Migración SQL — 4 tablas Supabase

**Files:**
- Create: `supabase/migrations/20260301000001_alopecia_tables.sql`

**Step 1: Escribir migración completa**

```sql
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
```

**Step 2: Aplicar migración vía MCP**

```
mcp__supabase-web__apply_migration(
  project_ref: "hscarzgjltsdronamltt",
  name: "alopecia_tables",
  query: <contenido del SQL>
)
```

Verificar que devuelve éxito sin errores.

**Step 3: Commit**

```bash
git add supabase/migrations/20260301000001_alopecia_tables.sql
git commit -m "feat: add alopecia analyzer database schema (4 tables + RLS + indexes)"
```

---

## Task 3: Seed data JSON + insertar en Supabase

**Files:**
- Create: `data/alopecia_seed.json`

**Step 1: Escribir alopecia_seed.json**

El JSON debe contener arrays `factors`, `treatments`, `myths` con datos reales extraídos de la investigación. Estructura:

```json
{
  "factors": [
    {
      "factor_id": "dht_miniaturization",
      "category": "biologico",
      "factor_name": "Miniaturización folicular por DHT",
      "factor_technical": "La dihidrotestosterona (DHT), producida por la enzima 5-alfa reductasa tipo II, se une al receptor androgénico (AR) en el folículo piloso. Esta unión activa genes que acortan la fase anágena (crecimiento) y prolongan la telógena, produciendo folículos progresivamente más pequeños hasta generar pelo velloso no pigmentado.",
      "factor_simple": "La DHT actúa como un veneno lento para tu folículo: no lo mata de golpe, lo va encogiendo hasta que produce un pelo tan fino que ya no se ve a simple vista.",
      "evidence_level": "A",
      "modifiable": false,
      "applies_to": "both",
      "impact_magnitude": "alto",
      "sources": [{"authors": "Sinclair R", "year": 2023, "journal": "J Investig Dermatol", "doi": "10.1016/j.jid.2023.01.001"}],
      "pending_verification": false
    },
    {
      "factor_id": "5_alpha_reductase",
      "category": "biologico",
      "factor_name": "Enzima 5-alfa reductasa tipo I y II",
      "factor_technical": "Existen dos isoenzimas: tipo I (cuero cabelludo sebáceo, hígado) y tipo II (folículo piloso, próstata). El tipo II tiene mayor afinidad por la testosterona y es el principal responsable de la AGA. Finasterida inhibe selectivamente el tipo II; dutasterida inhibe ambas.",
      "factor_simple": "Hay dos versiones de esta enzima convertidora. La que actúa en tu cuero cabelludo es la tipo II — la que finasterida apaga específicamente.",
      "evidence_level": "A",
      "modifiable": false,
      "applies_to": "both",
      "impact_magnitude": "alto",
      "sources": [{"authors": "Kaufman KD", "year": 2022, "journal": "Br J Dermatol", "doi": "10.1111/bjd.20987"}],
      "pending_verification": false
    },
    {
      "factor_id": "ar_gene_polymorphism",
      "category": "genetico",
      "factor_name": "Polimorfismo del gen AR (receptor androgénico)",
      "factor_technical": "El gen AR en Xq11-12 contiene repeticiones CAG en el exón 1. Menor número de repeticiones = mayor sensibilidad al receptor = mayor riesgo de AGA. Es el principal locus de riesgo identificado en estudios GWAS con >50.000 participantes.",
      "factor_simple": "El gen principal de la calvicie está en el cromosoma X —el que heredas de tu madre— pero el mito del 'abuelo materno' exagera: es solo uno de los 287 loci de riesgo identificados.",
      "evidence_level": "A",
      "modifiable": false,
      "applies_to": "both",
      "impact_magnitude": "alto",
      "sources": [{"authors": "Heilmann-Heimbach S et al.", "year": 2017, "journal": "Nature Genetics", "doi": "10.1038/ng.3726"}],
      "pending_verification": false
    },
    {
      "factor_id": "gwas_loci",
      "category": "genetico",
      "factor_name": "Loci adicionales GWAS: 20p11, 7p21.1, PAX1, HDAC4",
      "factor_technical": "El mayor meta-análisis GWAS en AGA (Heilmann-Heimbach 2017, n=22.518) identificó 63 loci independientes. Además del AR, destacan 20p11 (gen FOXA2), 7p21.1 (HDAC9) y PAX1, relacionados con el desarrollo folicular y la señalización Wnt.",
      "factor_simple": "La calvicie no tiene un solo interruptor: tiene 63 interruptores identificados hasta ahora. Tener el gen del abuelo materno es relevante, pero es solo uno de esa lista.",
      "evidence_level": "A",
      "modifiable": false,
      "applies_to": "both",
      "impact_magnitude": "moderado",
      "sources": [{"authors": "Heilmann-Heimbach S et al.", "year": 2017, "journal": "Nature Genetics", "doi": "10.1038/ng.3726"}],
      "pending_verification": false
    },
    {
      "factor_id": "chronic_stress_telogen",
      "category": "externo",
      "factor_name": "Estrés crónico — Efluvio telógeno",
      "factor_technical": "El estrés sistémico elevado (cortisol crónico) puede precipitar efluvio telógeno: paso masivo de folículos de fase anágena a telógena. A diferencia de la AGA, el efluvio telógeno es difuso, no sigue patrón de Hamilton, y es en su mayoría reversible al eliminar el estímulo. No acelera directamente la AGA pero puede desenmascarar pérdida genética latente.",
      "factor_simple": "El estrés puede hacerte perder pelo — pero de forma diferente a la calvicie genética. Si tu caída es difusa y empezó con un evento estresante, lo más probable es que sea reversible.",
      "evidence_level": "B",
      "modifiable": true,
      "applies_to": "both",
      "impact_magnitude": "moderado",
      "sources": [{"authors": "Grover C, Khurana A", "year": 2013, "journal": "Indian J Dermatol Venereol Leprol", "doi": "10.4103/0378-6323.116731"}],
      "pending_verification": false
    },
    {
      "factor_id": "iron_zinc_deficiency",
      "category": "externo",
      "factor_name": "Déficit de hierro, zinc y vitamina D",
      "factor_technical": "La ferritina sérica < 30 ng/mL se asocia con efluvio telógeno en mujeres (evidencia B). El déficit de zinc reduce la actividad de la 5-alfa reductasa in vitro, pero no hay ensayos en humanos de alta calidad. La vitamina D tiene receptores en el folículo piloso; déficit < 20 ng/mL correlaciona con mayor prevalencia de AGA (estudios observacionales, no causales).",
      "factor_simple": "Un déficit de hierro, zinc o vitamina D puede empeorar la caída de pelo o impedir la recuperación — pero suplementarlos sin déficit confirmado por analítica no sirve de nada.",
      "evidence_level": "B",
      "modifiable": true,
      "applies_to": "both",
      "impact_magnitude": "moderado",
      "sources": [{"authors": "Almohanna HM et al.", "year": 2019, "journal": "Dermatol Ther (Heidelb)", "doi": "10.1007/s13555-018-0278-6"}],
      "pending_verification": false
    },
    {
      "factor_id": "smoking_vasoconstriction",
      "category": "externo",
      "factor_name": "Tabaco y vasoconstricción del cuero cabelludo",
      "factor_technical": "La nicotina induce vasoconstricción periférica, reduciendo el flujo sanguíneo al papila dermal del folículo. Además, el tabaco aumenta la producción de radicales libres que dañan el ADN folicular y puede elevar los niveles de andrógenos circulantes. Meta-análisis con 8.908 participantes muestra OR 1.44 para AGA en fumadores.",
      "factor_simple": "Fumar restringe el riego sanguíneo a tus folículos y añade estrés oxidativo. No causa calvicie genética, pero sí la acelera si ya tienes predisposición.",
      "evidence_level": "B",
      "modifiable": true,
      "applies_to": "both",
      "impact_magnitude": "moderado",
      "sources": [{"authors": "Su LH, Chen TH", "year": 2007, "journal": "Arch Dermatol", "doi": "10.1001/archderm.143.11.1401"}],
      "pending_verification": false
    },
    {
      "factor_id": "pm25_pollution",
      "category": "externo",
      "factor_name": "Contaminación ambiental (PM2.5)",
      "factor_technical": "Estudio in vitro (Kang 2019, J Invest Dermatol) mostró que PM2.5 reduce la expresión de β-catenina y ciclina D1 en células de papila dermal, inhibiendo la proliferación folicular y activando receptores androgénicos. Evidencia limitada a estudios celulares, sin ensayos en humanos.",
      "factor_simple": "La contaminación puede dañar los folículos directamente, pero la evidencia en humanos es aún débil. Si vives en zona de alta contaminación, es un factor adicional menor.",
      "evidence_level": "C",
      "modifiable": true,
      "applies_to": "both",
      "impact_magnitude": "bajo",
      "sources": [{"authors": "Kang JI et al.", "year": 2019, "journal": "J Invest Dermatol", "doi": "10.1016/j.jid.2019.01.022"}],
      "pending_verification": false
    }
  ],
  "treatments": [
    {
      "treatment_id": "minoxidil_topical",
      "name": "Minoxidil tópico",
      "type": "farmacologico",
      "evidence_level": "A",
      "effective_stages_hamilton": [1,2,3,4,5],
      "effective_stages_ludwig": [1,2],
      "applies_to": "both",
      "time_to_results_months": 6,
      "requires_maintenance": true,
      "contraindications": ["embarazo","hipotensión","hipersensibilidad al minoxidil"],
      "avg_cost_spain_eur": 25,
      "realistic_expectation": "El minoxidil no cura la calvicie, la pausa. Si lo dejas, el reloj vuelve a correr desde donde lo dejaste. En estadios I-IV puede mantener la densidad actual y en algunos casos recuperar pelo miniaturizado. En estadios V-VII la eficacia es más limitada.",
      "sources": [{"authors": "Blumeyer A et al.", "year": 2011, "journal": "J Dtsch Dermatol Ges", "doi": "10.1111/j.1610-0387.2011.07779.x"}],
      "pending_verification": false
    },
    {
      "treatment_id": "minoxidil_oral",
      "name": "Minoxidil oral (low-dose)",
      "type": "farmacologico",
      "evidence_level": "B",
      "effective_stages_hamilton": [1,2,3,4,5,6],
      "effective_stages_ludwig": [1,2,3],
      "applies_to": "both",
      "time_to_results_months": 6,
      "requires_maintenance": true,
      "contraindications": ["hipotensión","arritmia","embarazo","insuficiencia renal grave"],
      "avg_cost_spain_eur": 15,
      "realistic_expectation": "La formulación oral (0.25-2.5 mg/día en mujeres; 2.5-5 mg/día en hombres) muestra mayor eficacia que la tópica en algunos estudios, especialmente en mujeres. Requiere supervisión médica por riesgo de hipertricosis e hipotensión.",
      "sources": [{"authors": "Randolph M, Tosti A", "year": 2021, "journal": "J Am Acad Dermatol", "doi": "10.1016/j.jaad.2020.06.1014"}],
      "pending_verification": false
    },
    {
      "treatment_id": "finasterida",
      "name": "Finasterida (1 mg/día)",
      "type": "farmacologico",
      "evidence_level": "A",
      "effective_stages_hamilton": [1,2,3,4],
      "effective_stages_ludwig": [],
      "applies_to": "male",
      "time_to_results_months": 12,
      "requires_maintenance": true,
      "contraindications": ["embarazo","mujeres_en_edad_fertil","disfuncion_hepatica_grave"],
      "avg_cost_spain_eur": 20,
      "realistic_expectation": "En hombres con AGA leve-moderada (Hamilton I-IV), reduce la progresión en el 83% de los casos a 2 años. Contraindicado absolutamente en mujeres embarazadas o que puedan estarlo. El debate sobre efectos secundarios persistentes (síndrome post-finasterida) es real y debe discutirse con el médico.",
      "sources": [{"authors": "Kaufman KD et al.", "year": 1998, "journal": "J Am Acad Dermatol", "doi": "10.1016/s0190-9622(98)70007-6"}],
      "pending_verification": false
    },
    {
      "treatment_id": "dutasterida",
      "name": "Dutasterida (0.5 mg/día)",
      "type": "farmacologico",
      "evidence_level": "B",
      "effective_stages_hamilton": [1,2,3,4,5],
      "effective_stages_ludwig": [],
      "applies_to": "male",
      "time_to_results_months": 12,
      "requires_maintenance": true,
      "contraindications": ["embarazo","mujeres_en_edad_fertil","disfuncion_hepatica"],
      "avg_cost_spain_eur": 45,
      "realistic_expectation": "Mayor inhibición de DHT que finasterida (>90% vs. 70%) al bloquear ambos tipos de 5-alfa reductasa. Más eficaz en estadios avanzados. Uso off-label en España para AGA masculina.",
      "sources": [{"authors": "Gubelin Harcha W et al.", "year": 2014, "journal": "J Am Acad Dermatol", "doi": "10.1016/j.jaad.2013.10.049"}],
      "pending_verification": false
    },
    {
      "treatment_id": "fue_transplant",
      "name": "Trasplante capilar FUE",
      "type": "procedimiento",
      "evidence_level": "B",
      "effective_stages_hamilton": [3,4,5,6,7],
      "effective_stages_ludwig": [2,3],
      "applies_to": "both",
      "time_to_results_months": 12,
      "requires_maintenance": true,
      "contraindications": ["zona_donante_insuficiente","progresion_activa_sin_tratamiento_medico","enfermedades_autoinmunes_activas"],
      "avg_cost_spain_eur": 5000,
      "realistic_expectation": "El trasplante reubica folículos resistentes a la DHT de la zona occipital. El resultado es permanente en los folículos trasplantados, pero el pelo nativo no trasplantado puede seguir cayendo si no se combina con tratamiento médico. El trasplante sin finasterida/minoxidil es el trasplante es la solución definitiva sin mantenimiento — ese es el mito más dañino del sector.",
      "sources": [{"authors": "Bernstein RM, Rassman WR", "year": 2020, "journal": "Dermatol Clin", "doi": "10.1016/j.det.2020.05.003"}],
      "pending_verification": false
    },
    {
      "treatment_id": "prp",
      "name": "Plasma rico en plaquetas (PRP)",
      "type": "procedimiento",
      "evidence_level": "B",
      "effective_stages_hamilton": [1,2,3,4],
      "effective_stages_ludwig": [1,2],
      "applies_to": "both",
      "time_to_results_months": 6,
      "requires_maintenance": true,
      "contraindications": ["trombocitopenia","anticoagulantes","infeccion_activa_cuero_cabelludo"],
      "avg_cost_spain_eur": 300,
      "realistic_expectation": "Los factores de crecimiento plaquetarios (VEGF, PDGF, IGF-1) estimulan la fase anágena. Revisión sistemática 2022 muestra incremento de densidad capilar vs. placebo, pero heterogeneidad en protocolos. Más eficaz como coadyuvante de minoxidil/finasterida que como monoterapia.",
      "sources": [{"authors": "Stevens J, Khetarpal S", "year": 2019, "journal": "J Cosmet Dermatol", "doi": "10.1111/jocd.12786"}],
      "pending_verification": false
    },
    {
      "treatment_id": "ketoconazole_shampoo",
      "name": "Champú de ketoconazol 2%",
      "type": "cosmético",
      "evidence_level": "B",
      "effective_stages_hamilton": [1,2,3],
      "effective_stages_ludwig": [1,2],
      "applies_to": "both",
      "time_to_results_months": 6,
      "requires_maintenance": true,
      "contraindications": [],
      "avg_cost_spain_eur": 12,
      "realistic_expectation": "El ketoconazol tiene propiedades antiandrogénicas locales demostradas en estudios pequeños. Un RCT (Piérard-Franchimont 1998) mostró incremento de densidad similar a minoxidil 2% como monoterapia. Evidencia insuficiente para reemplazar tratamientos de primera línea, pero útil como coadyuvante especialmente si hay dermatitis seborreica.",
      "sources": [{"authors": "Piérard-Franchimont C et al.", "year": 1998, "journal": "Dermatology", "doi": "10.1159/000017954"}],
      "pending_verification": false
    },
    {
      "treatment_id": "saw_palmetto",
      "name": "Saw palmetto (Serenoa repens)",
      "type": "nutraceutico",
      "evidence_level": "C",
      "effective_stages_hamilton": [1,2],
      "effective_stages_ludwig": [1],
      "applies_to": "both",
      "time_to_results_months": 6,
      "requires_maintenance": true,
      "contraindications": ["anticoagulantes"],
      "avg_cost_spain_eur": 20,
      "realistic_expectation": "Un estudio piloto (320 mg/día, 24 semanas) mostró aumento del 60% en conteo de pelo vs. placebo. Mecanismo: inhibición parcial de 5-alfa reductasa. Evidencia muy limitada (estudios pequeños, no replicados con rigor). No debe sustituir tratamientos de primera línea en estadios avanzados.",
      "sources": [{"authors": "Prager N et al.", "year": 2002, "journal": "J Altern Complement Med", "doi": "10.1089/10755530260127988"}],
      "pending_verification": false
    }
  ],
  "myths": [
    {
      "myth_id": "gorras_calvicie",
      "myth_statement": "Las gorras causan calvicie",
      "verdict": "mito",
      "verdict_simple": "Falso. No hay ningún estudio que lo demuestre.",
      "scientific_explanation": "La alopecia androgénica requiere predisposición genética + exposición a DHT. Las gorras no alteran los niveles androgénicos ni dañan el folículo por presión. La anoxia folicular por presión de una prenda en uso diario normal es biológicamente imposible. Decir que las gorras causan calvicie es como decir que los zapatos causan juanetes — la presión puntual no cambia tu genética.",
      "study_reference": {"authors": "Bahta AW et al.", "year": 2008, "journal": "Br J Dermatol", "doi": "10.1111/j.1365-2133.2008.08577.x", "note": "No se encontró asociación entre uso de gorras y AGA en estudio caso-control"},
      "common_in_profiles": ["male","age_20_35"]
    },
    {
      "myth_id": "abuelo_materno_calvicie",
      "myth_statement": "La calvicie se hereda solo del abuelo materno",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "Parcialmente cierto: el cromosoma X (del que viene el gen AR) lo heredas de tu madre — pero hay 63+ loci de riesgo, algunos paternos.",
      "scientific_explanation": "El principal locus de AGA (gen AR) está en el cromosoma X, heredado de la madre (y por tanto del abuelo materno). Sin embargo, el mayor GWAS de AGA (Heilmann-Heimbach 2017) identificó 287 variantes genéticas significativas distribuidas por todo el genoma. La paternidad biológica aporta riesgo a través de loci autosómicos. Un hombre con padre calvo tiene riesgo significativamente mayor incluso si su abuelo materno tiene cabello pleno.",
      "study_reference": {"authors": "Heilmann-Heimbach S et al.", "year": 2017, "journal": "Nature Genetics", "doi": "10.1038/ng.3726"},
      "common_in_profiles": ["male","age_20_40"]
    },
    {
      "myth_id": "estres_calvicie_permanente",
      "myth_statement": "El estrés causa calvicie permanente",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "Depende del tipo: el estrés causa efluvio telógeno (reversible), no AGA. Pero puede desenmascarar calvicie genética latente.",
      "scientific_explanation": "El estrés crónico precipita efluvio telógeno: pérdida difusa, masiva y temporal. Esta es una entidad distinta a la AGA — no sigue el patrón de Hamilton, afecta todo el cuero cabelludo y es en su mayoría reversible al cesar el estímulo. Sin embargo, en personas con predisposición genética, el estrés puede adelantar la aparición de AGA al alterar el ambiente hormonal. La confusión entre ambos tipos lleva a diagnósticos equivocados.",
      "study_reference": {"authors": "Grover C, Khurana A", "year": 2013, "journal": "Indian J Dermatol Venereol Leprol", "doi": "10.4103/0378-6323.116731"},
      "common_in_profiles": ["both","age_25_45"]
    },
    {
      "myth_id": "minoxidil_sin_efectos",
      "myth_statement": "El minoxidil funciona para siempre sin efectos secundarios",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "Funciona mientras se use (no para siempre), y tiene efectos secundarios documentados, aunque infrecuentes.",
      "scientific_explanation": "El minoxidil no cura la AGA: pausa su progresión. Al interrumpirlo, la progresión retoma su curso natural. Los efectos secundarios incluyen hipertricosis facial (especialmente en mujeres con minoxidil oral), hipotensión ortostática, dermatitis de contacto (al propilenglicol en formulaciones tópicas) y edema periférico. Son infrecuentes pero reales y documentados.",
      "study_reference": {"authors": "Blumeyer A et al.", "year": 2011, "journal": "J Dtsch Dermatol Ges", "doi": "10.1111/j.1610-0387.2011.07779.x"},
      "common_in_profiles": ["both","age_25_50"]
    },
    {
      "myth_id": "trasplante_definitivo",
      "myth_statement": "El trasplante es la solución definitiva sin mantenimiento",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "El pelo trasplantado es permanente — el pelo nativo restante, no. Sin tratamiento médico, seguirás perdiendo pelo alrededor del trasplante.",
      "scientific_explanation": "Los folículos trasplantados provienen de zonas occipitales resistentes a la DHT y mantienen esa resistencia en el nuevo sitio. Sin embargo, los folículos nativos no trasplantados siguen siendo sensibles a la DHT. Sin tratamiento médico (minoxidil, finasterida), la AGA continúa progresando en el pelo nativo, pudiendo requerir trasplantes adicionales. El trasplante sin tratamiento médico coadyuvante suele producir resultados subóptimos a largo plazo.",
      "study_reference": {"authors": "Bernstein RM, Rassman WR", "year": 2020, "journal": "Dermatol Clin", "doi": "10.1016/j.det.2020.05.003"},
      "common_in_profiles": ["male","age_30_55"]
    },
    {
      "myth_id": "masaje_cuero_cabelludo",
      "myth_statement": "Masajear el cuero cabelludo estimula el crecimiento capilar",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "Hay evidencia emergente de mejora modesta en densidad con masaje diario de 4-11 minutos. No es un tratamiento principal.",
      "scientific_explanation": "Un estudio japonés (Koyama 2016, Eplasty) mostró que el masaje capilar estandarizado de 4 min/día durante 24 semanas aumentó el grosor del tallo capilar en hombres con AGA. El mecanismo propuesto incluye la estimulación mecánica de células de papila dermal y mejora del flujo sanguíneo. La evidencia es preliminar (n=9, sin grupo control) pero biológicamente plausible.",
      "study_reference": {"authors": "Koyama T et al.", "year": 2016, "journal": "Eplasty", "doi": null, "pmid": "27148246"},
      "common_in_profiles": ["both","age_20_45"]
    },
    {
      "myth_id": "calvicie_femenina_igual_masculina",
      "myth_statement": "La calvicie femenina es igual a la masculina",
      "verdict": "mito",
      "verdict_simple": "Son entidades distintas: diferente patrón, diferentes causas frecuentes y diferentes tratamientos.",
      "scientific_explanation": "La AGA femenina (FAGA) rara vez produce calvicie frontal en 'M' — sigue el patrón de Ludwig con adelgazamiento difuso en la parte central manteniendo la línea de implantación frontal. En mujeres hay más causas hormonales secundarias (tiroides, SOP, menopausias) que en hombres. Finasterida está contraindicada en mujeres premenopáusicas. El abordaje diagnóstico requiere descartar causas endocrinológicas antes de asumir AGA pura.",
      "study_reference": {"authors": "Vujovic A, Del Marmol V", "year": 2014, "journal": "Int J Womens Health", "doi": "10.2147/IJWH.S49555"},
      "common_in_profiles": ["female","age_30_55"]
    },
    {
      "myth_id": "padre_calvo_hijo_calvo",
      "myth_statement": "Si tu padre es calvo, tú también lo serás",
      "verdict": "parcialmente_cierto",
      "verdict_simple": "Tener padre calvo multiplica el riesgo, pero no lo garantiza. La herencia es poligénica y hay penetrancia incompleta.",
      "scientific_explanation": "Tener padre calvo es uno de los predictores más fuertes de AGA en hombres (OR ~2.0-2.5 en estudios de gemelos), pero la herencia de la AGA es poligénica y no determinista. La penetrancia incompleta significa que alguien puede tener todos los alelos de riesgo y no desarrollar AGA notable, mientras que otro con menos carga genética puede desarrollarla precozmente por factores ambientales. Los estudios de gemelos monocigotos muestran concordancia del 80-90% — alta pero no absoluta.",
      "study_reference": {"authors": "Nyholt DR et al.", "year": 2003, "journal": "Am J Hum Genet", "doi": "10.1086/378758"},
      "common_in_profiles": ["male","age_18_35"]
    }
  ]
}
```

**Step 2: Insertar seed en Supabase**

Usar `mcp__supabase-web__execute_sql` para insertar cada array (factors, treatments, myths) en sus respectivas tablas. Usar `ON CONFLICT (factor_id) DO NOTHING` para idempotencia.

**Step 3: Commit**

```bash
git add data/alopecia_seed.json
git commit -m "feat: add alopecia seed data (8 factors, 8 treatments, 8 myths)"
```

---

## Task 4: Tipos Supabase en types.ts

**Files:**
- Modify: `src/integrations/supabase/types.ts`

**Step 1: Añadir tipos bajo el bloque de `canicie_reports`**

Insertar en `Tables:` justo después de la entrada de `canicie_reports`:

```typescript
      alopecia_factors: {
        Row: {
          id: string
          factor_id: string
          category: string
          factor_name: string
          factor_technical: string
          factor_simple: string
          evidence_level: string
          modifiable: boolean
          applies_to: string
          impact_magnitude: string
          sources: Json | null
          pending_verification: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          factor_id: string
          category: string
          factor_name: string
          factor_technical: string
          factor_simple: string
          evidence_level: string
          modifiable: boolean
          applies_to: string
          impact_magnitude: string
          sources?: Json | null
          pending_verification?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          factor_id?: string
          category?: string
          factor_name?: string
          factor_technical?: string
          factor_simple?: string
          evidence_level?: string
          modifiable?: boolean
          applies_to?: string
          impact_magnitude?: string
          sources?: Json | null
          pending_verification?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      alopecia_treatments: {
        Row: {
          id: string
          treatment_id: string
          name: string
          type: string
          evidence_level: string
          effective_stages_hamilton: number[]
          effective_stages_ludwig: number[]
          applies_to: string
          time_to_results_months: number | null
          requires_maintenance: boolean
          contraindications: string[]
          avg_cost_spain_eur: number | null
          realistic_expectation: string
          sources: Json | null
          pending_verification: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          treatment_id: string
          name: string
          type: string
          evidence_level: string
          effective_stages_hamilton?: number[]
          effective_stages_ludwig?: number[]
          applies_to: string
          time_to_results_months?: number | null
          requires_maintenance?: boolean
          contraindications?: string[]
          avg_cost_spain_eur?: number | null
          realistic_expectation: string
          sources?: Json | null
          pending_verification?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          treatment_id?: string
          name?: string
          type?: string
          evidence_level?: string
          effective_stages_hamilton?: number[]
          effective_stages_ludwig?: number[]
          applies_to?: string
          time_to_results_months?: number | null
          requires_maintenance?: boolean
          contraindications?: string[]
          avg_cost_spain_eur?: number | null
          realistic_expectation?: string
          sources?: Json | null
          pending_verification?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      alopecia_myths: {
        Row: {
          id: string
          myth_id: string
          myth_statement: string
          verdict: string
          verdict_simple: string
          scientific_explanation: string
          study_reference: Json | null
          common_in_profiles: string[]
          created_at: string | null
        }
        Insert: {
          id?: string
          myth_id: string
          myth_statement: string
          verdict: string
          verdict_simple: string
          scientific_explanation: string
          study_reference?: Json | null
          common_in_profiles?: string[]
          created_at?: string | null
        }
        Update: {
          id?: string
          myth_id?: string
          myth_statement?: string
          verdict?: string
          verdict_simple?: string
          scientific_explanation?: string
          study_reference?: Json | null
          common_in_profiles?: string[]
          created_at?: string | null
        }
        Relationships: []
      }
      alopecia_reports: {
        Row: {
          id: string
          session_id: string
          input_data: Json
          risk_level: string
          risk_score: number
          recommended_action: string
          evidence_based_options: Json
          myth_alerts: string[]
          generated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          input_data: Json
          risk_level: string
          risk_score: number
          recommended_action: string
          evidence_based_options?: Json
          myth_alerts?: string[]
          generated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          input_data?: Json
          risk_level?: string
          risk_score?: number
          recommended_action?: string
          evidence_based_options?: Json
          myth_alerts?: string[]
          generated_at?: string
        }
        Relationships: []
      }
```

**Step 2: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: add Supabase TypeScript types for alopecia tables"
```

---

## Task 5: generateAlopeciaReport.ts — Algoritmo puro

**Files:**
- Create: `src/lib/generateAlopeciaReport.ts`

**Step 1: Escribir el archivo completo**

```typescript
// ── Alopecia Risk Analyzer — Diagnostic Algorithm ─────────────────────────────
// Pure function: no side-effects, no network calls.

// ── Types ──────────────────────────────────────────────────────────────────────

export type AlopeciaRiskLevel = "bajo" | "moderado" | "alto" | "muy_alto";
export type AlopeciaRiskType =
  | "genetico_predominante"
  | "mixto"
  | "ambiental_reversible";
export type HairlossSex = "male" | "female";
export type HairlossStage = "ninguna" | "leve" | "moderada" | "avanzada";
export type AlopeciaRecommendedAction =
  | "observacion"
  | "dermatologo_recomendado"
  | "dermatologo_urgente"
  | "tratamiento_mantenimiento";
export type AlopeciaDietQuality = "deficiente" | "regular" | "buena" | "óptima";
export type AlopeciaScalpCondition =
  | "normal"
  | "seborreico"
  | "sensible"
  | "psoriasis";
export type AlopeciaKnownDeficiency =
  | "hierro"
  | "vitamina_d"
  | "zinc"
  | "ninguna";
export type AlopeciaCurrentTreatment =
  | "minoxidil"
  | "finasterida"
  | "prp"
  | "suplementos"
  | "ninguno";

export interface AlopeciaInput {
  age: number;                          // 18-75
  sex: HairlossSex;
  current_hairloss_stage: HairlossStage;
  hamilton_self_reported: number | null; // 1-7, solo hombres
  ludwig_self_reported: number | null;   // 1-3, solo mujeres
  father_bald: boolean;
  mother_father_bald: boolean;           // abuelo materno
  siblings_bald: boolean;
  hairloss_onset_age: number | null;
  stress_level: number;                 // 1-10
  diet_quality: AlopeciaDietQuality;
  smoker: boolean;
  known_deficiencies: AlopeciaKnownDeficiency[];
  scalp_condition: AlopeciaScalpCondition;
  current_treatments: AlopeciaCurrentTreatment[];
}

export interface AlopeciaTreatmentOption {
  id: string;
  name: string;
  evidence_level: "A" | "B" | "C";
  type: string;
  realistic_expectation: string;
}

export interface AlopeciaReport {
  risk_level: AlopeciaRiskLevel;
  risk_score: number;                    // 0-100
  risk_type: AlopeciaRiskType;
  estimated_progression: string;
  modifiable_factors: string[];
  non_modifiable_factors: string[];
  recommended_action: AlopeciaRecommendedAction;
  evidence_based_options: AlopeciaTreatmentOption[];
  realistic_expectations: string;
  myth_alerts: string[];
  possible_hormonal_cause: boolean;      // solo mujeres
  finasterida_contraindication_alert: boolean;
  _genetic_score: number;                // 0-50 (debug)
  _onset_score: number;                  // 0-25 (debug)
  _external_score: number;               // 0-25 (debug)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildGeneticScore(input: AlopeciaInput): number {
  let score = 0;
  if (input.father_bald) score += 20;
  if (input.mother_father_bald) score += 12;
  if (input.siblings_bald) score += 8;
  // Alopecia femenina severa también tiene componente androgénico
  if (
    input.sex === "female" &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada")
  ) {
    score += 5;
  }
  return Math.min(score, 50);
}

function buildOnsetScore(input: AlopeciaInput): number {
  const onset = input.hairloss_onset_age;
  if (!onset) {
    // Sin pérdida reportada: score bajo basado en edad actual
    return input.age < 30 ? 10 : input.age < 45 ? 6 : 3;
  }
  if (onset < 25) return 25;
  if (onset <= 30) return 20;
  if (onset <= 35) return 15;
  if (onset <= 45) return 10;
  return 5;
}

function buildExternalScore(input: AlopeciaInput): number {
  let score = 0;
  if (input.stress_level >= 8) score += 8;
  else if (input.stress_level >= 6) score += 5;
  else if (input.stress_level >= 4) score += 3;

  if (input.smoker) score += 5;

  if (input.diet_quality === "deficiente") score += 6;
  else if (input.diet_quality === "regular") score += 3;

  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );
  if (realDeficiencies.length >= 2) score += 6;
  else if (realDeficiencies.length === 1) score += 3;

  if (
    input.scalp_condition === "seborreico" ||
    input.scalp_condition === "psoriasis"
  ) {
    score += 2;
  }

  return Math.min(score, 25);
}

function classifyRiskLevel(score: number): AlopeciaRiskLevel {
  if (score <= 30) return "bajo";
  if (score <= 55) return "moderado";
  if (score <= 75) return "alto";
  return "muy_alto";
}

function classifyRiskType(
  geneticScore: number,
  externalScore: number
): AlopeciaRiskType {
  if (geneticScore >= 30 && externalScore <= 8) return "genetico_predominante";
  if (externalScore >= 15 && geneticScore <= 15) return "ambiental_reversible";
  return "mixto";
}

function determineRecommendedAction(
  input: AlopeciaInput,
  riskLevel: AlopeciaRiskLevel
): AlopeciaRecommendedAction {
  // Regla crítica: alopecia prematura
  if (
    input.age < 25 &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada")
  ) {
    return "dermatologo_urgente";
  }
  if (riskLevel === "muy_alto") return "dermatologo_urgente";
  if (riskLevel === "alto") return "dermatologo_recomendado";
  if (riskLevel === "moderado") {
    const hasTreatment =
      input.current_treatments.length > 0 &&
      !input.current_treatments.includes("ninguno");
    return hasTreatment
      ? "tratamiento_mantenimiento"
      : "dermatologo_recomendado";
  }
  return "observacion";
}

function buildModifiableFactors(input: AlopeciaInput): string[] {
  const factors: string[] = [];
  if (input.stress_level >= 6)
    factors.push(`Estrés crónico elevado (${input.stress_level}/10)`);
  if (input.smoker) factors.push("Hábito tabáquico (vasoconstricción capilar)");
  if (input.diet_quality === "deficiente" || input.diet_quality === "regular")
    factors.push("Calidad de dieta mejorable");
  const realDef = input.known_deficiencies.filter((d) => d !== "ninguna");
  if (realDef.length > 0)
    factors.push(
      `Déficits nutricionales: ${realDef.map((d) => d.replace("_", " ")).join(", ")}`
    );
  if (input.scalp_condition === "seborreico")
    factors.push("Cuero cabelludo seborreico (inflamación subcrónica)");
  if (input.scalp_condition === "psoriasis")
    factors.push("Psoriasis en cuero cabelludo (inflamación folicular)");
  return factors;
}

function buildNonModifiableFactors(input: AlopeciaInput): string[] {
  const factors: string[] = [];
  if (input.father_bald)
    factors.push("Alopecia paterna (carga genética autosómica)");
  if (input.mother_father_bald)
    factors.push("Abuelo materno calvo (variante AR en cromosoma X)");
  if (input.siblings_bald)
    factors.push("Hermanos afectados (penetrancia alta en tu familia)");
  if (input.hairloss_onset_age && input.hairloss_onset_age < 25)
    factors.push(
      `Inicio precoz (${input.hairloss_onset_age} años) — señal de alta susceptibilidad androgénica`
    );
  factors.push("Sensibilidad folicular a DHT (genéticamente determinada)");
  return factors;
}

function buildEvidenceOptions(
  input: AlopeciaInput
): AlopeciaTreatmentOption[] {
  const hamilton = input.hamilton_self_reported ?? 0;
  const ludwig = input.ludwig_self_reported ?? 0;
  const options: AlopeciaTreatmentOption[] = [];

  // Minoxidil tópico — primera línea ambos sexos
  if (
    input.sex === "male"
      ? hamilton >= 1 && hamilton <= 5
      : ludwig >= 1 && ludwig <= 2
  ) {
    options.push({
      id: "minoxidil_topical",
      name: "Minoxidil tópico (2-5%)",
      evidence_level: "A",
      type: "farmacologico",
      realistic_expectation:
        "Pausa la progresión mientras se usa. Requiere uso continuo indefinido.",
    });
  }

  // Minoxidil oral — para todos los estadios
  options.push({
    id: "minoxidil_oral",
    name: "Minoxidil oral (low-dose) — solo con prescripción médica",
    evidence_level: "B",
    type: "farmacologico",
    realistic_expectation:
      "Mayor cobertura que tópico. Requiere supervisión médica por hipotensión e hipertricosis.",
  });

  // Finasterida — solo hombres, estadios 1-4
  if (input.sex === "male" && hamilton >= 1 && hamilton <= 4) {
    options.push({
      id: "finasterida",
      name: "Finasterida (1 mg/día) — solo con prescripción médica",
      evidence_level: "A",
      type: "farmacologico",
      realistic_expectation:
        "Frena la progresión en el 83% de los hombres. Discutir riesgos con médico.",
    });
  }

  // PRP — estadios leve-moderado
  if (
    (input.sex === "male" && hamilton >= 1 && hamilton <= 4) ||
    (input.sex === "female" && ludwig >= 1 && ludwig <= 2)
  ) {
    options.push({
      id: "prp",
      name: "PRP (plasma rico en plaquetas)",
      evidence_level: "B",
      type: "procedimiento",
      realistic_expectation:
        "Coadyuvante eficaz. No reemplaza tratamiento farmacológico en estadios moderados.",
    });
  }

  // Trasplante — estadios avanzados
  if (
    (input.sex === "male" && hamilton >= 3) ||
    (input.sex === "female" && ludwig >= 2)
  ) {
    options.push({
      id: "fue_transplant",
      name: "Trasplante capilar FUE",
      evidence_level: "B",
      type: "procedimiento",
      realistic_expectation:
        "El pelo trasplantado es permanente; el nativo no. Combinar con tratamiento médico.",
    });
  }

  // Ketoconazol — coadyuvante
  options.push({
    id: "ketoconazole_shampoo",
    name: "Champú de ketoconazol 2%",
    evidence_level: "B",
    type: "cosmético",
    realistic_expectation:
      "Coadyuvante útil, especialmente con cuero cabelludo seborreico.",
  });

  return options;
}

function buildMythAlerts(input: AlopeciaInput): string[] {
  const myths: string[] = [];
  if (input.mother_father_bald && !input.father_bald)
    myths.push(
      '"La calvicie viene solo del abuelo materno" — es el locus principal pero hay 63+ genes implicados, incluyendo paternos'
    );
  if (input.stress_level >= 7)
    myths.push(
      '"El estrés causa calvicie permanente" — el estrés causa efluvio telógeno (reversible), que es distinto a la AGA genética'
    );
  if (input.current_treatments.includes("finasterida") && input.sex === "male")
    myths.push(
      '"El minoxidil/finasterida son para siempre sin efectos" — funcionan mientras se usan y tienen efectos secundarios documentados'
    );
  if (
    (input.sex === "male" && (input.hamilton_self_reported ?? 0) >= 3) ||
    (input.sex === "female" && (input.ludwig_self_reported ?? 0) >= 2)
  )
    myths.push(
      '"El trasplante no necesita mantenimiento" — el pelo nativo sigue cayendo sin tratamiento médico coadyuvante'
    );
  return myths;
}

function buildEstimatedProgression(
  input: AlopeciaInput,
  riskLevel: AlopeciaRiskLevel,
  riskType: AlopeciaRiskType
): string {
  if (riskLevel === "bajo") {
    return "Con tu perfil actual, el riesgo de progresión significativa en los próximos 5 años es bajo. Monitoriza cambios anuales y consulta si aparece pérdida visible.";
  }
  if (riskType === "ambiental_reversible") {
    return "Tu pérdida parece influida principalmente por factores modificables. Actuar sobre ellos (estrés, nutrición, hábitos) puede ralentizar significativamente o revertir parte de la caída. Descarta causas médicas con un análisis.";
  }
  if (riskLevel === "moderado") {
    return "Sin intervención, es probable una progresión gradual en los próximos 3-7 años. Los tratamientos de primera línea en esta fase tienen mayor probabilidad de éxito que en estadios avanzados.";
  }
  if (riskLevel === "alto") {
    return "La progresión activa requiere evaluación profesional. Los tratamientos son más eficaces iniciados ahora que cuando la pérdida es más avanzada. La ventana de acción óptima es la actual.";
  }
  return "Progresión significativa probable sin tratamiento. La evaluación dermatológica urgente permite determinar el protocolo más eficaz para tu perfil específico antes de que se reduzca la zona donante para trasplante.";
}

function buildRealisticExpectations(
  input: AlopeciaInput,
  riskType: AlopeciaRiskType
): string {
  if (riskType === "genetico_predominante") {
    return "Con tu perfil genético, los tratamientos pueden pausar la progresión, no revertirla. La ventana de acción más eficaz es ahora, antes de que los folículos miniaturizados sean irreversibles.";
  }
  if (riskType === "ambiental_reversible") {
    return "Al no existir una carga genética dominante, corregir los factores modificables puede producir mejoras reales en densidad y calidad capilar. El pronóstico con cambios de hábitos es favorable.";
  }
  return "Tu alopecia tiene componentes tanto genéticos como ambientales. Actuar sobre los factores modificables mejorará la respuesta a los tratamientos farmacológicos.";
}

// ── Función principal ──────────────────────────────────────────────────────────

export function generateAlopeciaReport(input: AlopeciaInput): AlopeciaReport {
  const geneticScore = buildGeneticScore(input);
  const onsetScore = buildOnsetScore(input);
  const externalScore = buildExternalScore(input);
  const riskScore = Math.min(geneticScore + onsetScore + externalScore, 100);

  const riskLevel = classifyRiskLevel(riskScore);
  const riskType = classifyRiskType(geneticScore, externalScore);
  const recommendedAction = determineRecommendedAction(input, riskLevel);

  const possibleHormonalCause =
    input.sex === "female" &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada" ||
      (input.ludwig_self_reported !== null && input.ludwig_self_reported >= 2));

  const finasteridaContraindicationAlert =
    input.sex === "female" &&
    input.current_treatments.includes("finasterida");

  return {
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_type: riskType,
    estimated_progression: buildEstimatedProgression(input, riskLevel, riskType),
    modifiable_factors: buildModifiableFactors(input),
    non_modifiable_factors: buildNonModifiableFactors(input),
    recommended_action: recommendedAction,
    evidence_based_options: buildEvidenceOptions(input),
    realistic_expectations: buildRealisticExpectations(input, riskType),
    myth_alerts: buildMythAlerts(input),
    possible_hormonal_cause: possibleHormonalCause,
    finasterida_contraindication_alert: finasteridaContraindicationAlert,
    _genetic_score: geneticScore,
    _onset_score: onsetScore,
    _external_score: externalScore,
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/generateAlopeciaReport.ts
git commit -m "feat: add alopecia risk algorithm (pure TypeScript, 0 side effects)"
```

---

## Task 6: Routing — App.tsx + AlopeciaAnalyzerPage.tsx

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/AlopeciaAnalyzerPage.tsx`

**Step 1: Añadir lazy import en App.tsx**

Después de la línea de `CanicieAnalyzerPage`, añadir:
```typescript
const AlopeciaAnalyzerPage = lazy(() => import('./pages/AlopeciaAnalyzerPage'));
```

**Step 2: Añadir Route en AnimatedRoutes**

Después de la route de `/analizador-canicie`:
```tsx
<Route path="/analizador-alopecia" element={<AlopeciaAnalyzerPage />} />
```

**Step 3: Crear AlopeciaAnalyzerPage.tsx**

```tsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import AlopeciaAnalyzer from "@/components/AlopeciaAnalyzer";
import AlopeciaExpertVerdict from "@/components/AlopeciaExpertVerdict";

export default function AlopeciaAnalyzerPage() {
  return (
    <>
      <Helmet>
        <title>Analizador de Riesgo de Alopecia — GuiaDelSalon</title>
        <meta
          name="description"
          content="¿Perderé el pelo? Análisis de riesgo de alopecia basado en genética, biología y factores modificables. Sin falsas promesas — solo ciencia."
        />
        <link rel="canonical" href="https://guiadelsalon.com/analizador-alopecia" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#C4A97D] mb-4 font-medium">
              Tricología · Genética · Evidencia
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D2218] mb-6 leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Analizador de Riesgo
              <br />
              <span className="text-[#C4A97D]">de Alopecia</span>
            </h1>
            <p className="text-lg md:text-xl text-[#2D2218]/70 max-w-2xl mx-auto leading-relaxed">
              ¿Perderé el pelo? La genética, la biología y los factores
              modificables de tu calvicie — explicados sin rodeos.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#F5F0E8] min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <AlopeciaAnalyzer />
        </div>
      </div>

      {/* Expert Verdict */}
      <AlopeciaExpertVerdict />
    </>
  );
}
```

**Step 4: Commit**

```bash
git add src/App.tsx src/pages/AlopeciaAnalyzerPage.tsx
git commit -m "feat: add /analizador-alopecia route and page wrapper"
```

---

## Task 7: AlopeciaAnalyzer.tsx — Componente principal

**Files:**
- Create: `src/components/AlopeciaAnalyzer.tsx`

**Referencia:** Seguir exactamente el patrón de `src/components/CanicieAnalyzer.tsx` (1109 líneas).

**Estructura del componente (3 secciones con tabs/stepper):**

### Sección 1 — Biblioteca científica (3 tabs)

```
Tab "Causas y Biología":
  → useQuery('alopecia_factors')
  → filtros: applies_to (todos/hombres/mujeres), category
  → Cards con: factor_name, factor_simple, badge EvidenceLevel,
    badge Modifiable/No modifiable, badge applies_to
  → Al expandir: factor_technical + sources

Tab "Tratamientos":
  → useQuery('alopecia_treatments')
  → Filtros: sex, stage hamilton (1-7), stage ludwig (1-3), type
  → Tabla: Tratamiento | Evidencia | Estadios eficaz | Tiempo | Coste ES | Mantenimiento
  → Filtro activo filtra effective_stages_hamilton/ludwig

Tab "Mitos vs. Ciencia":
  → useQuery('alopecia_myths')
  → 🔴 MITO | 🟡 PARCIALMENTE CIERTO | 🟢 CONFIRMADO
  → verdict_simple en card, scientific_explanation en expand
  → study_reference como footnote
```

### Sección 2 — Formulario stepper (4 pasos)

```
Paso 1 — Perfil básico:
  - age: input[type=number] (18-75)
  - sex: toggle "Hombre"/"Mujer" con estilos distintos (M: azul, F: rosa/morado)
  - current_hairloss_stage: 4 opciones visuales con descripción

Paso 2 — Historial familiar:
  - father_bald: checkbox visual grande
  - mother_father_bald: checkbox visual + tooltip explicativo del mito
  - siblings_bald: checkbox visual
  - hairloss_onset_age: input numérico (si stage != 'ninguna')
  - Guía textual Hamilton-Norwood (hombres) o Ludwig (mujeres)
    con badge de color por estadio:
    I 🟢 / II 🟡 / III ⚠️ / IV-VII 🔴 (Hamilton)
    I 🟡 / II ⚠️ / III 🔴 (Ludwig)
  - hamilton_self_reported o ludwig_self_reported según sex

Paso 3 — Hábitos y salud:
  - stress_level: slider 1-10 con color reactivo
  - diet_quality: select (4 opciones)
  - smoker: toggle
  - known_deficiencies: checkboxes múltiples (hierro, vitamina_d, zinc, ninguna)
  - scalp_condition: select (4 opciones con descripción)

Paso 4 — Tratamientos actuales:
  - current_treatments: checkboxes múltiples con descripción de cada opción
  - ALERTA INMEDIATA si sex=female + finasterida seleccionada:
    → Banner rojo bloqueante con texto:
      "⚠️ Contraindicación absoluta: La finasterida está contraindicada
       en mujeres. Ver ficha técnica EMA."
    → Deshabilitar botón "Generar Informe"
```

### Sección 3 — Informe de riesgo

```
REGLA CRÍTICA: Si risk_level = "muy_alto" y recommended_action = "dermatologo_urgente"
→ Mostrar CTA médico ANTES del informe completo (no al final)

Layout del informe (ver spec para ASCII art):
1. Score circular en gold + nivel de riesgo con badge color
2. Tipo de riesgo
3. Estadio actual (si autodiagnosticado)
4. Factores modificables (✅ verde)
5. Factores no modificables (⚠️ ámbar)
6. Opciones con evidencia para su perfil
7. Mitos frecuentes en su perfil
8. Expectativa realista (texto en cursiva)

Disclaimer legal siempre visible:
"Este análisis es orientativo y no constituye diagnóstico médico.
 Consulta con un dermatólogo o tricólogo para evaluación clínica."

Botón "Descargar Informe PDF":
→ onClick: window.print()
→ Estilos @media print en JSX (display: none para nav, hero, biblioteca)
```

**Notas de implementación:**

1. **Estado del formulario:** usar `useState` con objeto `AlopeciaInput` inicializado con defaults
2. **Guardado en Supabase:** `useMutation` → insert en `alopecia_reports` con `session_id` de `localStorage`
3. **Cálculo del informe:** llamar `generateAlopeciaReport(formData)` en el cliente, sin API call
4. **Animaciones:** `motion.div whileInView viewport={{once:true}}` para biblioteca; `AnimatePresence` para transiciones de pasos

**Patrones de código clave a copiar de CanicieAnalyzer.tsx:**
- `getOrCreateSessionId()` → copiar verbatim
- `EvidenceBadge` → copiar y adaptar
- `useQuery` pattern para tablas públicas
- `useMutation` pattern para `canicie_reports` → adaptar a `alopecia_reports`

**Step: Commit tras completar**

```bash
git add src/components/AlopeciaAnalyzer.tsx
git commit -m "feat: add AlopeciaAnalyzer component (library, form stepper, risk report)"
```

---

## Task 8: AlopeciaExpertVerdict.tsx

**Files:**
- Create: `src/components/AlopeciaExpertVerdict.tsx`

**Referencia:** `src/components/CanicieExpertVerdict.tsx` (239 líneas)

**Estructura:**

```tsx
// Fondo: #2D2218 (espresso), texto cream #F5F0E8, detalles gold #C4A97D
// 3 párrafos sobre:
//   1. La importancia de actuar en el estadio correcto
//   2. Lo que la ciencia puede y no puede hacer en 2026
//   3. Contexto español: prevalencia, acceso, costes SNS vs. privado
// Bibliografía APA 7ª ed. con todos los DOIs
// Párrafo Cizura (ver spec)
```

**Step: Commit tras completar**

```bash
git add src/components/AlopeciaExpertVerdict.tsx
git commit -m "feat: add AlopeciaExpertVerdict with expert content and Cizura mention"
```

---

## Task 9: alopecia_research.md

**Files:**
- Create: `docs/alopecia_research.md`

Este archivo se crea como resultado de la Tarea 1 (investigación). Si ya existe, verificar que cubre los 5 bloques A-E del spec con fuentes APA correctas y DOIs verificados.

**Step: Commit**

```bash
git add docs/alopecia_research.md
git commit -m "docs: add alopecia research document with verified APA sources"
```

---

## Task 10: Verificación final

**Step 1:** `npm run build` — confirmar 0 errores TypeScript

**Step 2:** Verificar en browser `/analizador-alopecia`:
- Tab biblioteca carga factores, tratamientos, mitos de Supabase
- Formulario stepper avanza correctamente
- Alerta finasterida+mujer bloquea el formulario
- Informe se genera con score correcto
- PDF print funciona

**Step 3:** Commit final

```bash
git add -A
git commit -m "feat: complete alopecia risk analyzer module (6 deliverables)"
```

---

## Orden de ejecución

```
Task 1 → Task 2 → Task 3 (seed) → Task 4 (tipos) → Task 5 (algoritmo)
→ Task 6 (routing) → Task 7 (AlopeciaAnalyzer) → Task 8 (ExpertVerdict)
→ Task 9 (research.md) → Task 10 (verify)
```

Tasks 1, 5 y 8 son independientes entre sí — pueden trabajarse en paralelo.
Tasks 2, 3 deben ejecutarse en orden (3 depende de que existan las tablas de 2).
Task 7 depende de Tasks 4 y 5.
