// extract-keyword-gap.js — Semrush Keyword Gap extractor
// Endpoint: https://www.semrush.com/spectrum/v1/Gap/KeywordsList
// Usa Playwright (Chromium visible) + intercepcion XHR persistente con cola
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
const ENDPOINT         = 'spectrum/v1/Gap/KeywordsList';

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
  console.log(`  [checkpoint] Guardado en página ${lastPage} — ${rows.length} keywords`);
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
// mapRow se actualiza una vez vista la estructura real del primer response.
// Los campos actuales son estimaciones — ajustar según el [DEBUG] de la primera ejecución.
function mapRow(raw) {
  return {
    keyword:       raw.Ph   || raw.keyword  || raw.phrase      || (Array.isArray(raw) ? raw[0]  : '') || '',
    volume:        raw.Nq   ?? raw.volume   ?? raw.search_volume ?? (Array.isArray(raw) ? raw[1]  : 0)  ?? 0,
    kd:            raw.Kd   ?? raw.kd       ?? raw.difficulty  ?? (Array.isArray(raw) ? raw[2]  : 0)  ?? 0,
    cpc:           raw.Cp   ?? raw.cpc      ?? raw.cpc_usd     ?? (Array.isArray(raw) ? raw[3]  : 0)  ?? 0,
    intent:        raw.In   || raw.intent   || raw.intents     || (Array.isArray(raw) ? raw[4]  : '') || '',
    pos_treatwell: raw.Po1  || raw.pos1     || raw.position_1  || (Array.isArray(raw) ? raw[5]  : '-') || '-',
    pos_booksy:    raw.Po2  || raw.pos2     || raw.position_2  || (Array.isArray(raw) ? raw[6]  : '-') || '-',
    pos_mipelu:    raw.Po3  || raw.pos3     || raw.position_3  || (Array.isArray(raw) ? raw[7]  : '-') || '-',
  };
}

// ── Interceptor persistente con cola ─────────────────────────────────────────
// Registra un listener permanente que encola TODAS las respuestas del endpoint.
// Así no hay race condition entre el clic y el listener — nada se pierde.
const responseQueue = [];
let _firstResponseLogged = false;

function setupInterceptor(page) {
  page.on('response', async (response) => {
    if (!response.url().includes(ENDPOINT)) return;
    try {
      const json = await response.json();

      // Loguear el primer response completo para verificar estructura de campos
      if (!_firstResponseLogged) {
        console.log(`\n[DEBUG] Primer response de ${ENDPOINT}:`);
        const preview = JSON.stringify(json, null, 2);
        console.log(preview.length > 3000 ? preview.slice(0, 3000) + '\n...(truncado)' : preview);
        console.log('[DEBUG] Usa esta estructura para actualizar mapRow() si los campos son incorrectos.\n');
        _firstResponseLogged = true;
      }

      responseQueue.push(json);
    } catch {
      // Respuesta no parseable — ignorar
    }
  });
}

// Espera a que llegue un nuevo item a la cola (tras el índice `fromIndex`)
function waitForQueueItem(fromIndex, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (responseQueue.length > fromIndex) {
        clearInterval(interval);
        clearTimeout(timer);
        resolve(responseQueue[fromIndex]);
      }
    }, 150);
    const timer = setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Timeout (${timeoutMs / 1000}s) esperando respuesta de ${ENDPOINT}`));
    }, timeoutMs);
  });
}

// ── Detectar total de páginas desde el JSON ───────────────────────────────────
function getTotalPagesFromJson(json) {
  // Probar campos comunes de paginación
  const candidates = [
    json.totalPages, json.total_pages, json.pages,
    json.pageCount,  json.page_count,
  ];
  for (const v of candidates) {
    if (typeof v === 'number' && v > 0 && v < 100000) return v;
  }
  // Fallback: total de keywords / tamaño de página
  const totalItems = json.totalCount ?? json.total_count ?? json.total ?? json.count ?? null;
  const pageSize   = json.pageSize ?? json.page_size ?? json.limit ?? 100;
  if (totalItems && totalItems > 0) return Math.ceil(totalItems / pageSize);
  return null;
}

// ── Detectar total de páginas desde el DOM (fallback) ────────────────────────
async function getTotalPagesFromDom(page) {
  try {
    return await page.evaluate(() => {
      const selectors = [
        '[class*="pagination"] button',
        '[class*="Pagination"] button',
        '[class*="pager"] button',
      ];
      for (const sel of selectors) {
        const buttons = [...document.querySelectorAll(sel)];
        const nums = buttons.map(b => parseInt(b.textContent, 10)).filter(n => !isNaN(n));
        if (nums.length) return Math.max(...nums);
      }
      const match = document.body.innerText.match(/of\s+([\d,]+)|de\s+([\d,]+)/i);
      if (match) {
        const n = parseInt((match[1] || match[2]).replace(/,/g, ''), 10);
        return n > 5000 ? Math.ceil(n / 100) : n;
      }
      return null;
    });
  } catch {
    return null;
  }
}

// ── Click siguiente página ────────────────────────────────────────────────────
async function clickNextPage(page) {
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
  throw new Error('No se encontró el botón de siguiente página');
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, ans => { rl.close(); resolve(ans.trim()); }));
}

function randomDelay(minMs = 2000, maxMs = 3000) {
  return new Promise(r => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
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
      `\n[checkpoint] Encontrado: página ${checkpoint.lastPage}/${checkpoint.totalPages}, ` +
      `${checkpoint.extracted} keywords.\n` +
      `¿Continuar desde página ${checkpoint.lastPage + 1}? [S/n]: `
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

  // Interceptor registrado ANTES de que el usuario navegue — no se pierde nada
  setupInterceptor(page);

  try {
    await page.goto('https://www.semrush.com', { waitUntil: 'domcontentloaded' });

    console.log('[browser] Chromium abierto en semrush.com.');
    console.log(`[info]    Navega al Keyword Gap. El interceptor de ${ENDPOINT} ya está activo.`);
    console.log('[info]    Cuando la tabla cargue (página 1 visible), pulsa ENTER.\n');
    await waitForEnter('Pulsa ENTER cuando la tabla esté visible: ');

    // ── Capturar página 1 ─────────────────────────────────────────────────
    // Si el usuario navegó al Keyword Gap mientras el interceptor estaba activo,
    // la respuesta ya estará en la cola. Si no, pedimos un clic para re-triggerla.
    if (startPage === 1) {
      let firstJson = responseQueue.length > 0 ? responseQueue[0] : null;

      if (!firstJson) {
        console.log('[info] No se capturó la carga inicial — haz clic en cualquier cabecera');
        console.log('       de columna (ej. "Volume") para re-disparar la petición.');
        firstJson = await waitForQueueItem(0, 30000);
      }

      // Detectar total de páginas desde el JSON de página 1
      let totalPages = getTotalPagesFromJson(firstJson);
      if (!totalPages) {
        totalPages = await getTotalPagesFromDom(page);
      }
      if (!totalPages) {
        const ans = await waitForEnter('[warn] No se detectó el total de páginas. Introduce el número (default 1348): ');
        totalPages = parseInt(ans, 10) || 1348;
      }
      console.log(`\n[info] Total páginas: ${totalPages}\n`);

      // Extraer filas de página 1
      const rows1 = (firstJson.data || firstJson.results || firstJson.keywords ||
                     firstJson.rows || (Array.isArray(firstJson) ? firstJson : []));
      allRows.push(...rows1.map(mapRow));
      console.log(`Página 1/${totalPages} — ${allRows.length} keywords extraídas`);

      // ── Loop desde página 2 ──────────────────────────────────────────────
      for (let p = 2; p <= totalPages; p++) {
        const queueIndexBefore = responseQueue.length;
        let pageJson  = null;
        let attempts  = 0;

        while (attempts < 3 && !pageJson) {
          try {
            await clickNextPage(page);
            pageJson = await waitForQueueItem(queueIndexBefore, 20000);
          } catch (err) {
            attempts++;
            console.warn(`  [warn] Página ${p} intento ${attempts}/3: ${err.message}`);
            if (attempts < 3) await randomDelay(3000, 5000);
          }
        }

        if (!pageJson) {
          console.error(`  [error] Página ${p} falló tras 3 intentos — saltando.`);
        } else {
          const rows = pageJson.data || pageJson.results || pageJson.keywords ||
                       pageJson.rows || (Array.isArray(pageJson) ? pageJson : []);
          allRows.push(...rows.map(mapRow));
        }

        console.log(`Página ${p}/${totalPages} — ${allRows.length} keywords extraídas`);

        if (p % CHECKPOINT_EVERY === 0) saveCheckpoint(p, totalPages, allRows);
        if (p < totalPages) await randomDelay(2000, 3000);
      }

      // ── Export final ─────────────────────────────────────────────────────
      console.log('\n[done] Extracción completada. Exportando...');
      saveCheckpoint(totalPages, totalPages, allRows);
      exportXlsx(allRows, XLSX_FILE);
      fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(allRows, null, 2));

      console.log(`\n[resultado] ${allRows.length} keywords exportadas a:`);
      console.log(`  XLSX: ${XLSX_FILE}`);
      console.log(`  JSON: ${JSON_BACKUP_FILE}`);

    } else {
      // ── Reanudando desde checkpoint ──────────────────────────────────────
      console.log(`[info] Reanudando desde página ${startPage}. Navega a esa página manualmente`);
      console.log('       y pulsa ENTER cuando sea visible.\n');
      await waitForEnter('Pulsa ENTER cuando estés en la página correcta: ');

      // Detectar total de páginas
      let totalPages = checkpoint ? checkpoint.totalPages : null;
      if (!totalPages) {
        totalPages = await getTotalPagesFromDom(page);
        if (!totalPages) {
          const ans = await waitForEnter('Introduce el número total de páginas: ');
          totalPages = parseInt(ans, 10) || 1348;
        }
      }

      for (let p = startPage; p <= totalPages; p++) {
        const queueIndexBefore = responseQueue.length;
        let pageJson  = null;
        let attempts  = 0;

        // En la primera página del resume, esperar que llegue sin hacer clic
        // (el usuario ya navegó a ella manualmente)
        if (p === startPage) {
          pageJson = responseQueue.length > 0 ? responseQueue[0] : null;
          if (!pageJson) pageJson = await waitForQueueItem(0, 30000);
        } else {
          while (attempts < 3 && !pageJson) {
            try {
              await clickNextPage(page);
              pageJson = await waitForQueueItem(queueIndexBefore, 20000);
            } catch (err) {
              attempts++;
              console.warn(`  [warn] Página ${p} intento ${attempts}/3: ${err.message}`);
              if (attempts < 3) await randomDelay(3000, 5000);
            }
          }
        }

        if (!pageJson) {
          console.error(`  [error] Página ${p} falló tras 3 intentos — saltando.`);
        } else {
          const rows = pageJson.data || pageJson.results || pageJson.keywords ||
                       pageJson.rows || (Array.isArray(pageJson) ? pageJson : []);
          allRows.push(...rows.map(mapRow));
        }

        console.log(`Página ${p}/${totalPages} — ${allRows.length} keywords extraídas`);

        if (p % CHECKPOINT_EVERY === 0) saveCheckpoint(p, totalPages, allRows);
        if (p < totalPages) await randomDelay(2000, 3000);
      }

      console.log('\n[done] Extracción completada. Exportando...');
      saveCheckpoint(totalPages, totalPages, allRows);
      exportXlsx(allRows, XLSX_FILE);
      fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(allRows, null, 2));

      console.log(`\n[resultado] ${allRows.length} keywords exportadas a:`);
      console.log(`  XLSX: ${XLSX_FILE}`);
      console.log(`  JSON: ${JSON_BACKUP_FILE}`);
    }

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('\n[fatal]', err.message);
  console.error(err.stack);
  process.exit(1);
});
