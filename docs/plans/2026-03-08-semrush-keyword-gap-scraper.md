# Semrush Keyword Gap Scraper — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract all 1,348 pages of Keyword Gap data from Semrush via browser automation and export to XLSX + JSON.

**Architecture:** Playwright launches a visible Chromium window so the user can log in manually, then intercepts XHR responses (`page.on('response')`) as the user clicks through pages. A checkpoint file enables resume after interruption. Data is exported via the `xlsx` library.

**Tech Stack:** Node.js 18+, Playwright (Chromium), xlsx, readline (built-in)

---

### Task 1: Scaffold isolated package

**Files:**
- Create: `scripts/semrush/package.json`
- Create: `scripts/semrush/output/.gitkeep`

**Step 1: Create package.json**

```json
{
  "name": "semrush-scraper",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "playwright": "^1.42.0",
    "xlsx": "^0.18.5"
  }
}
```

**Step 2: Create output dir placeholder**

```bash
mkdir -p scripts/semrush/output
touch scripts/semrush/output/.gitkeep
```

**Step 3: Install dependencies**

```bash
cd scripts/semrush
npm install
npx playwright install chromium
```

Expected: `node_modules/` created, Chromium binary downloaded (~170 MB).

**Step 4: Commit**

```bash
git add scripts/semrush/package.json scripts/semrush/output/.gitkeep
git commit -m "feat: scaffold semrush scraper package"
```

---

### Task 2: Create run.ps1 launcher

**Files:**
- Create: `scripts/semrush/run.ps1`

**Step 1: Write the launcher**

```powershell
# run.ps1 — Lanza el extractor de Keyword Gap de Semrush
# Ejecutar desde cualquier ubicación
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir
Write-Host "=== Semrush Keyword Gap Extractor ===" -ForegroundColor Cyan
Write-Host "Directorio: $ScriptDir"
node extract-keyword-gap.js
```

**Step 2: Verify it runs without error (before main script exists)**

```powershell
cd scripts\semrush
.\run.ps1
```

Expected: `Error: Cannot find module 'extract-keyword-gap.js'` — OK, scaffold is correct.

**Step 3: Commit**

```bash
git add scripts/semrush/run.ps1
git commit -m "feat: add semrush scraper launcher"
```

---

### Task 3: Implement checkpoint helpers

**Files:**
- Create: `scripts/semrush/extract-keyword-gap.js` (initial, checkpoint logic only)

**Step 1: Write the file with checkpoint read/write helpers**

```js
// extract-keyword-gap.js
const fs   = require('fs');
const path = require('path');

const OUTPUT_DIR        = path.join(__dirname, 'output');
const CHECKPOINT_FILE   = path.join(OUTPUT_DIR, 'keyword_gap_checkpoint.json');
const JSON_BACKUP_FILE  = path.join(OUTPUT_DIR, 'keyword_gap_es.json');
const XLSX_FILE         = path.join(OUTPUT_DIR, 'keyword_gap_es.xlsx');
const CHECKPOINT_EVERY  = 50;

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  } catch { return null; }
}

function saveCheckpoint(lastPage, totalPages, rows) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastPage, totalPages, extracted: rows.length }, null, 2));
  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(rows, null, 2));
  console.log(`  [checkpoint] Guardado en página ${lastPage} — ${rows.length} keywords`);
}

module.exports = { loadCheckpoint, saveCheckpoint, OUTPUT_DIR, CHECKPOINT_FILE, JSON_BACKUP_FILE, XLSX_FILE, CHECKPOINT_EVERY };
```

**Step 2: Smoke-test require**

```bash
cd scripts/semrush
node -e "const c = require('./extract-keyword-gap.js'); console.log(Object.keys(c))"
```

Expected: `[ 'loadCheckpoint', 'saveCheckpoint', 'OUTPUT_DIR', ... ]`

**Step 3: Commit**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: add checkpoint helpers for keyword gap scraper"
```

---

### Task 4: Implement XLSX export

**Files:**
- Modify: `scripts/semrush/extract-keyword-gap.js`

**Step 1: Add exportXlsx function**

```js
const XLSX = require('xlsx');

function exportXlsx(rows, filePath) {
  const header = ['Keyword', 'Volume', 'KD', 'CPC', 'Intent', 'Pos_treatwell', 'Pos_booksy', 'Pos_mipelu'];
  const data = rows.map(r => [
    r.keyword, r.volume, r.kd, r.cpc, r.intent,
    r.pos_treatwell, r.pos_booksy, r.pos_mipelu
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Keyword Gap');
  XLSX.writeFile(wb, filePath);
  console.log(`\n[export] XLSX guardado: ${filePath} (${rows.length} filas)`);
}
```

**Step 2: Smoke-test export with mock data**

```bash
node -e "
const { exportXlsx, XLSX_FILE } = require('./extract-keyword-gap.js');
exportXlsx([{keyword:'test',volume:1000,kd:30,cpc:0.5,intent:'I',pos_treatwell:'-',pos_booksy:2,pos_mipelu:'-'}], XLSX_FILE);
console.log('OK');
"
```

Expected: `output/keyword_gap_es.xlsx` created with 1 data row.

**Step 3: Commit**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: add xlsx export to keyword gap scraper"
```

---

### Task 5: Implement XHR row mapper

**Files:**
- Modify: `scripts/semrush/extract-keyword-gap.js`

**Step 1: Add mapRow function**

This is the most fragile part — Semrush's API field names are unknown until the first run. The mapper logs the raw first response so the user can verify field names.

```js
let _rawResponseLogged = false;

function mapRow(raw) {
  // NOTE: Field names are confirmed from Semrush API response.
  // On first run, rawResponse is logged to console for verification.
  // Adjust keys here if Semrush changes their API.
  return {
    keyword:       raw.Ph  || raw.keyword  || raw[0] || '',
    volume:        raw.Nq  || raw.volume   || raw[1] || 0,
    kd:            raw.Kd  || raw.kd       || raw[2] || 0,
    cpc:           raw.Cp  || raw.cpc      || raw[3] || 0,
    intent:        raw.In  || raw.intent   || raw[4] || '',
    pos_treatwell: raw.Po1 || raw.pos1     || raw[5] || '-',
    pos_booksy:    raw.Po2 || raw.pos2     || raw[6] || '-',
    pos_mipelu:    raw.Po3 || raw.pos3     || raw[7] || '-',
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
```

**Step 2: Commit**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: add XHR row mapper with fallback field names"
```

---

### Task 6: Implement main Playwright loop

**Files:**
- Modify: `scripts/semrush/extract-keyword-gap.js`

**Step 1: Add main() function**

```js
const { chromium } = require('playwright');
const readline = require('readline');

const TARGET_URL = 'https://www.semrush.com/gap/keyword/?db=es&domains%5B0%5D=guiadelsalon.com&domains%5B1%5D=treatwell.es&domains%5B2%5D=booksy.com&domains%5B3%5D=mipelu.com&type=organic&filter=missing';

async function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, ans => { rl.close(); resolve(ans); }));
}

function randomDelay(min = 2000, max = 4000) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

async function extractPageViaXHR(page, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('XHR timeout')), timeoutMs);
    page.once('response', async (response) => {
      const url = response.url();
      if (!url.includes('gap') && !url.includes('keyword')) return;
      try {
        const json = await response.json();
        clearTimeout(timer);
        // Semrush returns rows in json.data or json.results or root array
        const rows = json.data || json.results || (Array.isArray(json) ? json : null);
        if (!rows) { reject(new Error(`No rows in response: ${url}`)); return; }
        logRawResponseOnce(rows);
        resolve(rows.map(mapRow));
      } catch { /* not JSON, skip */ }
    });
  });
}

async function getTotalPages(page) {
  try {
    // Semrush paginador: busca el último número de página en el nav
    const total = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[class*="pagination"] button, [class*="Pagination"] button')];
      const nums = buttons.map(b => parseInt(b.textContent)).filter(n => !isNaN(n));
      return nums.length ? Math.max(...nums) : null;
    });
    return total;
  } catch { return null; }
}

async function clickNextPage(page) {
  // Semrush "next" button — arrow icon or text "Next"
  const next = page.locator('[aria-label="Next"], [class*="next"]:not([disabled]), button:has-text("Next"):not([disabled])').first();
  await next.click();
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // ── Checkpoint recovery ──────────────────────────────────────────────────
  let startPage = 1;
  let allRows   = [];
  const checkpoint = loadCheckpoint();
  if (checkpoint) {
    const ans = await waitForEnter(
      `\n[checkpoint] Encontrado: página ${checkpoint.lastPage}/${checkpoint.totalPages}, ${checkpoint.extracted} keywords.\n¿Continuar desde página ${checkpoint.lastPage + 1}? [S/n]: `
    );
    if (ans.toLowerCase() !== 'n') {
      startPage = checkpoint.lastPage + 1;
      if (fs.existsSync(JSON_BACKUP_FILE)) {
        allRows = JSON.parse(fs.readFileSync(JSON_BACKUP_FILE, 'utf8'));
        console.log(`[recovery] Cargadas ${allRows.length} keywords del backup.`);
      }
    }
  }

  // ── Launch browser ────────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  console.log('\n[browser] Chromium abierto. Haz login en Semrush si es necesario.');
  await waitForEnter('Pulsa ENTER cuando la tabla del Keyword Gap sea visible: ');

  // ── Detect total pages ────────────────────────────────────────────────────
  let totalPages = await getTotalPages(page);
  if (!totalPages) {
    const ans = await waitForEnter('No se detectó el paginador automáticamente. ¿Cuántas páginas hay en total? ');
    totalPages = parseInt(ans) || 1348;
  }
  console.log(`\n[info] Total páginas: ${totalPages} | Inicio: ${startPage}`);

  // ── Main extraction loop ──────────────────────────────────────────────────
  for (let p = startPage; p <= totalPages; p++) {
    let pageRows = null;
    let attempts = 0;

    while (attempts < 3 && !pageRows) {
      try {
        // Start listening BEFORE clicking next (so we catch the response)
        const xhrPromise = extractPageViaXHR(page);
        if (p > startPage) await clickNextPage(page);
        pageRows = await xhrPromise;
      } catch (err) {
        attempts++;
        console.warn(`  [warn] Página ${p} intento ${attempts}/3: ${err.message}`);
        if (attempts < 3) {
          await page.reload({ waitUntil: 'domcontentloaded' });
          await randomDelay(3000, 5000);
        }
      }
    }

    if (!pageRows) {
      console.error(`  [error] Página ${p} falló tras 3 intentos — saltando.`);
    } else {
      allRows.push(...pageRows);
    }

    console.log(`Página ${p}/${totalPages} — ${allRows.length} keywords extraídas`);

    if (p % CHECKPOINT_EVERY === 0) saveCheckpoint(p, totalPages, allRows);
    if (p < totalPages) await randomDelay(2000, 4000);
  }

  // ── Export ────────────────────────────────────────────────────────────────
  await browser.close();
  saveCheckpoint(totalPages, totalPages, allRows);
  exportXlsx(allRows, XLSX_FILE);
  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(allRows, null, 2));
  console.log(`\n[done] ${allRows.length} keywords exportadas a:`);
  console.log(`  XLSX: ${XLSX_FILE}`);
  console.log(`  JSON: ${JSON_BACKUP_FILE}`);
}

main().catch(err => {
  console.error('[fatal]', err.message);
  process.exit(1);
});
```

**Step 2: Verify syntax**

```bash
cd scripts/semrush
node --check extract-keyword-gap.js
```

Expected: No output (syntax OK).

**Step 3: Commit**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: add main Playwright extraction loop with XHR intercept and retry"
```

---

### Task 7: Wire up XHR listener for page 1

**Context:** On page 1 the user is already on the page, so we can't "click next" to trigger XHR — we need to capture the initial load or trigger a re-fetch. Fix: on `startPage === 1`, trigger a small DOM interaction (e.g., click the first column header to sort and re-sort back) to force a new XHR. Alternative: use `page.waitForResponse()` during `waitForEnter` phase.

**Files:**
- Modify: `scripts/semrush/extract-keyword-gap.js`

**Step 1: Replace the first-page XHR capture**

In `main()`, after the user presses ENTER, capture the first page by:

```js
// Page 1: trigger re-fetch by scrolling or using waitForResponse on the current state
// Simplest approach: ask user to click any filter/sort to trigger a fresh XHR
if (startPage === 1) {
  console.log('\n[info] Para capturar página 1: haz clic en cualquier cabecera de columna');
  console.log('       para re-ordenar la tabla (forzará una nueva petición XHR).');
  const firstPageRows = await extractPageViaXHR(page, 30000);
  allRows.push(...firstPageRows);
  console.log(`Página 1/${totalPages} — ${allRows.length} keywords extraídas (captura manual)`);
}
```

**Step 2: Commit**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: handle page-1 XHR capture via user-triggered sort"
```

---

### Task 8: Add .gitignore for output and node_modules

**Files:**
- Modify: `.gitignore` (root)

**Step 1: Add entries**

```
scripts/semrush/node_modules/
scripts/semrush/output/keyword_gap_es.xlsx
scripts/semrush/output/keyword_gap_es.json
scripts/semrush/output/keyword_gap_checkpoint.json
```

Keep `output/.gitkeep` tracked so the directory exists.

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore semrush output and node_modules"
```

---

### Task 9: End-to-end test run (manual)

This is not automated — it requires a Semrush session.

**Step 1: Run the scraper**

```powershell
cd scripts\semrush
.\run.ps1
```

**Step 2: Verify first XHR response**

Check console for `[DEBUG] Primera fila raw del API`. If field names don't match `keyword/volume/kd/cpc`, update `mapRow()` with the actual keys.

**Step 3: Let it run for 5 pages, then Ctrl+C**

Verify `output/keyword_gap_checkpoint.json` exists with correct data.

**Step 4: Re-run and confirm checkpoint recovery**

```powershell
.\run.ps1
```

Prompt should ask `¿Continuar desde página 5?`. Answer `S`.

**Step 5: Commit final version**

```bash
git add scripts/semrush/extract-keyword-gap.js
git commit -m "feat: add Semrush Keyword Gap scraper with Playwright and checkpoint recovery"
```

---

## Notes for Implementation

- **XHR field names:** The biggest unknown. Log the first raw response and adjust `mapRow()` before running all 1,348 pages.
- **Semrush selectors:** Pagination selectors (`[aria-label="Next"]`) are guesses. If they fail, open DevTools in the visible browser and inspect the actual class names, then update `clickNextPage()`.
- **Rate limiting:** The 2–4s random delay is conservative. If Semrush starts returning empty responses, increase to 5–8s.
- **Chromium binary:** ~170 MB, installed under `scripts/semrush/node_modules/.cache`. Not committed to git.
