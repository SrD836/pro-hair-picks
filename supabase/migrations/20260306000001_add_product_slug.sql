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

-- 3. Apply NOT NULL + UNIQUE
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

  -- Guard: empty name produces empty slug
  IF base_slug = '' OR base_slug = '-' THEN
    RAISE EXCEPTION 'Cannot generate slug for product with empty/invalid name: %', NEW.name;
  END IF;

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

CREATE OR REPLACE TRIGGER set_product_slug
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION generate_product_slug();
