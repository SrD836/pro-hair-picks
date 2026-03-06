# Add `slug` Column to `products` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a stable, indexed `slug` column to `products`, replace all ILIKE lookups with exact `slug =` queries, and add a DB trigger so future pipeline inserts generate slugs automatically.

**Architecture:** Single Supabase migration handles column creation, backfill (with duplicate suffix resolution), NOT NULL + UNIQUE constraint, and the BEFORE INSERT trigger. The JS `toProductSlug()` is updated to use explicit character transliteration matching the SQL `translate()` formula — no NFD, full parity. Two component files update their `SELECT` and lookup queries to use the new column.

**Tech Stack:** PostgreSQL (Supabase), React + TypeScript, TanStack Query, `mcp__supabase-web__apply_migration` + `execute_sql`

---

## Pre-flight context

**Key finding:** `toProductSlug()` uses Unicode NFD normalization (`á→a`, `ñ→n`). The SQL `[^a-zA-Z0-9\s-]` filter strips those chars entirely (`á→""`, `ñ→""`). Both must produce identical output or links break. Fix: replace NFD in JS with explicit `translate`-style char map; update SQL to use `translate()` with the same map.

**Duplicates to handle (5 records):**
- IDs `62d0d72b`, `8c69fdf2` → same "Rizador de Pelo Automatico…" → will become `slug` and `slug-2`
- IDs `3b98cc9d`, `95ae3937`, `e3d7ab1b` → same "URAQT Capas para Peluqueria…" → will become `slug`, `slug-2`, `slug-3`

---

## Task 1 — Write and apply the Supabase migration

**Files:**
- Create: `supabase/migrations/20260306000001_add_product_slug.sql`

### Step 1: Create the migration file

```sql
-- =========================================================
-- Migration: add slug column to products
-- =========================================================

-- 1. Add nullable column (does not break existing rows)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

-- 2. Backfill: translate accented chars, strip non-alphanumeric,
--    replace spaces with hyphens, collapse multi-hyphens.
--    Uses ROW_NUMBER() to suffix duplicates (-2, -3, ...).
WITH ranked AS (
  SELECT
    id,
    regexp_replace(
      lower(regexp_replace(
        regexp_replace(
          translate(
            trim(name),
            'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
            'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
          ),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )),
      '-+', '-', 'g'
    ) AS base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY regexp_replace(
        lower(regexp_replace(
          regexp_replace(
            translate(
              trim(name),
              'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
              'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
            ),
            '[^a-zA-Z0-9\s-]', '', 'g'
          ),
          '\s+', '-', 'g'
        )),
        '-+', '-', 'g'
      )
      ORDER BY created_at, id
    ) AS rn
  FROM products
  WHERE slug IS NULL
)
UPDATE products p
SET slug = CASE
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || '-' || r.rn
END
FROM ranked r
WHERE p.id = r.id;

-- 3. Verify: must return 0 before proceeding
-- SELECT count(*) FROM products WHERE slug IS NULL;

-- 4. Apply NOT NULL + UNIQUE
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- =========================================================
-- Trigger: auto-generate slug on INSERT (for daily pipeline)
-- =========================================================
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 2;
BEGIN
  -- Skip if caller already set a slug
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;

  base_slug := regexp_replace(
    lower(regexp_replace(
      regexp_replace(
        translate(
          trim(NEW.name),
          'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
          'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )),
    '-+', '-', 'g'
  );

  final_slug := base_slug;

  -- Append suffix until unique
  WHILE EXISTS (
    SELECT 1 FROM products WHERE slug = final_slug AND id != NEW.id
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_slug
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION generate_product_slug();
```

### Step 2: Dry-run — verify slug output and duplicate count

```sql
-- Verify slug formula output (should match JS toProductSlug)
SELECT name, derived_slug FROM (
  SELECT name,
    regexp_replace(
      lower(regexp_replace(
        regexp_replace(
          translate(trim(name),
            'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
            'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'),
          '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g')),
      '-+', '-', 'g') AS derived_slug
  FROM products LIMIT 5
) t;

-- Must return 0 for blocking duplicates
SELECT derived_slug, count(*) FROM (
  SELECT regexp_replace(
    lower(regexp_replace(
      regexp_replace(
        translate(trim(name),
          'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
          'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'),
        '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g')),
    '-+', '-', 'g') AS derived_slug
  FROM products
) t
GROUP BY derived_slug HAVING count(*) > 1;
-- Expected: 2 rows (known duplicates that ROW_NUMBER() will suffix)
```

Expected: 2 duplicate groups (already identified — `rizador-de-pelo-automatico-...` ×2, `uraqt-capas-para-peluqueria-...` ×3). These are handled by the ROW_NUMBER() suffix logic in the migration. If more appear, **STOP** and report.

### Step 3: Apply migration via MCP

Use `mcp__supabase-web__apply_migration` with:
- `name`: `add_product_slug`
- `query`: full SQL from Step 1

### Step 4: Verify migration applied

```sql
-- Must return 431 rows all with non-null slugs
SELECT count(*) FROM products WHERE slug IS NOT NULL;

-- Must return 0 rows
SELECT count(*) FROM products WHERE slug IS NULL;

-- Spot-check known names
SELECT name, slug FROM products
WHERE name IN (
  'Wahl Detailer Trimmer',
  'Panasonic ER-1512 - Cortapelos',
  'Rizador de Pelo Automatico, Rizador Pelo Ondas, con 4 Niveles de Temperatura Ajustables, 3 Opciones de Tiempo de Calentamiento, Diseño Antiquemaduras, no Daña el Cabello'
)
ORDER BY name;
```

Expected slugs:
- `wahl-detailer-trimmer`
- `panasonic-er-1512-cortapelos`
- `rizador-de-pelo-automatico-rizador-pelo-ondas-con-4-niveles-de-temperatura-ajustables-3-opciones-de-tiempo-de-calentamiento-diseno-antiquemaduras-no-dana-el-cabello`
- `rizador-de-pelo-automatico-...-2` (the duplicate)

### Step 5: Commit

```bash
git add supabase/migrations/20260306000001_add_product_slug.sql
git commit -m "fix: add slug column to products with backfill + trigger"
```

---

## Task 2 — Update `toProductSlug()` to match SQL formula

**Files:**
- Modify: `src/lib/utils.ts`

### Step 1: Replace the NFD implementation with explicit char map

The current function uses `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` which maps ALL Unicode diacritics. The SQL uses `translate()` with an explicit list. Update JS to use the same explicit list so both produce byte-identical output.

```typescript
export function toProductSlug(name: string): string {
  const from = 'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ';
  const to   = 'aeiouaeiouaeiounAEIOUAEIOUAEIOUN';
  const charMap: Record<string, string> = {};
  for (let i = 0; i < from.length; i++) charMap[from[i]] = to[i];

  return name
    .split('')
    .map((c) => charMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Parity assertion (runs once at module load in dev)
console.assert(toProductSlug('Wahl Senior') === 'wahl-senior', 'slug: Wahl Senior');
console.assert(toProductSlug('Panasonic ER-1512 - Cortapelos') === 'panasonic-er-1512-cortapelos', 'slug: ER-1512');
console.assert(toProductSlug('Diseño Antiquemaduras') === 'diseno-antiquemaduras', 'slug: accents');
```

### Step 2: Run TypeScript check

```bash
cd C:/Users/david/pro-hair-picks && npx tsc --noEmit
```

Expected: 0 errors.

### Step 3: Commit

```bash
git add src/lib/utils.ts
git commit -m "fix: align toProductSlug() with SQL translate() formula"
```

---

## Task 3 — Update `ProductPage.tsx`: lookup by `slug =` instead of ILIKE

**Files:**
- Modify: `src/pages/ProductPage.tsx`

### Step 1: Replace ILIKE lookup with exact slug query + fallback

Find the `queryFn` in the `useQuery(["product-by-slug", slug])` block and replace:

**Before:**
```typescript
queryFn: async () => {
  const nameSearch = slug!.replace(/-/g, " ");
  const { data } = await supabase
    .from("products")
    .select("id, name, image_url, amazon_rating, amazon_reviews, current_price, brand, category, amazon_url, amazon_url_us")
    .ilike("name", `%${nameSearch}%`)
    .limit(10);
  if (!data) return null;
  return data.find((p) => toProductSlug(p.name) === slug) ?? data[0] ?? null;
},
```

**After:**
```typescript
queryFn: async () => {
  // Primary: exact slug lookup (indexed, O(log n))
  const { data: exact } = await supabase
    .from("products")
    .select("id, name, slug, image_url, amazon_rating, amazon_reviews, current_price, brand, category, amazon_url, amazon_url_us")
    .eq("slug", slug!)
    .maybeSingle();
  if (exact) return exact;

  // Fallback: product exists but slug column not yet backfilled
  const nameSearch = slug!.replace(/-/g, " ");
  const { data: byName } = await supabase
    .from("products")
    .select("id, name, slug, image_url, amazon_rating, amazon_reviews, current_price, brand, category, amazon_url, amazon_url_us")
    .ilike("name", `%${nameSearch}%`)
    .limit(5);
  const found = byName?.find((p) => toProductSlug(p.name) === slug) ?? byName?.[0] ?? null;
  if (found) {
    console.warn("[ProductPage] Product found by name fallback, slug missing:", slug);
  }
  return found ?? null;
},
```

### Step 2: TypeScript check

```bash
npx tsc --noEmit
```

### Step 3: Commit

```bash
git add src/pages/ProductPage.tsx
git commit -m "fix: replace ilike product lookup with indexed slug= query"
```

---

## Task 4 — Update `BlogPostPage.tsx` and `CategoryProductsPage.tsx`: add `slug` to SELECT

**Files:**
- Modify: `src/pages/BlogPostPage.tsx`
- Modify: `src/pages/CategoryProductsPage.tsx`

### Step 1: BlogPostPage — update relatedProducts query SELECT

Find `queryKey: ["blog-related-products"` and change the `.select()` call:

**Before:**
```typescript
.select("id, name, image_url, amazon_rating, category")
```

**After (both the category query and the fallback):**
```typescript
.select("id, name, slug, image_url, amazon_rating, category")
```

Then update the Link `to` prop to use `product.slug ?? toProductSlug(product.name)`:

**Before:**
```tsx
to={`/productos/${toProductSlug(product.name)}`}
```

**After:**
```tsx
to={`/productos/${product.slug ?? toProductSlug(product.name)}`}
```

### Step 2: CategoryProductsPage — no product links to update

`CategoryProductsPage` links to `/blog/[slug]` (blog posts, not products). No product link changes needed here — verify this by checking that no `toProductSlug` call exists in this file.

### Step 3: TypeScript check

```bash
npx tsc --noEmit
```

Expected: TypeScript will complain that `slug` is not in the Product type used by `useProductsByCategory`. This is a known issue — fixed in Task 5.

### Step 4: Commit (after Task 5 type fix)

Defer this commit until after Task 5.

---

## Task 5 — Update TypeScript types for `products.slug`

**Files:**
- Modify: `src/integrations/supabase/types.ts`
- Modify: `src/hooks/useProductsByCategory.ts`

### Step 1: Add `slug` to `products` Row/Insert/Update in `types.ts`

Find the `products:` table definition (around line 822) and add to all three (Row, Insert, Update):

In `Row`:
```typescript
slug: string  // add after name: string
```

In `Insert`:
```typescript
slug?: string | null  // optional on insert (trigger fills it)
```

In `Update`:
```typescript
slug?: string | null
```

### Step 2: Add `slug` to the `Product` interface in `useProductsByCategory.ts`

```typescript
export interface Product {
  id: string;
  slug: string;          // add this line
  category: string;
  // ... rest unchanged
}
```

And add `slug` to the `.select()` call in the same file:

```typescript
.select("id, slug, category, price_range, name, brand, ...")
```

### Step 3: TypeScript check — must be 0 errors

```bash
npx tsc --noEmit
```

### Step 4: Commit everything from Tasks 4–5 together

```bash
git add src/pages/BlogPostPage.tsx \
        src/integrations/supabase/types.ts \
        src/hooks/useProductsByCategory.ts
git commit -m "fix: add slug to products type, use slug in product links"
```

---

## Verification checklist

After all tasks complete, run these checks:

```bash
# TypeScript clean
npx tsc --noEmit

# No remaining ilike product lookups (except the fallback in ProductPage)
grep -n "ilike.*name" src/pages/ProductPage.tsx
# Expected: exactly 1 line (the fallback)

grep -rn "ilike.*name" src/pages/ src/components/ src/hooks/
# Expected: only ProductPage.tsx fallback line
```

In browser (dev server):
1. Navigate to `/categorias/clippers` → products load ✓
2. Click a product link → `/productos/[slug]` loads correctly ✓
3. Check Network tab: product query should hit `slug=eq.wahl-detailer-trimmer` not `name=ilike.*` ✓
4. Navigate to `/blog/[any-post]` → related products grid loads with correct `/productos/[slug]` hrefs ✓
