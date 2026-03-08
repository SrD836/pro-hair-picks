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

const KEYWORDS_DIR = path.join('C:', 'Users', 'david', 'Desktop', 'keywords');

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
  const desktopFile = lang === 'es' ? path.join(KEYWORDS_DIR, 'guiadelsalon_keywords_ES.xlsx') : null;
  const file = (desktopFile && require('fs').existsSync(desktopFile))
    ? desktopFile
    : path.join(__dirname, 'data', `keywords_${lang}.xlsx`);
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

/**
 * Carga keywords del Excel clustered generado por el script de análisis Semrush.
 * Hoja "🚀 Pipeline Ready" — columnas: keyword, volume, kd, score, cluster, source
 * Retorna array de objetos { keyword, cluster, score, volume, kd }
 */
function loadClusteredKeywords() {
  const file = path.join(KEYWORDS_DIR, 'guiadelsalon_keywords_clustered_ES.xlsx');
  if (!require('fs').existsSync(file)) {
    console.warn('  ⚠️  guiadelsalon_keywords_clustered_ES.xlsx no encontrado — usando solo keywords_es.xlsx');
    return [];
  }
  const wb        = XLSX.readFile(file);
  const sheetName = wb.SheetNames.find(n => n.includes('Pipeline')) || wb.SheetNames[wb.SheetNames.length - 1];
  const ws        = wb.Sheets[sheetName];
  const rows      = XLSX.utils.sheet_to_json(ws);
  return rows
    .filter(r => r['keyword'] && r['cluster'] && r['cluster'] !== 'otros')
    .map(r => ({
      keyword: String(r['keyword']).trim(),
      cluster: String(r['cluster']).trim(),
      score:   parseFloat(r['score'])  || 0,
      volume:  parseInt(r['volume'])   || 0,
      kd:      parseInt(r['kd'])       || 0,
    }))
    .sort((a, b) => b.score - a.score);
}

// Cache en memoria — el Excel solo se lee una vez por ejecución
let cacheES          = null;
let cacheUS          = null;
let cacheESClustered = null;

function getKeywords(lang) {
  if (lang === 'us') {
    if (!cacheUS) cacheUS = loadKeywords('us');
    return cacheUS;
  }
  if (!cacheES) {
    // Fusionar keywords_es.xlsx + guiadelsalon_keywords_clustered_ES.xlsx
    // El clustered tiene prioridad (ya están validadas y clasificadas)
    const clustered  = loadClusteredKeywords();
    cacheESClustered = clustered;
    const base       = loadKeywords('es');

    if (clustered.length > 0) {
      const clusteredKws = new Set(clustered.map(k => k.keyword.toLowerCase()));
      const baseFiltered = base.filter(kw => !clusteredKws.has(kw.toLowerCase()));
      cacheES = [...clustered.map(k => k.keyword), ...baseFiltered];
      console.log(`  ✓ Keywords ES combinadas: ${clustered.length} clustered + ${baseFiltered.length} base = ${cacheES.length} total`);
    } else {
      cacheES = base;
    }
  }
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

/**
 * Devuelve la keyword para un slot filtrando por cluster específico.
 * Permite que planner.js asigne clusters distintos por slot.
 *
 * @param {string}   cluster      — cluster temático ('cortes', 'gestion', etc.)
 * @param {string}   date
 * @param {number}   offset
 * @param {Set|null} usedKeywords
 */
function getKeywordForDayByCluster(cluster, date, offset = 0, usedKeywords = null) {
  if (!cacheESClustered) {
    cacheESClustered = loadClusteredKeywords();
  }
  const clusterKws = cacheESClustered
    .filter(k => k.cluster === cluster)
    .map(k => k.keyword);

  if (clusterKws.length === 0) {
    return getKeywordForDay('es', date, offset, usedKeywords);
  }

  const dayIndex = Math.floor((new Date(date) - new Date('2026-01-01')) / 86400000);
  const baseIdx  = (dayIndex * 5 + offset) % clusterKws.length;

  if (!usedKeywords || usedKeywords.size === 0) return clusterKws[baseIdx];

  for (let i = 0; i < clusterKws.length; i++) {
    const kw = clusterKws[(baseIdx + i) % clusterKws.length];
    if (!usedKeywords.has(kw.toLowerCase())) return kw;
  }
  return clusterKws[baseIdx];
}

/**
 * Devuelve el cluster con mayor score acumulado disponible para el día.
 * Excluye clusters ya cubiertos esta semana si se pasa el Set.
 */
function getTopClusterForDay(date, usedKeywords = null, excludeClusters = new Set()) {
  if (!cacheESClustered) {
    cacheESClustered = loadClusteredKeywords();
  }
  const clusterScores = {};
  for (const item of cacheESClustered) {
    if (excludeClusters.has(item.cluster)) continue;
    if (usedKeywords && usedKeywords.has(item.keyword.toLowerCase())) continue;
    if (!clusterScores[item.cluster]) clusterScores[item.cluster] = 0;
    clusterScores[item.cluster] += item.score;
  }
  return Object.entries(clusterScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'cortes';
}

module.exports = {
  getKeywordForDay,
  getKeywords,
  getUsedKeywords,
  getKeywordForDayByCluster,
  getTopClusterForDay,
};
