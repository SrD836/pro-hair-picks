#!/usr/bin/env node
/**
 * audit-titles.js
 * Consulta todos los títulos de blog_posts y reporta cuántos superan 60 chars.
 * Muestra preview del título optimizado con la misma lógica que buildPageTitle().
 * Solo lectura — no modifica nada en la base de datos.
 *
 * USO:
 *   node scripts/seo/audit-titles.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Cargar .env.scripts ──────────────────────────────────────────────────────
const ENV_FILE = path.join(__dirname, '../../.env.scripts');
if (fs.existsSync(ENV_FILE)) {
  fs.readFileSync(ENV_FILE, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 0) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^[\"']|[\"']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
}

const MGMT_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

if (!MGMT_TOKEN || !PROJECT_ID) {
  console.error('[error] Necesitas SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID en .env.scripts');
  process.exit(1);
}

const MGMT_BASE = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

async function sql(query) {
  const res = await fetch(MGMT_BASE, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${MGMT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Management API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Misma lógica que src/utils/seo.ts ────────────────────────────────────────
const BRAND    = 'Guía del Salón';
const MAX_CHARS = 60;

function buildPageTitle(rawTitle, keyword) {
  if (rawTitle.length <= MAX_CHARS) return `${rawTitle} | ${BRAND}`;

  if (keyword && keyword.trim().length > 0) {
    const seoTitle = `Top ${keyword.trim()} 2026`;
    if (seoTitle.length <= MAX_CHARS) return `${seoTitle} | ${BRAND}`;
    const maxKeywordLen = MAX_CHARS - 'Top  2026'.length;
    return `Top ${keyword.trim().slice(0, maxKeywordLen)} 2026 | ${BRAND}`;
  }

  const truncated = rawTitle.slice(0, MAX_CHARS).replace(/\s+\S*$/, '');
  return `${truncated}… | ${BRAND}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🔍  Auditando títulos de blog_posts...\n');

  const rows = await sql('SELECT id, title, keywords FROM blog_posts WHERE is_published = true ORDER BY title');

  const W_TITLE    = 50;
  const W_CHARS    = 6;
  const W_OPTIMIZED = 70;
  const pad = (s, n) => String(s ?? '').slice(0, n).padEnd(n);

  let over = 0;
  const issues = [];

  for (const row of rows) {
    const rawTitle = row.title ?? '';
    const kw = Array.isArray(row.keywords) ? row.keywords[0] : null;
    const optimized = buildPageTitle(rawTitle, kw);
    if (rawTitle.length > MAX_CHARS) {
      over++;
      issues.push({ title: rawTitle, chars: rawTitle.length, optimized });
    }
  }

  console.log(`📊  Total posts: ${rows.length}`);
  console.log(`✅  Dentro del límite (≤${MAX_CHARS} chars): ${rows.length - over}`);
  console.log(`⚠️   Superan ${MAX_CHARS} chars: ${over}\n`);

  if (issues.length > 0) {
    const sep = `${'─'.repeat(W_CHARS + 2)}┼${'─'.repeat(W_TITLE + 2)}┼${'─'.repeat(W_OPTIMIZED + 2)}`;
    console.log(`${'─'.repeat(W_CHARS + 2)}┬${'─'.repeat(W_TITLE + 2)}┬${'─'.repeat(W_OPTIMIZED + 2)}`);
    console.log(` ${'Chars'.padEnd(W_CHARS)} │ ${'Título original'.padEnd(W_TITLE)} │  Título optimizado`);
    console.log(sep);
    for (const { title, chars, optimized } of issues) {
      console.log(` ${String(chars).padEnd(W_CHARS)} │ ${pad(title, W_TITLE)} │  ${optimized}`);
    }
    console.log(sep + '\n');
  }
})().catch(e => { console.error('[error]', e.message); process.exit(1); });
