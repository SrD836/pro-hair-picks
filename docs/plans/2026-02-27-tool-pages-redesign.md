# Tool Pages Redesign 2026 — Phase 1 Design Doc

**Date:** 2026-02-27
**Scope:** ColorMatchPage, DiagnosticoCapilarPage, CompatibilidadQuimicaPage
**Strategy:** In-place rewrites of result screens + polish on quiz steps. Wizard logic unchanged.

---

## 1. ColorMatchPage (`/asesor-color`) — `src/pages/ColorMatchPage.tsx`

### Quiz steps (1–4) — polish only
- Larger swatches with `ring-2 ring-secondary ring-offset-2 ring-offset-background` on selected
- Question title: `font-display text-2xl` (was text-xl sans)
- Progress: replace dots with `Step X de 4` badge + gold fill bar
- Keep: all state, wizard flow, i18n keys, option arrays

### Results screen — full redesign
- **Hero**: `min-h-[40vh]` dark section, background color = `colorHex` at 15% opacity, title serif
- **Bento grid** `grid-cols-1 lg:grid-cols-3 gap-6`:
  - Left col: expert analysis card — profile avatar placeholder, italic quote, season badge (`INVIERNO/VERANO/OTOÑO/PRIMAVERA`)
  - Center col: large circle SVG (80px) with result color fill + `98% MATCH` badge below + color name
  - Right col: `3×2` palette grid of `colorHex` variations as rounded swatches
- **2 CTAs**: `bg-secondary text-secondary-foreground` "Descargar Guía PDF" (disabled/toast) + `Link to="/categorias/tintes"` "Ver Productos"

---

## 2. DiagnosticoCapilarPage (`/diagnostico-capilar`) — `src/pages/DiagnosticoCapilarPage.tsx`

### Quiz steps — sidebar widgets (desktop only)
- Wrap quiz layout in `grid grid-cols-1 lg:grid-cols-3 gap-6`
- Main card: `lg:col-span-2` (unchanged)
- Sidebar `lg:col-span-1 hidden lg:flex flex-col gap-4`:
  - **Damage widget**: `bg-card border border-secondary/15 rounded-2xl p-4` — title "Nivel de Daño", progress bar fill = `(currentQ / totalQ * 100)%`, label espresso/moderate/severe based on answers so far
  - **Expert widget**: `bg-secondary/10 border border-secondary/30 rounded-2xl p-4` — gold icon, static expert tip text per module

### Results screen — redesign `ResultsScreen` sub-component
- **Hero**: `min-h-[200px] bg-card` with subtle hair texture overlay (existing image `/images/section-salon.webp`), title "Pasaporte Capilar" serif
- **Main grid** `grid-cols-1 lg:grid-cols-2 gap-6`:
  - Left: SVG circular health score (`cx=60 cy=60 r=54`, stroke-dasharray animated) + profile table (textura/porosidad/elasticidad rows) + symptom tags `rounded-full border border-secondary/30 px-3 py-1`
  - Right: Expert recommendation card (`bg-accent`) + chemical status badge
- **Recovery Kit section**: full-width `bg-card` card, image background at 20% opacity, CTA "Ver Protocolo de Recuperación" → `/recuperacion-capilar`

---

## 3. CompatibilidadQuimicaPage (`/compatibilidad-quimica`) — `src/pages/CompatibilidadQuimicaPage.tsx`

### Page wrapper — full rewrite (57 lines)
- Orange primary override: wrap entire page in `<div style={{ "--primary": "#ec5b13", "--secondary": "#ec5b13" } as React.CSSProperties}`... actually use Tailwind custom property: add class with inline style
- **Hero section**: `min-h-[35vh] bg-card relative overflow-hidden` — decorative molecule SVG or CSS radial gradient as bg, badge "Laboratorio de Análisis Avanzado" in orange/10, title `font-display text-4xl` "Analizador de Compatibilidad Química", subtitle
- Keep `<ChemicalCompatibilityAnalyzer />` embed below hero — no internal changes
- Orange accent via CSS custom property scoped to the page wrapper

### ExpertVerdict component styling update — `src/components/ExpertVerdict.tsx`
- Add a 2-col layout for the verdict: left = features grid (Interacción Molecular + Estabilidad Térmica) + prose + blockquote; right = analysis ID + expert CTA
- Keep all data/logic, only layout change

---

## Constraints
- All user-facing text stays behind `t()` (add new i18n keys as needed)
- No new npm packages
- Wizard logic, Supabase queries, and state management untouched
- `ChemicalCompatibilityAnalyzer.tsx` internal logic untouched
