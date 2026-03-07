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
    .sort((a, b) => (parseInt(b['Volume']) || 0) - (parseInt(a['Volume']) || 0))
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
 * El índice avanza automáticamente cada día sin repetir ciclos cortos:
 *   dayIndex = días transcurridos desde 2026-01-01
 *   posición = (dayIndex * 5 + offset) % total_keywords
 *
 * @param {'es'|'us'} lang
 * @param {string}    date   — 'YYYY-MM-DD'
 * @param {number}    offset — 0-4 (uno por slot del día)
 */
function getKeywordForDay(lang, date, offset = 0) {
  const keywords = getKeywords(lang);
  const dayIndex = Math.floor((new Date(date) - new Date('2026-01-01')) / 86400000);
  return keywords[(dayIndex * 5 + offset) % keywords.length];
}

module.exports = { getKeywordForDay, getKeywords };
