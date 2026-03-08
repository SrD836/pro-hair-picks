#!/usr/bin/env node
/**
 * generate_pin_queue.js — Genera pin_queue.json para pin_publisher.js
 *
 * Distribución diaria (3 pins, uno por tipo):
 *   Slot 0 — Blog:    contenido editorial del post más reciente
 *   Slot 1 — Tool:    herramienta de diagnóstico/asesor
 *   Slot 2 — Product: producto del catálogo Amazon
 *
 * Rotación de idioma (basada en fecha UTC, ciclo de 2 días):
 *   Día par   → Blog ES · Tool EN · Product ES
 *   Día impar → Blog EN · Tool ES · Product EN
 *
 * Imágenes generadas con Google Imagen 3 via generate_pin_image.js.
 * Fallback a imagen existente en Supabase si la generación falla.
 *
 * Requiere en .env.scripts:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   PINTEREST_BOARD_ES, PINTEREST_BOARD_EN
 *   ANTHROPIC_API_KEY (para traducción de copy de blog)
 *   GEMINI_API_KEY    (para Imagen 3 — opcional, hay fallback)
 *
 * Uso: npm run pinterest:generate
 */

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Importar generador de imágenes (opcional — fallback si no disponible) ──
let generatePinImage = null;
try {
  generatePinImage = require('./generate_pin_image').generatePinImage;
} catch (_) { /* se usará imagen original del contenido */ }

// ── Rutas ──────────────────────────────────────────────────────────────────
const ENV_PATH   = path.join(process.cwd(), '.env.scripts');
const LOG_PATH   = path.join(__dirname, 'pin_log.json');
const QUEUE_PATH = path.join(__dirname, 'pin_queue.json');

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
const env = loadEnv(ENV_PATH);

const SUPABASE_URL  = process.env.SUPABASE_URL            || env.SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY    || env.SUPABASE_SERVICE_KEY;
const BOARD_ES      = process.env.PINTEREST_BOARD_ES      || env.PINTEREST_BOARD_ES;
const BOARD_EN      = process.env.PINTEREST_BOARD_EN      || env.PINTEREST_BOARD_EN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY       || env.ANTHROPIC_API_KEY;

const missing = [
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

// ── Herramientas hardcoded ─────────────────────────────────────────────────
const TOOLS = [
  {
    name:        'Analizador de Canicie',
    toolType:    'canicie',
    description: 'Descubre si tus canas son genéticas o ambientales. Diagnóstico científico gratuito basado en biología del melanocito, para profesionales y clientes.',
    url:         'https://guiadelsalon.com/mi-pelo/analizador-canicie',
    image_url:   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=1800&fit=crop',
  },
  {
    name:        'Diagnóstico Alopecia',
    toolType:    'alopecia',
    description: 'Analiza el tipo de alopecia y recibe recomendaciones personalizadas. Herramienta gratuita para profesionales del cabello y sus clientes.',
    url:         'https://guiadelsalon.com/mi-pelo/analizador-alopecia',
    image_url:   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=1800&fit=crop',
  },
  {
    name:        'Asesor de Color',
    toolType:    'color',
    description: 'Encuentra el tono exacto para cada cliente según su tono de piel y cabello base. Inteligencia artificial para coloristas profesionales.',
    url:         'https://guiadelsalon.com/mi-pelo/asesor-color',
    image_url:   'https://images.unsplash.com/photo-1582095133179-bfd08e2585d5?w=1200&h=1800&fit=crop',
  },
];

const FALLBACK_IMAGES = {
  blog:    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=1800&fit=crop',
  product: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=1800&fit=crop',
  tool:    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=1800&fit=crop',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function trunc(str, max) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// ── HTTP helper ────────────────────────────────────────────────────────────
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(raw)); }
          catch { resolve(raw); }
        } else {
          reject(new Error('HTTP ' + res.statusCode + ': ' + raw.slice(0, 300)));
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// ── Supabase REST ──────────────────────────────────────────────────────────
function fetchSupabase(table, qs) {
  return httpRequest(SUPABASE_URL + '/rest/v1/' + table + '?' + qs, {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Content-Type':  'application/json',
    },
  });
}

// ── Anthropic: traducir copy de blog ES → EN ──────────────────────────────
async function translateBlogToEN(titleES, bodyES) {
  const requestBody = JSON.stringify({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role:    'user',
      content: [
        'Translate this Pinterest pin content (Spanish → English) for a professional hairdressing audience.',
        'Title format: "Primary Keyword: value proposition" (max 100 chars).',
        'Description: 2-3 sentences, problem + benefit + soft CTA. Max 400 chars. No hashtags.',
        'Return ONLY valid JSON: {"title": "...", "body": "..."}. No extra text.',
        '',
        'Title ES: ' + titleES,
        'Body ES: ' + bodyES,
      ].join('\n'),
    }],
  });

  const res = await httpRequest('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json',
      'Content-Length':    Buffer.byteLength(requestBody),
    },
    body: requestBody,
  });

  const text  = (res.content && res.content[0] && res.content[0].text) || '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('JSON no encontrado en respuesta: ' + text.slice(0, 100));
  const parsed = JSON.parse(match[0]);
  return {
    title: String(parsed.title || titleES).slice(0, 100),
    body:  String(parsed.body  || bodyES).slice(0, 400),
  };
}

// ── Log helpers ────────────────────────────────────────────────────────────
function readLog() {
  if (!fs.existsSync(LOG_PATH)) return { pins: [] };
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); }
  catch { return { pins: [] }; }
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

// ── Rotación de idioma basada en fecha UTC (ciclo 3 días) ─────────────────
// Día 1 (index 0) → Blog ES · Tool EN · Product ES
// Día 2 (index 1) → Blog EN · Tool ES · Product EN
// Día 3 (index 2) → Blog ES · Tool EN · Product ES  (repite patrón día 1)
function getCycleDay() {
  return (Math.floor(Date.now() / 86400000) % 3) + 1; // 1 | 2 | 3
}

function getDayCycleLangs() {
  const idx = Math.floor(Date.now() / 86400000) % 3;
  return idx === 1
    ? { blog: 'en', tool: 'es', product: 'en' }
    : { blog: 'es', tool: 'en', product: 'es' };
}

// ── Hashtags por tipo e idioma ─────────────────────────────────────────────
// Devuelve array de strings (cada uno con su '#')
function getHashtagsArray(type, lang, data) {
  return getHashtags(type, lang, data).split(' ').filter(h => h.startsWith('#'));
}

function getHashtags(type, lang, data) {
  if (type === 'blog') {
    return lang === 'es'
      ? '#peluqueria #peluqueriaprofesional #salonprofesional #guiadelsalon'
      : '#hairstylist #professionalhair #salonlife #haircare #guiadelsalon';
  }
  if (type === 'tool') {
    const toolType = (data && data.toolType) || '';
    if (toolType === 'canicie') {
      return lang === 'es'
        ? '#cabello #canicienatural #diagnosticocapilar #herramientasgratuitas #peluqueria'
        : '#hairanalysis #freehairtest #haircare #greyhairtransition #hairstylist';
    }
    if (toolType === 'alopecia') {
      return lang === 'es'
        ? '#cabello #alopecia #diagnosticocapilar #herramientasgratuitas #peluqueria'
        : '#hairanalysis #freehairtest #hairloss #alopeciaawareness #hairstylist';
    }
    // color / default
    return lang === 'es'
      ? '#cabello #colorimetria #diagnosticocapilar #herramientasgratuitas #peluqueria'
      : '#hairanalysis #freehairtest #haircolor #colorimetry #hairstylist';
  }
  // product
  return lang === 'es'
    ? '#maquinillaprofesional #barberia #peluqueriaprofesional #herramientasdesalon'
    : '#professionaltool #barbershop #hairclipper #salontools #barberlife';
}

// ── Formatear título de blog como "Keyword: promesa de valor" ─────────────
function formatBlogTitle(title) {
  if (!title) return '';
  if (title.includes(':') || title.includes('—')) return trunc(title, 100);
  const connectors = [' para ', ' en cómo ', ' cómo ', ' que ', ' con ', ' sobre ', ' del ', ' de la '];
  for (const sep of connectors) {
    const idx = title.toLowerCase().indexOf(sep);
    if (idx > 8 && idx < 55) {
      const kw = title.slice(0, idx).trim();
      const promise = title.slice(idx + sep.length).trim();
      if (kw.length >= 5 && promise.length >= 5) {
        return trunc(kw + ': ' + promise, 100);
      }
    }
  }
  return trunc(title, 100);
}

// ── Construir body de descripción por tipo (SIN hashtags) ─────────────────
function buildBlogBody(data) {
  const metaDesc = (data.meta_description || '').trim();
  const cta      = '👉 Guía completa en guiadelsalon.com';
  const body     = metaDesc || 'Técnicas y consejos profesionales para peluqueros y barberos.';
  return trunc(body + ' ' + cta, 400);
}

function buildToolBody(data, lang) {
  const urlPath = (data.url || '').replace('https://guiadelsalon.com', '');
  if (lang === 'es') {
    const cta = '🔍 Pruébalo ahora en guiadelsalon.com' + urlPath;
    const intro = 'Analiza tu ' + (data.name || 'cabello').toLowerCase() +
                  ' en 2 minutos con nuestra herramienta gratuita. Sin registro. ' +
                  'Resultado inmediato con protocolo de acción personalizado.';
    return trunc(intro + ' ' + cta, 400);
  }
  const cta = '🔍 Try it now at guiadelsalon.com' + urlPath;
  const intro = 'Analyze your hair in 2 minutes with our free professional tool. ' +
                'No sign-up needed. Instant results with a personalized action plan.';
  return trunc(intro + ' ' + cta, 400);
}

function buildProductBody(data, lang) {
  const name   = data.name || 'Producto';
  const rating = data.rating ? 'Puntuación: ' + data.rating + '/10 · ' : '';
  const price  = data.price
    ? (lang === 'es' ? 'Desde ' + data.price + '€ con envío Prime. ' : 'From €' + data.price + ' with Prime shipping. ')
    : '';
  if (lang === 'es') {
    const cta  = '💈 Ver análisis completo en guiadelsalon.com';
    const body = rating + name + '. ' + price + 'Análisis real de peluqueros profesionales.';
    return trunc(body + ' ' + cta, 400);
  }
  const cta  = '💈 Full review at guiadelsalon.com';
  const body = rating + name + '. ' + price + 'Real reviews from professional hairdressers.';
  return trunc(body + ' ' + cta, 400);
}

// ── Título de herramienta por toolType e idioma ────────────────────────────
function buildToolTitle(data, lang) {
  const t = data.toolType || '';
  if (t === 'canicie') {
    return lang === 'es'
      ? 'Descubre el origen de tus canas — Diagnóstico capilar gratuito'
      : 'Discover What\'s Behind Your Gray Hair — Free Hair Analysis';
  }
  if (t === 'alopecia') {
    return lang === 'es'
      ? 'Analiza tu tipo de alopecia — Diagnóstico gratuito online'
      : 'Identify Your Hair Loss Pattern — Free Online Diagnosis';
  }
  // color / default
  return lang === 'es'
    ? 'Encuentra tu tono perfecto — Asesoría de color gratuita online'
    : 'Find Your Perfect Hair Color — Free Online Color Advisor';
}

// ── Ensamblar texto final de pin (title + description con hashtags) ────────
function assemblePinTexts(type, data, lang, translatedBlog) {
  let title, descBody;

  if (type === 'blog') {
    if (lang === 'en' && translatedBlog) {
      title    = trunc(translatedBlog.title, 100);
      descBody = trunc(translatedBlog.body,  400);
    } else {
      title    = formatBlogTitle(data.title || '');
      descBody = buildBlogBody(data);
    }
  } else if (type === 'tool') {
    title    = trunc(buildToolTitle(data, lang), 100);
    descBody = buildToolBody(data, lang);
  } else {
    // product
    title    = trunc(
      lang === 'es'
        ? trunc(data.name || 'Producto', 60) + ' — Análisis profesional con precio actualizado'
        : trunc(data.name || 'Product',  60) + ' — Professional Review & Current Price',
      100
    );
    descBody = buildProductBody(data, lang);
  }

  const hashtags   = getHashtags(type, lang, data);
  const description = trunc(descBody, 396) + '\n\n' + hashtags;

  return { title, description };
}

// ── Pipeline principal ─────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Generando cola de Pines — GuiaDelSalon.com\n');

  // 1. Idiomas del día (ciclo 3 días)
  const langs        = getDayCycleLangs();
  const rotationDay  = getCycleDay();
  console.log('📅 Día de ciclo: ' + rotationDay + '/3' +
              ' → Blog ' + langs.blog.toUpperCase() +
              ' · Tool ' + langs.tool.toUpperCase() +
              ' · Product ' + langs.product.toUpperCase());

  // 2. Estado del log
  const logData    = readLog();
  const recentUrls = getRecentUrls(logData);
  console.log('📋 URLs en cooldown (30 días): ' + recentUrls.size);

  // 3. Fetch blog posts
  console.log('\n📰 Obteniendo blog posts desde Supabase...');
  let blogPosts = [];
  try {
    blogPosts = await fetchSupabase(
      'blog_posts',
      'select=title,meta_description,slug,cover_image_url,published_at,target_keyword' +
      '&is_published=eq.true&order=published_at.desc&limit=50'
    );
    if (!Array.isArray(blogPosts)) blogPosts = [];
    console.log('   ✓ ' + blogPosts.length + ' posts obtenidos');
  } catch (err) {
    console.warn('   ⚠️  Error al obtener blog posts: ' + err.message);
  }

  // 4. Fetch productos
  console.log('🛍️  Obteniendo productos desde Supabase...');
  let products = [];
  try {
    products = await fetchSupabase(
      'products',
      'select=name,slug,image_url,price,rating,description&order=created_at.desc&limit=30'
    );
    if (!Array.isArray(products)) products = [];
    console.log('   ✓ ' + products.length + ' productos obtenidos');
  } catch (err) {
    console.warn('   ⚠️  Error al obtener productos: ' + err.message);
  }

  // 5. Filtrar candidatos (excluir cooldown 30 días)
  const h48ago = Date.now() - 48 * 60 * 60 * 1000;

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

  console.log('\n📊 Candidatos disponibles:');
  console.log('   Blog:         ' + availableBlogs.length + ' (' + recentBlogs.length + ' recientes <48 h)');
  console.log('   Productos:    ' + availableProducts.length);
  console.log('   Herramientas: ' + availableTools.length);

  // 6. Selección de slots: 1 blog + 1 tool + 1 product
  const slots = [];
  if (availableBlogs.length > 0)    slots.push({ type: 'blog',    data: availableBlogs[0] });
  if (availableTools.length > 0)    slots.push({ type: 'tool',    data: availableTools[0] });
  if (availableProducts.length > 0) slots.push({ type: 'product', data: availableProducts[0] });

  if (slots.length === 0) {
    console.error('\n❌ No hay contenido disponible (todo publicado en los últimos 30 días).');
    process.exit(1);
  }

  // 7. Construir pins
  console.log('\n✍️  Construyendo pins...');
  const pins = [];

  for (const slot of slots) {
    const lang = langs[slot.type] || 'es';

    // URL del contenido
    let link;
    if (slot.type === 'blog')    link = 'https://guiadelsalon.com/blog/' + slot.data.slug;
    else if (slot.type === 'product') link = 'https://guiadelsalon.com/categorias/' + slot.data.slug;
    else                         link = slot.data.url;

    // Imagen: Imagen 3 si disponible, fallback a imagen del contenido
    const fallbackImage = (slot.type === 'blog'    ? slot.data.cover_image_url :
                           slot.type === 'product' ? slot.data.image_url :
                           slot.data.image_url) || FALLBACK_IMAGES[slot.type];

    let imageUrl = fallbackImage;
    if (generatePinImage) {
      process.stdout.write('   🎨 Generando imagen [' + slot.type + '] ');
      try {
        imageUrl = await generatePinImage({
          content_type: slot.type,
          title:        slot.data.title || slot.data.name || '',
          link,
          image_url:    fallbackImage,
        });
        console.log('✓');
      } catch (err) {
        console.log('⚠️  (' + err.message.slice(0, 50) + ', usando fallback)');
        imageUrl = fallbackImage;
      }
    }

    // Traducción de blog EN via Anthropic
    let translatedBlog = null;
    if (slot.type === 'blog' && lang === 'en') {
      const esTitleFormatted = formatBlogTitle(slot.data.title || '');
      const esBody           = buildBlogBody(slot.data);
      process.stdout.write('   🔤 Traduciendo blog EN "' + esTitleFormatted.slice(0, 40) + '…" ');
      try {
        translatedBlog = await translateBlogToEN(esTitleFormatted, esBody);
        console.log('✓');
      } catch (err) {
        console.log('⚠️  (' + err.message.slice(0, 50) + ', usando ES)');
      }
    }

    // Ensamblar textos finales
    const { title, description } = assemblePinTexts(
      slot.type, slot.data, lang, translatedBlog
    );
    const hashtagsArr = getHashtagsArray(slot.type, lang, slot.data);

    pins.push({
      title,
      description,
      link,
      board_id:     lang === 'es' ? BOARD_ES : BOARD_EN,
      image_url:    imageUrl,
      lang,
      content_type: slot.type,
      hashtags:     hashtagsArr,
      rotation_day: rotationDay,
    });
  }

  // 8. Guardar pin_queue.json
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(pins, null, 2), 'utf8');

  // 9. Preview enriquecida por pin
  const sep = '═'.repeat(62);
  const div = '─'.repeat(62);
  console.log('\n' + sep);
  console.log('  COLA GENERADA — ' + pins.length + ' pins · Día de ciclo: ' + rotationDay);
  console.log(sep);
  pins.forEach((pin, i) => {
    console.log('\n  ┌─ Pin #' + (i + 1) + ' [' + pin.content_type.toUpperCase() + '] [' + pin.lang.toUpperCase() + '] ─');
    console.log('  │ Título:    ' + pin.title);
    console.log('  │ Desc:      ' + pin.description.replace(/\n/g, ' ').slice(0, 100) + '…');
    console.log('  │ Imagen:    ' + pin.image_url.slice(0, 70));
    console.log('  │ Tablero:   ' + pin.board_id);
    console.log('  │ Hashtags:  ' + pin.hashtags.slice(0, 4).join(' '));
    console.log('  └─ Link:     ' + pin.link);
  });
  console.log('\n' + div);
  console.log('  Guardado en: ' + path.relative(process.cwd(), QUEUE_PATH));
  console.log(div);
  console.log('  ▸ npm run pinterest:publish -- --queue=scripts/pinterest/pin_queue.json\n');
}

// ── Exportar función core para auto_publish.js ────────────────────────────
/**
 * generateQueue(logData) — genera y devuelve el array de pins del día.
 * No guarda en disco ni imprime resumen. Lanza Error si no hay contenido.
 * @param {Object} logData  contenido de pin_log.json
 * @returns {Promise<Array>}
 */
async function generateQueue(logData) {
  const langs        = getDayCycleLangs();
  const rotationDay  = getCycleDay();
  const recentUrls   = getRecentUrls(logData);
  const h48ago    = Date.now() - 48 * 60 * 60 * 1000;

  let blogPosts = [];
  try {
    const raw = await fetchSupabase(
      'blog_posts',
      'select=title,meta_description,slug,cover_image_url,published_at,target_keyword' +
      '&is_published=eq.true&order=published_at.desc&limit=50'
    );
    blogPosts = Array.isArray(raw) ? raw : [];
  } catch (err) {
    console.warn('⚠️  Error al obtener blog posts: ' + err.message);
  }

  let products = [];
  try {
    const raw = await fetchSupabase(
      'products',
      'select=name,slug,image_url,price,rating,description&order=created_at.desc&limit=30'
    );
    products = Array.isArray(raw) ? raw : [];
  } catch (err) {
    console.warn('⚠️  Error al obtener productos: ' + err.message);
  }

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

  const slots = [];
  if (availableBlogs.length > 0)    slots.push({ type: 'blog',    data: availableBlogs[0] });
  if (availableTools.length > 0)    slots.push({ type: 'tool',    data: availableTools[0] });
  if (availableProducts.length > 0) slots.push({ type: 'product', data: availableProducts[0] });

  if (slots.length === 0) {
    throw new Error('No hay contenido disponible (todo publicado en los últimos 30 días).');
  }

  const pins = [];
  for (const slot of slots) {
    const lang = langs[slot.type] || 'es';

    let link;
    if (slot.type === 'blog')         link = 'https://guiadelsalon.com/blog/' + slot.data.slug;
    else if (slot.type === 'product') link = 'https://guiadelsalon.com/categorias/' + slot.data.slug;
    else                              link = slot.data.url;

    const fallbackImage = (slot.type === 'blog'    ? slot.data.cover_image_url :
                           slot.type === 'product' ? slot.data.image_url :
                           slot.data.image_url) || FALLBACK_IMAGES[slot.type];

    let imageUrl = fallbackImage;
    if (generatePinImage) {
      try {
        imageUrl = await generatePinImage({
          content_type: slot.type,
          title:        slot.data.title || slot.data.name || '',
          link,
          image_url:    fallbackImage,
        });
      } catch (_) { imageUrl = fallbackImage; }
    }

    let translatedBlog = null;
    if (slot.type === 'blog' && lang === 'en') {
      try {
        translatedBlog = await translateBlogToEN(
          formatBlogTitle(slot.data.title || ''),
          buildBlogBody(slot.data)
        );
      } catch (_) { /* fallback to ES */ }
    }

    const { title, description } = assemblePinTexts(
      slot.type, slot.data, lang, translatedBlog
    );
    const hashtagsArr = getHashtagsArray(slot.type, lang, slot.data);

    pins.push({
      title,
      description,
      link,
      board_id:     lang === 'es' ? BOARD_ES : BOARD_EN,
      image_url:    imageUrl,
      lang,
      content_type: slot.type,
      hashtags:     hashtagsArr,
      rotation_day: rotationDay,
    });
  }
  return pins;
}

module.exports = { generateQueue };

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Error fatal:', err.message || err);
    process.exit(1);
  });
}
