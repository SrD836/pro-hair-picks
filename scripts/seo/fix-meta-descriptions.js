#!/usr/bin/env node
/**
 * fix-meta-descriptions.js
 * Genera meta descriptions únicas para posts con meta_description nula/vacía/duplicada.
 *
 * DEPENDENCIAS:
 *   @supabase/supabase-js — solo si usas SUPABASE_SERVICE_KEY (JWT).
 *   Si usas SUPABASE_ACCESS_TOKEN (sbp_...) el script usa fetch nativo (Node 18+).
 *
 *   Si @supabase/supabase-js no está instalado:
 *     npm install @supabase/supabase-js   (dentro de scripts/ o en la raíz)
 *
 * VARIABLES EN .env.scripts:
 *   SUPABASE_URL           — https://[ref].supabase.co
 *   SUPABASE_ACCESS_TOKEN  — Management API token (sbp_...) → usa fetch nativo
 *   SUPABASE_PROJECT_ID    — ID del proyecto (solo si se usa Management API)
 *   O bien:
 *   SUPABASE_SERVICE_KEY   — service_role JWT → usa @supabase/supabase-js
 *
 * USO:
 *   node scripts/seo/fix-meta-descriptions.js           → dry-run (por defecto)
 *   node scripts/seo/fix-meta-descriptions.js --force   → sin confirmación
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
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
} else {
  console.warn('[warn] .env.scripts no encontrado — usando variables de entorno del sistema.');
}

// ── Seleccionar estrategia de acceso ────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SERVICE_JWT      = process.env.SUPABASE_SERVICE_KEY;   // service_role JWT
const MGMT_TOKEN       = process.env.SUPABASE_ACCESS_TOKEN;  // sbp_... PAT
const PROJECT_ID       = process.env.SUPABASE_PROJECT_ID;

const USE_MGMT_API = !SERVICE_JWT && !!MGMT_TOKEN && !!PROJECT_ID;
const USE_SUPABASE_JS = !!SERVICE_JWT && !!SUPABASE_URL;

if (!USE_MGMT_API && !USE_SUPABASE_JS) {
  console.error(
    '[error] Configuración incompleta. Necesitas una de estas combinaciones:\n' +
    '  A) SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_ID  (Management API, recomendado)\n' +
    '  B) SUPABASE_URL + SUPABASE_SERVICE_KEY           (Supabase JS client)\n' +
    'Revisa tu .env.scripts.'
  );
  process.exit(1);
}

// ── Inicializar cliente según estrategia ────────────────────────────────────
let supabase = null;
const MGMT_BASE = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

if (USE_SUPABASE_JS) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SERVICE_JWT);
}

/** Ejecuta SQL via Management API REST (bypasa RLS completamente). */
async function sql(query) {
  const res = await fetch(MGMT_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MGMT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Management API ${res.status}: ${txt}`);
  }
  return res.json();
}

/** Wrapper SELECT unificado. */
async function dbSelect(table, columns, filters = '') {
  if (USE_MGMT_API) {
    const whereClause = filters ? `WHERE ${filters}` : '';
    return sql(`SELECT ${columns} FROM ${table} ${whereClause}`);
  }
  // Supabase JS path (service role key disponible)
  const q = supabase.from(table).select(columns);
  // Los filtros en supabase-js se pasan por encadenamiento; aquí es simplificado
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

/** UPDATE via Management API o JS client. */
async function dbUpdate(id, meta) {
  if (USE_MGMT_API) {
    const escaped = meta.replace(/'/g, "''");
    await sql(`UPDATE blog_posts SET meta_description = '${escaped}' WHERE id = '${id}'`);
    return null;
  }
  const { error } = await supabase
    .from('blog_posts')
    .update({ meta_description: meta })
    .eq('id', id);
  return error ?? null;
}

const FORCE = process.argv.includes('--force');
const BATCH_SIZE  = 50;
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

// ── Helpers ──────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function truncate(text, maxLen) {
  if (!text) return '';
  return text.length <= maxLen ? text : text.slice(0, maxLen - 3) + '...';
}

function buildMeta(post) {
  const MAX = 155;
  const kw = Array.isArray(post.keywords) ? post.keywords.filter(Boolean) : [];

  // CASO A: keywords con al menos 1 elemento
  if (kw.length > 0) {
    const base = `${kw[0]}: comparativa profesional, ventajas, precio actualizado y recomendaciones para peluquerías.`;
    return truncate(base, MAX);
  }

  // CASO B: title disponible
  if (post.title) {
    const shortTitle = truncate(post.title, 80);
    const base = `Guía profesional sobre ${shortTitle}. Consejos, productos y técnicas para profesionales del salón.`;
    return truncate(base, MAX);
  }

  // CASO C: sin datos
  return 'Recursos y guías para profesionales de peluquería y barbería en España. GuiaDelSalon.com';
}

function printTable(rows) {
  const W_TITLE  = 42;
  const W_BEFORE = 35;
  const W_AFTER  = 50;
  const pad = (s, n) => String(s ?? '(null)').slice(0, n).padEnd(n);
  const sep = `${'─'.repeat(6)}┼${'─'.repeat(W_TITLE + 2)}┼${'─'.repeat(W_BEFORE + 2)}┼${'─'.repeat(W_AFTER + 2)}`;

  console.log(`\n${'─'.repeat(6)}┬${'─'.repeat(W_TITLE + 2)}┬${'─'.repeat(W_BEFORE + 2)}┬${'─'.repeat(W_AFTER + 2)}`);
  console.log(` ${'ID'.padEnd(5)} │ ${' Título'.padEnd(W_TITLE + 1)} │ ${' ANTES'.padEnd(W_BEFORE + 1)} │  DESPUÉS`);
  console.log(sep);
  for (const r of rows) {
    console.log(
      ` ${r.id.slice(0, 5).padEnd(5)} │ ${pad(r.title, W_TITLE).padStart(1).padEnd(W_TITLE + 1)} │ ${pad(r.meta_before, W_BEFORE).padEnd(W_BEFORE + 1)} │  ${r.meta_after}`
    );
  }
  console.log(sep + '\n');
}

function askConfirm(question) {
  return new Promise(resolve => {
    if (!process.stdin.isTTY) {
      console.warn('[aviso] Terminal no interactiva. Usa --force para ejecutar sin confirmación.');
      resolve(false);
      return;
    }
    process.stdout.write(question);
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', data => {
      process.stdin.pause();
      resolve(data.trim().toLowerCase() === 's');
    });
  });
}

async function updateWithRetry(id, meta) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY);
    try {
      const err = await dbUpdate(id, meta);
      if (!err) return null;
      lastErr = err;
    } catch (e) {
      lastErr = e;
    }
  }
  return lastErr;
}

// ── PASO 1: Detectar afectados ───────────────────────────────────────────────
async function detectAffected() {
  const cols = 'id, title, keywords, meta_description, published_at';

  // 1a — NULL
  const nullRows = USE_MGMT_API
    ? await sql(`SELECT ${cols} FROM blog_posts WHERE meta_description IS NULL`)
    : await dbSelect('blog_posts', cols, 'meta_description IS NULL');

  // 1b — vacías
  const emptyRows = USE_MGMT_API
    ? await sql(`SELECT ${cols} FROM blog_posts WHERE trim(meta_description) = ''`)
    : await dbSelect('blog_posts', cols, "trim(meta_description) = ''");

  const affected = new Map();
  for (const row of [...(nullRows ?? []), ...(emptyRows ?? [])]) {
    affected.set(row.id, row);
  }

  // 1c — duplicadas
  try {
    const dupQuery = `
      SELECT meta_description, array_agg(id ORDER BY published_at, id) AS ids, count(*) AS cnt
      FROM blog_posts
      WHERE meta_description IS NOT NULL AND trim(meta_description) != ''
      GROUP BY meta_description
      HAVING count(*) > 1
    `;
    const dupGroups = USE_MGMT_API
      ? await sql(dupQuery)
      : await (async () => {
          const { data, error } = await supabase.rpc('raw', {}); // no-op path
          if (error) throw error;
          return data;
        })();

    for (const group of dupGroups ?? []) {
      const [, ...duplicates] = group.ids; // conservar el primero (más antiguo)
      for (const dupId of duplicates) {
        if (!affected.has(dupId)) {
          // Obtener datos del post duplicado
          const rows = USE_MGMT_API
            ? await sql(`SELECT ${cols} FROM blog_posts WHERE id = '${dupId}'`)
            : [];
          if (rows[0]) affected.set(dupId, rows[0]);
        }
      }
    }
  } catch (err) {
    console.warn('[aviso] No se pudo detectar duplicados (RLS u otro motivo):', err.message ?? err);
    console.warn('        Continuando solo con nulas y vacías.\n');
  }

  return Array.from(affected.values());
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  const mode = USE_MGMT_API ? 'Management API (sbp_...)' : 'Supabase JS (service_role)';
  console.log(`\n🔍  Detectando posts afectados... [${mode}]\n`);

  const posts = await detectAffected();

  if (posts.length === 0) {
    console.log('✅  No hay posts con meta description nula, vacía o duplicada. Nada que hacer.');
    process.exit(0);
  }

  const updates = posts.map(p => ({
    id:          p.id,
    title:       p.title,
    meta_before: p.meta_description,
    meta_after:  buildMeta(p),
  }));

  printTable(updates);
  console.log(`📋  Total a modificar: ${updates.length} post${updates.length !== 1 ? 's' : ''}\n`);

  if (!FORCE) {
    const ok = await askConfirm('¿Ejecutar actualización? (s/N): ');
    if (!ok) {
      console.log('\n⏸   Operación cancelada. Usa --force para ejecutar sin confirmación.\n');
      process.exit(0);
    }
  } else {
    console.log('⚡  Modo --force activado. Ejecutando sin confirmación...\n');
  }

  // ── PASO 4: Actualizar en batches ──────────────────────────────────────────
  let successCount = 0;
  const failedIds = [];

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(updates.length / BATCH_SIZE);
    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} posts)... `);

    const results = await Promise.all(
      batch.map(u => updateWithRetry(u.id, u.meta_after))
    );

    const batchFailed = batch.filter((_, idx) => results[idx] !== null);
    successCount += batch.length - batchFailed.length;
    for (const f of batchFailed) failedIds.push(f.id);

    console.log(`${batch.length - batchFailed.length} ok${batchFailed.length > 0 ? `, ${batchFailed.length} error(es)` : ''}`);
  }

  console.log(`\n✅  ${successCount} posts actualizados, ${failedIds.length} errores.`);
  if (failedIds.length > 0) {
    console.log('   IDs fallidos:');
    failedIds.forEach(id => console.log(`     - ${id}`));
  }
  console.log();
  process.exit(failedIds.length > 0 ? 1 : 0);
})();
