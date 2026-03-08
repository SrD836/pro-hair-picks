#!/usr/bin/env node
/**
 * auto_publish.js — Publicación automática diaria de 3 pins (sin intervención humana)
 *
 * Diseñado para Windows Task Scheduler. No requiere entrada interactiva.
 *
 * Flujo:
 *   1. Valida token de acceso contra la API de Pinterest (GET /v5/user_account)
 *   2. Comprueba límite diario (pin_log.json) → si ya hay 3, termina limpiamente
 *   3. Genera la cola del día (lógica de generate_pin_queue.js)
 *   4. Publica cada pin; los errores individuales no abortan la sesión
 *   5. Escribe resumen en daily_report.txt
 *
 * Requiere en .env.scripts:
 *   PINTEREST_ACCESS_TOKEN
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   PINTEREST_BOARD_ES, PINTEREST_BOARD_EN
 *   ANTHROPIC_API_KEY
 *
 * Uso:
 *   node scripts/pinterest/auto_publish.js
 *   npm run pinterest:auto
 */

'use strict';
const https = require('https');
const zlib  = require('zlib');
const fs    = require('fs');
const path  = require('path');

// ── Rutas ──────────────────────────────────────────────────────────────────
const DIR         = __dirname;
const ENV_PATH    = path.join(process.cwd(), '.env.scripts');
const LOG_PATH    = path.join(DIR, 'pin_log.json');
const REPORT_PATH = path.join(DIR, 'daily_report.txt');

// ── Cargar .env.scripts ────────────────────────────────────────────────────
function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const idx = t.indexOf('=');
    if (idx < 0) return;
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

const envVars = loadEnv(ENV_PATH);

const ACCESS_TOKEN  = process.env.PINTEREST_ACCESS_TOKEN || envVars.PINTEREST_ACCESS_TOKEN;
const SUPABASE_URL  = process.env.SUPABASE_URL            || envVars.SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY    || envVars.SUPABASE_SERVICE_KEY;
const BOARD_ES      = process.env.PINTEREST_BOARD_ES      || envVars.PINTEREST_BOARD_ES;
const BOARD_EN      = process.env.PINTEREST_BOARD_EN      || envVars.PINTEREST_BOARD_EN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY       || envVars.ANTHROPIC_API_KEY;

// ── Validar variables obligatorias ────────────────────────────────────────
const missing = [
  !ACCESS_TOKEN  && 'PINTEREST_ACCESS_TOKEN',
  !SUPABASE_URL  && 'SUPABASE_URL',
  !SERVICE_KEY   && 'SUPABASE_SERVICE_KEY',
  !BOARD_ES      && 'PINTEREST_BOARD_ES',
  !BOARD_EN      && 'PINTEREST_BOARD_EN',
  !ANTHROPIC_KEY && 'ANTHROPIC_API_KEY',
].filter(Boolean);

if (missing.length) {
  console.error('❌ Variables no encontradas en .env.scripts: ' + missing.join(', '));
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function ts() { return new Date().toISOString(); }
function log(msg) { console.log('[' + ts() + '] ' + msg); }

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return { pins: [] };
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); }
  catch { return { pins: [] }; }
}

function writeLog(data) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function countTodayPublished(logData) {
  const today = new Date().toISOString().slice(0, 10);
  return (logData.pins || []).filter(
    p => ['publicado', 'editado_y_publicado'].includes(p.decision)
      && p.timestamp.startsWith(today)
  ).length;
}

// ── HTTP helper genérico ───────────────────────────────────────────────────
function httpRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const opts = {
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method:   options.method || 'GET',
      headers:  options.headers || {},
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, body: parsed });
          else reject(Object.assign(new Error('HTTP ' + res.statusCode), { status: res.statusCode, body: parsed }));
        } catch {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, body: raw });
          else reject(Object.assign(new Error('HTTP ' + res.statusCode + ': ' + raw.slice(0, 200)), { status: res.statusCode }));
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ── Validar token de Pinterest ─────────────────────────────────────────────
async function validateToken() {
  try {
    await httpRequest('https://api.pinterest.com/v5/user_account', {
      headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN },
    });
    return true;
  } catch (err) {
    if (err.status === 401) return false;
    // Otro error de red: no bloquear, dejar que falle en la publicación
    log('⚠️  No se pudo verificar el token (error de red): ' + err.message);
    return true;
  }
}

// ── Supabase REST ──────────────────────────────────────────────────────────
function fetchSupabase(table, qs) {
  return httpRequest(SUPABASE_URL + '/rest/v1/' + table + '?' + qs, {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Content-Type':  'application/json',
    },
  }).then(r => r.body);
}

// ── Anthropic: traducir al inglés ─────────────────────────────────────────
async function translateToEN(title, description) {
  const body = JSON.stringify({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role:    'user',
      content: [
        'Translate this Pinterest pin content from Spanish to English for a professional hairdressing/barbering audience.',
        'Return ONLY valid JSON with keys "title" (max 100 chars) and "description" (max 500 chars). No extra text.',
        '',
        'Title: ' + title,
        'Description: ' + description,
      ].join('\n'),
    }],
  });

  const res = await httpRequest('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json',
      'Content-Length':    Buffer.byteLength(body),
    },
    body,
  });

  const text  = (res.body.content && res.body.content[0] && res.body.content[0].text) || '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('JSON no encontrado en respuesta Anthropic: ' + text.slice(0, 100));
  const parsed = JSON.parse(match[0]);
  return {
    title:       String(parsed.title || title).slice(0, 100),
    description: String(parsed.description || description).slice(0, 500),
  };
}

// ── Herramientas hardcoded (mismas que generate_pin_queue.js) ──────────────
const TOOLS = [
  {
    name:        'Analizador de Canicie',
    description: 'Descubre si tus canas son genéticas o ambientales. Diagnóstico científico gratuito basado en biología del melanocito, para profesionales y clientes.',
    url:         'https://guiadelsalon.com/mi-pelo/analizador-canicie',
    image_url:   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=630&fit=crop',
  },
  {
    name:        'Diagnóstico Alopecia',
    description: 'Analiza el tipo de alopecia y recibe recomendaciones personalizadas. Herramienta gratuita para profesionales del cabello y sus clientes.',
    url:         'https://guiadelsalon.com/mi-pelo/analizador-alopecia',
    image_url:   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
  },
  {
    name:        'Asesor de Color',
    description: 'Encuentra el tono exacto para cada cliente según su tono de piel y cabello base. Inteligencia artificial para coloristas profesionales.',
    url:         'https://guiadelsalon.com/mi-pelo/asesor-color',
    image_url:   'https://images.unsplash.com/photo-1582095133179-bfd08e2585d5?w=1200&h=630&fit=crop',
  },
];

const FALLBACK = {
  blog:    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=630&fit=crop',
  product: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=630&fit=crop',
  tool:    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
};

function trunc(str, max) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

function buildEsTexts(type, data) {
  if (type === 'blog') {
    return {
      title: trunc(data.title, 100),
      description: trunc(
        (data.meta_description
          ? data.meta_description
          : 'Guía profesional sobre ' + data.title + '. Técnicas y consejos para peluqueros y barberos.') +
        ' ▸ GuiaDelSalon.com',
        500
      ),
    };
  }
  if (type === 'product') {
    return {
      title: trunc(data.name + ' — Análisis profesional', 100),
      description: trunc(
        'Análisis completo de ' + data.name +
        (data.price ? ', desde ' + data.price + '€' : '') +
        '. Opiniones reales de peluqueros y barberos. ▸ GuiaDelSalon.com',
        500
      ),
    };
  }
  return {
    title:       trunc(data.name + ' — Herramienta gratuita para peluqueros', 100),
    description: trunc(data.description + ' ▸ GuiaDelSalon.com', 500),
  };
}

function getRecentUrls(logData) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const urls   = new Set();
  for (const entry of (logData.pins || [])) {
    if (!['publicado', 'editado_y_publicado'].includes(entry.decision)) continue;
    if (new Date(entry.timestamp).getTime() < cutoff) continue;
    const pin = entry.pin_after || entry.pin_before;
    if (pin && pin.link) urls.add(pin.link);
  }
  return urls;
}

function getLastLang(logData) {
  const published = (logData.pins || [])
    .filter(p => ['publicado', 'editado_y_publicado'].includes(p.decision))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (!published.length) return 'en';
  const last = published[0].pin_after || published[0].pin_before;
  return (last && last.lang) || 'en';
}

function getLastNonBlogType(logData) {
  const published = (logData.pins || [])
    .filter(p => ['publicado', 'editado_y_publicado'].includes(p.decision))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  for (const entry of published) {
    const pin = entry.pin_after || entry.pin_before;
    if (pin && pin.content_type && pin.content_type !== 'blog') return pin.content_type;
  }
  return 'tool';
}

// ── Generar cola de pins (lógica extraída de generate_pin_queue.js) ─────────
async function generateQueue(logData) {
  const recentUrls  = getRecentUrls(logData);
  const lastLang    = getLastLang(logData);
  const lastNonBlog = getLastNonBlogType(logData);

  log('URLs en cooldown (30 días): ' + recentUrls.size);
  log('Último idioma: ' + lastLang + ' → sesión con: ' + (lastLang === 'es' ? 'en' : 'es'));

  // Fetch blog posts
  let blogPosts = [];
  try {
    const raw = await fetchSupabase(
      'blog_posts',
      'select=title,meta_description,slug,cover_image_url,published_at' +
      '&is_published=eq.true&order=published_at.desc&limit=50'
    );
    blogPosts = Array.isArray(raw) ? raw : [];
    log('Blog posts obtenidos: ' + blogPosts.length);
  } catch (err) {
    log('⚠️  Error al obtener blog posts: ' + err.message);
  }

  // Fetch productos
  let products = [];
  try {
    const raw = await fetchSupabase(
      'products',
      'select=name,slug,image_url,price&order=created_at.desc&limit=30'
    );
    products = Array.isArray(raw) ? raw : [];
    log('Productos obtenidos: ' + products.length);
  } catch (err) {
    log('⚠️  Error al obtener productos: ' + err.message);
  }

  // Filtrar candidatos
  const now    = Date.now();
  const h48ago = now - 48 * 60 * 60 * 1000;

  const recentBlogs = [];
  const olderBlogs  = [];
  for (const p of blogPosts) {
    const link = 'https://guiadelsalon.com/blog/' + p.slug;
    if (recentUrls.has(link)) continue;
    const age = p.published_at ? new Date(p.published_at).getTime() : 0;
    (age >= h48ago ? recentBlogs : olderBlogs).push(p);
  }
  const availableBlogs    = [...recentBlogs, ...olderBlogs];
  const availableProducts = products.filter(
    p => !recentUrls.has('https://guiadelsalon.com/categorias/' + p.slug)
  );
  const availableTools = TOOLS.filter(t => !recentUrls.has(t.url));

  // Selección de slots
  const nextNonBlog = lastNonBlog === 'product' ? 'tool' : 'product';
  const slots = [];

  for (let i = 0; i < 2 && i < availableBlogs.length; i++) {
    slots.push({ type: 'blog', data: availableBlogs[i] });
  }

  if (nextNonBlog === 'product' && availableProducts.length > 0) {
    slots.push({ type: 'product', data: availableProducts[0] });
  } else if (availableTools.length > 0) {
    slots.push({ type: 'tool', data: availableTools[0] });
  } else if (availableProducts.length > 0) {
    slots.push({ type: 'product', data: availableProducts[0] });
  }

  const blogUsed = slots.filter(s => s.type === 'blog').length;
  for (let i = blogUsed; slots.length < 3 && i < availableBlogs.length; i++) {
    slots.push({ type: 'blog', data: availableBlogs[i] });
  }

  if (slots.length === 0) {
    throw new Error('No hay contenido disponible (todo publicado en los últimos 30 días).');
  }

  // Construir pins con alternancia de idioma
  const pins   = [];
  let currLang = lastLang === 'es' ? 'en' : 'es';

  for (const slot of slots) {
    let link, imageUrl;
    if (slot.type === 'blog') {
      link     = 'https://guiadelsalon.com/blog/' + slot.data.slug;
      imageUrl = slot.data.cover_image_url || FALLBACK[slot.type];
    } else if (slot.type === 'product') {
      link     = 'https://guiadelsalon.com/categorias/' + slot.data.slug;
      imageUrl = slot.data.image_url || FALLBACK[slot.type];
    } else {
      link     = slot.data.url;
      imageUrl = slot.data.image_url || FALLBACK[slot.type];
    }

    const esTexts = buildEsTexts(slot.type, slot.data);
    let finalTitle = esTexts.title;
    let finalDescription = esTexts.description;

    if (currLang === 'en') {
      try {
        const translated = await translateToEN(esTexts.title, esTexts.description);
        finalTitle       = translated.title;
        finalDescription = translated.description;
        log('Traducción EN: "' + finalTitle.slice(0, 50) + '"');
      } catch (err) {
        log('⚠️  Traducción fallida, usando ES: ' + err.message.slice(0, 60));
        currLang = 'es';
      }
    }

    pins.push({
      title:        finalTitle,
      description:  finalDescription,
      link,
      board_id:     currLang === 'es' ? BOARD_ES : BOARD_EN,
      image_url:    imageUrl,
      lang:         currLang,
      content_type: slot.type,
    });

    currLang = currLang === 'es' ? 'en' : 'es';
  }

  return pins;
}

// ── Publicar un pin via API v5 ─────────────────────────────────────────────
function publishPin(pin) {
  return new Promise((resolve, reject) => {
    if (!pin.link || !pin.link.startsWith('https://guiadelsalon.com')) {
      reject(new Error('El link debe apuntar a guiadelsalon.com: ' + pin.link));
      return;
    }

    const body = JSON.stringify({
      board_id:    pin.board_id,
      title:       pin.title,
      description: pin.description,
      link:        pin.link,
      media_source: { source_type: 'image_url', url: pin.image_url },
    });

    const options = {
      hostname: 'api.pinterest.com',
      path:     '/v5/pins',
      method:   'POST',
      headers: {
        'Authorization':   'Bearer ' + ACCESS_TOKEN,
        'Content-Type':    'application/json',
        'Content-Length':  Buffer.byteLength(body),
        'Accept-Encoding': 'identity',
      },
    };

    const req = https.request(options, res => {
      const encoding = res.headers['content-encoding'];
      const stream   = encoding === 'gzip' ? res.pipe(zlib.createGunzip())
                     : encoding === 'br'   ? res.pipe(zlib.createBrotliDecompress())
                     : res;
      let data = '';
      stream.on('data', chunk => { data += chunk; });
      stream.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(Object.assign(new Error(JSON.stringify(json)), { status: res.statusCode }));
        } catch { reject(new Error(data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Escribir daily_report.txt ──────────────────────────────────────────────
function writeReport({ startTime, published, errors, skippedReason }) {
  const lines = [];
  const sep   = '='.repeat(60);

  lines.push(sep);
  lines.push('GuiaDelSalon.com — Pinterest Daily Report');
  lines.push('Fecha/hora: ' + startTime);
  lines.push(sep);

  if (skippedReason) {
    lines.push('');
    lines.push('Estado: SIN PUBLICACION');
    lines.push('Motivo: ' + skippedReason);
  } else {
    lines.push('');
    lines.push('Publicados: ' + published.length);

    if (published.length > 0) {
      lines.push('');
      lines.push('PINS PUBLICADOS:');
      published.forEach((p, i) => {
        lines.push('');
        lines.push('  [' + (i + 1) + '] ' + p.title);
        lines.push('      URL:         ' + p.link);
        lines.push('      Pinterest ID: ' + p.pinterest_id);
        lines.push('      Idioma:       ' + (p.lang || '-').toUpperCase());
        lines.push('      Tablero:      ' + p.board_id);
      });
    }

    if (errors.length > 0) {
      lines.push('');
      lines.push('ERRORES (' + errors.length + '):');
      errors.forEach((e, i) => {
        lines.push('  [' + (i + 1) + '] ' + e.title);
        lines.push('      ' + e.error);
      });
    }
  }

  lines.push('');
  lines.push(sep);
  lines.push('Fin del reporte: ' + new Date().toISOString());
  lines.push(sep);
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf8');
  log('Reporte escrito → ' + path.relative(process.cwd(), REPORT_PATH));
}

// ── Flujo principal ────────────────────────────────────────────────────────
async function main() {
  const startTime = ts();
  log('=== auto_publish.js — inicio ===');

  // 1. Validar token
  log('Validando token de Pinterest...');
  const tokenOk = await validateToken();
  if (!tokenOk) {
    const msg = 'Token de Pinterest expirado o inválido. Ejecuta: npm run pinterest:auth';
    log('❌ ' + msg);
    writeReport({ startTime, published: [], errors: [], skippedReason: msg });
    process.exit(1);
  }
  log('Token válido ✓');

  // 2. Comprobar límite diario
  const logData    = readLog();
  const todayCount = countTodayPublished(logData);
  const DAILY_LIMIT = 3;

  if (todayCount >= DAILY_LIMIT) {
    const msg = 'Límite diario alcanzado: ' + todayCount + '/' + DAILY_LIMIT + ' pins publicados hoy.';
    log('ℹ️  ' + msg);
    writeReport({ startTime, published: [], errors: [], skippedReason: msg });
    process.exit(0);
  }

  const remaining = DAILY_LIMIT - todayCount;
  log('Pins publicados hoy: ' + todayCount + '/' + DAILY_LIMIT + ' (quedan ' + remaining + ')');

  // 3. Generar cola
  log('Generando cola de pins...');
  let queue = [];
  try {
    queue = await generateQueue(logData);
    log('Cola generada: ' + queue.length + ' pin(s)');
  } catch (err) {
    const msg = 'Error al generar cola: ' + err.message;
    log('❌ ' + msg);
    writeReport({ startTime, published: [], errors: [{ title: 'generate_queue', error: err.message }], skippedReason: msg });
    process.exit(1);
  }

  // Limitar al cupo disponible del día
  const toPublish = queue.slice(0, remaining);
  log('Pins a publicar en esta sesión: ' + toPublish.length);

  // 4. Publicar pin por pin
  const published = [];
  const errors    = [];

  for (let i = 0; i < toPublish.length; i++) {
    const pin   = toPublish[i];
    const label = 'Pin #' + (i + 1) + ' [' + (pin.lang || '??').toUpperCase() + '] "' + pin.title.slice(0, 50) + '"';

    log('Publicando ' + label + '...');

    const entry = {
      timestamp:    ts(),
      decision:     'publicado',
      pin_before:   Object.assign({}, pin),
      pin_after:    null,
      pinterest_id: null,
      error:        null,
    };

    try {
      const result       = await publishPin(pin);
      entry.pinterest_id = result.id;
      entry.pin_after    = Object.assign({}, pin, { pinterest_id: result.id });

      published.push({
        title:        pin.title,
        link:         pin.link,
        pinterest_id: result.id,
        lang:         pin.lang,
        board_id:     pin.board_id,
      });

      log('✓ Publicado con ID: ' + result.id);
    } catch (err) {
      entry.decision = 'error';
      entry.error    = err.message;

      errors.push({ title: pin.title, error: err.message });
      log('⚠️  Error en ' + label + ': ' + err.message.slice(0, 120));
      // No se aborta — continúa con el siguiente pin
    }

    logData.pins.push(entry);
    writeLog(logData);
  }

  // 5. Resumen y reporte
  log('=== Sesión finalizada — publicados: ' + published.length + ', errores: ' + errors.length + ' ===');
  writeReport({ startTime, published, errors, skippedReason: null });

  // Código de salida: 0 si al menos 1 pin publicado o no hubo errores fatales
  process.exit(errors.length > 0 && published.length === 0 ? 1 : 0);
}

main().catch(err => {
  console.error('❌ Error fatal no capturado:', err.message || err);
  process.exit(1);
});
