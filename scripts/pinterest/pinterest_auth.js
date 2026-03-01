#!/usr/bin/env node
/**
 * pinterest_oauth.js — Flujo OAuth 2.0 de Pinterest
 *
 * Uso: npm run pinterest:auth
 *
 * Requiere en .env.scripts:
 *   PINTEREST_CLIENT_ID
 *   PINTEREST_CLIENT_SECRET
 *   PINTEREST_REDIRECT_URI=http://localhost:8080/callback
 *
 * Escribe en .env.scripts:
 *   PINTEREST_ACCESS_TOKEN
 *   PINTEREST_REFRESH_TOKEN
 */

'use strict';
const http         = require('http');
const https        = require('https');
const fs           = require('fs');
const path         = require('path');
const crypto       = require('crypto');
const { execFile } = require('child_process');

// ── 1. Cargar .env.scripts ────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.scripts');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.scripts no encontrado.');
  process.exit(1);
}

function loadEnv(filePath) {
  const env = {};
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 0) return;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

function updateEnvKey(filePath, key, value) {
  let content = fs.readFileSync(filePath, 'utf8');
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^(${escapedKey}=).*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `$1${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

const env = loadEnv(envPath);
const CLIENT_ID     = env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI  = env.PINTEREST_REDIRECT_URI || 'http://localhost:8080/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ PINTEREST_CLIENT_ID y PINTEREST_CLIENT_SECRET deben estar en .env.scripts');
  process.exit(1);
}

// ── 2. Helpers de log con timestamp ──────────────────────────────────────
function ts() { return new Date().toISOString(); }
function log(msg) { console.log(`[${ts()}] ${msg}`); }

// ── 3. Generar state anti-CSRF ─────────────────────────────────────────────
const state = crypto.randomBytes(16).toString('hex');

// ── 4. Construir URL de autorización ──────────────────────────────────────
const scopes = 'boards:read,boards:write,pins:read,pins:write';
const authUrl = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

log('=== PASO 1: Abre este URL en tu navegador para autorizar la app ===');
log('');
console.log(authUrl);
log('');
log('=== Esperando redireccion en http://localhost:8080/callback ... ===');

// ── 5. Intentar abrir el navegador automáticamente (seguro: execFile) ──────
// En Windows, cmd interpreta & como separador de comandos, por lo que hay que
// escapar los & de la URL con ^& antes de pasarla a "start".
if (process.platform === 'win32') {
  const escapedUrl = authUrl.replace(/&/g, '^&');
  execFile('cmd', ['/c', 'start', '', escapedUrl], () => {});
} else if (process.platform === 'darwin') {
  execFile('open', [authUrl], () => {});
} else {
  execFile('xdg-open', [authUrl], () => {});
}

// ── 6. Servidor temporal para capturar el code ────────────────────────────
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:8080');
  if (url.pathname !== '/callback') {
    res.end('Not found'); return;
  }

  const receivedState = url.searchParams.get('state');
  const code          = url.searchParams.get('code');
  const error         = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    const safeError = String(error).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.end(`<h1>Error: ${safeError}</h1><p>Puedes cerrar esta ventana.</p>`);
    log(`Error Pinterest: ${error}`);
    server.close();
    process.exit(1);
  }

  if (receivedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>Error: state mismatch (posible CSRF)</h1>');
    log('State mismatch — abortando por seguridad.');
    server.close();
    process.exit(1);
  }

  log('=== PASO 2: authorization_code recibido ===');

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Autorizacion recibida. Puedes cerrar esta ventana.</h1>');

  clearTimeout(authTimeout);
  server.close();
  exchangeCodeForTokens(code);
});

const AUTH_TIMEOUT_MS = 5 * 60 * 1000;
const authTimeout = setTimeout(() => {
  log('Tiempo de espera agotado (5 min). Ejecuta de nuevo: npm run pinterest:auth');
  server.close();
  process.exit(1);
}, AUTH_TIMEOUT_MS);

server.listen(8080);

// ── 7. Intercambiar code por access_token + refresh_token ─────────────────
function exchangeCodeForTokens(code) {
  log('=== PASO 3: Intercambiando code por tokens... ===');

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    grant_type:   'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  }).toString();

  const options = {
    hostname: 'api-sandbox.pinterest.com',
    path:     '/v5/oauth/token',
    method:   'POST',
    headers: {
      'Authorization':  `Basic ${credentials}`,
      'Content-Type':   'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      let json;
      try { json = JSON.parse(data); }
      catch (e) { log(`Respuesta no JSON: ${data}`); process.exit(1); }

      if (json.error || !json.access_token) {
        log(`Error al obtener tokens: ${JSON.stringify(json)}`);
        process.exit(1);
      }

      log('=== PASO 4: Tokens obtenidos ===');
      log(`  access_token  -> ${json.access_token.slice(0, 20)}...`);
      log(`  refresh_token -> ${json.refresh_token ? json.refresh_token.slice(0, 20) + '...' : 'N/A'}`);
      log(`  expires_in    -> ${json.expires_in}s`);

      updateEnvKey(envPath, 'PINTEREST_ACCESS_TOKEN', json.access_token);
      if (json.refresh_token) {
        updateEnvKey(envPath, 'PINTEREST_REFRESH_TOKEN', json.refresh_token);
      }

      log('=== PASO 5: Tokens guardados en .env.scripts ===');
      log('Ya puedes ejecutar: npm run pinterest:publish');
    });
  });

  req.on('error', e => { log(`Error de red: ${e.message}`); process.exit(1); });
  req.write(body);
  req.end();
}
