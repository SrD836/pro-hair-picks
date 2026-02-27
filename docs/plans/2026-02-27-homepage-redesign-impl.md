# Homepage Redesign 2026 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite 4 homepage components to match the 2026 Stitch mockup — dark espresso aesthetic, photo category grid, articles carousel, tools grid.

**Architecture:** In-place rewrites of Hero.tsx, PhotoSections.tsx, HomeBlogPreview.tsx, HomeBentoGrid.tsx. Index.tsx unchanged. The CSS theme is already fully dark (no variables to touch).

**Tech Stack:** React + TypeScript, Framer Motion (`whileInView viewport={{once:true}}`), Tailwind CSS with existing CSS variable tokens (`bg-background`, `bg-card`, `text-secondary`, etc.), i18n via `useLanguage` / `t()`.

---

## Key tokens (already defined in index.css)
- `bg-background` = espresso `#2D2218`
- `bg-card` = slightly lighter espresso (cards)
- `bg-accent` = medium dark (accent cards)
- `text-foreground` = cream `#F5F0E8`
- `text-secondary` / `border-secondary` = gold `#C4A97D`
- `text-muted-foreground` = muted warm grey

---

## Task 1 — Rewrite Hero.tsx

**Files:**
- Modify: `src/components/Hero.tsx` (full rewrite)

**Goal:** Left-aligned hero with photo bg, gradient overlay, badge, serif headline, subtitle, gold CTA button. Remove logo, HeroParticles, stats, Color Matcher link.

**Code:**

```tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Hero = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
      {/* Background image */}
      <picture>
        <source media="(max-width: 768px)" srcSet="/images/hero-barbershop-mobile.webp" type="image/webp" />
        <source srcSet="/images/hero-barbershop.webp" type="image/webp" />
        <img
          src="/images/hero-barbershop.webp"
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>

      {/* Left-to-right espresso gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/20" />

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-sm mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-xs font-semibold uppercase tracking-widest">
              {t("hero.badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6"
          >
            {t("hero.titleWords").split(",").join(" ")}{" "}
            <span className="shimmer-gold">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.titleEnd")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.45 }}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Link
              to="/categorias/clippers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-secondary text-secondary-foreground font-bold text-base hover:bg-secondary/90 transition-colors group"
            >
              {lang === "es" ? "Explorar catálogo" : "Explore Catalog"}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
```

**Step 1:** Replace the full contents of `src/components/Hero.tsx` with the code above.

**Step 2:** Verify the import for `HeroParticles` and `HeroParticles.tsx` file are no longer referenced. The file can stay (used nowhere after this change), no need to delete.

**Step 3:** Commit
```bash
git add src/components/Hero.tsx
git commit -m "feat: redesign Hero — dark left-aligned layout, gold CTA, remove particles/logo"
```

---

## Task 2 — Rewrite PhotoSections.tsx → Explore Categories

**Files:**
- Modify: `src/components/PhotoSections.tsx` (full rewrite)

**Goal:** Two-row grid. Row 1 = 3 photo cards (Men/Women/Unisex). Row 2 = 3 dark icon cards (Clippers/Trimmers/Furniture).

**Code:**

```tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Zap, Armchair } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Photo card (row 1) ────────────────────── */
function PhotoCard({
  title, subtitle, href, imageSrc, imageWebp, index,
}: {
  title: string; subtitle: string; href: string;
  imageSrc: string; imageWebp: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer"
    >
      <Link to={href} className="block w-full h-full">
        <picture>
          <source srcSet={imageWebp} type="image/webp" />
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </picture>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">{title}</h3>
          <span className="inline-flex items-center gap-1 text-secondary text-sm font-semibold">
            {subtitle}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Icon card (row 2) ─────────────────────── */
function IconCard({
  title, href, icon: Icon, index,
}: {
  title: string; href: string; icon: React.ElementType; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, borderColor: "rgba(196,169,125,0.5)", transition: { duration: 0.2 } }}
      className="rounded-2xl border border-secondary/15 bg-card p-6 flex flex-col items-center gap-3 cursor-pointer"
    >
      <Link to={href} className="flex flex-col items-center gap-3 w-full">
        <div className="p-3 rounded-xl bg-secondary/10">
          <Icon className="w-7 h-7 text-secondary" />
        </div>
        <span className="font-display text-base font-semibold text-foreground">{title}</span>
      </Link>
    </motion.div>
  );
}

/* ── Main section ──────────────────────────── */
const PhotoSections = () => {
  const { t } = useLanguage();

  const photoCards = [
    {
      title: t("sections.barber.title"),
      subtitle: t("sections.barber.cta"),
      href: "/categorias/clippers",
      imageSrc: "/images/section-barber.jpg",
      imageWebp: "/images/section-barber.webp",
    },
    {
      title: t("sections.salon.title"),
      subtitle: t("sections.salon.cta"),
      href: "/categorias/secadores-profesionales",
      imageSrc: "/images/section-salon.jpg",
      imageWebp: "/images/section-salon.webp",
    },
    {
      title: t("sections.mixed.title"),
      subtitle: t("sections.mixed.cta"),
      href: "/categorias/capas-y-delantales",
      imageSrc: "/images/section-mixto.jpg",
      imageWebp: "/images/section-mixto.webp",
    },
  ];

  const iconCards = [
    { title: "Clippers", href: "/categorias/clippers", icon: Scissors },
    { title: "Trimmers", href: "/categorias/trimmers", icon: Zap },
    { title: "Furniture", href: "/categorias/sillones-de-barbero-hidraulico", icon: Armchair },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      {/* Section heading */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10"
      >
        {t("sections.exploreTitle") ?? "Explore Categories"}
      </motion.h2>

      {/* Row 1 — Photo cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {photoCards.map((card, i) => (
          <PhotoCard key={card.href} {...card} index={i} />
        ))}
      </div>

      {/* Row 2 — Icon cards */}
      <div className="grid grid-cols-3 gap-4">
        {iconCards.map((card, i) => (
          <IconCard key={card.href} {...card} index={i} />
        ))}
      </div>
    </section>
  );
};

export default PhotoSections;
```

**Note on i18n:** The key `sections.exploreTitle` may not exist yet. Add a fallback `?? "Explore Categories"` as shown, or add the key to the translations files later. Do NOT block on this.

**Step 1:** Replace full contents of `src/components/PhotoSections.tsx`.

**Step 2:** Check `Armchair` exists in lucide-react. If not, substitute `Sofa` or `LayoutDashboard`.
```bash
cd /c/Users/david/pro-hair-picks && grep -r "Armchair\|Sofa" node_modules/lucide-react/dist/lucide-react.d.ts 2>/dev/null | head -3
```

**Step 3:** Commit
```bash
git add src/components/PhotoSections.tsx
git commit -m "feat: redesign PhotoSections → Explore Categories grid (photo + icon rows)"
```

---

## Task 3 — Restyle HomeBlogPreview.tsx

**Files:**
- Modify: `src/components/HomeBlogPreview.tsx` (style update only — query stays identical)

**Goal:** Keep Supabase query. Update styling to dark card aesthetic matching new design.

**Code:**

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HomeBlogPreview = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";

  const { data: posts } = useQuery({
    queryKey: ["blog-preview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, title_en, excerpt, excerpt_en, cover_image_url, category, published_at, read_time_minutes")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl font-bold text-foreground"
        >
          {t("blog.latestArticles")}
        </motion.h2>
        <Link
          to="/blog"
          className="hidden md:inline-flex items-center gap-1.5 text-secondary text-sm font-semibold hover:text-secondary/80 transition-colors group"
        >
          {t("blog.viewAll")}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(196,169,125,0.15)", transition: { duration: 0.2 } }}
            className="rounded-2xl border border-secondary/15 bg-card overflow-hidden group"
          >
            <Link to={`/blog/${post.slug}`} className="block">
              {post.cover_image_url && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={`${post.cover_image_url}?width=378&height=252&resize=cover`}
                    srcSet={`${post.cover_image_url}?width=378&height=252&resize=cover 1x, ${post.cover_image_url}?width=756&height=504&resize=cover 2x`}
                    alt={post.title}
                    width={378}
                    height={252}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                      {post.category}
                    </span>
                  )}
                  {post.read_time_minutes && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.read_time_minutes} {t("blog.min")}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                  {(isEN && post.title_en) || post.title}
                </h3>
                {(post.excerpt || post.excerpt_en) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {(isEN && post.excerpt_en) || post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {/* Mobile view-all */}
      <div className="mt-8 text-center md:hidden">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
        >
          {t("blog.viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default HomeBlogPreview;
```

**Changes from current:**
- Removed `BookOpen` icon and label row before title
- "View all" link → text-only with arrow (not filled button) on desktop
- Category tag: `tracking-widest font-bold` (more prominent)
- Slight shadow change on hover for consistency

**Step 1:** Replace full contents of `src/components/HomeBlogPreview.tsx`.

**Step 2:** Commit
```bash
git add src/components/HomeBlogPreview.tsx
git commit -m "feat: restyle HomeBlogPreview — dark cards, cleaner header, gold category tags"
```

---

## Task 4 — Rewrite HomeBentoGrid.tsx → Salon Tools only

**Files:**
- Modify: `src/components/HomeBentoGrid.tsx` (full rewrite)

**Goal:** Remove the category bento (Men/Women/Mixed + subcategories — now covered by PhotoSections). Keep only "Salon Tools" as a clean 4-card grid.

**Code:**

```tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, GitCompare, HelpCircle, Calculator, Microscope } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function ToolCard({
  icon: Icon, title, description, cta, href, index,
}: {
  icon: React.ElementType; title: string; description: string;
  cta: string; href: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(196,169,125,0.18)", transition: { duration: 0.2 } }}
      className="rounded-2xl border border-secondary/15 bg-card p-6 flex flex-col gap-4"
    >
      <div className="p-3 rounded-xl bg-secondary/10 w-fit">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <Link
        to={href}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/90 transition-colors group w-fit"
      >
        {cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}

const HomeBentoGrid = () => {
  const { t } = useLanguage();

  const tools = [
    {
      icon: GitCompare,
      title: t("bento.comparator"),
      description: t("bento.comparatorDesc"),
      cta: t("bento.compare"),
      href: "/comparar",
    },
    {
      icon: HelpCircle,
      title: t("bento.quiz"),
      description: t("bento.quizDesc"),
      cta: t("bento.startQuiz"),
      href: "/quiz",
    },
    {
      icon: Calculator,
      title: t("bento.roiCalc"),
      description: t("bento.roiDesc"),
      cta: t("bento.useNow"),
      href: "/calculadora-roi",
    },
    {
      icon: Microscope,
      title: t("bento.diagnosticoTitle"),
      description: t("bento.diagnosticoDesc"),
      cta: t("bento.diagnosticoCta"),
      href: "/diagnostico-capilar",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("bento.salonTools")}
        </h2>
        <p className="text-muted-foreground max-w-lg">
          {t("bento.toolsSubtitle")}
        </p>
      </motion.div>

      {/* 4-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <ToolCard key={tool.href} {...tool} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HomeBentoGrid;
```

**Step 1:** Replace full contents of `src/components/HomeBentoGrid.tsx`.

**Step 2:** Commit
```bash
git add src/components/HomeBentoGrid.tsx
git commit -m "feat: simplify HomeBentoGrid → Salon Tools only, 4-card grid, no floating widgets"
```

---

## Task 5 — Smoke test

**Step 1:** Start dev server
```bash
cd /c/Users/david/pro-hair-picks && npm run dev
```

**Step 2:** Open `http://localhost:5173` and verify:
- [ ] Hero: left-aligned text, photo bg, gradient overlay, gold CTA button visible
- [ ] Explore Categories: 3 photo cards + 3 icon cards below
- [ ] Latest Articles: 3 dark cards with category tag in gold
- [ ] Salon Tools: 4 cards in a row, no floating widgets
- [ ] No TypeScript/console errors

**Step 3:** If `Armchair` from lucide-react is missing, swap it:
```tsx
// In PhotoSections.tsx, replace:
import { ArrowRight, Scissors, Zap, Armchair } from "lucide-react";
// With:
import { ArrowRight, Scissors, Zap, Sofa } from "lucide-react";
// And update the iconCards array:
{ title: "Furniture", href: "...", icon: Sofa },
```

**Step 4:** Final commit if any fixes needed
```bash
git add -p
git commit -m "fix: post-redesign smoke test corrections"
```
