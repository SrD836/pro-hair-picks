#!/usr/bin/env node
/**
 * pin_publisher.js — Publicador de Pines con aprobación humana
 *
 * Uso:
 *   npm run pinterest:publish -- --queue=ruta/pins.json
 *   npm run pinterest:publish   (usa cola de ejemplo para demo)
 *
 * Requiere en .env.scripts:
 *   PINTEREST_ACCESS_TOKEN
 *
 * Cumplimiento Pinterest:
 *   - Nunca publica sin confirmación humana (s/n/editar)
 *   - Máximo 5 Pines/día
 *   - Solo enlaza a contenido de GuiaDelSalon.com
 *   - Registra toda decisión en pin_log.json
 */

'use strict';
const https    = require('https');
const zlib     = require('zlib');
const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

// ── Cargar .env.scripts ──────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.scripts');
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
const env = loadEnv(envPath);
const ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || env.PINTEREST_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.error('❌ PINTEREST_ACCESS_TOKEN no encontrado. Ejecuta primero: npm run pinterest:auth');
  process.exit(1);
}

// ── Rutas ─────────────────────────────────────────────────────────────────
const LOG_PATH = path.join(__dirname, 'pin_log.json');

// ── Helpers ───────────────────────────────────────────────────────────────
function ts() { return new Date().toISOString(); }
function log(msg) { console.log(`[${ts()}] ${msg}`); }

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
  return logData.pins.filter(
    p => (p.decision === 'publicado' || p.decision === 'editado_y_publicado')
      && p.timestamp.startsWith(today)
  ).length;
}

// ── Previsualización ASCII ────────────────────────────────────────────────
function showPreview(pin, index, total) {
  const W   = 52;
  const pad = (str, w) => {
    const s = String(str || '').slice(0, w - 2);
    return s + ' '.repeat(Math.max(0, w - 2 - s.length));
  };
  console.log('');
  console.log('+-' + '-'.repeat(W) + '-+');
  console.log('| PIN #' + index + ' de ' + total + ' '.repeat(Math.max(0, W - ('PIN #' + index + ' de ' + total).length + 1)) + '|');
  console.log('+-' + '-'.repeat(W) + '-+');
  console.log('| Titulo:      ' + pad(pin.title, W - 13) + ' |');
  console.log('| Descripcion: ' + pad(pin.description, W - 13) + ' |');
  console.log('| URL destino: ' + pad(pin.link, W - 13) + ' |');
  console.log('| Tablero:     ' + pad(pin.board_id, W - 13) + ' |');
  const imgDisplay = pin.image_source === 'local'
    ? '[local] ' + (pin.image_file || '(sin archivo)')
    : (pin.image_url || '(sin imagen)');
  console.log('| Imagen:      ' + pad(imgDisplay, W - 13) + ' |');
  console.log('+-' + '-'.repeat(W) + '-+');
  console.log('');
}

// ── Imagen local → base64 ─────────────────────────────────────────────────
const MIME_MAP = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
const IMAGENES_DIR = path.join(__dirname, 'imagenes');

function loadLocalImageAsBase64(filename) {
  const filePath = path.join(IMAGENES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error('Imagen local no encontrada: ' + filePath);
  }
  const ext = path.extname(filename).toLowerCase().slice(1);
  const contentType = MIME_MAP[ext] || 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return { data, contentType };
}

// ── Publicar Pin via API v5 ────────────────────────────────────────────────
function publishPin(pin) {
  return new Promise((resolve, reject) => {
    // Compliance: all pins must link to GuiaDelSalon.com content
    if (!pin.link || !pin.link.startsWith('https://guiadelsalon.com')) {
      reject(new Error('El link debe apuntar a guiadelsalon.com: ' + pin.link));
      return;
    }
    let mediaSource;
    if (pin.image_source === 'local') {
      let imgData;
      try {
        imgData = loadLocalImageAsBase64(pin.image_file);
      } catch (e) {
        reject(e);
        return;
      }
      mediaSource = {
        source_type:  'image_base64',
        data:         imgData.data,
        content_type: imgData.contentType,
      };
    } else {
      mediaSource = {
        source_type: 'image_url',
        url:         pin.image_url,
      };
    }

    const body = JSON.stringify({
      board_id:     pin.board_id,
      title:        pin.title,
      description:  pin.description,
      link:         pin.link,
      media_source: mediaSource,
    });

    const options = {
      hostname: 'api-sandbox.pinterest.com',
      path:     '/v5/pins',
      method:   'POST',
      headers: {
        'Authorization':   `Bearer ${ACCESS_TOKEN}`,
        'Content-Type':    'application/json',
        'Content-Length':  Buffer.byteLength(body),
        'Accept-Encoding': 'identity',
      },
    };

    const req = https.request(options, res => {
      const encoding = res.headers['content-encoding'];
      const stream = encoding === 'gzip' ? res.pipe(zlib.createGunzip())
                   : encoding === 'br'   ? res.pipe(zlib.createBrotliDecompress())
                   : res;
      let data = '';
      stream.on('data', chunk => { data += chunk; });
      stream.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(JSON.stringify(json)));
        } catch { reject(new Error(data)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function editPin(rl, pin) {
  log('Modo edicion. Deja vacio para mantener el valor actual.');
  const newTitle = await ask(rl, '  Titulo [' + pin.title + ']: ');
  const newDesc  = await ask(rl, '  Descripcion [' + pin.description + ']: ');
  if (newTitle.trim()) pin.title = newTitle.trim();
  if (newDesc.trim())  pin.description = newDesc.trim();
  return pin;
}

// ── Flujo principal ────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const queueArg = args.find(a => a.startsWith('--queue='));
  const queuePath = queueArg ? queueArg.split('=')[1] : null;

  let pins = [];
  if (queuePath) {
    if (!fs.existsSync(queuePath)) {
      console.error('❌ Archivo de cola no encontrado: ' + queuePath);
      process.exit(1);
    }
    try {
      pins = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    } catch (e) {
      console.error('❌ El archivo de cola no contiene JSON valido: ' + queuePath);
      console.error('   ' + e.message);
      process.exit(1);
    }
    if (!Array.isArray(pins)) pins = [pins];
  } else {
    // Cola de ejemplo para demo (1 Pin con board_id real)
    pins = [{
      title:       'Que es el Color Match Capilar y como elegir el tono perfecto',
      description: 'Descubre como el analisis de color capilar profesional te ayuda a elegir el tinte ideal para tu cabello. Guia completa con tecnicas de coloristas expertos.',
      link:        'https://guiadelsalon.com/color-match',
      board_id:    '1133218393678035986',
      image_url:   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=630&fit=crop',
    }];
    log('(!) No se especifico --queue. Usando cola de ejemplo (1 Pin).');
    log('    Uso real: npm run pinterest:publish -- --queue=ruta/pins.json');
  }

  const logData    = readLog();
  const todayCount = countTodayPublished(logData);

  log('=== Inicio sesion de publicacion | Pines hoy: ' + todayCount + '/5 ===');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let published = 0;
  for (let i = 0; i < pins.length; i++) {
    let pin = Object.assign({}, pins[i]);

    if (todayCount + published >= 5) {
      log('Limite diario de 5 Pines alcanzado. Se detiene la publicacion.');
      break;
    }

    showPreview(pin, i + 1, pins.length);

    let decision = '';
    while (!['s', 'n', 'editar'].includes(decision)) {
      decision = (await ask(rl, 'Publicar este Pin? (s/n/editar): ')).trim().toLowerCase();
    }

    const entry = {
      timestamp:    ts(),
      decision:     decision === 's' ? 'publicado' : decision === 'n' ? 'saltado' : 'editado_y_publicado',
      pin_before:   Object.assign({}, pin),
      pin_after:    null,
      pinterest_id: null,
      error:        null,
    };

    if (decision === 'editar') {
      pin = await editPin(rl, pin);
      entry.pin_after = Object.assign({}, pin);
      showPreview(pin, i + 1, pins.length);
      let confirm = '';
      while (!['s', 'n'].includes(confirm)) {
        confirm = (await ask(rl, 'Publicar version editada? (s/n): ')).trim().toLowerCase();
      }
      if (confirm !== 's') {
        entry.decision = 'saltado_tras_edicion';
        logData.pins.push(entry);
        writeLog(logData);
        log('Pin #' + (i + 1) + ' saltado tras edicion.');
        continue;
      }
      entry.decision = 'editado_y_publicado';
    }

    if (decision === 'n') {
      logData.pins.push(entry);
      writeLog(logData);
      log('Pin #' + (i + 1) + ' saltado.');
      continue;
    }

    // Publicar
    try {
      log('Publicando Pin #' + (i + 1) + '...');
      const result = await publishPin(pin);
      entry.pinterest_id = result.id;
      published++;
      log('Pin publicado con ID: ' + result.id);
      log('Ver en: https://www.pinterest.com/pin/' + result.id + '/');
    } catch (err) {
      entry.decision = 'error';
      entry.error    = err.message;
      log('Error al publicar Pin #' + (i + 1) + ': ' + err.message);
    }

    logData.pins.push(entry);
    writeLog(logData);
  }

  rl.close();
  log('=== Sesion finalizada. Pines publicados esta sesion: ' + published + ' ===');
}

main().catch(err => { console.error('❌ Error fatal:', err); process.exit(1); });
