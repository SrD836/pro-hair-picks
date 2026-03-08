// extract-keyword-gap.js — Semrush Keyword Gap extractor
// Usa Playwright (Chromium visible) + intercepcion XHR
// Compatible con Node.js 18+ CommonJS

'use strict';

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');
const { chromium } = require('playwright');
const XLSX     = require('xlsx');

// ── Constantes ────────────────────────────────────────────────────────────────
const OUTPUT_DIR       = path.join(__dirname, 'output');
const CHECKPOINT_FILE  = path.join(OUTPUT_DIR, 'keyword_gap_checkpoint.json');
const JSON_BACKUP_FILE = path.join(OUTPUT_DIR, 'keyword_gap_es.json');
const XLSX_FILE        = path.join(OUTPUT_DIR, 'keyword_gap_es.xlsx');
const CHECKPOINT_EVERY = 50;

// ── Checkpoint helpers ────────────────────────────────────────────────────────
function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveCheckpoint(lastPage, totalPages, rows) {
  fs.writeFileSync(
    CHECKPOINT_FILE,
    JSON.stringify({ lastPage, totalPages, extracted: rows.length }, null, 2)
  );
  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(rows, null, 2));
  console.log(`  [checkpoint] Guardado en pagina ${lastPage} — ${rows.length} keywords`);
}

// ── XLSX export ───────────────────────────────────────────────────────────────
function exportXlsx(rows, filePath) {
  const header = ['Keyword', 'Volume', 'KD', 'CPC', 'Intent',
                  'Pos_treatwell', 'Pos_booksy', 'Pos_mipelu'];
  const data = rows.map(r => [
    r.keyword, r.volume, r.kd, r.cpc, r.intent,
    r.pos_treatwell, r.pos_booksy, r.pos_mipelu,
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Keyword Gap');
  XLSX.writeFile(wb, filePath);
  console.log(`\n[export] XLSX guardado: ${filePath} (${rows.length} filas)`);
}

// ── XHR row mapper ────────────────────────────────────────────────────────────
// Los nombres de campo del API de Semrush son desconocidos hasta la primera
// ejecucion. El script logueara la primera fila raw para verificacion.
// Ajustar claves aqui si Semrush cambia su API.
let _rawResponseLogged = false;

function mapRow(raw) {
  return {
    keyword:       raw.Ph   || raw.keyword  || (Array.isArray(raw) ? raw[0]  : '') || '',
    volume:        raw.Nq   ?? raw.volume   ?? (Array.isArray(raw) ? raw[1]  : 0)  ?? 0,
    kd:            raw.Kd   ?? raw.kd       ?? (Array.isArray(raw) ? raw[2]  : 0)  ?? 0,
    cpc:           raw.Cp   ?? raw.cpc      ?? (Array.isArray(raw) ? raw[3]  : 0)  ?? 0,
    intent:        raw.In   || raw.intent   || (Array.isArray(raw) ? raw[4]  : '') || '',
    pos_treatwell: raw.Po1  || raw.pos1     || (Array.isArray(raw) ? raw[5]  : '-') || '-',
    pos_booksy:    raw.Po2  || raw.pos2     || (Array.isArray(raw) ? raw[6]  : '-') || '-',
    pos_mipelu:    raw.Po3  || raw.pos3     || (Array.isArray(raw) ? raw[7]  : '-') || '-',
  };
}

function logRawResponseOnce(rows) {
  if (!_rawResponseLogged && rows.length > 0) {
    console.log('\n[DEBUG] Primera fila raw del API (para verificar mapping):');
    console.log(JSON.stringify(rows[0], null, 2));
    console.log('[DEBUG] Si los campos son incorrectos, ajusta mapRow() en extract-keyword-gap.js\n');
    _rawResponseLogged = true;
  }
}

// ── Utilidades de interaccion ─────────────────────────────────────────────────
function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, ans => { rl.close(); resolve(ans.trim()); }));
}

function randomDelay(minMs = 2000, maxMs = 4000) {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise(r => setTimeout(r, ms));
}

// ── Extraccion via XHR ────────────────────────────────────────────────────────
// Escucha UNA respuesta que contenga datos de keywords en la URL.
// Semrush carga la tabla via POST/GET a un endpoint interno.
function extractPageViaXHR(page, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('response', handler);
      reject(new Error('XHR timeout: no se recibio respuesta de keywords'));
    }, timeoutMs);

    const handler = async (response) => {
      const url = response.url();
      // Filtrar solo endpoints relacionados con keyword gap
      if (!url.includes('gap') && !url.includes('keyword') && !url.includes('/api/')) return;
      // Solo respuestas exitosas con JSON
      const ct = response.headers()['content-type'] || '';
      if (!ct.includes('json')) return;

      try {
        const json = await response.json();
        // Semrush puede devolver datos en distintas estructuras
        const rows =
          json.data     ||
          json.results  ||
          json.keywords ||
          json.rows     ||
          (Array.isArray(json) ? json : null);

        if (!rows || !Array.isArray(rows) || rows.length === 0) return;

        clearTimeout(timer);
        page.off('response', handler); // limpiar listener
        logRawResponseOnce(rows);
        resolve(rows.map(mapRow));
      } catch {
        // Respuesta no parseable como JSON util — ignorar
      }
    };

    page.on('response', handler);
  });
}

// ── Detectar total de paginas ─────────────────────────────────────────────────
async function getTotalPages(page) {
  try {
    return await page.evaluate(() => {
      // Semrush usa distintos selectores segun la version del UI
      const selectors = [
        '[class*="pagination"] button',
        '[class*="Pagination"] button',
        '[class*="pager"] button',
        'nav button',
      ];
      for (const sel of selectors) {
        const buttons = [...document.querySelectorAll(sel)];
        const nums = buttons.map(b => parseInt(b.textContent, 10)).filter(n => !isNaN(n));
        if (nums.length) return Math.max(...nums);
      }
      // Fallback: buscar texto "of N" o "de N" en el paginador
      const text = document.body.innerText;
      const match = text.match(/of\s+(\d[\d,]+)|de\s+(\d[\d,]+)/i);
      if (match) {
        const raw = (match[1] || match[2]).replace(/,/g, '');
        const total = parseInt(raw, 10);
        // Si es numero de keywords (no paginas), dividir entre 100
        return total > 5000 ? Math.ceil(total / 100) : total;
      }
      return null;
    });
  } catch {
    return null;
  }
}

// ── Click siguiente pagina ────────────────────────────────────────────────────
async function clickNextPage(page) {
  // Intentar distintos selectores para el boton "siguiente"
  const selectors = [
    '[aria-label="Next page"]',
    '[aria-label="Next"]',
    '[aria-label="next"]',
    'button[class*="next"]:not([disabled])',
    'button[class*="Next"]:not([disabled])',
    'a[class*="next"]:not([disabled])',
  ];
  for (const sel of selectors) {
    const btn = page.locator(sel).first();
    if (await btn.count() > 0 && await btn.isEnabled()) {
      await btn.click();
      return;
    }
  }
  throw new Error('No se encontro el boton de siguiente pagina');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ── Checkpoint recovery ──────────────────────────────────────────────────
  let startPage = 1;
  let allRows   = [];

  const checkpoint = loadCheckpoint();
  if (checkpoint) {
    const ans = await waitForEnter(
      `\n[checkpoint] Encontrado: pagina ${checkpoint.lastPage}/${checkpoint.totalPages}, ` +
      `${checkpoint.extracted} keywords.\n` +
      `Continuar desde pagina ${checkpoint.lastPage + 1}? [S/n]: `
    );
    if (ans.toLowerCase() !== 'n') {
      startPage = checkpoint.lastPage + 1;
      if (fs.existsSync(JSON_BACKUP_FILE)) {
        allRows = JSON.parse(fs.readFileSync(JSON_BACKUP_FILE, 'utf8'));
        console.log(`[recovery] Cargadas ${allRows.length} keywords del backup.`);
      }
    } else {
      console.log('[info] Empezando desde el principio (checkpoint ignorado).');
    }
  }

  // ── Launch browser ────────────────────────────────────────────────────────
  console.log('\n[browser] Abriendo Chromium...');
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();
  try {
  await page.goto('https://www.semrush.com', { waitUntil: 'domcontentloaded' });

  console.log('[browser] Chromium abierto en semrush.com.');
  console.log('[info]    Navega manualmente al Keyword Gap y espera a que la tabla cargue.');
  await waitForEnter('\nPulsa ENTER cuando la tabla sea visible y estes listo para empezar: ');

  // ── DEBUG: loguear todas las respuestas de red durante 15s ────────────────
  // Haz clic en "Volume" (u otra cabecera) en el navegador mientras esto corre.
  // El endpoint correcto aparecerá en la lista — busca las URLs con datos JSON.
  console.log('\n[DEBUG] Capturando respuestas de red durante 15 segundos...');
  console.log('[DEBUG] Haz clic en "Volume" en la tabla ahora.\n');
  const debugResponses = [];
  const debugHandler = (response) => {
    debugResponses.push(`  ${response.status()} ${response.url()}`);
  };
  page.on('response', debugHandler);
  await new Promise(r => setTimeout(r, 15000));
  page.off('response', debugHandler);
  console.log(`[DEBUG] ${debugResponses.length} respuestas capturadas:`);
  debugResponses.forEach(line => console.log(line));
  console.log('\n[DEBUG] Identifica el endpoint de keywords arriba y actualiza el filtro en extractPageViaXHR().');
  process.exit(0); // salir tras debug
  // ── FIN DEBUG ─────────────────────────────────────────────────────────────

  // ── Detectar total de paginas ─────────────────────────────────────────────
  let totalPages = await getTotalPages(page);
  if (!totalPages) {
    console.log('[warn] No se detecto el paginador automaticamente.');
    const ans = await waitForEnter('Introduce el numero total de paginas (default 1348): ');
    totalPages = parseInt(ans, 10) || 1348;
  }
  console.log(`\n[info] Total paginas: ${totalPages} | Inicio: pagina ${startPage}\n`);

  // ── Pagina 1: captura via interaccion manual ──────────────────────────────
  if (startPage === 1) {
    console.log('[info] Para capturar pagina 1, haz clic en cualquier cabecera de columna');
    console.log('       de la tabla (p.ej. "Volume") para re-ordenar y forzar nueva XHR.');
    let firstPageRows = null;
    let attempts = 0;
    while (attempts < 3 && !firstPageRows) {
      try {
        firstPageRows = await extractPageViaXHR(page, 30000);
      } catch (err) {
        attempts++;
        console.warn(`  [warn] Pagina 1 intento ${attempts}/3: ${err.message}`);
        if (attempts < 3) {
          await waitForEnter('  Haz clic en una cabecera de columna y pulsa ENTER: ');
        }
      }
    }
    if (firstPageRows) {
      allRows.push(...firstPageRows);
      console.log(`Página 1/${totalPages} — ${allRows.length} keywords extraídas`);
    } else {
      console.error('  [error] No se pudo capturar pagina 1 — continuando desde pagina 2');
    }
    startPage = 2;
  }

  // ── Loop de extraccion ────────────────────────────────────────────────────
  for (let p = startPage; p <= totalPages; p++) {
    let pageRows = null;
    let attempts = 0;

    while (attempts < 3 && !pageRows) {
      try {
        // Registrar listener ANTES de hacer clic para no perder la respuesta
        const xhrPromise = extractPageViaXHR(page);
        await clickNextPage(page);
        pageRows = await xhrPromise;
      } catch (err) {
        attempts++;
        console.warn(`  [warn] Pagina ${p} intento ${attempts}/3: ${err.message}`);
        if (attempts < 3) {
          console.warn(`  [retry] Esperando antes de reintentar...`);
          await randomDelay(3000, 5000);
        }
      }
    }

    if (!pageRows) {
      console.error(`  [error] Pagina ${p} fallo tras 3 intentos — saltando.`);
    } else {
      allRows.push(...pageRows);
    }

    console.log(`Página ${p}/${totalPages} — ${allRows.length} keywords extraídas`);

    // Checkpoint cada N paginas
    if (p % CHECKPOINT_EVERY === 0) {
      saveCheckpoint(p, totalPages, allRows);
    }

    // Delay anti-rate-limit (excepto en la ultima pagina)
    if (p < totalPages) await randomDelay(2000, 3000);
  }

  // ── Export final ──────────────────────────────────────────────────────────
  console.log('\n[done] Extraccion completada. Exportando...');
  saveCheckpoint(totalPages, totalPages, allRows);
  exportXlsx(allRows, XLSX_FILE);
  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(allRows, null, 2));

  console.log(`\n[resultado] ${allRows.length} keywords exportadas a:`);
  console.log(`  XLSX: ${XLSX_FILE}`);
  console.log(`  JSON: ${JSON_BACKUP_FILE}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('\n[fatal]', err.message);
  console.error(err.stack);
  process.exit(1);
});
