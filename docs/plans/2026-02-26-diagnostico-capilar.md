# Diagnóstico Capilar Profesional — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 12-question scientific hair diagnosis quiz that scores cuticle, porosity, elasticity and scalp health, then shows a green/yellow/red traffic-light result with Amazon product recommendations and a contextual Cizura CTA.

**Architecture:** Pure scoring logic in `src/lib/diagnosticoCapilarEngine.ts` (testable in isolation). Single-page component `DiagnosticoCapilarPage.tsx` manages 3 screens (intro → quiz → results). Session data saved to Supabase `hair_diagnostic_sessions` table on completion.

**Tech Stack:** React + TypeScript + Tailwind, Framer Motion (existing), Supabase JS client (`@/integrations/supabase/client`), TanStack Query `useMutation`, Vitest + jsdom (existing test setup)

---

## Task 1: Supabase table

**Files:**
- No files — apply via MCP tool `mcp__supabase-web__apply_migration`

**Step 1: Apply migration**

```sql
CREATE TABLE IF NOT EXISTS hair_diagnostic_sessions (
  id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id        text NOT NULL,
  created_at             timestamptz DEFAULT now(),
  cuticle_score          integer NOT NULL DEFAULT 0,
  porosity_score         integer NOT NULL DEFAULT 0,
  elasticity_score       integer NOT NULL DEFAULT 0,
  scalp_score            integer NOT NULL DEFAULT 0,
  total_score            integer NOT NULL DEFAULT 0,
  risk_level             text NOT NULL CHECK (risk_level IN ('optimal','caution','critical')),
  answers                jsonb NOT NULL DEFAULT '{}',
  cizura_cta_shown       boolean DEFAULT false,
  cizura_cta_clicked     boolean DEFAULT false,
  product_recommendations text[] DEFAULT '{}'
);

ALTER TABLE hair_diagnostic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert"
  ON hair_diagnostic_sessions FOR INSERT TO anon WITH CHECK (true);
```

**Step 2: Verify in Supabase Dashboard**
Table `hair_diagnostic_sessions` appears under Table Editor.

---

## Task 2: Engine — data + scoring logic

**Files:**
- Create: `src/lib/diagnosticoCapilarEngine.ts`
- Create: `src/lib/diagnosticoCapilarEngine.test.ts`

**Step 1: Write failing tests**

```typescript
// src/lib/diagnosticoCapilarEngine.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateScores,
  getRiskLevel,
  QUESTIONS,
  CIZURA_BRIDGE,
  getProductRecommendations,
} from './diagnosticoCapilarEngine';

describe('QUESTIONS', () => {
  it('has 12 questions', () => expect(QUESTIONS).toHaveLength(12));
  it('has 4 modules numbered 1-4', () => {
    const modules = [...new Set(QUESTIONS.map(q => q.module))].sort();
    expect(modules).toEqual([1, 2, 3, 4]);
  });
  it('every option has non-negative points', () => {
    QUESTIONS.forEach(q =>
      q.options.forEach(o => expect(o.points).toBeGreaterThanOrEqual(0))
    );
  });
});

describe('calculateScores', () => {
  it('returns zero scores for all-A answers', () => {
    const allA: Record<string, string> = {};
    QUESTIONS.forEach(q => { allA[q.id] = 'A'; });
    const s = calculateScores(allA);
    expect(s.total).toBe(0);
    expect(s.cuticle).toBe(0);
    expect(s.porosity).toBe(0);
    expect(s.elasticity).toBe(0);
    expect(s.scalp).toBe(0);
  });

  it('total equals sum of module scores', () => {
    const allA: Record<string, string> = {};
    QUESTIONS.forEach(q => { allA[q.id] = 'A'; });
    const s = calculateScores(allA);
    expect(s.total).toBe(s.cuticle + s.porosity + s.elasticity + s.scalp);
  });

  it('partial answers skip unanswered questions (treat as 0)', () => {
    const s = calculateScores({});
    expect(s.total).toBe(0);
  });
});

describe('getRiskLevel', () => {
  it('0-15 → optimal', () => expect(getRiskLevel(0)).toBe('optimal'));
  it('15 → optimal', () => expect(getRiskLevel(15)).toBe('optimal'));
  it('16 → caution', () => expect(getRiskLevel(16)).toBe('caution'));
  it('35 → caution', () => expect(getRiskLevel(35)).toBe('caution'));
  it('36 → critical', () => expect(getRiskLevel(36)).toBe('critical'));
  it('67 → critical', () => expect(getRiskLevel(67)).toBe('critical'));
});

describe('getProductRecommendations', () => {
  it('returns exactly 3 products for each level', () => {
    expect(getProductRecommendations('optimal')).toHaveLength(3);
    expect(getProductRecommendations('caution')).toHaveLength(3);
    expect(getProductRecommendations('critical')).toHaveLength(3);
  });
  it('each product has asin, name, description', () => {
    getProductRecommendations('caution').forEach(p => {
      expect(p.asin).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
    });
  });
});

describe('CIZURA_BRIDGE', () => {
  it('has text for all 3 levels', () => {
    expect(CIZURA_BRIDGE.optimal).toBeTruthy();
    expect(CIZURA_BRIDGE.caution).toBeTruthy();
    expect(CIZURA_BRIDGE.critical).toBeTruthy();
  });
});
```

**Step 2: Run to confirm failures**

```bash
cd C:/Users/david/pro-hair-picks && npm test -- --reporter=verbose 2>&1 | tail -20
```
Expected: multiple FAIL lines.

**Step 3: Implement engine**

```typescript
// src/lib/diagnosticoCapilarEngine.ts

export type RiskLevel = 'optimal' | 'caution' | 'critical';
export type ModuleId  = 1 | 2 | 3 | 4;

export interface QuestionOption {
  label:  string;  // 'A' | 'B' | 'C' | 'D' | 'E'
  text:   string;
  points: number;
}

export interface Question {
  id:          string;
  module:      ModuleId;
  moduleName:  string;
  question:    string;
  protocol?:   string;
  options:     QuestionOption[];
}

export interface Scores {
  cuticle:    number;  // Module 1 max 12
  porosity:   number;  // Module 2 max 20
  elasticity: number;  // Module 3 max 21
  scalp:      number;  // Module 4 max 12
  total:      number;
}

export interface ProductRec {
  name:        string;
  description: string;
  asin:        string;
  tag:         string;
}

// ── Questions ────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // MODULE 1 — INTEGRIDAD DE LA CUTÍCULA (max 12 pts)
  {
    id: 'q1_1', module: 1,
    moduleName: 'Integridad de la Cutícula',
    question: 'Test del Tacto Proximal-Distal',
    protocol: 'Desliza dos dedos desde la punta hacia la raíz. Resistencia = cutícula sellada. Aspereza inmediata = escamas levantadas.',
    options: [
      { label: 'A', text: 'Completamente liso',                   points: 0 },
      { label: 'B', text: 'Ligera aspereza en puntas',            points: 2 },
      { label: 'C', text: 'Aspereza en la mitad del tallo',       points: 4 },
      { label: 'D', text: 'Áspero en toda la longitud',           points: 6 },
    ],
  },
  {
    id: 'q1_2', module: 1,
    moduleName: 'Integridad de la Cutícula',
    question: 'Índice de Brillo Visual',
    options: [
      { label: 'A', text: 'Brillo uniforme, aspecto sano',                    points: 0 },
      { label: 'B', text: 'Brillo solo en zona proximal/raíces',              points: 2 },
      { label: 'C', text: 'Mate generalizado con frizz leve',                 points: 4 },
      { label: 'D', text: 'Completamente mate, sin reflexión',                points: 6 },
    ],
  },
  // MODULE 2 — POROSIDAD CAPILAR (max 20 pts)
  {
    id: 'q2_1', module: 2,
    moduleName: 'Porosidad Capilar',
    question: 'Test de Flotación',
    protocol: 'Toma 3-4 cabellos limpios (sin acondicionador). Deposítalos en un vaso de agua a temperatura ambiente. Observa a los 2-4 minutos.',
    options: [
      { label: 'A', text: 'Flotan tras 4 min (porosidad baja)',             points: 0 },
      { label: 'B', text: 'Se hunden entre 2-4 min (media)',                points: 2 },
      { label: 'C', text: 'Se hunden en menos de 2 min (alta)',             points: 5 },
      { label: 'D', text: 'Se hunden inmediatamente (muy alta)',            points: 7 },
    ],
  },
  {
    id: 'q2_2', module: 2,
    moduleName: 'Porosidad Capilar',
    question: 'Velocidad de Absorción en Mojado',
    options: [
      { label: 'A', text: 'Se moja uniformemente, sin saturación inmediata',  points: 0 },
      { label: 'B', text: 'Absorbe rápido pero se siente suave',              points: 2 },
      { label: 'C', text: 'Absorbe instantáneamente, se siente esponjoso',    points: 4 },
      { label: 'D', text: 'Se empapa y queda rígido al secar',               points: 6 },
    ],
  },
  {
    id: 'q2_3', module: 2,
    moduleName: 'Porosidad Capilar',
    question: 'Historial de Tratamientos Oxidativos',
    options: [
      { label: 'A', text: 'Sin procesos químicos en los últimos 12 meses',              points: 0 },
      { label: 'B', text: '1 coloración/tinte sin decoloración',                        points: 1 },
      { label: 'C', text: 'Decoloración única o permanente',                            points: 3 },
      { label: 'D', text: '2+ decoloraciones o mechas+tinte simultáneos',              points: 6 },
      { label: 'E', text: 'Alisado/permanente + color',                                points: 7 },
    ],
  },
  // MODULE 3 — RESISTENCIA Y ELASTICIDAD (max 21 pts)
  {
    id: 'q3_1', module: 3,
    moduleName: 'Resistencia y Elasticidad',
    question: 'Test de Elasticidad en Mojado',
    protocol: 'Toma un cabello húmedo. Estíralo lentamente 2-3 cm.',
    options: [
      { label: 'A', text: 'Estira y vuelve a su forma sin romperse',                   points: 0 },
      { label: 'B', text: 'Estira pero queda algo más largo al soltar',                points: 2 },
      { label: 'C', text: 'Estira muy poco y se rompe con tensión moderada',           points: 5 },
      { label: 'D', text: 'Se rompe con mínima tensión',                              points: 7 },
    ],
  },
  {
    id: 'q3_2', module: 3,
    moduleName: 'Resistencia y Elasticidad',
    question: 'Frecuencia y Temperatura de Herramientas Térmicas',
    options: [
      { label: 'A', text: 'Sin planchas/rizadores en el día a día',                   points: 0 },
      { label: 'B', text: 'Uso ocasional (<2x semana), con protector térmico',        points: 1 },
      { label: 'C', text: 'Uso frecuente (>3x semana), con protector',                points: 3 },
      { label: 'D', text: 'Uso diario sin protector térmico',                         points: 6 },
    ],
  },
  {
    id: 'q3_3', module: 3,
    moduleName: 'Resistencia y Elasticidad',
    question: 'Cantidad de Rotura Mecánica Observable',
    options: [
      { label: 'A', text: 'Sin roturas visibles, puntas sanas',                       points: 0 },
      { label: 'B', text: 'Pocas puntas abiertas',                                   points: 2 },
      { label: 'C', text: 'Rotura frecuente, puntas abiertas en toda la longitud',   points: 4 },
      { label: 'D', text: 'Rotura en tallo medio (no en puntas): SEÑAL DE ALARMA',   points: 8 },
    ],
  },
  // MODULE 4 — SALUD DEL CUERO CABELLUDO (max 12 pts)
  {
    id: 'q4_1', module: 4,
    moduleName: 'Salud del Cuero Cabelludo',
    question: 'Estado de Producción de Sebo',
    options: [
      { label: 'A', text: 'Cuero cabelludo equilibrado 48h post-lavado',              points: 0 },
      { label: 'B', text: 'Graso a las 24h, cabello limpio > 2 días',                points: 1 },
      { label: 'C', text: 'Graso antes de 12h consistentemente',                     points: 3 },
      { label: 'D', text: 'Muy seco, picor sin grasa aparente',                      points: 3 },
    ],
  },
  {
    id: 'q4_2', module: 4,
    moduleName: 'Salud del Cuero Cabelludo',
    question: 'Síntomas de Barrera Comprometida',
    options: [
      { label: 'A', text: 'Sin síntomas',                                            points: 0 },
      { label: 'B', text: 'Picor ocasional post-lavado',                             points: 1 },
      { label: 'C', text: 'Picor frecuente + descamación leve',                      points: 3 },
      { label: 'D', text: 'Enrojecimiento, descamación o eccema visible',            points: 5 },
    ],
  },
  {
    id: 'q4_3', module: 4,
    moduleName: 'Salud del Cuero Cabelludo',
    question: 'Productos y pH de la Rutina',
    options: [
      { label: 'A', text: 'Usa champús pH-balanceados o específicos',                points: 0 },
      { label: 'B', text: 'Desconoce el pH de sus productos',                        points: 2 },
      { label: 'C', text: 'Usa productos muy espumosos/agresivos',                   points: 4 },
    ],
  },
];

// ── Scoring ──────────────────────────────────────────────────────────────────

export function calculateScores(answers: Record<string, string>): Scores {
  let cuticle = 0, porosity = 0, elasticity = 0, scalp = 0;

  QUESTIONS.forEach(q => {
    const selected = answers[q.id];
    if (!selected) return;
    const opt = q.options.find(o => o.label === selected);
    if (!opt) return;
    if (q.module === 1) cuticle    += opt.points;
    if (q.module === 2) porosity   += opt.points;
    if (q.module === 3) elasticity += opt.points;
    if (q.module === 4) scalp      += opt.points;
  });

  return { cuticle, porosity, elasticity, scalp, total: cuticle + porosity + elasticity + scalp };
}

export function getRiskLevel(total: number): RiskLevel {
  if (total <= 15) return 'optimal';
  if (total <= 35) return 'caution';
  return 'critical';
}

// ── Amazon product recommendations ──────────────────────────────────────────

const TAG = 'guiadelsalo09-21';

const PRODUCTS: Record<RiskLevel, ProductRec[]> = {
  optimal: [
    {
      name: 'Olaplex No.7 Bonding Oil',
      description: 'Aceite protector para fibra sana. Previene el daño térmico y aporta brillo sin pesar.',
      asin: 'B07YM8DWRZ', tag: TAG,
    },
    {
      name: 'Moroccanoil Treatment Original',
      description: 'Tratamiento de mantenimiento con aceite de argán. Ideal para conservar la integridad cuticular.',
      asin: 'B00ILBE2W8', tag: TAG,
    },
    {
      name: 'Kerastase Nutritive Masquintense',
      description: 'Mascarilla nutritiva para cabello sano. Refuerza la 18-MEA y mantiene la hidrofobicidad de la cutícula.',
      asin: 'B01LXLMLOH', tag: TAG,
    },
  ],
  caution: [
    {
      name: 'Olaplex No.3 Hair Perfector',
      description: 'Bond builder de referencia. Reconstruye los puentes disulfuro rotos antes de cualquier proceso oxidativo.',
      asin: 'B07SVCNFMD', tag: TAG,
    },
    {
      name: 'Redken Acidic Bonding Concentrate',
      description: 'Champú pH-ácido que sella la cutícula y estabiliza la porosidad tras tratamientos químicos.',
      asin: 'B09VQDTK4S', tag: TAG,
    },
    {
      name: 'Schwarzkopf Fibreplex No.2',
      description: 'Tono de mantenimiento en casa para el protocolo FIBREPLEX. Refuerza los enlaces de fibra.',
      asin: 'B09F1NS9GW', tag: TAG,
    },
  ],
  critical: [
    {
      name: 'K18 Leave-In Molecular Repair Mask',
      description: 'Péptido bioactivo que repara las cadenas de queratina dañadas desde el interior del córtex. Sin aclarado.',
      asin: 'B09J7Y3ZFH', tag: TAG,
    },
    {
      name: 'Olaplex No.0 + No.3 System',
      description: 'Sistema de reconstrucción intensiva en dos pasos. Protocolo estándar para daño severo de puentes disulfuro.',
      asin: 'B08FKXLRJ1', tag: TAG,
    },
    {
      name: 'Philip Kingsley Bond Builder',
      description: 'Champú ultrasuave para cuero cabelludo sensible y fibra críticamente dañada. Fórmula sin sulfatos agresivos.',
      asin: 'B092CXLZ5P', tag: TAG,
    },
  ],
};

export function getProductRecommendations(level: RiskLevel): ProductRec[] {
  return PRODUCTS[level];
}

// ── Cizura Bridge ────────────────────────────────────────────────────────────

export const CIZURA_BRIDGE: Record<RiskLevel, string> = {
  optimal:  'Tu cabello está en perfecto estado. ¿Tu agenda también lo está? Los clientes con cabello sano son los que más repiten tratamientos premium.',
  caution:  'Necesitas 4-6 semanas de tratamiento antes de decolorar. Con Cizura puedes programar el seguimiento automático para ese cliente —sin perder la cita ni el servicio.',
  critical: 'Este diagnóstico acaba de salvarte de una rotura en silla. Documenta este análisis en la ficha del cliente con Cizura: protección legal + historial de tratamientos en tiempo real.',
};
```

**Step 4: Run tests to confirm they pass**

```bash
cd C:/Users/david/pro-hair-picks && npm test -- --reporter=verbose 2>&1 | grep -E "PASS|FAIL|✓|✗"
```
Expected: all green.

**Step 5: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/lib/diagnosticoCapilarEngine.ts src/lib/diagnosticoCapilarEngine.test.ts
git commit -m "feat: diagnostico capilar engine — questions, scoring, risk levels, products"
```

---

## Task 3: Page component

**Files:**
- Create: `src/pages/DiagnosticoCapilarPage.tsx`

**Step 1: Create the page**

Full component — three screens managed via local state (`intro` → `quiz` → `results`):

```tsx
// src/pages/DiagnosticoCapilarPage.tsx
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, FlaskConical, RotateCcw, ExternalLink } from 'lucide-react';
import {
  QUESTIONS,
  calculateScores,
  getRiskLevel,
  getProductRecommendations,
  CIZURA_BRIDGE,
  type RiskLevel,
  type Scores,
} from '@/lib/diagnosticoCapilarEngine';

// ── Session ID (anon) ────────────────────────────────────────────────────────
function getSessionId(): string {
  const key = 'diag_session_id';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

// ── Risk level config ────────────────────────────────────────────────────────
const RISK_CONFIG = {
  optimal:  { emoji: '🟢', label: 'ÓPTIMO',    range: '0-15 pts',  color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
  caution:  { emoji: '🟡', label: 'PRECAUCIÓN', range: '16-35 pts', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  critical: { emoji: '🔴', label: 'CRÍTICO',    range: '36+ pts',   color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30' },
};

const MODULE_LABELS = ['', 'Cutícula', 'Porosidad', 'Elasticidad', 'Cuero Cabelludo'];
const MODULE_MAX    = [0, 12, 20, 21, 12];

// ── Intro Screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center px-4 py-16"
    >
      <div className="text-6xl mb-6">🔬</div>
      <Badge variant="secondary" className="mb-4">Diagnóstico Científico</Badge>
      <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
        Diagnóstico Capilar <span className="text-secondary">Profesional</span>
      </h1>
      <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
        12 preguntas basadas en parámetros clínicos validados: integridad cuticular, porosidad,
        elasticidad del córtex y salud del cuero cabelludo.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {['Cutícula', 'Porosidad', 'Elasticidad', 'Cuero Cabelludo'].map(m => (
          <div key={m} className="bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground">
            <FlaskConical className="w-4 h-4 mx-auto mb-1 text-secondary" />
            {m}
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onStart} className="gap-2 font-bold px-8">
        Comenzar diagnóstico <ArrowRight className="w-4 h-4" />
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        ~4 minutos · Sin registro · Protocolo clínico aplicado
      </p>
    </motion.div>
  );
}

// ── Quiz Screen ──────────────────────────────────────────────────────────────
function QuizScreen({
  questionIndex,
  answers,
  onAnswer,
  onBack,
}: {
  questionIndex: number;
  answers: Record<string, string>;
  onAnswer: (questionId: string, label: string) => void;
  onBack: () => void;
}) {
  const q = QUESTIONS[questionIndex];
  const progress = ((questionIndex) / QUESTIONS.length) * 100;
  const selected = answers[q.id];

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-4 py-10"
    >
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Módulo {q.module}: {q.moduleName}</span>
          <span>{questionIndex + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="font-display text-2xl text-foreground mb-2">{q.question}</h2>
      {q.protocol && (
        <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-3 mb-6 leading-relaxed">
          🧪 <strong>Protocolo:</strong> {q.protocol}
        </p>
      )}

      {/* Options */}
      <div className="space-y-3 mb-8">
        {q.options.map(opt => (
          <button
            key={opt.label}
            onClick={() => onAnswer(q.id, opt.label)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
              selected === opt.label
                ? 'border-secondary bg-secondary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-secondary/50 hover:text-foreground'
            }`}
          >
            <span className="font-bold text-secondary mr-3">{opt.label}</span>
            {opt.text}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>
        {selected && (
          <Button size="sm" onClick={() => onAnswer(q.id, selected)} className="gap-1.5">
            {questionIndex < QUESTIONS.length - 1 ? 'Siguiente' : 'Ver resultado'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({
  scores,
  riskLevel,
  onRetry,
  onCizuraClick,
}: {
  scores: Scores;
  riskLevel: RiskLevel;
  onRetry: () => void;
  onCizuraClick: () => void;
}) {
  const cfg = RISK_CONFIG[riskLevel];
  const products = getProductRecommendations(riskLevel);
  const cizuraText = CIZURA_BRIDGE[riskLevel];
  const AMAZON_TAG = 'guiadelsalo09-21';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-10"
    >
      {/* Semaphore */}
      <div className={`rounded-2xl border p-8 text-center mb-8 ${cfg.bg}`}>
        <div className="text-5xl mb-3">{cfg.emoji}</div>
        <div className={`font-display text-3xl font-bold mb-1 ${cfg.color}`}>{cfg.label}</div>
        <div className="text-muted-foreground text-sm">{cfg.range} · Puntuación total: <strong>{scores.total}</strong></div>
      </div>

      {/* Module breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {([1, 2, 3, 4] as const).map(m => {
          const key = m === 1 ? 'cuticle' : m === 2 ? 'porosity' : m === 3 ? 'elasticity' : 'scalp';
          const score = scores[key as keyof Scores] as number;
          const max = MODULE_MAX[m];
          const pct = Math.round((score / max) * 100);
          return (
            <div key={m} className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">{MODULE_LABELS[m]}</div>
              <div className="font-bold text-foreground">{score} / {max}</div>
              <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct < 35 ? 'bg-green-400' : pct < 65 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action protocol */}
      <div className={`rounded-xl border p-5 mb-8 ${cfg.bg}`}>
        <h3 className={`font-display font-bold mb-2 ${cfg.color}`}>Protocolo de acción</h3>
        <p className="text-sm text-foreground leading-relaxed">
          {riskLevel === 'optimal' && 'Fibra con integridad cuticular y cortical preservada. Apta para cualquier proceso químico o térmico con resultados predecibles. Tiempo de exposición estándar.'}
          {riskLevel === 'caution' && 'Daño moderado en cutícula y posible inicio de compromiso del córtex. Bond builder obligatorio (Olaplex/FIBREPLEX). Test de mecha previo. Reducir tiempo de exposición 15-20%.'}
          {riskLevel === 'critical' && 'Compromiso severo de puentes disulfuro y porosidad extrema. Denegar proceso oxidativo inmediato. Protocolo de reconstrucción mínimo 4-6 semanas previas.'}
        </p>
      </div>

      {/* Amazon recommendations */}
      <h3 className="font-display text-xl text-foreground mb-4">Productos recomendados</h3>
      <div className="space-y-3 mb-8">
        {products.map(p => (
          <a
            key={p.asin}
            href={`https://amazon.es/dp/${p.asin}?tag=${p.tag}`}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-secondary/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm group-hover:text-secondary transition-colors">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</div>
            </div>
            <div className="shrink-0 text-xs text-secondary font-medium flex items-center gap-1 whitespace-nowrap">
              Ver precio <ExternalLink className="w-3 h-3" />
            </div>
          </a>
        ))}
      </div>

      {/* Cizura Bridge CTA */}
      <div className="rounded-xl border border-secondary/30 bg-accent/40 p-5 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">✂️</span>
          <div>
            <p className="text-sm text-foreground leading-relaxed">{cizuraText}</p>
            <Button
              size="sm"
              className="mt-3 font-bold"
              onClick={onCizuraClick}
              asChild
            >
              <a href="https://cizura.app" target="_blank" rel="noopener noreferrer">
                Probar Cizura gratis
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Retry */}
      <div className="text-center">
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Repetir diagnóstico
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
type Screen = 'intro' | 'quiz' | 'results';

const DiagnosticoCapilarPage = () => {
  const [screen, setScreen]     = useState<Screen>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers]   = useState<Record<string, string>>({});

  const scores    = calculateScores(answers);
  const riskLevel = getRiskLevel(scores.total);

  // Save session to Supabase
  const saveMutation = useMutation({
    mutationFn: async (payload: {
      scores: typeof scores;
      riskLevel: RiskLevel;
      answers: Record<string, string>;
    }) => {
      const products = getProductRecommendations(payload.riskLevel);
      await supabase.from('hair_diagnostic_sessions').insert({
        user_session_id:       getSessionId(),
        cuticle_score:         payload.scores.cuticle,
        porosity_score:        payload.scores.porosity,
        elasticity_score:      payload.scores.elasticity,
        scalp_score:           payload.scores.scalp,
        total_score:           payload.scores.total,
        risk_level:            payload.riskLevel,
        answers:               payload.answers,
        cizura_cta_shown:      true,
        product_recommendations: products.map(p => p.asin),
      });
    },
  });

  const handleAnswer = useCallback((questionId: string, label: string) => {
    const updated = { ...answers, [questionId]: label };
    setAnswers(updated);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      const finalScores = calculateScores(updated);
      const level = getRiskLevel(finalScores.total);
      setScreen('results');
      saveMutation.mutate({ scores: finalScores, riskLevel: level, answers: updated });
    }
  }, [answers, currentQ, saveMutation]);

  const handleBack = useCallback(() => {
    if (currentQ === 0) setScreen('intro');
    else setCurrentQ(q => q - 1);
  }, [currentQ]);

  const handleRetry = useCallback(() => {
    setAnswers({});
    setCurrentQ(0);
    setScreen('intro');
  }, []);

  const handleCizuraClick = useCallback(async () => {
    // Best-effort update; no await needed
    const sessionId = getSessionId();
    supabase
      .from('hair_diagnostic_sessions')
      .update({ cizura_cta_clicked: true })
      .eq('user_session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
  }, []);

  return (
    <section className="min-h-screen bg-background">
      <Helmet>
        <title>Diagnóstico Capilar Profesional | Guía del Salón</title>
        <meta name="description" content="Test científico de 12 preguntas para evaluar la integridad capilar: cutícula, porosidad, elasticidad y cuero cabelludo. Resultado inmediato con protocolo profesional." />
      </Helmet>

      <AnimatePresence mode="wait">
        {screen === 'intro' && (
          <IntroScreen key="intro" onStart={() => setScreen('quiz')} />
        )}
        {screen === 'quiz' && (
          <QuizScreen
            key={`q-${currentQ}`}
            questionIndex={currentQ}
            answers={answers}
            onAnswer={handleAnswer}
            onBack={handleBack}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            key="results"
            scores={scores}
            riskLevel={riskLevel}
            onRetry={handleRetry}
            onCizuraClick={handleCizuraClick}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default DiagnosticoCapilarPage;
```

**Step 2: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/DiagnosticoCapilarPage.tsx
git commit -m "feat: diagnostico capilar page — intro, quiz, results + Cizura CTA"
```

---

## Task 4: Route + Nav integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Navbar.tsx`

**Step 1: Add lazy import + route in App.tsx**

After the existing `const ColorMatchPage = lazy(...)` line, add:
```tsx
const DiagnosticoCapilarPage = lazy(() => import('./pages/DiagnosticoCapilarPage'));
```

Inside `<Routes>`, after the `/asesor-color` route, add:
```tsx
<Route path="/diagnostico-capilar" element={<DiagnosticoCapilarPage />} />
```

**Step 2: Add nav link in Navbar.tsx**

In both the desktop nav and the mobile menu, add a link next to the existing `🎨 asesor-color` button. Pattern to follow (desktop, after the asesor-color Link):
```tsx
<Link
  to="/diagnostico-capilar"
  className="px-3 py-1.5 text-sm font-bold text-secondary-foreground bg-secondary/20 border border-secondary/40 hover:bg-secondary/30 rounded-md transition-colors"
>
  🔬 Diagnóstico Capilar
</Link>
```

Mobile menu (after the asesor-color mobile link):
```tsx
<Link
  to="/diagnostico-capilar"
  onClick={() => setMobileOpen(false)}
  className="block px-2 py-2 font-display font-semibold text-secondary hover:text-secondary/80 transition-colors"
>
  🔬 Diagnóstico Capilar
</Link>
```

**Step 3: Verify in browser**

```bash
cd C:/Users/david/pro-hair-picks && npm run dev
```

Navigate to `http://localhost:8080/diagnostico-capilar` — confirm intro screen renders.

**Step 4: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/App.tsx src/components/Navbar.tsx
git commit -m "feat: add /diagnostico-capilar route and nav link"
```

---

## Task 5: Homepage CTA card (Bento section)

**Files:**
- Modify: `src/components/BentoTools.tsx` (or wherever the quiz card lives — search `bento.quiz` in components)
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`

**Step 1: Add i18n keys to es.ts** (inside the existing `bento:` block or as a new `diagnostico:` key):

```ts
diagnostico: {
  navLabel:    'Diagnóstico Capilar',
  bentoTitle:  'Diagnóstico Capilar',
  bentoDesc:   'Test científico de 12 preguntas. Evalúa cutícula, porosidad, elasticidad y cuero cabelludo.',
  bentoCta:    'Iniciar diagnóstico',
},
```

**Step 2: Add same keys to en.ts**:
```ts
diagnostico: {
  navLabel:    'Hair Diagnosis',
  bentoTitle:  'Hair Diagnosis',
  bentoDesc:   'Science-based 12-question test. Assess cuticle, porosity, elasticity and scalp health.',
  bentoCta:    'Start diagnosis',
},
```

**Step 3: Find bento component and add card**

Search for the file using: `grep -r "bento.quiz" src/ --include="*.tsx" -l`

Add a card using the same visual pattern as the existing `quiz` card, linking to `/diagnostico-capilar`.

**Step 4: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/i18n/es.ts src/i18n/en.ts src/components/BentoTools.tsx
git commit -m "feat: diagnostico capilar bento card + i18n keys"
```

---

## Task 6: Bibliography section in Results

**Files:**
- Modify: `src/pages/DiagnosticoCapilarPage.tsx` — add inside `ResultsScreen`, after the Cizura CTA

**Step 1: Add bibliography array and section**

```tsx
const BIBLIOGRAPHY = [
  { num: 1, title: 'Porosity and Resistance of Textured Hair', source: 'MDPI Cosmetics, 12(3):93', year: 2025 },
  { num: 2, title: 'Update on hair fiber assessment', source: 'Surgical & Cosmetic Dermatology', year: 2022 },
  { num: 3, title: 'On Hair Care Physicochemistry', source: 'PMC / Polymers Journal', year: 2023 },
  { num: 4, title: 'The shampoo pH can affect the hair: myth or reality?', source: 'Int J Trichology, 6(3):95-99', year: 2014 },
  { num: 5, title: 'An Overview on Hair Porosity', source: 'NYSCC Society of Cosmetic Chemists', year: 2024 },
];
```

```tsx
{/* Bibliography */}
<details className="mt-4">
  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
    Ver bibliografía científica ({BIBLIOGRAPHY.length} fuentes)
  </summary>
  <ol className="mt-3 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
    {BIBLIOGRAPHY.map(b => (
      <li key={b.num}>{b.title} — <em>{b.source}</em> ({b.year})</li>
    ))}
  </ol>
</details>
```

**Step 2: Final commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/DiagnosticoCapilarPage.tsx
git commit -m "feat: add bibliography to diagnostico results screen"
```

---

## Testing Summary

```bash
# Run all tests at any point
cd C:/Users/david/pro-hair-picks && npm test

# Dev server
npm run dev  # http://localhost:8080/diagnostico-capilar
```

Key flows to verify manually:
1. Intro → click "Comenzar" → question 1 appears with progress bar
2. Answer each question → progress bar advances
3. After question 12 → results screen with semaphore
4. Open Network tab → POST to Supabase `hair_diagnostic_sessions`
5. Click "Probar Cizura gratis" → opens cizura.app
6. Click "Repetir diagnóstico" → back to intro
7. Mobile nav shows 🔬 link
