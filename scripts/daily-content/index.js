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

// ── Directorio de output global (existe antes que OUTPUT_DIR por fecha) ───────
const GLOBAL_OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(GLOBAL_OUTPUT_DIR)) fs.mkdirSync(GLOBAL_OUTPUT_DIR, { recursive: true });

const PIPELINE_LOG = path.join(GLOBAL_OUTPUT_DIR, 'pipeline.log');

/**
 * Escribe un mensaje de error en pipeline.log y en stderr.
 * Usado por los handlers globales y por el catch principal.
 */
function logError(err, context = 'ERROR') {
  const ts  = new Date().toISOString();
  const msg = `[${ts}] ${context}: ${err && err.stack ? err.stack : String(err)}\n`;
  process.stderr.write(msg);
  try { fs.appendFileSync(PIPELINE_LOG, msg); } catch (_) {}
}

// ── Handlers de errores no capturados ────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logError(err, 'UNCAUGHT_EXCEPTION');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logError(reason instanceof Error ? reason : new Error(String(reason)), 'UNHANDLED_REJECTION');
  process.exit(1);
});

// ── Timeout global: 90 minutos ────────────────────────────────────────────────
const GLOBAL_TIMEOUT = setTimeout(() => {
  logError(new Error('Pipeline excedió el límite de 90 minutos'), 'TIMEOUT');
  process.exit(1);
}, 90 * 60 * 1000);
// No bloquear el event loop si el pipeline termina antes
GLOBAL_TIMEOUT.unref();

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
  logError(new Error('.env.scripts no encontrado'), 'STARTUP');
  process.exit(1);
}

// ── Verificar variables críticas ────────────────────────────────────────────
for (const key of ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_ID']) {
  if (!process.env[key]) {
    logError(new Error(`Variable requerida no encontrada: ${key}`), 'STARTUP');
    process.exit(1);
  }
}

// ── Verificar que claude CLI está disponible ────────────────────────────────
const versionCheck = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (versionCheck.error || versionCheck.status !== 0) {
  logError(new Error('El comando `claude` no está disponible'), 'STARTUP');
  process.exit(1);
}

const { planDay }          = require('./lib/planner');
const { researchAllPosts } = require('./lib/researcher');
const { writeAllPosts, deduplicateContent } = require('./lib/writer');
const { processImages }    = require('./lib/images');
const { publishAll, getRelatedPostLinks } = require('./lib/publisher');
const { getUsedKeywords }                 = require('./keyword-loader');

// ── Argumentos CLI ──────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1];
const dryRun  = args.includes('--dry-run');
const TODAY   = dateArg || new Date().toISOString().slice(0, 10);

const OUTPUT_DIR = path.join(GLOBAL_OUTPUT_DIR, TODAY);
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
  const start    = Date.now();
  const startISO = new Date().toISOString();

  console.log(`[${startISO}] Pipeline iniciado`);
  console.log(`\n🚀 GuiaDelSalon — Pipeline de contenido diario`);
  console.log(`📅 Fecha: ${TODAY} | Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}`);
  console.log(`🤖 Motor: Claude Code CLI (claude -p) — suscripción actual`);
  console.log('─'.repeat(58));

  // Registrar inicio en pipeline.log
  fs.appendFileSync(PIPELINE_LOG, `[${startISO}] START date=${TODAY} dryRun=${dryRun}\n`);

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

  // Obtener enlaces internos relacionados para cada post antes de escribirlo
  if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
    console.log('  Buscando posts relacionados para enlazado interno...');
    for (const post of researchedPlan.posts) {
      post.relatedPosts = await getRelatedPostLinks(post, config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      if (post.relatedPosts.length > 0) {
        console.log(`    [slot ${post.slot}] ${post.relatedPosts.length} post(s) relacionado(s) encontrado(s)`);
      }
    }
  }

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
      // Segunda capa de deduplicación (safety net) antes de publicar en Supabase
      content:    deduplicateContent(p.content),
      content_en: deduplicateContent(p.content_en),
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

  // ── FASE 6: Retry posts faltantes ────────────────────────────────────────────
  const publishedCount = finalPlan.posts.filter(p => !p._failed).length;
  if (publishedCount < 5) {
    const failedPosts = finalPlan.posts.filter(p => p._failed);
    console.log(`\n⚠️  Solo ${publishedCount}/5 posts generados. Reintentando ${failedPosts.length} post(s) fallidos...`);
    fs.appendFileSync(PIPELINE_LOG, `[${new Date().toISOString()}] RETRY ${failedPosts.length} posts fallidos\n`);

    for (const failedPost of failedPosts) {
      console.log(`  🔄 Reintentando slot ${failedPost.slot} (${failedPost.type})...`);
      try {
        const retryPost = {
          ...failedPost,
          _failed: false,
          // Si es post US y falló, convertir a core ES con el topic existente
          ...(failedPost.market === 'us' ? {
            type:   'core',
            lang:   'es',
            market: 'es',
            topic:  failedPost.topic,
          } : {}),
        };

        const researched = await researchAllPosts({ ...finalPlan, posts: [retryPost] });

        if (config.SUPABASE_URL && config.SUPABASE_ANON_KEY) {
          researched.posts[0].relatedPosts = await getRelatedPostLinks(
            researched.posts[0], config.SUPABASE_URL, config.SUPABASE_ANON_KEY
          );
        }

        const written = await writeAllPosts(researched);
        const withImages = await processImages(written, config);

        const retryFinal = {
          ...withImages,
          posts: withImages.posts.map(p => ({
            ...p,
            published_at: new Date(`${TODAY}T10:00:00Z`).toISOString(),
          })),
        };

        if (!dryRun) {
          await publishAll(retryFinal, config);
        }

        const idx = finalPlan.posts.findIndex(p => p.slot === failedPost.slot);
        if (idx !== -1) finalPlan.posts[idx] = retryFinal.posts[0];

        console.log(`  ✅ Slot ${failedPost.slot} recuperado en el retry`);
        fs.appendFileSync(PIPELINE_LOG, `[${new Date().toISOString()}] RETRY_SUCCESS slot=${failedPost.slot}\n`);

      } catch (retryErr) {
        console.error(`  ❌ Retry también falló para slot ${failedPost.slot}: ${retryErr.message}`);
        fs.appendFileSync(PIPELINE_LOG, `[${new Date().toISOString()}] RETRY_FAILED slot=${failedPost.slot} err=${retryErr.message}\n`);
      }
    }

    const recoveredCount = finalPlan.posts.filter(p => !p._failed).length;
    console.log(`\n📊 Resultado tras retry: ${recoveredCount}/5 posts publicados`);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_plan_final.json'), JSON.stringify(finalPlan, null, 2));

  // ── ALERTA: Pipeline incompleto ───────────────────────────────────────────
  const totalPublished = finalPlan.posts.filter(p => !p._failed).length;
  if (totalPublished < 5) {
    const alertMsg = `[${new Date().toISOString()}] ALERTA: Solo ${totalPublished}/5 posts publicados el ${TODAY}\n`;
    fs.appendFileSync(PIPELINE_LOG, alertMsg);
    fs.writeFileSync(
      path.join(GLOBAL_OUTPUT_DIR, 'last_incomplete.txt'),
      `${TODAY}: ${totalPublished}/5 posts\n${finalPlan.posts.filter(p => p._failed).map(p => `  - slot ${p.slot} (${p.type}): ${p.target_keyword}`).join('\n')}\n`
    );
    console.warn(`\n⚠️  PIPELINE INCOMPLETO: ${totalPublished}/5 posts — ver last_incomplete.txt`);
  } else {
    const incompleteFile = path.join(GLOBAL_OUTPUT_DIR, 'last_incomplete.txt');
    if (fs.existsSync(incompleteFile)) fs.unlinkSync(incompleteFile);
  }

  // ── Finalización ─────────────────────────────────────────────────────────
  const elapsed    = Math.round((Date.now() - start) / 1000);
  const finishISO  = new Date().toISOString();

  console.log('\n' + '─'.repeat(58));
  console.log(`[${finishISO}] Pipeline completado en ${elapsed}s — ${finalPlan.posts.length} posts generados`);
  console.log(`📁 ${OUTPUT_DIR}`);
  if (!dryRun) console.log(`\nRevisar drafts en Supabase → ejecutar SQL de daily_report.md\n`);

  // Registrar éxito en pipeline.log
  fs.appendFileSync(PIPELINE_LOG, `[${finishISO}] SUCCESS date=${TODAY} duration=${elapsed}s posts=${finalPlan.posts.length}\n`);

  // Health check: marcar última ejecución exitosa
  fs.writeFileSync(
    path.join(GLOBAL_OUTPUT_DIR, 'last_success.txt'),
    `${finishISO}\n`
  );

  clearTimeout(GLOBAL_TIMEOUT);
  process.exit(0);
}

run().catch(err => {
  logError(err, 'FATAL');
  process.exit(1);
});
