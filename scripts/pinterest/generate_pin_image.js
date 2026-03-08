#!/usr/bin/env node
/**
 * generate_pin_image.js — Genera imágenes para Pins con Google Imagen 3
 *
 * Uso standalone (modo test):
 *   npm run pinterest:genimage
 *   node scripts/pinterest/generate_pin_image.js --test
 *
 * Exporta generatePinImage(pinData) → Promise<string> (URL pública Supabase)
 *
 * Flujo:
 *   1. Construye prompt personalizado según el tipo de pin (blog/tool/product)
 *   2. Llama a Google Imagen 3 via REST (generativelanguage.googleapis.com)
 *   3. Sube la imagen al bucket "pinterest-images" de Supabase Storage
 *   4. Devuelve la URL pública de Supabase Storage
 *   5. En caso de fallo, devuelve la imagen original del pin (fallback)
 *
 * Requiere en .env.scripts:
 *   GEMINI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ENV_PATH = path.join(process.cwd(), '.env.scripts');

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

const envVars     = loadEnv(ENV_PATH);
const GEMINI_KEY  = process.env.GEMINI_API_KEY      || envVars.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL        || envVars.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || envVars.SUPABASE_SERVICE_KEY;

const BUCKET = 'pinterest-images';

// ── Helpers ────────────────────────────────────────────────────────────────
function ts() { return new Date().toISOString(); }
function log(msg) { console.log('[' + ts() + '] ' + msg); }

function httpsRequest(options, bodyBuffer) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        resolve({ status: res.statusCode, headers: res.headers, raw });
      });
    });
    req.on('error', reject);
    if (bodyBuffer) req.end(bodyBuffer);
    else req.end();
  });
}

// ── Extraer keywords del título (para el prompt de blog) ───────────────────
function extractKeywords(title) {
  if (!title) return 'peluquería profesional';
  // Eliminar palabras vacías en ES y quedarse con sustantivos/adjetivos clave
  const stopwords = new Set([
    'de','la','el','los','las','en','y','a','con','por','para','del',
    'al','se','le','que','un','una','unos','unas','como','es','son',
    'lo','su','sus','mi','tu','nos','hay','más','si','no','o','e',
  ]);
  return title
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 4)
    .join(', ') || 'peluquería profesional';
}

// ── Construir prompt por tipo de pin ──────────────────────────────────────
function buildPrompt(pinData) {
  const type = pinData.content_type || 'blog';

  if (type === 'blog') {
    const keywords = extractKeywords(pinData.title || '');
    return [
      'Photorealistic professional hairdressing salon scene in Spain.',
      'Warm, inviting atmosphere with rich espresso-brown tones (#2D2218) and cream (#F5F0E8) accents.',
      'Soft studio lighting, shallow depth of field, editorial style.',
      'Subject matter related to: ' + keywords + '.',
      'Premium beauty salon aesthetic. No text or watermarks.',
      'Vertical portrait composition, 2:3 ratio.',
    ].join(' ');
  }

  if (type === 'tool') {
    return [
      'Minimalist elegant composition on a deep espresso-dark background (#2D2218).',
      'Golden (#C4A97D) graphic elements and subtle light rays.',
      'Premium professional hair diagnosis tool aesthetic.',
      'Abstract hair strands or trichoscopy microscopic detail, high-end beauty tech.',
      'No text or watermarks. Clean, luxury brand visual.',
      'Vertical portrait composition, 2:3 ratio.',
    ].join(' ');
  }

  // product
  return [
    'Professional hairdressing product on a white marble surface.',
    'Studio lighting, neutral cream background (#F5F0E8), soft shadows.',
    'Editorial style of a specialized beauty magazine.',
    'Elegant flat-lay or three-quarter angle composition.',
    'High-end product photography, no text or watermarks.',
    'Vertical portrait composition, 2:3 ratio.',
  ].join(' ');
}

// ── Llamar a Google Imagen 3 via REST ──────────────────────────────────────
async function generateWithImagen3(prompt) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY no encontrado en .env.scripts');

  const reqBody = Buffer.from(JSON.stringify({
    instances: [{ prompt }],
    parameters: {
      sampleCount:       1,
      aspectRatio:       '2:3',
      safetySetting:     'block_some',
      personGeneration:  'dont_allow',
      addWatermark:      false,
    },
  }));

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path:     '/v1beta/models/imagen-3.0-generate-001:predict?key=' + GEMINI_KEY,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': reqBody.length,
    },
  };

  const { status, raw } = await httpsRequest(options, reqBody);

  let parsed;
  try { parsed = JSON.parse(raw.toString('utf8')); }
  catch { throw new Error('Respuesta no JSON de Imagen 3: ' + raw.toString('utf8').slice(0, 200)); }

  if (status < 200 || status >= 300) {
    const errMsg = (parsed.error && parsed.error.message) || JSON.stringify(parsed).slice(0, 300);
    throw new Error('Imagen 3 HTTP ' + status + ': ' + errMsg);
  }

  const prediction = parsed.predictions && parsed.predictions[0];
  if (!prediction || !prediction.bytesBase64Encoded) {
    throw new Error('Imagen 3 no devolvió imagen: ' + JSON.stringify(parsed).slice(0, 200));
  }

  return {
    buffer:   Buffer.from(prediction.bytesBase64Encoded, 'base64'),
    mimeType: prediction.mimeType || 'image/png',
  };
}

// ── Supabase Storage: crear bucket (idempotente) ───────────────────────────
async function ensureBucket() {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('SUPABASE_URL o SUPABASE_SERVICE_KEY no encontrados');

  const body = Buffer.from(JSON.stringify({ id: BUCKET, name: BUCKET, public: true }));
  const url  = new URL(SUPABASE_URL + '/storage/v1/bucket');

  const { status, raw } = await httpsRequest({
    hostname: url.hostname,
    path:     url.pathname,
    method:   'POST',
    headers: {
      'apikey':          SERVICE_KEY,
      'Authorization':   'Bearer ' + SERVICE_KEY,
      'Content-Type':    'application/json',
      'Content-Length':  body.length,
    },
  }, body);

  // 200 = creado, 409 = ya existe — ambos son correctos
  if (status !== 200 && status !== 201 && status !== 409) {
    throw new Error('Error al crear bucket "' + BUCKET + '": HTTP ' + status +
                    ' — ' + raw.toString('utf8').slice(0, 200));
  }
}

// ── Supabase Storage: subir imagen y devolver URL pública ─────────────────
async function uploadToSupabase(buffer, mimeType, filename) {
  const url = new URL(SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + filename);

  const { status, raw } = await httpsRequest({
    hostname: url.hostname,
    path:     url.pathname,
    method:   'POST',
    headers: {
      'apikey':          SERVICE_KEY,
      'Authorization':   'Bearer ' + SERVICE_KEY,
      'Content-Type':    mimeType,
      'Content-Length':  buffer.length,
      'x-upsert':        'true',   // sobreescribir si ya existe
    },
  }, buffer);

  if (status < 200 || status >= 300) {
    throw new Error('Error al subir imagen a Supabase: HTTP ' + status +
                    ' — ' + raw.toString('utf8').slice(0, 200));
  }

  // URL pública: /storage/v1/object/public/{bucket}/{filename}
  return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + filename;
}

// ── Función principal exportable ───────────────────────────────────────────
/**
 * Genera una imagen para el pin con Imagen 3 y la sube a Supabase Storage.
 * @param  {Object} pinData  Objeto pin: { title, content_type, image_url, link, lang }
 * @returns {Promise<string>} URL pública de la imagen generada (o fallback)
 */
async function generatePinImage(pinData) {
  const type     = pinData.content_type || 'blog';
  const safeName = (pinData.link || '')
    .replace(/https?:\/\/[^/]+/, '')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const timestamp = Date.now();
  const filename  = (safeName || type) + '-' + timestamp + '.png';

  const prompt = buildPrompt(pinData);
  log('Generando imagen [' + type + ']: "' + prompt.slice(0, 80) + '..."');

  try {
    const { buffer, mimeType } = await generateWithImagen3(prompt);
    log('Imagen generada (' + Math.round(buffer.length / 1024) + ' KB). Subiendo a Supabase...');

    await ensureBucket();
    const publicUrl = await uploadToSupabase(buffer, mimeType, filename);
    log('✓ Imagen disponible: ' + publicUrl);
    return publicUrl;

  } catch (err) {
    const fallback = pinData.image_url || null;
    log('⚠️  Fallo en Imagen 3 (' + err.message.slice(0, 80) + ')' +
        (fallback ? ' → usando fallback: ' + fallback : ' → sin fallback'));
    if (fallback) return fallback;
    throw err;
  }
}

// ── Exportar ───────────────────────────────────────────────────────────────
module.exports = { generatePinImage };

// ── Modo --test ────────────────────────────────────────────────────────────
if (require.main === module) {
  const isTest = process.argv.includes('--test');
  if (!isTest) {
    console.log('Uso: node scripts/pinterest/generate_pin_image.js --test');
    console.log('  Genera 1 imagen de cada tipo (blog, tool, product) y muestra las URLs.');
    process.exit(0);
  }

  const missing = [
    !GEMINI_KEY   && 'GEMINI_API_KEY',
    !SUPABASE_URL && 'SUPABASE_URL',
    !SERVICE_KEY  && 'SUPABASE_SERVICE_KEY',
  ].filter(Boolean);
  if (missing.length) {
    console.error('❌ Variables no encontradas en .env.scripts: ' + missing.join(', '));
    process.exit(1);
  }

  const testPins = [
    {
      content_type: 'blog',
      title:        'Técnicas de coloración profesional balayage y ombre para peluquería',
      link:         'https://guiadelsalon.com/blog/tecnicas-coloracion-balayage',
      image_url:    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=1800&fit=crop',
    },
    {
      content_type: 'tool',
      title:        'Analizador de Canicie — Herramienta gratuita para peluqueros',
      link:         'https://guiadelsalon.com/mi-pelo/analizador-canicie',
      image_url:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=1800&fit=crop',
    },
    {
      content_type: 'product',
      title:        'Champú profesional hidratante para cabello teñido',
      link:         'https://guiadelsalon.com/categorias/champu-hidratante',
      image_url:    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=1800&fit=crop',
    },
  ];

  (async () => {
    log('=== generate_pin_image.js — modo test (3 imágenes) ===\n');
    const results = [];

    for (const pin of testPins) {
      log('── Tipo: ' + pin.content_type.toUpperCase() + ' ──');
      try {
        const url = await generatePinImage(pin);
        results.push({ type: pin.content_type, url, ok: true });
      } catch (err) {
        results.push({ type: pin.content_type, url: null, ok: false, error: err.message });
      }
      log('');
    }

    const sep = '─'.repeat(60);
    console.log('\n' + sep);
    console.log('RESULTADOS DEL TEST');
    console.log(sep);
    results.forEach(r => {
      if (r.ok) {
        console.log('✅ [' + r.type.toUpperCase() + '] ' + r.url);
      } else {
        console.log('❌ [' + r.type.toUpperCase() + '] Error: ' + r.error);
      }
    });
    console.log(sep + '\n');

    const failed = results.filter(r => !r.ok).length;
    process.exit(failed === results.length ? 1 : 0);
  })();
}
