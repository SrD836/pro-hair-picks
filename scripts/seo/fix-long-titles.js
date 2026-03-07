#!/usr/bin/env node
/**
 * fix-long-titles.js
 * Usa `claude -p` para acortar títulos largos (>43 chars) en blog_posts y categories.
 * Muestra antes/después y actualiza la base de datos.
 *
 * USO (desde terminal independiente, fuera de Claude Code):
 *   node scripts/seo/fix-long-titles.js           # actualiza en DB
 *   node scripts/seo/fix-long-titles.js --dry-run # solo muestra cambios
 *
 * Variables en .env.scripts:
 *   SUPABASE_ACCESS_TOKEN  — Management API token (sbp_...)
 *   SUPABASE_PROJECT_ID    — ID del proyecto Supabase
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Cargar .env.scripts ───────────────────────────────────────────────────────
const ENV_FILE = path.join(__dirname, '../../.env.scripts');
if (fs.existsSync(ENV_FILE)) {
  fs.readFileSync(ENV_FILE, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 0) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
}

const MGMT_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const DRY_RUN    = process.argv.includes('--dry-run');
const MAX_CHARS  = 43;

if (!MGMT_TOKEN || !PROJECT_ID) {
  console.error('[error] Necesitas SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID en .env.scripts');
  process.exit(1);
}

const { callClaude } = require('../daily-content/lib/claude-cli');

// ── Slugs a procesar ──────────────────────────────────────────────────────────
const BLOG_SLUGS = [
  'como-hacer-babylights-en-casa-paso-a-paso',
  'como-usar-redes-sociales-para-llenar-agenda-citas-barberia',
  'cortes-bob-variantes-a-quien-favorecen',
  'diferencia-clipper-trimmer-profesional-barberos',
  'equipamiento-minimo-para-montar-una-barberia-profesional',
  'esterilizadores-uv-barberia-como-elegir-cuando-usarlos',
  'kits-completos-fade-degradado-mejores-barberos-profesionales',
  'mejores-clippers-profesionales-barberia-comparativa-2026',
  'mejores-planchas-pelo-profesionales-peluqueria-2026',
  'peinados-de-celebridades-que-triunfan-en-espana',
  'rutina-completa-cuidado-capilar-hombres',
  'tijeras-japonesas-vs-alemanas-peluqueria-cual-comprar',
  'wahl-vs-andis-vs-oster-mejor-maquinilla-barberos-profesionales',
];

const CATEGORY_SLUGS = [
  'lavacabezas-portatiles-y-fijos',
  'tratamientos-capilares-profundos',
];

const MGMT_BASE = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

// ── Supabase Management API ───────────────────────────────────────────────────
async function sql(query) {
  const res = await fetch(MGMT_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MGMT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Supabase API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Acortar título con claude -p ──────────────────────────────────────────────
function shortenTitle(original, keywords) {
  const kwHint = keywords && keywords.length > 0
    ? `Keyword principal: "${keywords[0]}". `
    : '';

  const prompt = `Eres un experto en SEO para el sector de peluquería y barbería profesional.
Acorta este título de blog a un máximo de ${MAX_CHARS} caracteres.

REGLAS:
- Máximo ${MAX_CHARS} caracteres (incluyendo espacios)
- Mantén la keyword principal al inicio si es posible
- Mantén el año (2026) si aparece en el original
- Conserva el sentido y la intención de búsqueda
- No uses puntos suspensivos ni truncados bruscos
- Responde SOLO con el título acortado, sin comillas ni explicaciones

${kwHint}Título original (${original.length} chars): ${original}`;

  const response = callClaude(prompt, { timeout: 30_000 });
  const shortened = response.trim().replace(/^["']|["']$/g, '');

  if (!shortened || shortened.length > MAX_CHARS + 5) {
    throw new Error(`Respuesta inválida: "${shortened}"`);
  }
  return shortened.slice(0, MAX_CHARS);
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n🔧  fix-long-titles.js — Modo: ${DRY_RUN ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log(`📏  Límite: ${MAX_CHARS} chars\n`);

  let totalFixed = 0;

  // ── blog_posts ──────────────────────────────────────────────────────────────
  console.log('📝  Procesando blog_posts...\n');
  const slugList = BLOG_SLUGS.map(s => `'${s}'`).join(', ');
  const posts = await sql(
    `SELECT slug, title, keywords FROM blog_posts WHERE slug IN (${slugList}) ORDER BY slug`
  );

  for (const row of posts) {
    const original = row.title ?? '';
    if (original.length <= MAX_CHARS) {
      console.log(`  ✅  ${String(original.length).padStart(2)}c  ${original}`);
      continue;
    }

    console.log(`  ✂️   ${String(original.length).padStart(2)}c  ${original}`);
    try {
      const kw = Array.isArray(row.keywords) ? row.keywords : [];
      const shortened = shortenTitle(original, kw);
      console.log(`       → ${String(shortened.length).padStart(2)}c  ${shortened}`);

      if (!DRY_RUN) {
        const escaped = shortened.replace(/'/g, "''");
        await sql(`UPDATE blog_posts SET title = '${escaped}' WHERE slug = '${row.slug}'`);
        console.log(`       ✓ Actualizado en DB`);
      }
      totalFixed++;
    } catch (err) {
      console.error(`       ❌ Error: ${err.message}`);
    }
    console.log('');
  }

  // ── categories ──────────────────────────────────────────────────────────────
  console.log('🗂️   Procesando categories...\n');
  const catList = CATEGORY_SLUGS.map(s => `'${s}'`).join(', ');
  const cats = await sql(
    `SELECT slug, name FROM categories WHERE slug IN (${catList}) ORDER BY slug`
  );

  for (const row of cats) {
    const original = row.name ?? '';
    if (original.length <= MAX_CHARS) {
      console.log(`  ✅  ${String(original.length).padStart(2)}c  ${original}`);
      continue;
    }

    console.log(`  ✂️   ${String(original.length).padStart(2)}c  ${original}`);
    try {
      const shortened = shortenTitle(original, []);
      console.log(`       → ${String(shortened.length).padStart(2)}c  ${shortened}`);

      if (!DRY_RUN) {
        const escaped = shortened.replace(/'/g, "''");
        await sql(`UPDATE categories SET name = '${escaped}' WHERE slug = '${row.slug}'`);
        console.log(`       ✓ Actualizado en DB`);
      }
      totalFixed++;
    } catch (err) {
      console.error(`       ❌ Error: ${err.message}`);
    }
    console.log('');
  }

  console.log('─'.repeat(58));
  if (DRY_RUN) {
    console.log(`✅  DRY RUN — ${totalFixed} títulos serían acortados\n`);
  } else {
    console.log(`✅  Completado — ${totalFixed} títulos actualizados en DB\n`);
  }
})().catch(e => {
  console.error('[error fatal]', e.message);
  process.exit(1);
});
