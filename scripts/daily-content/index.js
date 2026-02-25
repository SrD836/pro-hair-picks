#!/usr/bin/env node
/**
 * GuiaDelSalon.com — Pipeline de contenido diario
 * Genera 5 posts SEO de alta calidad y los inserta en Supabase como drafts.
 *
 * Uso:
 *   node scripts/daily-content/index.js
 *   node scripts/daily-content/index.js --date 2026-03-01   (fecha manual)
 *   node scripts/daily-content/index.js --dry-run            (sin insertar)
 *
 * Variables de entorno requeridas (en .env.scripts):
 *   ANTHROPIC_API_KEY        — Claude API key
 *   SUPABASE_ACCESS_TOKEN    — Management API token (sbp_...)
 *   SUPABASE_PROJECT_ID      — ID del proyecto Supabase
 *   SUPABASE_URL             — URL del proyecto
 *   SUPABASE_ANON_KEY        — Anon key para Storage upload
 *
 * Variables opcionales:
 *   PEXELS_API_KEY           — Para imágenes de Pexels (fallback: Unsplash)
 */

const fs   = require('fs');
const path = require('path');

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
const required = ['ANTHROPIC_API_KEY', 'SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Variable de entorno requerida no encontrada: ${key}`);
    process.exit(1);
  }
}

const Anthropic = require('@anthropic-ai/sdk');
const { planDay }         = require('./lib/planner');
const { researchAllPosts } = require('./lib/researcher');
const { writeAllPosts }   = require('./lib/writer');
const { processImages }   = require('./lib/images');
const { publishAll }      = require('./lib/publisher');

// ── Argumentos CLI ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1];
const dryRun  = args.includes('--dry-run');
const TODAY   = dateArg || new Date().toISOString().slice(0, 10);

// ── Config ──────────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, 'output', TODAY);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const config = {
  SUPABASE_PROJECT_ID  : process.env.SUPABASE_PROJECT_ID,
  SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  SUPABASE_URL         : process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
  SUPABASE_ANON_KEY    : process.env.SUPABASE_ANON_KEY,
  PEXELS_API_KEY       : process.env.PEXELS_API_KEY || null,
  OUTPUT_DIR,
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Pipeline principal ───────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀 GuiaDelSalon — Pipeline de contenido diario`);
  console.log(`📅 Fecha: ${TODAY} | Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log('─'.repeat(56));

  // FASE 0 — Planificación
  console.log('\n📋 FASE 0 — Planificando los 5 posts del día...');
  const rawPlan = await planDay(client, TODAY);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'daily_plan_initial.json'),
    JSON.stringify(rawPlan, null, 2)
  );
  console.log(`  ✓ Plan inicial: ${rawPlan.posts.map(p => p.type).join(' · ')}`);

  // FASE 1 — Investigación
  console.log('\n🔍 FASE 1 — Investigando temas...');
  const researchedPlan = await researchAllPosts(client, rawPlan);

  // Actualizar bridge_test en el plan
  const bridgePost = researchedPlan.posts.find(p => p.type === 'bridge');
  if (bridgePost) {
    console.log(`  Bridge test: ${bridgePost.bridge_test} — ${bridgePost.bridge_reason || ''}`);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'daily_plan.json'),
    JSON.stringify({
      ...researchedPlan,
      posts: researchedPlan.posts.map(p => ({
        slot: p.slot, type: p.type, topic: p.topic,
        target_keyword: p.target_keyword, slug: p.slug,
        bridge_test: p.bridge_test || null,
      })),
    }, null, 2)
  );

  // FASE 2+3+4 — Redacción, visualización y enlazado
  console.log('\n✍️  FASE 2-4 — Redactando posts...');
  const writtenPlan = await writeAllPosts(client, researchedPlan);

  // Guardar posts como HTML para revisión
  for (const post of writtenPlan.posts) {
    const htmlPath = path.join(OUTPUT_DIR, `post_${post.slug}.html`);
    fs.writeFileSync(htmlPath, `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${post.title}</title>
  <meta name="description" content="${post.meta_description || ''}">
  <!-- Keywords: ${(post.keywords || []).join(', ')} -->
</head>
<body>
<h1>${post.title}</h1>
${post.content}
</body>
</html>`);
    console.log(`  ✓ post_${post.slug}.html guardado`);
  }

  // FASE 5a — Imágenes
  console.log('\n🖼️  FASE 5a — Procesando imágenes...');
  const planWithImages = await processImages(writtenPlan, config);

  // Añadir published_at
  const finalPlan = {
    ...planWithImages,
    posts: planWithImages.posts.map(p => ({
      ...p,
      published_at: new Date(`${TODAY}T10:00:00Z`).toISOString(),
    })),
  };

  // FASE 5b — Publicación
  if (dryRun) {
    console.log('\n⏭️  DRY RUN — Saltando inserción en Supabase');
    console.log('  Posts que se insertarían:');
    finalPlan.posts.forEach(p => console.log(`    · [${p.type}] ${p.slug}`));
  } else {
    console.log('\n📤 FASE 5b — Publicando en Supabase (is_published=false)...');
    await publishAll(finalPlan, config);
  }

  // Guardar plan final completo
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'daily_plan_final.json'),
    JSON.stringify(finalPlan, null, 2)
  );

  console.log('\n' + '─'.repeat(56));
  console.log(`✅ Pipeline completado — ${finalPlan.posts.length} posts generados`);
  console.log(`📁 Archivos en: ${OUTPUT_DIR}`);
  console.log(`\nPara publicar, revisar los drafts en Supabase Dashboard`);
  console.log(`y ejecutar el SQL en daily_report.md\n`);
}

run().catch(err => {
  console.error('\n❌ Error fatal en el pipeline:', err);
  process.exit(1);
});
