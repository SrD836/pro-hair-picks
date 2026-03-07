#!/usr/bin/env node
/**
 * GuiaDelSalon.com — Pipeline de contenido diario
 * Genera 5 posts SEO e inserta en Supabase como drafts.
 *
 * Usa `claude -p` (Claude Code CLI) — NO requiere ANTHROPIC_API_KEY separada.
 * Autenticación: la misma que tu suscripción de Claude Code.
 *
 * IMPORTANTE: Ejecutar desde una terminal INDEPENDIENTE (no desde Claude Code):
 *   npm run content        ← producción (inserta en Supabase)
 *   npm run content:dry    ← prueba sin insertar
 *   npm run content -- --date=2026-03-01   ← fecha manual
 *
 * Variables requeridas en .env.scripts:
 *   SUPABASE_ACCESS_TOKEN  — Management API token (sbp_...)
 *   SUPABASE_PROJECT_ID    — ID del proyecto Supabase
 *
 * Variables opcionales:
 *   SUPABASE_URL           — auto-detectada si no se pone
 *   SUPABASE_ANON_KEY      — para subir imágenes a Supabase Storage
 *   PEXELS_API_KEY         — para imágenes de Pexels (fallback: Unsplash)
 */

const fs    = require('fs');
const path  = require('path');
const { spawnSync } = require('child_process');

// ── Cargar .env.scripts ─────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.scripts');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  });
} else {
  console.error('❌ .env.scripts no encontrado. Copia .env.scripts.example y rellénalo.');
  process.exit(1);
}

// ── Verificar variables críticas ────────────────────────────────────────────
for (const key of ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_ID']) {
  if (!process.env[key]) {
    console.error(`❌ Variable requerida no encontrada en .env.scripts: ${key}`);
    process.exit(1);
  }
}

// ── Verificar que claude CLI está disponible ────────────────────────────────
const versionCheck = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (versionCheck.error || versionCheck.status !== 0) {
  console.error('❌ El comando `claude` no está disponible.');
  console.error('   Instala Claude Code CLI: https://claude.ai/download');
  process.exit(1);
}

const { planDay }          = require('./lib/planner');
const { researchAllPosts } = require('./lib/researcher');
const { writeAllPosts }    = require('./lib/writer');
const { processImages }    = require('./lib/images');
const { publishAll }       = require('./lib/publisher');
const { getUsedKeywords }  = require('./keyword-loader');

// ── Argumentos CLI ──────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1];
const dryRun  = args.includes('--dry-run');
const TODAY   = dateArg || new Date().toISOString().slice(0, 10);

const OUTPUT_DIR = path.join(__dirname, 'output', TODAY);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const config = {
  SUPABASE_PROJECT_ID  : process.env.SUPABASE_PROJECT_ID,
  SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  SUPABASE_URL         : process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
  SUPABASE_ANON_KEY    : process.env.SUPABASE_ANON_KEY || null,
  PEXELS_API_KEY       : process.env.PEXELS_API_KEY || null,
  OUTPUT_DIR,
};

// ── Pipeline principal ───────────────────────────────────────────────────────
async function run() {
  const start = Date.now();
  console.log(`\n🚀 GuiaDelSalon — Pipeline de contenido diario`);
  console.log(`📅 Fecha: ${TODAY} | Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log(`🤖 Motor: Claude Code CLI (claude -p) — suscripción actual`);
  console.log('─'.repeat(58));

  // FASE 0 — Planificación
  console.log('\n📋 FASE 0 — Planificando 5 posts del día...');
  const usedKeywords = await getUsedKeywords(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  const rawPlan = await planDay(TODAY, {
    usedKeywords,
    supabaseUrl: config.SUPABASE_URL,
    anonKey: config.SUPABASE_ANON_KEY,
  });
  console.log(`  ✓ Plan: ${rawPlan.posts.map(p => `[${p.type}]`).join(' · ')}`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_plan_inicial.json'), JSON.stringify(rawPlan, null, 2));

  // FASE 1 — Investigación
  console.log('\n🔍 FASE 1 — Investigando temas...');
  const researchedPlan = await researchAllPosts(rawPlan);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_plan.json'), JSON.stringify({
    ...researchedPlan,
    posts: researchedPlan.posts.map(p => ({
      slot: p.slot, type: p.type, topic: p.topic,
      target_keyword: p.target_keyword, slug: p.slug,
      bridge_test: p.bridge_test || null,
      bridge_trend_topic: p.bridge_trend_topic || null,
    })),
  }, null, 2));

  // FASE 2-4 — Redacción + visualización + enlazado
  console.log('\n✍️  FASE 2-4 — Redactando posts (puede tardar 15-25 min)...');
  const writtenPlan = await writeAllPosts(researchedPlan);

  for (const post of writtenPlan.posts) {
    const htmlPath = path.join(OUTPUT_DIR, `post_${post.slug}.html`);
    fs.writeFileSync(htmlPath, [
      `<!DOCTYPE html><html lang="es"><head>`,
      `<meta charset="UTF-8"><title>${(post.title || '').replace(/</g, '&lt;')}</title>`,
      `<meta name="description" content="${(post.meta_description || '').replace(/"/g, '&quot;')}">`,
      `</head><body><h1>${(post.title || '').replace(/</g, '&lt;')}</h1>`,
      post.content || '',
      `</body></html>`,
    ].join('\n'), 'utf8');
    console.log(`  ✓ post_${post.slug}.html`);
  }

  // FASE 5a — Imágenes
  console.log('\n🖼️  FASE 5a — Procesando imágenes...');
  const planWithImages = await processImages(writtenPlan, config);

  const finalPlan = {
    ...planWithImages,
    posts: planWithImages.posts.map(p => ({
      ...p,
      published_at: new Date(`${TODAY}T10:00:00Z`).toISOString(),
    })),
  };

  // FASE 5b — Publicación
  if (dryRun) {
    console.log('\n⏭️  DRY RUN — Posts que se insertarían:');
    finalPlan.posts.forEach(p => {
      console.log(`  · [${p.type}] "${p.title}" → /blog/${p.slug}`);
      console.log(`    meta_description: ${p.meta_description ? p.meta_description.slice(0, 80) + '…' : '⚠️  NULL'}`);
    });
  } else {
    console.log('\n📤 FASE 5b — Publicando drafts en Supabase...');
    await publishAll(finalPlan, config);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_plan_final.json'), JSON.stringify(finalPlan, null, 2));

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log('\n' + '─'.repeat(58));
  console.log(`✅ Completado en ${elapsed}s — ${finalPlan.posts.length} posts generados`);
  console.log(`📁 ${OUTPUT_DIR}`);
  if (!dryRun) console.log(`\nRevisar drafts en Supabase → ejecutar SQL de daily_report.md\n`);
}

run().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
