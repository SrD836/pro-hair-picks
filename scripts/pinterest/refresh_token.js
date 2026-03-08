#!/usr/bin/env node
/**
 * refresh_token.js — Renueva el access_token de Pinterest usando el refresh_token
 *
 * Uso standalone:
 *   npm run pinterest:refresh
 *
 * También exporta refreshToken() para uso programático desde auto_publish.js.
 *
 * Requiere en .env.scripts:
 *   PINTEREST_CLIENT_ID
 *   PINTEREST_CLIENT_SECRET
 *   PINTEREST_REFRESH_TOKEN
 *
 * Actualiza en .env.scripts:
 *   PINTEREST_ACCESS_TOKEN   ← nuevo token
 *   PINTEREST_REFRESH_TOKEN  ← si Pinterest devuelve uno rotado
 */

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ENV_PATH = path.join(process.cwd(), '.env.scripts');

// ── Helpers (mismo patrón que pinterest_auth.js) ───────────────────────────
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

function updateEnvKey(filePath, key, value) {
  let content = fs.readFileSync(filePath, 'utf8');
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^(' + escapedKey + '=).*$', 'm');
  if (regex.test(content)) {
    content = content.replace(regex, '$1' + value);
  } else {
    content = content.trimEnd() + '\n' + key + '=' + value + '\n';
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function ts() { return new Date().toISOString(); }
function log(msg) { console.log('[' + ts() + '] ' + msg); }

// ── Llamada HTTP ───────────────────────────────────────────────────────────
function postForm(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(Object.assign(
            new Error('HTTP ' + res.statusCode + ': ' + JSON.stringify(json)),
            { status: res.statusCode, body: json }
          ));
        } catch {
          reject(new Error('HTTP ' + res.statusCode + ' (respuesta no JSON): ' + data.slice(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── refreshToken(): función principal exportable ───────────────────────────
/**
 * Renueva el access_token de Pinterest.
 * @returns {Promise<string>} Nuevo access_token
 * @throws  Si el refresh falla (token expirado, credenciales inválidas, red)
 */
async function refreshToken() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('.env.scripts no encontrado en: ' + ENV_PATH);
  }

  const env = loadEnv(ENV_PATH);
  const CLIENT_ID      = process.env.PINTEREST_CLIENT_ID      || env.PINTEREST_CLIENT_ID;
  const CLIENT_SECRET  = process.env.PINTEREST_CLIENT_SECRET  || env.PINTEREST_CLIENT_SECRET;
  const REFRESH_TOKEN  = process.env.PINTEREST_REFRESH_TOKEN  || env.PINTEREST_REFRESH_TOKEN;

  const missing = [
    !CLIENT_ID     && 'PINTEREST_CLIENT_ID',
    !CLIENT_SECRET && 'PINTEREST_CLIENT_SECRET',
    !REFRESH_TOKEN && 'PINTEREST_REFRESH_TOKEN',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error('Variables no encontradas en .env.scripts: ' + missing.join(', '));
  }

  const credentials = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
  const body = 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(REFRESH_TOKEN);

  const options = {
    hostname: 'api.pinterest.com',
    path:     '/v5/oauth/token',
    method:   'POST',
    headers: {
      'Authorization':  'Basic ' + credentials,
      'Content-Type':   'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  log('Renovando access_token de Pinterest...');
  const json = await postForm(options, body);

  if (!json.access_token) {
    throw new Error('Respuesta sin access_token: ' + JSON.stringify(json).slice(0, 200));
  }

  // Guardar nuevo access_token
  updateEnvKey(ENV_PATH, 'PINTEREST_ACCESS_TOKEN', json.access_token);
  log('PINTEREST_ACCESS_TOKEN actualizado ✓');

  // Pinterest puede rotar el refresh_token; guardarlo si viene en la respuesta
  if (json.refresh_token && json.refresh_token !== REFRESH_TOKEN) {
    updateEnvKey(ENV_PATH, 'PINTEREST_REFRESH_TOKEN', json.refresh_token);
    log('PINTEREST_REFRESH_TOKEN rotado y guardado ✓');
  }

  // Fecha de expiración del access_token
  if (json.expires_in) {
    const expiresAt = new Date(Date.now() + json.expires_in * 1000);
    log('Nuevo token expira: ' + expiresAt.toISOString() +
        ' (en ' + Math.round(json.expires_in / 86400) + ' días)');
  }

  // Fecha de expiración del refresh_token (si la API la devuelve)
  if (json.refresh_token_expires_in) {
    const rtExp = new Date(Date.now() + json.refresh_token_expires_in * 1000);
    log('Refresh token expira: ' + rtExp.toISOString() +
        ' (en ' + Math.round(json.refresh_token_expires_in / 86400) + ' días)');
  }

  return json.access_token;
}

// ── Exportar para auto_publish.js ──────────────────────────────────────────
module.exports = { refreshToken };

// ── Ejecutar standalone ────────────────────────────────────────────────────
if (require.main === module) {
  refreshToken()
    .then(token => {
      log('=== Refresh completado. Token: ' + token.slice(0, 20) + '... ===');
    })
    .catch(err => {
      console.error('❌ ' + err.message);
      if (err.status === 400 || err.status === 401) {
        console.error('   El refresh_token ha expirado o es inválido.');
        console.error('   Ejecuta: npm run pinterest:auth  (requiere interacción manual)');
      }
      process.exit(1);
    });
}
