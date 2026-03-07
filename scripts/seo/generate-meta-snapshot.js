#!/usr/bin/env node
/**
 * generate-meta-snapshot.js
 * Genera public/_meta_snapshot.json con meta tags para blog posts, categorias y productos.
 * Consumido por SEOHead.tsx como fallback para crawlers sin JS.
 *
 * VARIABLES EN .env.scripts o .env:
 *   SUPABASE_URL           — https://[ref].supabase.co
 *   SUPABASE_SERVICE_KEY   — service_role JWT (preferido)
 *   SUPABASE_ACCESS_TOKEN  — Management API token (sbp_...) — alternativa
 *   SUPABASE_PROJECT_ID    — requerido si usas SUPABASE_ACCESS_TOKEN
 *
 * USO:
 *   node scripts/seo/generate-meta-snapshot.js
 *   npm run meta:snapshot
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Cargar variables de entorno ──────────────────────────────────────────────
for (const envFile of ['.env.scripts', '.env']) {
  const p = path.join(__dirname, '../../', envFile);
  if (!fs.existsSync(p)) continue;
  fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 0) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
}

const SUPABASE_URL     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SERVICE_KEY      = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY || '';
const ACCESS_TOKEN     = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_ID       = process.env.SUPABASE_PROJECT_ID || '';
const BRAND            = 'Guía del Salón';

if (!SUPABASE_URL && !PROJECT_ID) {
  console.warn('⚠️  SUPABASE_URL o SUPABASE_PROJECT_ID no configurado — saltando generación de meta snapshot');
  process.exit(0);
}

// ── Clientes de datos ─────────────────────────────────────────────────────────

/** REST API directa con service_role key */
async function restQuery(table, params) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`REST ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Management API con access token (sbp_...) */
async function managementQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`Management API: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Elige el método disponible */
async function query(table, params, sql) {
  if (SERVICE_KEY && SUPABASE_URL) {
    return restQuery(table, params);
  }
  if (ACCESS_TOKEN && PROJECT_ID) {
    return managementQuery(sql);
  }
  throw new Error('No hay credenciales de Supabase configuradas');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').trim();
}

function buildPageTitle(rawTitle) {
  if (rawTitle.length <= 60) return `${rawTitle} | ${BRAND}`;
  return `${rawTitle.slice(0, 57)}… | ${BRAND}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📸 Generando meta snapshot desde Supabase...');

  // 1. Blog posts
  const posts = await query(
    'blog_posts',
    'select=slug,title,meta_description,excerpt&meta_description=not.is.null&meta_description=neq.&is_published=eq.true&order=published_at.desc&limit=200',
    `SELECT slug, title, meta_description, excerpt
     FROM blog_posts
     WHERE meta_description IS NOT NULL AND meta_description != ''
       AND is_published = true
     ORDER BY published_at DESC LIMIT 200`
  );

  // 2. Categorias
  const categories = await query(
    'categories',
    'select=slug,name',
    `SELECT slug, name FROM categories`
  );

  // 3. Productos
  const products = await query(
    'products',
    'select=slug,name&limit=200',
    `SELECT slug, name FROM products LIMIT 200`
  );

  // ── Construir snapshot ────────────────────────────────────────────────────

  const blog = {};
  for (const p of (posts || [])) {
    if (!p.slug) continue;
    blog[p.slug] = {
      title: buildPageTitle(p.title || ''),
      description: (p.meta_description || p.excerpt || '').slice(0, 155),
    };
  }

  const categorias = {};
  for (const c of (categories || [])) {
    if (!c.slug) continue;
    const name = c.name || c.slug.replace(/-/g, ' ');
    categorias[c.slug] = {
      title: `${name} profesional — Comparativa y precios | ${BRAND}`,
      description: `Comparativa de ${name.toLowerCase()} para peluqueros y barberos: modelos mejor valorados, precios en Amazon España y análisis de rendimiento real en salón.`.slice(0, 155),
    };
  }

  const productos = {};
  for (const p of (products || [])) {
    if (!p.slug) continue;
    const name = p.name || p.slug.replace(/-/g, ' ');
    const rawDesc = `Análisis de ${name}: especificaciones técnicas, precio y veredicto de experto para profesionales del salón.`.slice(0, 155);
    productos[p.slug] = {
      title: `${name.slice(0, 50)} — Análisis profesional | ${BRAND}`,
      description: rawDesc,
    };
  }

  const snapshot = {
    generated: new Date().toISOString(),
    blog,
    categorias,
    productos,
  };

  // ── Escribir archivo ──────────────────────────────────────────────────────

  const outPath = path.join(__dirname, '../../public/_meta_snapshot.json');
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');

  console.log(`✅ Generated meta snapshot: ${Object.keys(blog).length} blog, ${Object.keys(categorias).length} categorias, ${Object.keys(productos).length} productos`);
  console.log(`📁 ${outPath}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
