# Homepage Redesign 2026

**Date:** 2026-02-27
**Reference:** `C:\Users\david\arhivos web\guia_del_salon_mobile_redesign_2026.png` + ZIP mockups
**Strategy:** Rewrite in-place (same files, same imports in App.tsx)
**Theme:** Always dark — espresso `#2D2218` background, fixed (no light/dark toggle on homepage)

---

## Sections

### 1. Hero — `src/components/Hero.tsx`
- Background: existing `/images/hero-barbershop.webp` with left→right espresso gradient overlay
- Remove: logo image, HeroParticles, stats counter, Color Matcher inline CTA
- Add: gold badge (`t("hero.badge")`), serif headline (existing i18n keys), subtitle, gold CTA button "Explore Catalog →" linking to `/categorias/clippers`
- Keep: Framer Motion entrance animation

### 2. Explore Categories — `src/components/PhotoSections.tsx`
- Section heading "Explore Categories"
- **Row 1** — 3 photo cards (aspect-[4/3]): Men → `/categorias/clippers`, Women → `/categorias/secadores-profesionales`, Unisex → `/categorias/capas-y-delantales`
  - Real images: `section-barber.webp`, `section-salon.webp`, `section-mixto.webp`
  - Dark overlay + title + "Explore →" link
- **Row 2** — 3 icon cards (dark bg, gold icon): Clippers, Trimmers, Furniture
  - Links: `/categorias/clippers`, `/categorias/trimmers`, `/categorias/sillones-de-barbero-hidraulico`
- Animations: `motion.div whileInView viewport={{ once: true }}`

### 3. Latest Articles — `src/components/HomeBlogPreview.tsx`
- Heading "Latest Articles" + "Ver todos →" link to `/blog`
- Horizontal scroll-snap on mobile, 3-col grid on desktop
- Card: image, gold category tag, title, read time
- Keeps existing Supabase query

### 4. Salon Tools — `src/components/HomeBentoGrid.tsx`
- Heading "Salon Tools"
- 2×2 mobile / 4-col desktop grid
- 4 dark cards: Comparador (`/comparar`), Product Matcher (`/quiz`), ROI Calculator (`/calculadora-roi`), Hair Diagnosis (`/diagnostico-capilar`)
- Remove: floating widgets, Men/Women/Mixed section card duplicates (categories now live in PhotoSections)
- Keep: `whileInView` animations, i18n keys for labels

---

## Constraints
- i18n: all user-facing text stays behind `t()` calls
- Images: reuse existing `/images/` assets, no new downloads
- No new npm packages
- `Index.tsx` unchanged (same component imports)
