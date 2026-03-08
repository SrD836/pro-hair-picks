// extract-keyword-gap.js — Semrush Keyword Gap extractor
// Estrategia: escucha pasiva de spectrum/v1/Gap/KeywordsList
// El usuario pasa las páginas manualmente. Ctrl+C exporta todo.

'use strict';

const fs           = require('fs');
const path         = require('path');
const { chromium } = require('playwright');
const XLSX         = require('xlsx');

const OUTPUT_DIR       = path.join(__dirname, 'output');
const JSON_BACKUP_FILE = path.join(OUTPUT_DIR, 'keyword_gap_es.json');
const XLSX_FILE        = path.join(OUTPUT_DIR, 'keyword_gap_es.xlsx');
const ENDPOINT         = 'spectrum/v1/Gap/KeywordsList';

// ── Mapper con campos confirmados ─────────────────────────────────────────────
function mapRow(raw) {
  return {
    keyword: raw.keyword                                    || '',
    volume:  raw.volume                                     ?? 0,
    kd:      raw.keywordDifficulty                          ?? 0,
    cpc:     raw.cpc                                        ?? 0,
    intent:  Array.isArray(raw.intents) ? raw.intents[0] || '' : '',
  };
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportAll(rows) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(rows, null, 2));

  const header = ['Keyword', 'Volume', 'KD', 'CPC', 'Intent'];
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows.map(r =>
    [r.keyword, r.volume, r.kd, r.cpc, r.intent]
  )]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Keyword Gap');
  XLSX.writeFile(wb, XLSX_FILE);

  console.log(`\n[export] ${rows.length} keywords guardadas:`);
  console.log(`  XLSX: ${XLSX_FILE}`);
  console.log(`  JSON: ${JSON_BACKUP_FILE}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const allRows  = [];
  let   pagesSeen = 0;

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  // Exportar y salir limpiamente al pulsar Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n[Ctrl+C] Exportando...');
    exportAll(allRows);
    await browser.close();
    process.exit(0);
  });

  // Listener pasivo — captura cada respuesta de KeywordsList sin interferir
  page.on('response', async (response) => {
    if (!response.url().includes(ENDPOINT)) return;
    try {
      const json = await response.json();
      const rows = json.data || json.results || json.keywords ||
                   json.rows || (Array.isArray(json) ? json : []);
      if (!rows.length) return;

      pagesSeen++;
      allRows.push(...rows.map(mapRow));
      console.log(`[página ${pagesSeen}] +${rows.length} keywords → total: ${allRows.length}`);
    } catch { /* ignorar respuestas no parseables */ }
  });

  await page.goto('https://www.semrush.com', { waitUntil: 'domcontentloaded' });

  console.log('=== Semrush Keyword Gap — captura pasiva ===\n');
  console.log(`Escuchando: ${ENDPOINT}`);
  console.log('1. Navega al Keyword Gap en el navegador');
  console.log('2. Pasa las páginas manualmente con la flecha "siguiente"');
  console.log('3. Pulsa Ctrl+C cuando hayas terminado para exportar\n');
}

main().catch(err => {
  console.error('[fatal]', err.message);
  process.exit(1);
});
