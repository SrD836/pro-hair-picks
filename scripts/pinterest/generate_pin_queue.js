#!/usr/bin/env node
/**
 * generate_pin_queue.js — Genera pin_queue.json para pin_publisher.js
 *
 * Fuentes de contenido:
 *   - Supabase: blog_posts + products (REST API)
 *   - Herramientas hardcoded (Analizador Canicie, Alopecia, Asesor Color)
 *
 * Lógica:
 *   - Evita repetir URLs publicadas en los últimos 30 días (pin_log.json)
 *   - Distribución por sesión: 2 blog + 1 producto/herramienta (rotando)
 *   - Alterna idioma (es ↔ en) respecto al último pin publicado
 *   - Prioriza blog posts de las últimas 48 h
 *   - Traduce al inglés via Anthropic API (claude-haiku-4-5)
 *
 * Requiere en .env.scripts:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   PINTEREST_BOARD_ES, PINTEREST_BOARD_EN
 *   ANTHROPIC_API_KEY
 *
 * Uso: npm run pinterest:generate
 */

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Rutas ──────────────────────────────────────────────────────────────────
const ENV_PATH   = path.join(process.cwd(), '.env.scripts');
const LOG_PATH   = path.join(__dirname, 'pin_log.json');
const QUEUE_PATH = path.join(__dirname, 'pin_queue.json');

// ── Cargar .env.scripts (mismo patrón que pin_publisher.js) ───────────────
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

const SUPABASE_URL   = process.env.SUPABASE_URL            || env.SUPABASE_URL;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_KEY    || env.SUPABASE_SERVICE_KEY;
const BOARD_ES       = process.env.PINTEREST_BOARD_ES      || env.PINTEREST_BOARD_ES;
const BOARD_EN       = process.env.PINTEREST_BOARD_EN      || env.PINTEREST_BOARD_EN;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY       || env.ANTHROPIC_API_KEY;

// Validar variables obligatorias
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

// Imágenes de fallback por tipo de contenido
const FALLBACK = {
  blog:    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=630&fit=crop',
  product: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=630&fit=crop',
  tool:    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
};

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

// ── Anthropic: traducir título + descripción al inglés ────────────────────
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

  const text  = (res.content && res.content[0] && res.content[0].text) || '';
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('JSON no encontrado en respuesta: ' + text.slice(0, 100));
  const parsed = JSON.parse(match[0]);
  return {
    title:       String(parsed.title || title).slice(0, 100),
    description: String(parsed.description || description).slice(0, 500),
  };
}

// ── Leer pin_log.json ──────────────────────────────────────────────────────
function readLog() {
  if (!fs.existsSync(LOG_PATH)) return { pins: [] };
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); }
  catch { return { pins: [] }; }
}

/**
 * Devuelve el Set de URLs publicadas (con éxito) en los últimos 30 días.
 * Solo cuenta decisiones 'publicado' y 'editado_y_publicado'.
 */
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

/**
 * Devuelve el idioma del último pin publicado (para alternar).
 * Si no hay historial, devuelve 'en' → la primera sesión empezará con 'es'.
 */
function getLastLang(logData) {
  const published = (logData.pins || [])
    .filter(p => ['publicado', 'editado_y_publicado'].includes(p.decision))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (!published.length) return 'en';
  const last = published[0].pin_after || published[0].pin_before;
  return (last && last.lang) || 'en';
}

/**
 * Devuelve el content_type ('product' o 'tool') del último pin no-blog publicado.
 * Sirve para rotar producto ↔ herramienta en el slot 3.
 */
function getLastNonBlogType(logData) {
  const published = (logData.pins || [])
    .filter(p => ['publicado', 'editado_y_publicado'].includes(p.decision))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  for (const entry of published) {
    const pin = entry.pin_after || entry.pin_before;
    if (pin && pin.content_type && pin.content_type !== 'blog') {
      return pin.content_type;
    }
  }
  return 'tool'; // si no hay historial, empezar con 'product' la primera vez
}

// ── Truncar respetando límites de Pinterest ────────────────────────────────
function trunc(str, max) {
  if (!str) return '';
  const s = String(str).trim();
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// ── Construir texto del pin en español ────────────────────────────────────
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
  // tool
  return {
    title:       trunc(data.name + ' — Herramienta gratuita para peluqueros', 100),
    description: trunc(data.description + ' ▸ GuiaDelSalon.com', 500),
  };
}

// ── Pipeline principal ─────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Generando cola de Pines — GuiaDelSalon.com\n');

  // 1. Estado del log
  const logData    = readLog();
  const recentUrls = getRecentUrls(logData);
  const lastLang   = getLastLang(logData);
  const lastNonBlog = getLastNonBlogType(logData);

  console.log('📋 URLs publicadas (últimos 30 días): ' + recentUrls.size);
  console.log('🌍 Último idioma: ' + lastLang + ' → sesión actual inicia con: ' + (lastLang === 'es' ? 'en' : 'es'));

  // 2. Fetch blog posts (is_published=true, orden descendente)
  console.log('\n📰 Obteniendo blog posts desde Supabase...');
  let blogPosts = [];
  try {
    blogPosts = await fetchSupabase(
      'blog_posts',
      'select=title,meta_description,slug,cover_image_url,published_at' +
      '&is_published=eq.true&order=published_at.desc&limit=50'
    );
    if (!Array.isArray(blogPosts)) blogPosts = [];
    console.log('   ✓ ' + blogPosts.length + ' posts obtenidos');
  } catch (err) {
    console.warn('   ⚠️  Error al obtener blog posts: ' + err.message);
  }

  // 3. Fetch productos
  console.log('🛍️  Obteniendo productos desde Supabase...');
  let products = [];
  try {
    products = await fetchSupabase(
      'products',
      'select=name,slug,image_url,price&order=created_at.desc&limit=30'
    );
    if (!Array.isArray(products)) products = [];
    console.log('   ✓ ' + products.length + ' productos obtenidos');
  } catch (err) {
    console.warn('   ⚠️  Error al obtener productos: ' + err.message);
  }

  // 4. Filtrar candidatos (excluir URLs ya publicadas en 30 días)
  const now    = Date.now();
  const h48ago = now - 48 * 60 * 60 * 1000;

  // Blog: separar recientes (<48 h) para priorización
  const recentBlogs = [];
  const olderBlogs  = [];
  for (const p of blogPosts) {
    const link = 'https://guiadelsalon.com/blog/' + p.slug;
    if (recentUrls.has(link)) continue;
    const age = p.published_at ? new Date(p.published_at).getTime() : 0;
    (age >= h48ago ? recentBlogs : olderBlogs).push(p);
  }
  const availableBlogs = [...recentBlogs, ...olderBlogs];

  const availableProducts = products.filter(
    p => !recentUrls.has('https://guiadelsalon.com/categorias/' + p.slug)
  );

  const availableTools = TOOLS.filter(t => !recentUrls.has(t.url));

  console.log('\n📊 Candidatos disponibles:');
  console.log('   Blog:         ' + availableBlogs.length + ' (' + recentBlogs.length + ' recientes <48 h)');
  console.log('   Productos:    ' + availableProducts.length);
  console.log('   Herramientas: ' + availableTools.length);

  // 5. Selección de slots
  //    Slots 1-2: blog posts (recientes primero)
  //    Slot 3:    producto o herramienta, rotando respecto al último
  const nextNonBlog = lastNonBlog === 'product' ? 'tool' : 'product';

  const slots = [];

  // Slots blog
  for (let i = 0; i < 2 && i < availableBlogs.length; i++) {
    slots.push({ type: 'blog', data: availableBlogs[i] });
  }

  // Slot producto/herramienta
  if (nextNonBlog === 'product' && availableProducts.length > 0) {
    slots.push({ type: 'product', data: availableProducts[0] });
  } else if (availableTools.length > 0) {
    slots.push({ type: 'tool', data: availableTools[0] });
  } else if (availableProducts.length > 0) {
    slots.push({ type: 'product', data: availableProducts[0] });
  }

  // Completar hasta 3 con más blogs si faltan contenidos del otro tipo
  const blogSlotsUsed = slots.filter(s => s.type === 'blog').length;
  for (let i = blogSlotsUsed; slots.length < 3 && i < availableBlogs.length; i++) {
    slots.push({ type: 'blog', data: availableBlogs[i] });
  }

  if (slots.length === 0) {
    console.error('\n❌ No hay contenido disponible para generar pins (todo ya publicado en los últimos 30 días).');
    process.exit(1);
  }

  // 6. Construir pins con alternancia de idioma y traducción
  console.log('\n✍️  Construyendo pins...');
  const pins   = [];
  let currLang = lastLang === 'es' ? 'en' : 'es';

  for (const slot of slots) {
    // Determinar URL e imagen
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

    // Textos base en español
    const esTexts = buildEsTexts(slot.type, slot.data);

    let finalTitle = esTexts.title;
    let finalDescription = esTexts.description;

    // Traducir al inglés si es el idioma de este slot
    if (currLang === 'en') {
      process.stdout.write('   🔤 Traduciendo "' + esTexts.title.slice(0, 45) + '…" ');
      try {
        const translated = await translateToEN(esTexts.title, esTexts.description);
        finalTitle       = translated.title;
        finalDescription = translated.description;
        console.log('✓');
      } catch (err) {
        console.log('⚠️  (fallo: ' + err.message.slice(0, 50) + ', se usa ES)');
        // Si la traducción falla, mantener español pero asignar al tablero ES
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

    // Alternar idioma para el siguiente pin
    currLang = currLang === 'es' ? 'en' : 'es';
  }

  // 7. Guardar pin_queue.json
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(pins, null, 2), 'utf8');

  // 8. Resumen
  const bar = '─'.repeat(58);
  console.log('\n' + bar);
  console.log('✅ ' + pins.length + ' pin(s) generado(s) → ' + path.relative(process.cwd(), QUEUE_PATH));
  console.log(bar);
  pins.forEach((pin, i) => {
    console.log('\n  Pin #' + (i + 1) + ' [' + pin.lang.toUpperCase() + '] [' + pin.content_type + ']');
    console.log('  Título:  ' + pin.title);
    console.log('  Link:    ' + pin.link);
    console.log('  Tablero: ' + pin.board_id);
  });
  console.log('\n▸ Revisar y publicar:');
  console.log('  npm run pinterest:publish -- --queue=scripts/pinterest/pin_queue.json\n');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message || err);
  process.exit(1);
});
