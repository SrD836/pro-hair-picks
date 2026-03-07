'use strict';
/**
 * keyword-loader.js
 * Carga y filtra keywords de los Excel exportados de Semrush.
 * Archivos esperados en scripts/daily-content/data/:
 *   keywords_es.xlsx  — ~30.000 keywords mercado ES
 *   keywords_us.xlsx  — ~30.000 keywords mercado US
 *
 * Columnas del Excel: Keyword | Intent | Volume | Potential Traffic |
 *   Personal Keyword Difficulty | Keyword Difficulty | CPC | SERP Features | Positions
 */

const XLSX = require('xlsx');
const path = require('path');

const FILTERS = {
  es: {
    intents:      ['Informational', 'Commercial'],
    maxKD:        50,
    minVolume:    200,
    excludeTerms: ['near me', 'precio', 'comprar', 'amazon', 'ebay', 'tienda'],
  },
  us: {
    intents:      ['Informational', 'Commercial'],
    maxKD:        50,
    minVolume:    500,
    excludeTerms: ['near me', 'salon near', 'price', 'buy', 'amazon', 'walmart'],
  },
};

function loadKeywords(lang) {
  const file = path.join(__dirname, 'data', `keywords_${lang}.xlsx`);
  const wb   = XLSX.readFile(file);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  const f = FILTERS[lang];
  return rows
    .filter(r => {
      const intent = r['Intent'] || '';
      const kd     = parseFloat(r['Keyword Difficulty']) || 100;
      const vol    = parseInt(r['Volume'])               || 0;
      const kw     = (r['Keyword'] || '').toLowerCase();

      const intentOk   = f.intents.some(i => intent.includes(i));
      const kdOk       = kd <= f.maxKD;
      const volOk      = vol >= f.minVolume;
      const noExcluded = !f.excludeTerms.some(t => kw.includes(t));
      const isAscii    = /^[\x00-\x7F\u00C0-\u024F\s]+$/.test(kw); // excluir spam no-latino

      return intentOk && kdOk && volOk && noExcluded && isAscii;
    })
    // Score por oportunidad real: prioriza KD bajo sobre volumen puro
    .sort((a, b) => {
      const scoreA = (parseInt(a['Volume']) || 0) / ((parseFloat(a['Keyword Difficulty']) || 0) + 1);
      const scoreB = (parseInt(b['Volume']) || 0) / ((parseFloat(b['Keyword Difficulty']) || 0) + 1);
      return scoreB - scoreA;
    })
    .map(r => r['Keyword']);
}

// Cache en memoria — el Excel solo se lee una vez por ejecución
let cacheES = null;
let cacheUS = null;

function getKeywords(lang) {
  if (lang === 'us') {
    if (!cacheUS) cacheUS = loadKeywords('us');
    return cacheUS;
  }
  if (!cacheES) cacheES = loadKeywords('es');
  return cacheES;
}

/**
 * Devuelve la keyword para un slot del día concreto.
 * Salta keywords que ya están publicadas si se pasa el Set usedKeywords.
 *
 * @param {'es'|'us'} lang
 * @param {string}    date         — 'YYYY-MM-DD'
 * @param {number}    offset       — 0-4 (uno por slot del día)
 * @param {Set|null}  usedKeywords — Set de keywords ya publicadas (lowercase)
 */
function getKeywordForDay(lang, date, offset = 0, usedKeywords = null) {
  const keywords = getKeywords(lang);
  const dayIndex = Math.floor((new Date(date) - new Date('2026-01-01')) / 86400000);
  const baseIdx  = (dayIndex * 5 + offset) % keywords.length;

  if (!usedKeywords || usedKeywords.size === 0) {
    return keywords[baseIdx];
  }

  // Iterar desde la posición base hasta encontrar una keyword no usada
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[(baseIdx + i) % keywords.length];
    if (!usedKeywords.has(kw.toLowerCase())) return kw;
  }

  // Todas usadas (improbable) — devolver la base
  return keywords[baseIdx];
}

/**
 * Obtiene el Set de keywords ya publicadas en Supabase.
 * Usa el REST API público con anon key (solo lectura).
 *
 * @param {string} supabaseUrl
 * @param {string} anonKey
 * @returns {Promise<Set<string>>}
 */
async function getUsedKeywords(supabaseUrl, anonKey) {
  if (!supabaseUrl || !anonKey) return new Set();
  try {
    const url = `${supabaseUrl}/rest/v1/blog_posts?select=keywords&is_published=eq.true`;
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });
    if (!res.ok) {
      console.warn(`  ⚠️  getUsedKeywords HTTP ${res.status} — sin filtrado de duplicados`);
      return new Set();
    }
    const rows = await res.json();
    const used = new Set();
    for (const row of rows) {
      if (Array.isArray(row.keywords)) {
        row.keywords.forEach(kw => used.add((kw || '').toLowerCase()));
      }
    }
    console.log(`  ✓ ${used.size} keywords ya publicadas cargadas (se saltarán)`);
    return used;
  } catch (err) {
    console.warn(`  ⚠️  getUsedKeywords falló (${err.message}) — sin filtrado`);
    return new Set();
  }
}

module.exports = { getKeywordForDay, getKeywords, getUsedKeywords };
