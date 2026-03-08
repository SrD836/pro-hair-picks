# Design: Mi Pelo — Unified Design System
**Date:** 2026-03-08
**Scope:** Foundation (tokens + 9 shared components) + DiagnosticoCapilar full UI rewrite + Hub redesign
**Status:** Approved

---

## Decisions Made

- **Icons:** Keep Lucide React (no Material Symbols dependency)
- **Routes:** Keep root-level routes (`/diagnostico-capilar`, `/asesor-color`, etc.) — no URL migration
- **Scope:** Foundation + DiagnosticoCapilar star tool (other 5 tools keep existing UI)
- **Implementation:** Approach B — clean shared component library + full UI rewrite of DiagnosticoCapilar

---

## Section 1 — Token Strategy

**Problem:** `primary` in tailwind.config.ts is a shadcn/ui HSL CSS variable — renaming it would break all shadcn components site-wide.

**Solution:** Use `gold` (#C4A97D, already exists) as the mi-pelo accent token. Stitch's `primary` → our `gold` throughout all new components.

**Changes to `tailwind.config.ts`** (additive, no renames):
```
background-light: "#F5F0E8"   (semantic alias for cream)
background-dark:  "#2D2218"   (semantic alias for espresso)
damage-low:       "#4CAF7C"
damage-med:       "#E4B84A"
damage-high:      "#E06B52"
```

**Changes to `src/index.css`:**
- `.radio-custom:checked` — gold fill + border for custom radio inputs
- `.bento-card` — hover lift (translateY -4px + shadow)

**Font:** Keep `font-display: Playfair Display` — brand consistent. Stitch's "Public Sans" is a prototype artifact.

---

## Section 2 — Shared Component Library

**Location:** `src/components/mi-pelo/shared/`

| File | Purpose | Key classes |
|---|---|---|
| `ToolShell.tsx` | Full page wrapper | `bg-background-light/80 backdrop-blur-md sticky` header |
| `ToolHero.tsx` | `aspect-[21/9]` hero | Espresso overlay gradient, fallback `bg-espresso` |
| `ProgressBar.tsx` | Progress inside white card | `bg-gold`, NOT in sticky header |
| `OptionCard.tsx` | `<label>` radio card | Icon-left + text-center + radio-right, `has-[:checked]` |
| `MultiSelectPills.tsx` | Toggle pills | `rounded-full`, espresso when selected |
| `DamageMeter.tsx` | Dark sidebar widget | `bg-espresso` + `bg-gold` bar, score 0–100 |
| `ExpertPanel.tsx` | Light sidebar widget | `bg-gold/10 border-gold/20` |
| `StepFooter.tsx` | Prev/Next nav | Ghost prev + espresso solid next, `h-14` |
| `CizuraCTA.tsx` | Interrupt banner | `bg-espresso rounded-3xl`, inserted between steps 3–4 |

All components are purely presentational — no state, no Supabase, no routing logic.

---

## Section 3 — Bug Fixes

**Both reported bugs investigated and confirmed NOT present:**
- Alopecia nav: Route `/analizador-alopecia` exists in App.tsx; Navbar.tsx has `nav.alopeciaLabel` link ✅
- Canicie i18n: `CanicieAnalyzer.tsx` does not use the i18n system — hardcoded Spanish, no raw keys ✅

No bug fix files needed.

---

## Section 4 — DiagnosticoCapilar Rewrite

**File:** `src/pages/DiagnosticoCapilarPage.tsx`

**Untouched (business logic):**
- `src/lib/diagnosticoCapilarEngine.ts` — QUESTIONS, calculateScores, getRiskLevel, getProductRecommendations
- All `diagnostico.*` i18n keys in es.ts / en.ts
- `saveSession()` → Supabase `hair_diagnostic_sessions`
- `useWizardReturn('diagnostico-capilar')` hook

**UI rewrite:**

| Old | New |
|---|---|
| `IntroScreen` (emoji + dark card) | `ToolHero` + module preview in cream |
| `QuizQuestion` (dark button options) | `OptionCard` in `ToolShell` |
| Flat progress bar at top | `ProgressBar` inside white main card |
| No sidebar | `DamageMeter` + `ExpertPanel` from step 2+ |
| No CizuraCTA | Inserted between steps 3 and 4 |
| Dark semaphore results | `ResultsShell` — Pasaporte Capilar (score circle SVG + bento metrics) |

**Step layout:**
- Steps 1–2: Full-width (no sidebar) — intro phase
- Steps 3–12: `lg:col-span-8` options + `lg:col-span-4` sidebar
- CizuraCTA: Renders once after step 3's Next, before step 4 loads

**Real-time DamageMeter:** Derived from partial `calculateScores()` on current answers, linearly mapped to 0–100. Updates on every answer selection.

---

## Section 5 — Hub `/mi-pelo` Redesign

**File:** `src/pages/MiPeloPage.tsx`

**Unchanged logic:** `useAuth`, `useUserDiagnostics`, `TOOLS_CONFIG`, SEOHead, Framer Motion.

**Layout:**

| Old | New |
|---|---|
| Dark gradient hero | `aspect-[21/9]` espresso hero, italic serif title |
| `<ToolCard>` component grid | Inline bento cards `bg-white rounded-2xl bento-card` |
| No featured tool | `DiagnosticoCapilar` → `md:col-span-2` + "Más completo" badge |
| No CizuraCTA | `<CizuraCTA />` between grid and auth section |

Each bento card: Lucide icon (`text-gold`) + title + description + duration badge + "Iniciar →" Link.
`TOOLS_CONFIG.href` values unchanged (root-level routes).

---

## Files Changed

1. `tailwind.config.ts` — add 5 tokens
2. `src/index.css` — add 2 CSS blocks
3. `src/components/mi-pelo/shared/ToolShell.tsx` — new
4. `src/components/mi-pelo/shared/ToolHero.tsx` — new
5. `src/components/mi-pelo/shared/ProgressBar.tsx` — new
6. `src/components/mi-pelo/shared/OptionCard.tsx` — new
7. `src/components/mi-pelo/shared/MultiSelectPills.tsx` — new
8. `src/components/mi-pelo/shared/DamageMeter.tsx` — new
9. `src/components/mi-pelo/shared/ExpertPanel.tsx` — new
10. `src/components/mi-pelo/shared/StepFooter.tsx` — new
11. `src/components/mi-pelo/shared/CizuraCTA.tsx` — new
12. `src/pages/DiagnosticoCapilarPage.tsx` — full UI rewrite
13. `src/pages/MiPeloPage.tsx` — full rewrite
