# Tool Pages Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign ColorMatchPage results + quiz polish, DiagnosticoCapilarPage results + quiz sidebar, CompatibilidadQuimicaPage hero + orange override, and ExpertVerdict 2-col layout.

**Architecture:** In-place rewrites of result screens and targeted polish on quiz steps. No new packages, no changes to wizard logic, Supabase queries, or state management.

**Tech Stack:** React + TypeScript + TailwindCSS + Framer Motion. Brand: cream #F5F0E8, espresso #2D2218, gold #C4A97D. CSS vars: `--secondary` = gold, `--card`, `--background`, `--muted-foreground`, `--foreground`, `--border`.

---

## Task 1: ColorMatchPage — Results screen bento redesign

**Files:**
- Modify: `src/pages/ColorMatchPage.tsx`
  - Line 4: add `Link` to react-router-dom import
  - Lines 336–533: replace the `if (result)` block entirely

**Step 1: Add Link to the react-router-dom import**

Find line 4:
```tsx
import { useLocation } from "react-router-dom";
```
Replace with:
```tsx
import { Link, useLocation } from "react-router-dom";
```

**Step 2: Replace the entire `if (result)` block (lines 336–533)**

Replace everything from `// ── Results screen ──` (line 336) through the closing `}` at line 533 with:

```tsx
  // ── Results screen ──
  if (result) {
    const SeasonIcon = SEASON_ICON_MAP[result.season];
    const seasonStyle = SEASON_STYLES[result.season];
    const undertoneLabel = computedUndertone === "cool"
      ? { es: "Frío", en: "Cool" }
      : computedUndertone === "warm"
        ? { es: "Cálido", en: "Warm" }
        : { es: "Neutro", en: "Neutral" };

    const paletteSwatches = [
      result.hexPreview,
      ...result.complementary.slice(0, 5).map((c) => c.hex),
    ];

    return (
      <>
        <Helmet><title>{metaTitle}</title><meta name="description" content={metaDesc} /></Helmet>

        {/* ── Hero ── */}
        <div
          className="min-h-[40vh] flex items-end relative overflow-hidden"
          style={{ backgroundColor: `${result.hexPreview}26` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/95" />
          <div className="container mx-auto px-4 py-16 relative z-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-4">
              {lang === "es" ? "Tu Análisis Cromático" : "Your Color Analysis"}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              {lang === "es" ? "Tu Master Color Card" : "Your Master Color Card"}
            </h1>
            <p className="text-secondary font-display text-xl">
              {SEASON_STYLES[result.season].icon}{" "}
              {l(SEASON_NAMES[result.season])}
            </p>
          </div>
        </div>

        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* ── Bento grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: Expert analysis card */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 border-2 border-secondary/40 flex items-center justify-center shrink-0">
                    <SeasonIcon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {lang === "es" ? "Análisis Experto" : "Expert Analysis"}
                    </p>
                    <p className="font-display text-sm text-foreground font-bold">
                      {lang === "es" ? "Colorista Senior" : "Senior Colorist"}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 w-fit">
                  <span className="text-sm">{SEASON_STYLES[result.season].icon}</span>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {l(SEASON_NAMES[result.season])}
                  </span>
                </div>

                <blockquote className="italic text-sm text-muted-foreground leading-relaxed border-l-2 border-secondary/40 pl-4 flex-1">
                  {l(result.verdict)}
                </blockquote>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {lang === "es" ? "Subtono" : "Undertone"}
                  </p>
                  <p className="text-sm font-bold text-foreground">{l(undertoneLabel)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l(seasonStyle.contrast)}</p>
                </div>
              </div>

              {/* Center: Color circle + match badge */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="72" fill={result.hexPreview} />
                  <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(196,169,125,0.5)" strokeWidth="3" />
                </svg>

                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 border border-secondary/40">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-bold text-secondary">98% MATCH</span>
                </div>

                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">{result.code}</p>
                  <p className="text-sm text-muted-foreground">{l(result.name)}</p>
                </div>

                <div className="w-full bg-accent/50 rounded-xl p-4 border border-border text-xs text-muted-foreground leading-relaxed text-center">
                  {l(result.description)}
                </div>
              </div>

              {/* Right: Palette grid */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {lang === "es" ? "Tu Paleta Cromática" : "Your Color Palette"}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {paletteSwatches.slice(0, 6).map((hex, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-14 h-14 rounded-xl border border-border shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                      {i === 0 && (
                        <span className="text-[10px] text-secondary font-bold">
                          {lang === "es" ? "Principal" : "Main"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {result.requiresDecolor && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs">
                    <FlaskConical className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      {lang === "es" ? "Requiere decoloración profesional" : "Requires professional bleaching"}
                    </p>
                  </div>
                )}

                {result.requiresSalon && !result.requiresDecolor && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      {lang === "es"
                        ? `Salto de ${result.levelJump} niveles — visita un salón`
                        : `${result.levelJump}-level jump — visit a salon`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Clothing + avoid colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <ShirtIcon className="w-4 h-4" />
                  {lang === "es" ? "Tus colores ideales para vestir" : "Your ideal clothing colors"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {seasonStyle.clothingColors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-lg border-2 border-border shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] text-muted-foreground text-center max-w-[60px]">{l(c.name)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-display text-sm text-destructive/80 mb-3">
                  {lang === "es" ? "🚫 Colores a evitar" : "🚫 Colors to avoid"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {seasonStyle.avoidColors.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 opacity-70">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-destructive/30 shadow-sm relative"
                        style={{ backgroundColor: c.hex }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">✕</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center max-w-[60px]">{l(c.name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2 CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                disabled
                size="lg"
                className="flex-1 bg-secondary text-secondary-foreground gap-2 opacity-60 cursor-not-allowed"
              >
                {lang === "es" ? "Descargar Guía PDF" : "Download PDF Guide"}
                <span className="text-xs opacity-70">{lang === "es" ? "(Próximamente)" : "(Coming soon)"}</span>
              </Button>
              <Button asChild size="lg" className="flex-1 border border-secondary/30 bg-card text-foreground hover:bg-secondary/10 gap-2">
                <Link to="/categorias/tintes">
                  {lang === "es" ? "Ver Productos" : "View Products"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Amazon CTAs (conditional) */}
            {!result.requiresDecolor && !result.requiresSalon && (() => {
              const dyeUrlES = skinTone ? getDyeLink(DYE_LINKS_ES, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
              const dyeUrlUS = skinTone ? getDyeLink(DYE_LINKS_US, skinTone, effectiveUndertone, result.code, naturalLevel ?? 5) : null;
              const hasAny = dyeUrlES || dyeUrlUS;
              return hasAny ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  {dyeUrlES && (
                    <Button asChild className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2" size="lg">
                      <a href={dyeUrlES} target="_blank" rel="noopener noreferrer">
                        🇪🇸 Amazon España <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {dyeUrlUS && (
                    <Button asChild className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2" size="lg">
                      <a href={dyeUrlUS} target="_blank" rel="noopener noreferrer">
                        🇺🇸 Amazon USA <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ) : null;
            })()}

            <Button onClick={reset} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              {lang === "es" ? "Empezar de nuevo" : "Start over"}
            </Button>

            <Colorimetry101 lang={lang} />
            <ColorMatchFAQ lang={lang} onReset={reset} />
          </motion.div>
        </section>
      </>
    );
  }
```

**Step 3: Verify TypeScript builds**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -30`
Expected: no TypeScript errors

**Step 4: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/ColorMatchPage.tsx
git commit -m "feat: redesign ColorMatchPage results screen with bento grid layout"
```

---

## Task 2: ColorMatchPage — Stepper UI polish

**Files:**
- Modify: `src/pages/ColorMatchPage.tsx`

**Step 1: Upgrade question title font size**

Find (line ~603):
```tsx
            <h2 className="font-display text-xl text-center text-foreground">{l(titles[step])}</h2>
```
Replace with:
```tsx
            <h2 className="font-display text-2xl text-center text-foreground">{l(titles[step])}</h2>
```

**Step 2: Style the progress indicator as a badge**

Find (lines ~591–599):
```tsx
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{lang === "es" ? "Paso" : "Step"} {step + 1}/{totalSteps}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
```
Replace with:
```tsx
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-xs font-bold text-secondary">
              {lang === "es" ? `Paso ${step + 1} de ${totalSteps}` : `Step ${step + 1} of ${totalSteps}`}
            </span>
            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-secondary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
```

**Step 3: Add ring to selected option cards in renderOptionCards**

Find (line ~547–551):
```tsx
          className={`p-4 rounded-lg border-2 transition-all flex ${layout === "grid" ? "flex-col items-center gap-2" : "items-center gap-4 text-left"} ${
            selected === o.value
              ? "border-secondary bg-accent/60"
              : "border-border hover:border-secondary/50 bg-card"
          }`}
```
Replace with:
```tsx
          className={`p-4 rounded-lg border-2 transition-all flex ${layout === "grid" ? "flex-col items-center gap-2" : "items-center gap-4 text-left"} ${
            selected === o.value
              ? "border-secondary bg-accent/60 ring-2 ring-secondary ring-offset-2 ring-offset-background"
              : "border-border hover:border-secondary/50 bg-card"
          }`}
```

**Step 4: Add ring to eye color options (step 4)**

Find (line ~639):
```tsx
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${eyeColor === o.value ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}
```
Replace with:
```tsx
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${eyeColor === o.value ? "border-secondary bg-accent/60 ring-2 ring-secondary ring-offset-2 ring-offset-background" : "border-border hover:border-secondary/50 bg-card"}`}
```

**Step 5: Add ring to level selectors (step 5 — naturalLevel)**

Find (line ~651):
```tsx
                  <button key={lv} onClick={() => setNaturalLevel(lv)} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${naturalLevel === lv ? "border-secondary bg-accent/60" : "border-border hover:border-secondary/50 bg-card"}`}>
```
Replace with:
```tsx
                  <button key={lv} onClick={() => setNaturalLevel(lv)} className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${naturalLevel === lv ? "border-secondary bg-accent/60 ring-2 ring-secondary ring-offset-2 ring-offset-background" : "border-border hover:border-secondary/50 bg-card"}`}>
```

**Step 6: Verify build and commit**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -20`
Expected: no errors

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/ColorMatchPage.tsx
git commit -m "feat: polish ColorMatchPage quiz steps — badge progress, font-display title, ring on selected"
```

---

## Task 3: DiagnosticoCapilarPage — ResultsScreen redesign

**Files:**
- Modify: `src/pages/DiagnosticoCapilarPage.tsx`
  - Lines 1–4: add `Link` to react-router-dom (already imports other things — check if there's a react-router import, there isn't currently, so add it)
  - Lines 409–603: replace `ResultsScreen` function entirely

**Step 1: Add react-router-dom import**

At line 4 (after the last import), add:
```tsx
import { Link } from "react-router-dom";
```

**Step 2: Replace the entire ResultsScreen function (lines 409–603)**

Replace from `// ── RESULTS SCREEN ─────────────────────────────────────` to the closing `}` at line 603 with:

```tsx
// ── RESULTS SCREEN ─────────────────────────────────────
function ResultsScreen({
  scores,
  riskLevel,
  products,
  onReset,
}: {
  scores: ScoreBreakdown;
  riskLevel: RiskLevel;
  products: Product[];
  onReset: () => void;
}) {
  const { t, lang } = useLanguage();
  const colors = RISK_COLORS[riskLevel];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const TOTAL_MAX = 65; // 12+20+21+12
  const healthPct = Math.min(100, Math.round((scores.total / TOTAL_MAX) * 100));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (healthPct / 100) * circumference;

  const modules: { labelKey: string; score: number; max: number; module: 1 | 2 | 3 | 4 }[] = [
    { labelKey: "cuticleModule", score: scores.cuticle, max: MODULE_MAX[1], module: 1 },
    { labelKey: "porosityModule", score: scores.porosity, max: MODULE_MAX[2], module: 2 },
    { labelKey: "elasticityModule", score: scores.elasticity, max: MODULE_MAX[3], module: 3 },
    { labelKey: "scalpModule", score: scores.scalp, max: MODULE_MAX[4], module: 4 },
  ];

  const symptomTags: string[] =
    riskLevel === "optimal"
      ? [lang === "es" ? "Bien hidratada" : "Well hydrated", lang === "es" ? "Buena elasticidad" : "Good elasticity", lang === "es" ? "Cutícula sana" : "Healthy cuticle"]
      : riskLevel === "caution"
      ? [lang === "es" ? "Algo deshidratada" : "Slightly dry", lang === "es" ? "Porosidad media" : "Medium porosity", lang === "es" ? "Elasticidad reducida" : "Reduced elasticity"]
      : [lang === "es" ? "Muy deshidratada" : "Very dry", lang === "es" ? "Alta porosidad" : "High porosity", lang === "es" ? "Baja elasticidad" : "Low elasticity"];

  return (
    <div className="space-y-8">
      {/* ── Hero ── */}
      <div className="min-h-[200px] bg-card rounded-2xl relative overflow-hidden flex items-end">
        <img
          src="/images/section-salon.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/95 to-card/30" />
        <div className="relative z-10 p-6 md:p-8 w-full">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-2">
            {lang === "es" ? "Diagnóstico Completo" : "Full Diagnosis"}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {lang === "es" ? "Pasaporte Capilar" : "Hair Passport"}
          </h2>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: SVG health score + profile table + symptom tags */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
          {/* SVG circular health score */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-extrabold ${colors.color}`}>{healthPct}</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {lang === "es" ? "Salud Capilar" : "Hair Health"}
              </p>
              <p className={`text-2xl font-extrabold ${colors.color}`}>
                {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {scores.total} / {TOTAL_MAX} {t("diagnostico.pts")}
              </p>
            </div>
          </div>

          {/* Profile table */}
          <div className="rounded-xl border border-border overflow-hidden">
            {modules.map((m, i) => {
              const pct = Math.min(100, Math.round((m.score / m.max) * 100));
              return (
                <div key={m.module} className={`flex items-center gap-3 px-4 py-3 ${i < modules.length - 1 ? "border-b border-border" : ""}`}>
                  <FlaskConical className="w-4 h-4 text-secondary shrink-0" />
                  <p className="text-xs text-muted-foreground flex-1">{t(`diagnostico.${m.labelKey}`)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Symptom tags */}
          <div className="flex flex-wrap gap-2">
            {symptomTags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full border border-secondary/30 px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Expert recommendation + chemical status badge */}
        <div className="flex flex-col gap-4">
          {/* Expert recommendation card */}
          <div className="bg-accent rounded-2xl border border-border p-6 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-3">
              {t("diagnostico.actionProtocol")}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {t(`diagnostico.risk${capitalize(riskLevel)}Protocol`)}
            </p>
          </div>

          {/* Chemical status badge */}
          <div className={`rounded-2xl border-2 p-5 text-center ${colors.bgColor} ${colors.borderColor}`}>
            <div className="text-3xl mb-2">{colors.emoji}</div>
            <p className={`text-lg font-extrabold ${colors.color}`}>
              {t(`diagnostico.risk${capitalize(riskLevel)}Label`)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(`diagnostico.risk${capitalize(riskLevel)}Range`)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Recovery Kit section ── */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
        <img
          src="/images/section-salon.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-2">
              {lang === "es" ? "Protocolo personalizado" : "Personalized protocol"}
            </p>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
              {lang === "es" ? "Kit de Recuperación Capilar" : "Hair Recovery Kit"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "es"
                ? "Productos y rutina para restaurar tu fibra capilar"
                : "Products and routine to restore your hair fiber"}
            </p>
          </div>
          <Link
            to="/recuperacion-capilar"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 transition-colors"
          >
            {lang === "es" ? "Ver Protocolo" : "View Protocol"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Product recommendations ── */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">{t("diagnostico.productsTitle")}</h3>
        <div className="space-y-3">
          {products.map((product, i) => (
            <motion.a
              key={product.asin}
              href={lang === "en" ? product.urlEN : product.urlES}
              target="_blank"
              rel="nofollow noopener noreferrer"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-secondary/60 hover:bg-secondary/5 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-secondary">
                  {t("diagnostico.amazonCta")}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* ── Bibliography ── */}
      <details className="group rounded-xl border border-border bg-card overflow-hidden">
        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-foreground select-none list-none hover:bg-secondary/5 transition-colors">
          <span><span aria-hidden="true">📚</span> {t("diagnostico.bibliographyTitle")}</span>
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">{t("diagnostico.bibliographySee")}</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">{t("diagnostico.bibliographyHide")}</span>
        </summary>
        <ol className="px-5 pb-5 pt-2 space-y-3 text-xs text-muted-foreground leading-relaxed list-decimal list-inside marker:font-semibold marker:text-foreground">
          <li>Gavazzoni Dias, M.F.R. et al. (2014). The Shampoo pH can Affect the Hair Fiber: Myth or Reality? <em>International Journal of Trichology</em>, 6(3), 95–99. <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4171909/" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-2 hover:opacity-80">PMC4171909</a></li>
          <li>Bolduc, C. &amp; Shapiro, J. (2022). Hair care products. <em>Surgical &amp; Cosmetic Dermatology</em>, 14(1), 4–14.</li>
          <li>Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair. <em>Polymers</em> (6th ed.). <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10054080/" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-2 hover:opacity-80">PMC10054080</a></li>
          <li>Pinheiro, M.V. et al. (2025). Assessment of Hair Fiber Integrity After Chemical Treatments. <em>Cosmetics</em> (MDPI), 12(3), 93. <a href="https://www.mdpi.com/2079-9284/12/3/93" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-2 hover:opacity-80">mdpi.com/2079-9284/12/3/93</a></li>
          <li>Society of Cosmetic Chemists (NYSCC). (2024). Hair Porosity and Elasticity. Annual Symposium Proceedings.</li>
        </ol>
      </details>

      {/* Reset */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          {t("diagnostico.resetBtn")}
        </Button>
      </div>
    </div>
  );
}
```

**Step 3: Verify build**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -30`
Expected: no TypeScript errors

**Step 4: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/DiagnosticoCapilarPage.tsx
git commit -m "feat: redesign DiagnosticoCapilarPage ResultsScreen with Pasaporte Capilar layout"
```

---

## Task 4: DiagnosticoCapilarPage — Quiz sidebar widgets (desktop only)

**Files:**
- Modify: `src/pages/DiagnosticoCapilarPage.tsx`

The quiz screen lives inside the `{screen === "quiz" && (...)}` block (lines 199–272). The inner layout starts with the progress bar and ends with the navigation buttons.

**Step 1: Wrap the quiz content in a 3-col grid**

Find the opening of the quiz screen block (line ~200):
```tsx
            {/* ─── SCREEN 2: QUIZ ──────────────────────── */}
            {screen === "quiz" && (
              <motion.div
                key="quiz"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Progress bar */}
```

Replace the inner content of that `<motion.div>` — from `{/* Progress bar */}` through the closing `</motion.div>` just before the SCREEN 3 comment — with a 3-col grid wrapper. The entire quiz screen block should become:

```tsx
            {/* ─── SCREEN 2: QUIZ ──────────────────────── */}
            {screen === "quiz" && (
              <motion.div
                key="quiz"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main quiz card */}
                  <div className="lg:col-span-2">
                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t("diagnostico.moduleLabel")} {moduleOfQ}:{" "}
                          {t(`diagnostico.${MODULE_KEY[moduleOfQ as 1 | 2 | 3 | 4]}`)}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {currentQ + 1} / {QUESTIONS.length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-secondary rounded-full"
                          initial={false}
                          animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Question card */}
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={q.id}
                        custom={direction}
                        variants={questionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <QuizQuestion
                          q={localizedQ as (typeof QUESTIONS)[number]}
                          selectedOption={selectedOption}
                          onSelect={handleOptionSelect}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                      <button
                        onClick={goBack}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t("diagnostico.backBtn")}
                      </button>

                      {hasAnswer && (
                        <motion.div
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button onClick={goNext} className="gap-2">
                            {isLastQ ? t("diagnostico.finishBtn") : t("diagnostico.nextBtn")}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar — desktop only */}
                  <div className="hidden lg:flex flex-col gap-4 lg:col-span-1">
                    {/* Damage widget */}
                    <div className="bg-card border border-secondary/15 rounded-2xl p-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        {t("diagnostico.lang") === "es" ? "Nivel de Daño" : "Damage Level"}
                      </p>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
                        <motion.div
                          className="h-full bg-secondary rounded-full"
                          animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {currentQ < 7
                          ? (lang === "es" ? "Analizando cutícula..." : "Analyzing cuticle...")
                          : currentQ < 13
                          ? (lang === "es" ? "Evaluando porosidad..." : "Evaluating porosity...")
                          : currentQ < 17
                          ? (lang === "es" ? "Midiendo elasticidad..." : "Measuring elasticity...")
                          : (lang === "es" ? "Valorando cuero cabelludo..." : "Assessing scalp...")}
                      </p>
                    </div>

                    {/* Expert tip widget */}
                    <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="w-4 h-4 text-secondary" />
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                          {lang === "es" ? "Consejo experto" : "Expert tip"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {moduleOfQ === 1
                          ? (lang === "es" ? "La cutícula es la primera capa de defensa del cabello. Su estado determina el brillo y la resistencia al daño." : "The cuticle is hair's first defense layer. Its condition determines shine and damage resistance.")
                          : moduleOfQ === 2
                          ? (lang === "es" ? "La porosidad alta absorbe más agua pero también pierde hidratación más rápido. Los aceites sellantes son clave." : "High porosity absorbs more water but loses moisture faster. Sealing oils are key.")
                          : moduleOfQ === 3
                          ? (lang === "es" ? "La elasticidad sana permite estirar el cabello húmedo un 30% sin romperse. Si se rompe antes, hay deficiencia proteica." : "Healthy elasticity allows stretching wet hair 30% without breaking. Breaks sooner? Protein deficiency.")
                          : (lang === "es" ? "El cuero cabelludo sano produce 0.35 mm de cabello nuevo al día. El estrés y la nutrición afectan directamente esta tasa." : "A healthy scalp produces 0.35 mm of new hair daily. Stress and nutrition directly affect this rate.")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
```

Note: The sidebar "Nivel de Daño" label uses a workaround (`t("diagnostico.lang") === "es"`) which won't work. Use `lang === "es"` directly. Fix: replace `{t("diagnostico.lang") === "es" ? "Nivel de Daño" : "Damage Level"}` with `{lang === "es" ? "Nivel de Daño" : "Damage Level"}`. The `lang` is already in scope from `const { t, lang } = useLanguage()` (which is in the parent function — but NOT inside the quiz screen JSX, which is inside the main component where `lang` is not destructured). Check line 57: `const { t } = useLanguage();` — only `t` is destructured. Add `lang` to it:

Find (line 57):
```tsx
  const { t } = useLanguage();
```
Replace with:
```tsx
  const { t, lang } = useLanguage();
```

**Step 2: Verify build**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -30`
Expected: no TypeScript errors

**Step 3: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/DiagnosticoCapilarPage.tsx
git commit -m "feat: add desktop sidebar widgets to DiagnosticoCapilarPage quiz"
```

---

## Task 5: CompatibilidadQuimicaPage — Hero redesign + orange scoped override

**Files:**
- Modify: `src/pages/CompatibilidadQuimicaPage.tsx` (57 lines — full rewrite)

**Step 1: Rewrite the file**

Replace the entire file content with:

```tsx
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import ChemicalCompatibilityAnalyzer from "@/components/ChemicalCompatibilityAnalyzer";

export default function CompatibilidadQuimicaPage() {
  const { t } = useLanguage();

  return (
    <div
      style={{ "--primary": "#ec5b13", "--secondary": "#ec5b13" } as React.CSSProperties}
    >
      <Helmet>
        <title>{t("quimica.pageTitle")}</title>
        <meta name="description" content={t("quimica.pageDesc")} />
        <link rel="canonical" href="https://guiadelsalon.com/compatibilidad-quimica" />
      </Helmet>

      {/* Hero */}
      <div className="min-h-[35vh] bg-card relative overflow-hidden flex items-end">
        {/* Decorative radial gradient bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(236,91,19,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(236,91,19,0.08) 0%, transparent 55%)",
          }}
        />
        {/* Molecule-like decorative SVG dots */}
        <svg
          className="absolute right-8 top-8 opacity-10 hidden md:block"
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="60" stroke="#ec5b13" strokeWidth="1" />
          <circle cx="100" cy="100" r="35" stroke="#ec5b13" strokeWidth="1" />
          <circle cx="100" cy="40" r="8" fill="#ec5b13" />
          <circle cx="100" cy="160" r="8" fill="#ec5b13" />
          <circle cx="40" cy="100" r="8" fill="#ec5b13" />
          <circle cx="160" cy="100" r="8" fill="#ec5b13" />
          <line x1="100" y1="48" x2="100" y2="65" stroke="#ec5b13" strokeWidth="1" />
          <line x1="100" y1="135" x2="100" y2="152" stroke="#ec5b13" strokeWidth="1" />
          <line x1="48" y1="100" x2="65" y2="100" stroke="#ec5b13" strokeWidth="1" />
          <line x1="135" y1="100" x2="152" y2="100" stroke="#ec5b13" strokeWidth="1" />
        </svg>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5" style={{ borderColor: "rgba(236,91,19,0.3)", backgroundColor: "rgba(236,91,19,0.08)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#ec5b13" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ec5b13" }}>
                {t("quimica.heroBadge")}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight max-w-3xl">
              {t("quimica.heroTitle")}
              <span className="block" style={{ color: "#ec5b13" }}>
                {t("quimica.heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
              {t("quimica.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <ChemicalCompatibilityAnalyzer />
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -20`
Expected: no TypeScript errors

**Step 3: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/pages/CompatibilidadQuimicaPage.tsx
git commit -m "feat: redesign CompatibilidadQuimicaPage hero with orange scoped override"
```

---

## Task 6: ExpertVerdict — 2-col layout

**Files:**
- Modify: `src/components/ExpertVerdict.tsx`

The current `ExpertVerdict` renders a single-column layout inside a dark card. Per spec, add a 2-col layout:
- Left col: features grid (Interacción Molecular + Estabilidad Térmica cards) + prose paragraphs + blockquote
- Right col (sticky): analysis ID card + expert CTA

**Step 1: Rewrite the main component JSX (lines 138–271)**

Replace just the `ExpertVerdict` function (keep `SOURCES`, `SourceItem`, and the imports intact). Replace from line 138 (`export default function ExpertVerdict()`) to end of file:

```tsx
// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: "⚗️",
    title: "Interacción Molecular",
    desc: "H₂O₂ + iones Cu²⁺ → radicales hidroxilo. Reacción exotérmica irreversible.",
  },
  {
    icon: "🌡️",
    title: "Estabilidad Térmica",
    desc: "NaOH forma lantionina permanente: ningún intervalo de tiempo la revierte.",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#2D2218" }}
      aria-label="Veredicto del Experto"
    >
      {/* Gold top accent line */}
      <div className="h-1 w-full" style={{ background: "#C4A97D" }} />

      <div className="p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D] mb-3">
            Análisis científico
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F5F0E8] leading-tight">
            Veredicto del Experto
          </h3>
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left col: features + prose + blockquote */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURE_CARDS.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(196,169,125,0.06)", border: "1px solid rgba(196,169,125,0.15)" }}
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-sm font-bold text-[#F5F0E8] mb-1">{f.title}</p>
                  <p className="text-xs text-[#F5F0E8]/55 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Body paragraphs */}
            <div className="space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed">
              <p>
                La fibra capilar humana es uno de los biomateriales más complejos del
                organismo: una arquitectura de queratina en hélice-alfa mantenida por
                puentes disulfuro, interacciones electrostáticas y una capa hidrófoba
                exterior de ácido 18-metileicosanoico (18-MEA) que actúa como barrera
                química. Esta estructura puede ser comprometida de forma irreversible
                en literalmente minutos por la combinación equivocada de agentes químicos.
              </p>
              <p>
                La decoloración con H₂O₂ al 6–12% convierte los puentes disulfuro en ácido
                cisteico de forma irreversible; el hidróxido sódico forma lantionina permanente;
                el ácido glioxílico crea adductos en los mismos sitios nucleófilos que los
                relajantes necesitan. Cada proceso modifica la arquitectura molecular del pelo
                de una forma que determina cómo responderá ante el siguiente tratamiento.
              </p>
              <p>
                La interacción más documentada es la de los tintes metálicos (sales de cobre,
                plomo o plata de la henna compuesta) con cualquier fuente de H₂O₂.
                Los iones Cu²⁺ depositados en la corteza capilar actúan como catalizadores Fenton:
                descomponen el peróxido de hidrógeno en una cascada de radicales hidroxilo
                altamente exotérmica que literalmente disuelve la proteína capilar en minutos.
              </p>
              <p>
                La incompatibilidad NaOH–tioglicolato merece mención especial por su carácter
                de ley química absoluta: la lantionina formada por el hidróxido es un tioéter
                estructuralmente irreducible. No existe intervalo de tiempo que haga compatible
                esta combinación en el mismo cabello.
              </p>

              {/* Pull quote */}
              <div className="relative my-6 pl-6 border-l-2 border-[#C4A97D]">
                <Quote className="w-5 h-5 text-[#C4A97D]/40 absolute -left-2.5 -top-1" />
                <p className="text-[#F5F0E8]/90 text-base md:text-lg font-display italic leading-relaxed">
                  La compatibilidad química no es una recomendación cosmética; es
                  bioquímica aplicada. Conocer las restricciones moleculares de los
                  tratamientos que ofreces es tan fundamental como la técnica de aplicación.
                </p>
              </div>

              <p>
                El conocimiento de estas interacciones pertenece a la consulta de cada
                profesional, a la formación de cada estilista y a la protección de cada
                cliente que confía su cabello a manos expertas.
              </p>
            </div>
          </div>

          {/* Right col: analysis ID + expert CTA */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Analysis ID card */}
            <div
              className="rounded-xl p-5"
              style={{ background: "rgba(196,169,125,0.06)", border: "1px solid rgba(196,169,125,0.15)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60 mb-3">
                ID de análisis
              </p>
              <div className="space-y-2 text-xs text-[#F5F0E8]/50">
                <div className="flex justify-between">
                  <span>Base científica</span>
                  <span className="text-[#C4A97D]/70">10 fuentes</span>
                </div>
                <div className="flex justify-between">
                  <span>Actualizado</span>
                  <span className="text-[#C4A97D]/70">2024–2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Norma</span>
                  <span className="text-[#C4A97D]/70">SCCS / ANSES</span>
                </div>
                <div className="flex justify-between">
                  <span>Algoritmo</span>
                  <span className="text-[#C4A97D]/70">v2.1</span>
                </div>
              </div>
            </div>

            {/* Cizura cross-promo */}
            <div
              className="rounded-xl p-5 flex-1"
              style={{ background: "rgba(196,169,125,0.05)", border: "1px solid rgba(196,169,125,0.20)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60 mb-3">
                Para profesionales
              </p>
              <p className="text-xs text-[#F5F0E8]/70 leading-relaxed mb-4">
                Registra el historial completo de tratamientos de cada cliente —
                decoloración, relajantes, henna, queratina — para nunca adivinar
                qué se aplicó la última vez.
              </p>
              <a
                href="https://cizura.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                style={{ color: "#C4A97D" }}
              >
                Cizura <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="mt-10 pt-8 border-t border-[#C4A97D]/15">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60 mb-5">
            Referencias bibliográficas (APA 7.ª ed.)
          </p>
          <ol className="space-y-3 list-none p-0">
            {SOURCES.map((s) => (
              <SourceItem key={s.id} s={s} />
            ))}
          </ol>
        </div>
      </div>
    </motion.section>
  );
}
```

**Step 2: Verify build**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -20`
Expected: no TypeScript errors

**Step 3: Commit**

```bash
cd C:/Users/david/pro-hair-picks
git add src/components/ExpertVerdict.tsx
git commit -m "feat: add 2-col layout to ExpertVerdict with feature cards and expert CTA"
```

---

## Task 7: Smoke test + push to main

**Step 1: Run the build one final time**

Run: `cd C:/Users/david/pro-hair-picks && npm run build 2>&1 | tail -30`
Expected: "✓ built in" — zero errors

**Step 2: Check git log**

Run: `cd C:/Users/david/pro-hair-picks && git log --oneline -8`
Expected: see the 6 commits from tasks 1–6 listed

**Step 3: Push to main**

Run: `cd C:/Users/david/pro-hair-picks && git push origin main`
Expected: push succeeds
