# Mi Pelo Design System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify the `/mi-pelo` section under a cream/espresso Stitch design system, building 9 shared components and fully rewriting DiagnosticoCapilar + the hub page.

**Architecture:** Shared presentational components in `src/components/mi-pelo/shared/`. DiagnosticoCapilar keeps all business logic untouched (`diagnosticoCapilarEngine.ts`, i18n keys, Supabase save, `useWizardReturn`) — only UI is replaced. MiPeloPage keeps `useAuth` + `useUserDiagnostics` logic.

**Tech Stack:** React 18 + TypeScript + Vite + TailwindCSS 3.4 + Lucide React + Framer Motion + `cn()` from `@/lib/utils`

**Key token decision:** Tailwind's `primary` is a shadcn HSL variable — do NOT rename it. Use `gold` (`#C4A97D`) as the mi-pelo accent throughout all new components.

**Navbar note:** ToolShell has its own sticky header (`z-50`). The global Navbar renders above all pages via App.tsx. Before starting Task 5, check `src/App.tsx` — if tool routes can opt out of the Navbar (via a layout slot or route-level hiding), do so for `/diagnostico-capilar`. If not, remove `sticky` from ToolShell's header so there is no double-header conflict; a non-sticky toolbar still provides navigation context.

---

## Task 1 — Tokens + CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/index.css`

### Step 1: Add 5 new color tokens to tailwind.config.ts

In the `colors` block under `// Bento 2026 palette`, add after `"gold-light"`:

```typescript
// Mi Pelo semantic aliases
"background-light": "#F5F0E8",
"background-dark":  "#2D2218",
// Damage level tokens
"damage-low":  "#4CAF7C",
"damage-med":  "#E4B84A",
"damage-high": "#E06B52",
```

### Step 2: Add CSS to src/index.css

Append at the end of the file:

```css
/* ── Mi Pelo — Custom radio button ─────────────────────────── */
.radio-custom {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 2px solid rgba(196, 169, 125, 0.3);
  border-radius: 9999px;
  cursor: pointer;
  flex-shrink: 0;
}
.radio-custom:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: #C4A97D;
  border-color: #C4A97D;
}
.radio-custom:focus-visible {
  outline: 2px solid #C4A97D;
  outline-offset: 2px;
}

/* ── Mi Pelo — Bento card hover lift ───────────────────────── */
.bento-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(26, 15, 10, 0.10);
}
```

### Step 3: Verify build

```bash
cd C:/Users/david/pro-hair-picks
npx tsc --noEmit
```

Expected: no errors (tokens are just strings, no TS impact).

### Step 4: Commit

```bash
git add tailwind.config.ts src/index.css
git commit -m "feat(mi-pelo): add design system tokens and CSS utilities"
```

---

## Task 2 — ToolShell + ToolHero

**Files:**
- Create: `src/components/mi-pelo/shared/ToolShell.tsx`
- Create: `src/components/mi-pelo/shared/ToolHero.tsx`

### Step 1: Create directory

```bash
mkdir -p "C:/Users/david/pro-hair-picks/src/components/mi-pelo/shared"
```

### Step 2: Create ToolShell.tsx

```tsx
// src/components/mi-pelo/shared/ToolShell.tsx
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolShellProps {
  toolName: string;
  ToolIcon: LucideIcon;
  currentStep?: number;
  totalSteps?: number;
  backLink?: string;
  children: React.ReactNode;
}

export default function ToolShell({
  toolName,
  ToolIcon,
  currentStep,
  totalSteps,
  backLink = '/mi-pelo',
  children,
}: ToolShellProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-sans text-espresso">
      <header className="flex items-center justify-between border-b border-espresso/10 bg-background-light/80 backdrop-blur-md px-6 py-4 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="text-gold">
            <ToolIcon className="w-7 h-7" />
          </div>
          <h2 className="text-espresso text-base font-bold tracking-tight uppercase">
            {toolName}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {currentStep !== undefined && totalSteps !== undefined && (
            <span className="text-xs font-semibold text-espresso/50 uppercase tracking-widest">
              Paso {currentStep} / {totalSteps}
            </span>
          )}
          <Link
            to={backLink}
            aria-label="Cerrar herramienta"
            className="flex items-center justify-center rounded-full h-9 w-9 bg-espresso text-cream transition-transform hover:scale-105"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
```

### Step 3: Create ToolHero.tsx

```tsx
// src/components/mi-pelo/shared/ToolHero.tsx
import { cn } from '@/lib/utils';

interface ToolHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export default function ToolHero({ title, subtitle, imageUrl, className }: ToolHeroProps) {
  return (
    <div className={cn(
      'relative w-full mb-10 overflow-hidden rounded-xl shadow-2xl group',
      className
    )}>
      <div className="aspect-[21/9] w-full bg-espresso relative">
        {imageUrl && (
          <img
            alt=""
            src={imageUrl}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-cream text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-cream/80 mt-2 max-w-md text-sm leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 5: Commit

```bash
git add src/components/mi-pelo/
git commit -m "feat(mi-pelo): add ToolShell and ToolHero shared components"
```

---

## Task 3 — ProgressBar + OptionCard + MultiSelectPills

**Files:**
- Create: `src/components/mi-pelo/shared/ProgressBar.tsx`
- Create: `src/components/mi-pelo/shared/OptionCard.tsx`
- Create: `src/components/mi-pelo/shared/MultiSelectPills.tsx`

### Step 1: Create ProgressBar.tsx

```tsx
// src/components/mi-pelo/shared/ProgressBar.tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          Progreso
        </span>
        <span className="text-sm font-bold text-espresso">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-gold/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-espresso/60 text-xs mt-2 italic font-medium">
        Paso {current} de {total}
      </p>
    </div>
  );
}
```

### Step 2: Create OptionCard.tsx

```tsx
// src/components/mi-pelo/shared/OptionCard.tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  label: string;
  description?: string;
  Icon?: LucideIcon;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export default function OptionCard({
  label,
  description,
  Icon,
  name,
  value,
  checked,
  onChange,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        'group relative flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all',
        'border-gold/10 bg-cream/30 hover:bg-cream/50 hover:border-gold',
        checked && 'border-gold bg-gold/5'
      )}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gold shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col">
          <p className="text-espresso font-bold text-base leading-tight">{label}</p>
          {description && (
            <p className="text-espresso/60 text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="radio-custom h-6 w-6 shrink-0 ml-4"
      />
    </label>
  );
}
```

### Step 3: Create MultiSelectPills.tsx

```tsx
// src/components/mi-pelo/shared/MultiSelectPills.tsx
import { cn } from '@/lib/utils';

interface MultiSelectPillsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelectPills({
  options,
  selected,
  onChange,
}: MultiSelectPillsProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div
      role="group"
      aria-label="Opciones de selección múltiple"
      className="flex flex-wrap gap-3"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={cn(
            'px-6 py-3 border-2 rounded-full font-medium transition-colors text-sm',
            selected.includes(opt.value)
              ? 'bg-espresso text-cream border-espresso'
              : 'border-espresso/10 text-espresso hover:border-gold'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

### Step 4: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 5: Commit

```bash
git add src/components/mi-pelo/shared/
git commit -m "feat(mi-pelo): add ProgressBar, OptionCard, MultiSelectPills"
```

---

## Task 4 — DamageMeter + ExpertPanel + StepFooter + CizuraCTA

**Files:**
- Create: `src/components/mi-pelo/shared/DamageMeter.tsx`
- Create: `src/components/mi-pelo/shared/ExpertPanel.tsx`
- Create: `src/components/mi-pelo/shared/StepFooter.tsx`
- Create: `src/components/mi-pelo/shared/CizuraCTA.tsx`

### Step 1: Create DamageMeter.tsx

```tsx
// src/components/mi-pelo/shared/DamageMeter.tsx
import { BarChart2 } from 'lucide-react';

interface DamageMeterProps {
  score: number;      // 0–100, higher = more damage
  label: string;      // "Bajo" | "Moderado" | "Alto" | "Crítico"
  uncertain?: boolean; // true when few answers collected
}

export default function DamageMeter({ score, label, uncertain }: DamageMeterProps) {
  return (
    <div className="bg-espresso text-cream rounded-xl p-6 shadow-xl border border-gold/20">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-gold shrink-0" />
        <h4 className="font-bold uppercase tracking-widest text-xs">
          Nivel de Daño Estimado
        </h4>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <span className="text-xs font-semibold py-1 px-2 uppercase rounded-full bg-gold/20 text-gold">
            {label}
          </span>
          <span className="text-xs font-semibold text-gold">{score}%</span>
        </div>
        <div className="overflow-hidden h-2 mb-4 rounded bg-white/10">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-white/60 leading-relaxed italic">
        {uncertain
          ? 'Responde más preguntas para afinar el diagnóstico.'
          : 'Este valor se actualiza en tiempo real según tus respuestas.'}
      </p>
    </div>
  );
}
```

### Step 2: Create ExpertPanel.tsx

```tsx
// src/components/mi-pelo/shared/ExpertPanel.tsx
import { Lightbulb } from 'lucide-react';

interface ExpertPanelProps {
  quote: string;
  expertName?: string;
  expertTitle?: string;
}

export default function ExpertPanel({
  quote,
  expertName = 'Elena Martínez',
  expertTitle = 'Senior Trichologist',
}: ExpertPanelProps) {
  return (
    <div className="bg-gold/10 border border-gold/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-gold shrink-0" />
        <h4 className="font-bold text-espresso uppercase tracking-widest text-xs">
          Consejo del Experto
        </h4>
      </div>
      <p className="text-espresso text-sm leading-relaxed mb-4">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-sm shrink-0">
          {expertName[0]}
        </div>
        <div>
          <p className="text-espresso text-xs font-bold">{expertName}</p>
          <p className="text-espresso/50 text-[10px] uppercase">{expertTitle}</p>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create StepFooter.tsx

```tsx
// src/components/mi-pelo/shared/StepFooter.tsx
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepFooterProps {
  onPrev?: () => void;
  onNext: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export default function StepFooter({
  onPrev,
  onNext,
  isFirst,
  isLast,
  nextLabel,
  nextDisabled,
}: StepFooterProps) {
  return (
    <div className="mt-12 flex items-center justify-between gap-4">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center justify-center px-6 h-14 rounded-xl border-2 border-gold/20 text-espresso font-bold hover:bg-cream/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Anterior
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 flex items-center justify-center px-8 h-14 rounded-xl bg-espresso text-cream font-bold hover:bg-espresso/90 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLast ? 'Ver Resultados' : (nextLabel ?? 'Siguiente Paso')}
        <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
```

### Step 4: Create CizuraCTA.tsx

```tsx
// src/components/mi-pelo/shared/CizuraCTA.tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CizuraCTA() {
  return (
    <div className="relative overflow-hidden bg-espresso rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 my-10">
      <div className="relative z-10">
        <span className="text-gold text-xs font-bold tracking-widest uppercase block mb-2">
          Para profesionales
        </span>
        <h4 className="text-cream text-xl font-bold mb-1">
          Este diagnóstico tarda 8 minutos. Cizura te ahorra 40 al día.
        </h4>
        <p className="text-gold/80 text-sm">
          Software de salón español — sin comisiones ocultas
        </p>
      </div>
      <Link
        to="/gestion-peluqueria"
        className="relative z-10 bg-cream text-espresso px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap"
      >
        Ver Cizura
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
```

### Step 5: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 6: Commit

```bash
git add src/components/mi-pelo/shared/
git commit -m "feat(mi-pelo): add DamageMeter, ExpertPanel, StepFooter, CizuraCTA"
```

---

## Task 5 — DiagnosticoCapilar UI Rewrite

**Files:**
- Modify: `src/pages/DiagnosticoCapilarPage.tsx` (full rewrite — logic preserved, UI replaced)
- Read first: `src/lib/diagnosticoCapilarEngine.ts` (to confirm QUESTIONS structure and max scores)

**Do NOT touch:** `src/lib/diagnosticoCapilarEngine.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`

### Step 1: Check App.tsx for Navbar hiding

Open `src/App.tsx` and search for how Navbar is rendered. If there is a layout wrapper that accepts a `hideNav` prop or a `<NoNavLayout>` route wrapper, use it for `/diagnostico-capilar`. If not, simply remove `sticky` from ToolShell's header for now and add a `// TODO: hide global Navbar` comment.

### Step 2: Read diagnosticoCapilarEngine.ts

Confirm:
- `QUESTIONS.length` — should be 12
- Each question has: `id`, `module` (1|2|3|4), `options: { value: string }[]`
- `MODULE_MAX` totals: cuticle=12, porosity=20, elasticity=21, scalp=12 → total max = 65

### Step 3: Write the new DiagnosticoCapilarPage.tsx

Replace the entire file with the following. All business logic (calculateScores, getRiskLevel, etc.) is preserved. Only the JSX is replaced.

```tsx
// src/pages/DiagnosticoCapilarPage.tsx
import { useState, useCallback, useMemo } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Droplets,
  Activity,
  ScanSearch,
  FlaskConical,
  ExternalLink,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  QUESTIONS,
  calculateScores,
  getRiskLevel,
  getProductRecommendations,
  type RiskLevel,
  type ScoreBreakdown,
  type Product,
} from '@/lib/diagnosticoCapilarEngine';
import { useWizardReturn } from '@/hooks/useWizardReturn';

// ── Shared design components ─────────────────────────────────
import ToolShell from '@/components/mi-pelo/shared/ToolShell';
import ToolHero from '@/components/mi-pelo/shared/ToolHero';
import ProgressBar from '@/components/mi-pelo/shared/ProgressBar';
import OptionCard from '@/components/mi-pelo/shared/OptionCard';
import DamageMeter from '@/components/mi-pelo/shared/DamageMeter';
import ExpertPanel from '@/components/mi-pelo/shared/ExpertPanel';
import StepFooter from '@/components/mi-pelo/shared/StepFooter';
import CizuraCTA from '@/components/mi-pelo/shared/CizuraCTA';

// ── Constants ────────────────────────────────────────────────
const TOTAL_SCORE_MAX = 65; // 12 + 20 + 21 + 12

const MODULE_ICONS: Record<1 | 2 | 3 | 4, LucideIcon> = {
  1: Layers,
  2: Droplets,
  3: Activity,
  4: ScanSearch,
};

const MODULE_QUOTES: Record<1 | 2 | 3 | 4, string> = {
  1: 'La cutícula es la primera línea de defensa del cabello. Una cutícula abierta libera humedad y proteínas esenciales con cada lavado.',
  2: 'La porosidad determina cómo el cabello absorbe y retiene los productos. Alta porosidad requiere sellantes como aceites pesados.',
  3: 'La elasticidad sana permite estirarse hasta un 30% sin romperse. Por debajo del 15%, el cabello entra en zona de riesgo de rotura.',
  4: 'El cuero cabelludo es el ecosistema de todo. Un pH desequilibrado o exceso de sebo afecta directamente al ciclo de crecimiento.',
};

// ── Session ID ────────────────────────────────────────────────
function getSessionId(): string {
  const key = 'diag_session_id';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

type Screen = 'intro' | 'quiz' | 'results';

// ── Main component ────────────────────────────────────────────
export default function DiagnosticoCapilarPage() {
  const { t, lang } = useLanguage();
  const [screen, setScreen]       = useState<Screen>('intro');
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]      = useState<Record<string, string>>({});
  const [direction, setDirection]  = useState<1 | -1>(1);
  const [scores, setScores]        = useState<ScoreBreakdown | null>(null);
  const [riskLevel, setRiskLevel]  = useState<RiskLevel | null>(null);
  const [products, setProducts]    = useState<Product[]>([]);
  const { isWizardMode, completeWizardModule } = useWizardReturn('diagnostico-capilar');

  const q             = QUESTIONS[currentQ];
  const selectedValue = answers[q?.id];
  const hasAnswer     = selectedValue !== undefined;
  const isLastQ       = currentQ === QUESTIONS.length - 1;

  // Localize via i18n (unchanged from original)
  const localizedQ = q ? {
    ...q,
    text:     t(`diagnostico.${q.id}Text`),
    protocol: q.protocol ? t(`diagnostico.${q.id}Protocol`) : undefined,
    options:  q.options.map((opt) => ({
      ...opt,
      label: t(`diagnostico.${q.id}${opt.value}`),
    })),
  } : q;

  // Real-time damage estimate for sidebar
  const { damageScore, damageLabel } = useMemo(() => {
    const answered = Object.keys(answers).length;
    if (answered === 0) return { damageScore: 50, damageLabel: 'Evaluando' };
    const partial = calculateScores(answers).total;
    const proportionalMax = (answered / QUESTIONS.length) * TOTAL_SCORE_MAX;
    const score = Math.round(100 - Math.min(100, (partial / Math.max(1, proportionalMax)) * 100));
    const label = score < 25 ? 'Bajo' : score < 50 ? 'Moderado' : score < 75 ? 'Alto' : 'Crítico';
    return { damageScore: score, damageLabel: label };
  }, [answers]);

  // ── Supabase save (unchanged) ─────────────────────────────
  const saveSession = useCallback(async (
    finalAnswers: Record<string, string>,
    finalScores: ScoreBreakdown,
    finalRiskLevel: RiskLevel,
    finalProducts: Product[],
  ) => {
    const sessionId = getSessionId();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from as any)('hair_diagnostic_sessions').insert({
        user_session_id:       sessionId,
        cuticle_score:         finalScores.cuticle,
        porosity_score:        finalScores.porosity,
        elasticity_score:      finalScores.elasticity,
        scalp_score:           finalScores.scalp,
        total_score:           finalScores.total,
        risk_level:            finalRiskLevel,
        answers:               finalAnswers,
        product_recommendations: finalProducts.map((p) => p.asin),
      });
    } catch { /* best-effort */ }
  }, []);

  // ── Navigation (unchanged logic) ─────────────────────────
  const goNext = useCallback(async () => {
    if (!hasAnswer) return;
    if (isLastQ) {
      const finalAnswers   = { ...answers };
      const finalScores    = calculateScores(finalAnswers);
      const finalRiskLevel = getRiskLevel(finalScores.total);
      const finalProducts  = getProductRecommendations(finalRiskLevel);
      setScores(finalScores);
      setRiskLevel(finalRiskLevel);
      setProducts(finalProducts);
      await saveSession(finalAnswers, finalScores, finalRiskLevel, finalProducts);
      setScreen('results');
    } else {
      setDirection(1);
      setCurrentQ((n) => n + 1);
    }
  }, [hasAnswer, isLastQ, answers, saveSession]);

  const goBack = useCallback(() => {
    if (currentQ === 0) { setScreen('intro'); }
    else { setDirection(-1); setCurrentQ((n) => n - 1); }
  }, [currentQ]);

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }, [q?.id]);

  const reset = useCallback(() => {
    setCurrentQ(0); setAnswers({}); setScores(null);
    setRiskLevel(null); setProducts([]); setDirection(1); setScreen('intro');
  }, []);

  const moduleOfQ  = q?.module as 1 | 2 | 3 | 4 | undefined;
  const QuizIcon   = moduleOfQ ? MODULE_ICONS[moduleOfQ] : FlaskConical;
  const expertQuote = moduleOfQ ? MODULE_QUOTES[moduleOfQ] : MODULE_QUOTES[1];
  const showSidebar = screen === 'quiz' && currentQ > 1; // steps 3–12

  // ── INTRO SCREEN ─────────────────────────────────────────
  if (screen === 'intro') {
    return (
      <>
        <SEOHead title={t('diagnostico.metaTitle')} description={t('diagnostico.metaDesc')} />
        <ToolShell toolName="Diagnóstico Capilar" ToolIcon={FlaskConical}>
          <ToolHero
            title={t('diagnostico.title')}
            subtitle={t('diagnostico.subtitle')}
          />
          {/* Module cards */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gold/10 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gold mb-6">
              4 módulos de análisis
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {([1, 2, 3, 4] as const).map((mod) => {
                const Icon = MODULE_ICONS[mod];
                const labelKey = ['cuticleModule', 'porosityModule', 'elasticityModule', 'scalpModule'][mod - 1];
                const subKey   = ['cuticleModuleSub', 'porosityModuleSub', 'elasticityModuleSub', 'scalpModuleSub'][mod - 1];
                return (
                  <div key={mod} className="flex items-center gap-4 p-5 rounded-2xl border border-gold/10 bg-cream/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gold shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-espresso text-sm">{t(`diagnostico.${labelKey}`)}</p>
                      <p className="text-espresso/60 text-xs mt-0.5">{t(`diagnostico.${subKey}`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setScreen('quiz')}
              className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-espresso text-cream font-bold hover:bg-espresso/90 shadow-lg transition-all"
            >
              {t('diagnostico.startBtn')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-4 text-xs text-espresso/50 text-center italic">
              {t('diagnostico.timeNote')}
            </p>
          </div>
        </ToolShell>
      </>
    );
  }

  // ── RESULTS SCREEN ────────────────────────────────────────
  if (screen === 'results' && scores && riskLevel) {
    const healthPct = Math.round((scores.total / TOTAL_SCORE_MAX) * 100);
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const modules = [
      { labelKey: 'cuticleModule',     score: scores.cuticle,     max: 12, icon: Layers },
      { labelKey: 'porosityModule',    score: scores.porosity,    max: 20, icon: Droplets },
      { labelKey: 'elasticityModule',  score: scores.elasticity,  max: 21, icon: Activity },
      { labelKey: 'scalpModule',       score: scores.scalp,       max: 12, icon: ScanSearch },
    ];

    return (
      <>
        <SEOHead title={t('diagnostico.metaTitle')} description={t('diagnostico.metaDesc')} />
        {/* Results hero */}
        <div className="relative h-[360px] w-full overflow-hidden bg-espresso">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-gold uppercase tracking-[0.3em] text-xs mb-4 font-semibold block">
              Resultados del Diagnóstico
            </span>
            <h1 className="text-cream text-4xl md:text-5xl mb-4 italic font-display font-bold">
              Pasaporte Capilar
            </h1>
            <p className="text-cream/80 max-w-lg text-base font-light leading-relaxed">
              {t('diagnostico.resultsSubtitle')}
            </p>
          </div>
        </div>

        {/* Content overlapping hero */}
        <div className="max-w-5xl mx-auto px-4 py-12 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Main column */}
            <div className="md:col-span-2 space-y-6">

              {/* Module bento cards */}
              <div className="bg-cream rounded-3xl p-6 border border-gold/10">
                <h3 className="font-bold text-espresso text-lg mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                  Resumen del Perfil
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {modules.map((m) => {
                    const pct = Math.round((m.score / m.max) * 100);
                    return (
                      <motion.div
                        key={m.labelKey}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-2xl border border-gold/10 bento-card"
                      >
                        <m.icon className="w-5 h-5 text-gold mb-3" />
                        <p className="text-[10px] uppercase tracking-wider text-espresso/60 mb-1">
                          {t(`diagnostico.${m.labelKey}`)}
                        </p>
                        <p className="font-bold text-lg text-espresso">{m.score}<span className="text-espresso/40 text-sm font-normal">/{m.max}</span></p>
                        <div className="mt-2 h-1 bg-gold/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gold rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Action protocol */}
              <div className="bg-white rounded-2xl border border-gold/10 p-6">
                <p className="text-sm font-semibold text-espresso mb-2">
                  {t('diagnostico.actionProtocol')}
                </p>
                <p className="text-sm text-espresso/70 leading-relaxed">
                  {t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}
                </p>
              </div>

              {/* Product recommendations */}
              <div>
                <h3 className="text-lg font-bold text-espresso mb-4">
                  {t('diagnostico.productsTitle')}
                </h3>
                <div className="space-y-3">
                  {products.map((product, i) => (
                    <motion.a
                      key={product.asin}
                      href={lang === 'en' ? product.urlEN : product.urlES}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gold/10 bg-cream/40 hover:border-gold hover:bg-cream/60 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0 mt-0.5">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-espresso group-hover:text-gold transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-espresso/60 mt-0.5 leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-gold">
                          {t('diagnostico.amazonCta')}
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Bibliography (unchanged) */}
              <details className="group rounded-xl border border-gold/10 bg-cream/30 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-espresso select-none list-none hover:bg-cream/60 transition-colors">
                  <span>📚 {t('diagnostico.bibliographyTitle')}</span>
                  <span className="text-espresso/40 text-xs font-normal group-open:hidden">{t('diagnostico.bibliographySee')}</span>
                  <span className="text-espresso/40 text-xs font-normal hidden group-open:inline">{t('diagnostico.bibliographyHide')}</span>
                </summary>
                <ol className="px-5 pb-5 pt-2 space-y-3 text-xs text-espresso/60 leading-relaxed list-decimal list-inside">
                  <li>Gavazzoni Dias, M.F.R. et al. (2014). The Shampoo pH can Affect the Hair Fiber. <em>Int. J. Trichology</em>, 6(3), 95–99.</li>
                  <li>Bolduc, C. & Shapiro, J. (2022). Hair care products. <em>Surgical &amp; Cosmetic Dermatology</em>, 14(1), 4–14.</li>
                  <li>Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair. Springer, 6th ed.</li>
                  <li>Pinheiro, M.V. et al. (2025). Assessment of Hair Fiber Integrity. <em>Cosmetics</em> (MDPI), 12(3), 93.</li>
                  <li>Society of Cosmetic Chemists (NYSCC). (2024). Hair Porosity and Elasticity. Annual Symposium.</li>
                </ol>
              </details>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Score circle */}
              <div className="bg-espresso text-cream p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">
                  Nivel de Salud Capilar
                </p>
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="stroke-cream/10"
                      fill="none" strokeWidth="2"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="stroke-gold"
                      fill="none" strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={`${healthPct}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold font-display">{healthPct}%</span>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gold/20 text-gold font-semibold uppercase tracking-wide mb-3">
                  {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
                </span>
                <p className="text-xs text-cream/70 italic leading-relaxed">
                  "{t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}"
                </p>
              </div>

              <ExpertPanel
                quote={MODULE_QUOTES[4]}
                expertName="Elena Martínez"
                expertTitle="Senior Trichologist"
              />
            </div>
          </div>

          {/* Bottom actions */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gold/20 text-espresso font-semibold hover:bg-cream/50 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              {t('diagnostico.resetBtn')}
            </button>
            {isWizardMode && (
              <button
                onClick={() => completeWizardModule({
                  summary: `${riskLevel} — ${scores.total} pts`,
                  score: scores.total,
                  rawResult: { scores, riskLevel },
                })}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-espresso text-cream font-bold hover:bg-espresso/90 transition-all"
              >
                Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────
  return (
    <>
      <SEOHead title={t('diagnostico.metaTitle')} description={t('diagnostico.metaDesc')} />
      <ToolShell
        toolName="Diagnóstico Capilar"
        ToolIcon={FlaskConical}
        currentStep={currentQ + 1}
        totalSteps={QUESTIONS.length}
      >
        {/* CizuraCTA: shown above step 4 (index 3) */}
        {currentQ === 3 && <CizuraCTA />}

        {/* Main white card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gold/10">
          <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />

          <div className="mb-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.h2
                key={q.id + '-title'}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.2 }}
                className="text-espresso text-2xl md:text-3xl font-bold mb-3 tracking-tight leading-snug"
              >
                {localizedQ.text}
              </motion.h2>
            </AnimatePresence>

            {localizedQ.protocol && (
              <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5 text-sm text-espresso/70 mb-2">
                <span className="shrink-0">🧪</span>
                <p>{localizedQ.protocol}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Options */}
            <div className="lg:col-span-8">
              <div
                role="radiogroup"
                aria-label={localizedQ.text}
                className="grid grid-cols-1 gap-4 mb-4"
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={q.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -60 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {localizedQ.options.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        label={opt.label}
                        Icon={QuizIcon}
                        name={q.id}
                        value={opt.value}
                        checked={selectedValue === opt.value}
                        onChange={handleSelect}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <StepFooter
                onPrev={goBack}
                onNext={goNext}
                isFirst={currentQ === 0 && screen === 'quiz'}
                isLast={isLastQ}
                nextDisabled={!hasAnswer}
              />
            </div>

            {/* Sidebar (steps 3+) */}
            {showSidebar && (
              <div className="lg:col-span-4 flex flex-col gap-6">
                <DamageMeter
                  score={damageScore}
                  label={damageLabel}
                  uncertain={Object.keys(answers).length < 3}
                />
                <ExpertPanel
                  quote={expertQuote}
                  expertName="Elena Martínez"
                  expertTitle="Senior Trichologist"
                />
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  );
}
```

### Step 4: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: no errors. If there are type errors about `Product` or `ScoreBreakdown` missing fields, check `src/lib/diagnosticoCapilarEngine.ts` for the exact exported interface names and adjust imports.

### Step 5: Visual check

```bash
npm run dev
```

Navigate to `http://localhost:5173/diagnostico-capilar`.
- Intro: cream background, ToolHero with espresso overlay, 4 module cards, espresso start button
- Quiz step 1-2: white card, progress bar, OptionCards, no sidebar
- Quiz step 3+: OptionCards on left, DamageMeter + ExpertPanel on right
- Step 4: CizuraCTA banner above the options
- Results: dark hero + overlapping cream content, score circle SVG, bento module cards

### Step 6: Commit

```bash
git add src/pages/DiagnosticoCapilarPage.tsx
git commit -m "feat(mi-pelo): redesign DiagnosticoCapilar UI — Pasaporte Capilar layout"
```

---

## Task 6 — MiPeloPage Hub Redesign

**Files:**
- Modify: `src/pages/MiPeloPage.tsx` (full rewrite — logic unchanged)

### Step 1: Write the new MiPeloPage.tsx

```tsx
// src/pages/MiPeloPage.tsx
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { TOOLS_CONFIG } from '@/data/tools.config';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';
import CizuraCTA from '@/components/mi-pelo/shared/CizuraCTA';

const TOOL_EMOJI: Record<string, string> = Object.fromEntries(
  TOOLS_CONFIG.map((t) => [t.id, t.emoji])
);

// Map tool IDs to Lucide icon names via emoji fallback (reuse emoji from config)
// Tools keep existing href (root-level routes)

export default function MiPeloPage() {
  const { user }           = useAuth();
  const { data: diagnostics } = useUserDiagnostics(user?.id);
  const recent             = diagnostics?.slice(0, 5) ?? [];

  return (
    <>
      <SEOHead
        title="Mi Pelo · Diagnósticos Capilares · GuiaDelSalon.com"
        description="Diagnósticos y análisis profesionales para conocer tu cabello desde la ciencia."
      />

      <div className="min-h-screen bg-background-light text-espresso">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden">
          <div className="aspect-[21/9] w-full bg-espresso relative">
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/30" />
            <div className="absolute bottom-0 left-0 p-8 md:p-14">
              <span className="text-gold text-xs font-bold tracking-widest uppercase block mb-3">
                Laboratorio Capilar
              </span>
              <h1 className="text-cream text-4xl md:text-5xl font-display font-bold italic leading-tight mb-3">
                Descubre la salud<br />de tu cabello
              </h1>
              <p className="text-cream/70 text-base max-w-md mb-8 leading-relaxed">
                6 herramientas de diagnóstico profesional gratuitas
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/mi-pelo/diagnostico-completo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-gold text-espresso hover:bg-gold/90 transition-all"
                >
                  Comenzar Diagnóstico Completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#herramientas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-cream/20 text-cream hover:bg-white/5 transition-colors"
                >
                  Explorar herramientas
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOOL BENTO GRID ──────────────────────────────── */}
        <section id="herramientas" className="py-16 md:py-20 px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-espresso mb-1">
              Herramientas individuales
            </h2>
            <p className="text-espresso/50 text-sm">
              Cada herramienta es independiente. Úsalas en cualquier orden.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS_CONFIG.map((tool, i) => {
              const isFeatured = tool.id === 'diagnostico-capilar';
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={isFeatured ? 'md:col-span-2' : ''}
                >
                  <div className="h-full bg-white rounded-2xl p-6 border border-gold/10 bento-card flex flex-col gap-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-3xl" role="img" aria-label={tool.title}>
                        {tool.emoji}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isFeatured && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                            Más completo
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-espresso/5 text-espresso/50">
                          {tool.badge}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-espresso text-base mb-1">{tool.title}</h3>
                      <p className="text-espresso/60 text-sm leading-relaxed">{tool.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gold/10">
                      <span className="text-[10px] uppercase tracking-wider text-espresso/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tool.duration}
                      </span>
                      <Link
                        to={tool.href}
                        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:gap-2 transition-all"
                      >
                        Iniciar <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CIZURA CTA ───────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <CizuraCTA />
        </div>

        {/* ── AUTH / HISTORIAL ─────────────────────────────── */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto bg-espresso rounded-3xl p-8 md:p-12">
            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/15">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-cream font-semibold text-sm">Mis Diagnósticos</p>
                    <p className="text-cream/40 text-xs">{user.email}</p>
                  </div>
                </div>

                {recent.length === 0 ? (
                  <p className="text-cream/50 text-sm">Aún no tienes diagnósticos guardados.</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {recent.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-cream/5 border border-cream/8"
                      >
                        <span className="text-xl">{TOOL_EMOJI[d.tool_id] ?? '🔬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream text-sm font-medium truncate">{d.result_summary}</p>
                          <p className="text-cream/40 text-xs flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {format(new Date(d.created_at), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/mi-pelo/mis-resultados"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all"
                >
                  Ver historial completo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="font-display font-bold text-cream text-xl md:text-2xl mb-3">
                  Guarda tus resultados. Consulta tu historial.
                </h2>
                <p className="text-cream/55 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Crea tu cuenta gratuita para acceder a tu historial completo de diagnósticos.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-bold bg-gold text-espresso hover:bg-gold/90 transition-opacity"
                  >
                    Crear cuenta gratuita
                  </Link>
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-medium border border-gold/30 text-cream hover:bg-white/5 transition-colors"
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
```

### Step 2: Verify TypeScript

```bash
npx tsc --noEmit
```

### Step 3: Visual check

```bash
npm run dev
```

Navigate to `http://localhost:5173/mi-pelo`.
- Hero: `aspect-[21/9]` espresso background, gold badge, italic serif title, gold CTA button
- Tool grid: white bento cards with hover lift, `DiagnosticoCapilar` spans 2 columns with "Más completo" badge
- CizuraCTA: dark espresso banner between grid and auth section
- Auth section: unchanged behavior

### Step 4: Commit

```bash
git add src/pages/MiPeloPage.tsx
git commit -m "feat(mi-pelo): redesign hub page — bento grid + CizuraCTA"
```

---

## Task 7 — Production Build + Final QA

### Step 1: Full production build

```bash
npm run build
```

Expected: no TypeScript errors, no missing module errors, bundle generated in `dist/`.

### Step 2: QA checklist (manual, in browser via `npm run dev`)

- [ ] `/mi-pelo` — hero renders, bento grid renders, CizuraCTA renders, auth section renders
- [ ] `/mi-pelo` — DiagnosticoCapilar card spans 2 cols on md+ screens
- [ ] `/diagnostico-capilar` — intro screen: cream background, ToolHero, 4 module cards, espresso start button
- [ ] `/diagnostico-capilar` — quiz step 1: ProgressBar visible, OptionCards with radio, no sidebar
- [ ] `/diagnostico-capilar` — quiz step 3+: DamageMeter + ExpertPanel sidebar visible
- [ ] `/diagnostico-capilar` — step 4: CizuraCTA banner renders above options
- [ ] `/diagnostico-capilar` — DamageMeter score updates as user answers questions
- [ ] `/diagnostico-capilar` — completing quiz triggers Supabase save + shows results
- [ ] `/diagnostico-capilar` — results: score circle renders, bento module cards render
- [ ] Mobile (375px): all layouts stack correctly, no overflow
- [ ] Other pages (`/`, `/blog`, `/asesor-color`) — Navbar + shadcn components unchanged

### Step 3: Push

```bash
git push origin main
```

---

## Notes for Future Tools (5 remaining)

Once DiagnosticoCapilar is complete, the pattern for each remaining tool is:

1. Import the same 9 shared components
2. Replace dark-theme wrapper with `ToolShell`
3. Replace option buttons with `OptionCard` or `MultiSelectPills`
4. Keep all engine/Supabase/i18n logic untouched
5. Add `CizuraCTA` if tool has >4 steps (between steps 3–4)
6. Add sidebar from step 2+ if tool has progressive scoring

Priority order: AsesorColor → RecuperacionCapilar → AnalizadorCanicie → InciCheck → AnalizadorAlopecia
