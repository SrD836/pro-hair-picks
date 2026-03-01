#!/usr/bin/env node
/**
 * demo_server.js — Servidor de demo para GuiaDelSalon x Pinterest
 * Sirve index.html en :3001 y expone endpoints de estado.
 *
 * Endpoints:
 *   GET /              → sirve demo/index.html
 *   GET /api/status    → { connected: bool, username: null }
 *   GET /api/last-pin  → ultimo Pin publicado del log, o 204 si no hay
 *   GET /api/auth-url  → { url: string } URL de autorizacion OAuth
 *
 * Uso: npm run pinterest:demo
 */

'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const PORT     = 3001;
const HTML     = path.join(__dirname, 'demo', 'index.html');
const LOG_PATH = path.join(__dirname, 'pin_log.json');
const ENV_PATH = path.join(process.cwd(), '.env.scripts');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(function(line) {
    var t = line.trim();
    if (!t || t.startsWith('#')) return;
    var idx = t.indexOf('=');
    if (idx < 0) return;
    env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

function readLog() {
  if (!fs.existsSync(LOG_PATH)) return { pins: [] };
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); }
  catch { return { pins: [] }; }
}

function sendJson(res, data, status) {
  var body = JSON.stringify(data);
  res.writeHead(status || 200, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

var server = http.createServer(function(req, res) {
  var url = new URL(req.url, 'http://localhost:' + PORT);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  // Serve HTML
  if (url.pathname === '/' || url.pathname === '/index.html') {
    if (!fs.existsSync(HTML)) {
      res.writeHead(404);
      res.end('demo/index.html not found');
      return;
    }
    var html = fs.readFileSync(HTML, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // GET /api/status
  if (url.pathname === '/api/status') {
    var env = loadEnv(ENV_PATH);
    sendJson(res, { connected: !!env.PINTEREST_ACCESS_TOKEN, username: null });
    return;
  }

  // GET /api/last-pin
  if (url.pathname === '/api/last-pin') {
    var logData   = readLog();
    var published = logData.pins.filter(function(p) {
      return p.decision === 'publicado' || p.decision === 'editado_y_publicado';
    });
    if (!published.length) {
      res.writeHead(204);
      res.end();
      return;
    }
    var last = published[published.length - 1];
    var pinData = Object.assign(
      {},
      last.pin_after || last.pin_before,
      { timestamp: last.timestamp, pinterest_id: last.pinterest_id }
    );
    sendJson(res, pinData);
    return;
  }

  // GET /api/auth-url
  // Note: state (CSRF token) is intentionally omitted here. The full OAuth flow with
  // proper state validation runs via `npm run pinterest:auth` (pinterest_oauth.js on :8080).
  // This endpoint only provides the URL for display purposes in the demo interface.
  if (url.pathname === '/api/auth-url') {
    var e = loadEnv(ENV_PATH);
    if (!e.PINTEREST_CLIENT_ID) {
      sendJson(res, { error: 'PINTEREST_CLIENT_ID no configurado' }, 400);
      return;
    }
    var redir = e.PINTEREST_REDIRECT_URI || 'http://localhost:8080/callback';
    var authUrl = 'https://www.pinterest.com/oauth/?client_id=' + e.PINTEREST_CLIENT_ID
      + '&redirect_uri=' + encodeURIComponent(redir)
      + '&scope=' + encodeURIComponent('boards:read,pins:write')
      + '&response_type=code';
    sendJson(res, { url: authUrl });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, function() {
  console.log('[' + new Date().toISOString() + '] Demo server en http://localhost:' + PORT);
  console.log('  Abre http://localhost:' + PORT + ' en tu navegador');
});
