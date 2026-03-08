/**
 * planner.js — FASE 0: Clasifica los 5 posts del día
 * Distribución: 2 core ES · 1 core US · 1 bridge · 1 negocio
 * Usa `claude -p` (autenticación de Claude Code, sin API key separada)
 * Keywords: cargadas desde Semrush Excel via keyword-loader.js
 */
const { callClaude, extractJSON }  = require('./claude-cli');
const { getKeywordForDay, getKeywordForDayByCluster, getTopClusterForDay } = require('../keyword-loader');
const { getTrendingKeywords }      = require('../trend-analyzer');

// TOPICS_POOL mantenido como fallback si keyword-loader falla
const TOPICS_POOL = {
  core: [
    'coloración vegetal sin amoniaco: guía técnica 2026',
    'técnica balayage vs highlights: diferencias y cuándo usar cada una',
    'cuidado del cabello rizado: rutina CGM para salón',
    'tratamiento de keratina brasileña: pasos, tiempos y contraindicaciones',
    'cortes con maquinilla: guía de números y técnicas de fundido',
    'mejores clippers profesionales para barbería 2026: análisis y ranking',
    'secadores de iones vs convencionales: qué recomienda la ciencia',
    'tijeras de barbero: acero japonés vs alemán, todo lo que debes saber',
    'planchas profesionales: comparativa de los 8 mejores modelos del mercado',
    'sillones de barbero hidráulicos: guía de compra completa',
    'trimmers sin cable para barbería: análisis de los más vendidos',
    'mejores tintes sin amoniaco: ranking para profesionales 2026',
    'mascarillas de reparación capilar: ingredientes que realmente funcionan',
    'aceites capilares profesionales: argán vs keratina vs CBD comparativa',
    'productos para barba: aceites, bálsamos y ceras en comparativa',
    'alisado japonés vs keratina: comparativa técnica definitiva',
    'extensiones de cabello: tipos, técnicas de aplicación y mantenimiento',
    'colorimetría avanzada: corrección de color en cabello dañado',
    'permanente moderna: técnicas actuales y productos de nueva generación',
    'trenzas box braids: proceso completo y cuidado posterior',
  ],
  core_us: [
    'best professional clippers 2026: barber rankings and US market guide',
    'balayage vs highlights: techniques and costs for American salons',
    'keratin treatment guide for US salon professionals 2026',
    'best professional hair dryers 2026: ionic vs ceramic US market review',
    'barber scissors guide: Japanese vs German steel for US professionals',
    'best professional hair color on Amazon.com: US stylist ranking 2026',
    'fade haircut mastery: full technique guide for American barbershops',
    'best cordless trimmers for barbering 2026: Andis vs Wahl vs Oster',
    'curly hair CGM method: professional salon guide for US stylists',
    'hair extension types and application: US salon professional guide 2026',
    'ammonia-free hair color: professional ranking for US salons 2026',
    'hair repair masks: science-backed ingredients for US salon professionals',
    'hydraulic barber chairs: complete US buying guide 2026',
    'beard grooming products: oils, balms and waxes US market comparison',
    'Japanese straightening vs keratin: technical comparison for US stylists',
    'advanced color correction on damaged hair: US colorimetry guide',
    'modern perm techniques: US salon professional guide 2026',
    'box braids professional application and aftercare: US salon guide',
    'scalp health and hair loss prevention: US professional recommendations',
    'best professional flat irons 2026: US salon market comparison',
  ],
  bridge: [
    'cómo la IA de reconocimiento facial está cambiando el diagnóstico capilar',
    'apps de prueba virtual de color: realidad aumentada en el salón 2026',
    'automatización de agenda con IA: qué pueden hacer las apps modernas',
    'análisis de cuero cabelludo por cámara: tecnología trichoscopia accesible',
    'normativa EU tintes sin amoníaco 2026: impacto en proveedores y salones',
    'peluquería eco-friendly: cómo reducir residuos químicos en el salón',
    'inflación en el sector peluquería España 2026: análisis de precios',
    'cómo calcular el precio de tus servicios según costes reales',
    'lesiones laborales en peluqueros: síndrome túnel carpiano y prevención',
    'productos químicos en el salón y salud respiratoria: lo que dice la ciencia',
  ],
  negocio: [
    'cómo digitalizar la gestión de tu salón de peluquería en 2026',
    'marketing en redes sociales para peluquerías: estrategia con resultados',
    'fidelización de clientes en peluquería: sistemas que funcionan',
    'análisis de rentabilidad de un salón: métricas clave que debes medir',
    'normativa fiscal autónomos peluqueros España 2026: VeriFactu y más',
    'cómo contratar personal para tu peluquería sin errores legales',
    'ticket medio en peluquería: cómo aumentarlo sin perder clientes',
    'gestión de citas online: comparativa de las mejores apps para salones',
    'costes fijos y variables de una peluquería: guía de control financiero',
    'cómo abrir una peluquería en España 2026: pasos y requisitos legales',
  ],
};

/**
 * Comprueba si un slug existe en Supabase (REST API pública, anon key).
 */
async function isSlugAvailable(slug, supabaseUrl, anonKey) {
  if (!supabaseUrl || !anonKey) return true;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=slug&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    );
    if (!res.ok) return true; // En caso de error, asumir disponible
    const data = await res.json();
    return !Array.isArray(data) || data.length === 0;
  } catch {
    return true;
  }
}

/**
 * Devuelve un slug único añadiendo -2, -3... si ya existe en Supabase.
 */
async function ensureUniqueSlug(slug, supabaseUrl, anonKey) {
  if (await isSlugAvailable(slug, supabaseUrl, anonKey)) return slug;
  for (let i = 2; i <= 20; i++) {
    const candidate = `${slug}-${i}`;
    if (await isSlugAvailable(candidate, supabaseUrl, anonKey)) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

/**
 * Valida si una keyword tiene sentido como artículo para GuiaDelSalon.com.
 * 3 niveles para minimizar llamadas a Claude:
 *   1. Regex noise (0ms) → rechazo inmediato
 *   2. Regex sector (0ms) → aprobación inmediata
 *   3. Claude -p (≈20s) → solo casos ambiguos
 */
async function validateKeyword(keyword) {
  const kw = keyword.toLowerCase();

  const NOISE_PATTERNS = [
    /\bperro\b/, /\bgato\b/, /\bmascotas?\b/, /\bfútbol\b/, /\bfutbol\b/,
    /\bpelé\b/, /\bpele\b/, /mbappe/, /\balcaraz\b/, /\bgriezmann\b/,
    /\buñas?\b/, /\bpiercing\b/, /\btattoo\b/, /\btatuaje\b/,
    /\bmanicura\b/, /\bpestañas?\b/, /microblading/, /\bhifu\b/,
    /\bsauna\b/, /reflexologia/, /\bmasajes?\b/, /\bpiña\b/,
    /\bmembrillo\b/, /\balmendra\b/, /navalvillar/, /peleas?\s+\w/,
    /\bvacas?\b/, /\bperuan[ao]\b.*pelo/, /recetar?\s/, /\bhuevos?\b/,
    /cocer\b/, /\bchicle\b/, /quiste/, /\bdiastasis\b/, /\bsolarium\b/,
    /\bgua\s*sha\b/, /\blampara\s+de\s+sal\b/, /cacharel/,
  ];
  if (NOISE_PATTERNS.some(p => p.test(kw))) {
    return { valid: false, reason: 'Ruido detectado por pre-filter', suggestedCluster: null };
  }

  const SECTOR_PATTERNS = [
    /\bpelo\b/, /\bcabello\b/, /\bcorte\b/, /\bpeluquer/, /\bbarbería?\b/,
    /\bbalayage\b/, /\bmechas?\b/, /\btinte\b/, /\bcoloraci/, /\bkeratina\b/,
    /\bsecador\b/, /\bplancha\b/, /\bmaquinilla\b/, /\bclipper\b/,
    /\btrimmer\b/, /\bfade\b/, /\bdegradado\b/, /\brizos?\b/, /\brizador\b/,
    /\bpeinado\b/, /\btrenza\b/, /\bmoño\b/, /\brecogido\b/,
    /\bshampoo\b/, /\bchampu\b/, /\bacondicionador\b/, /\bmascarilla\b/,
    /\balopecia\b/, /\bcanas?\b/, /\bcaspa\b/, /\bminoxidil\b/,
    /\bbarba\b/, /\bafeitado\b/, /\bnavaja\b/, /\bpomada\b/,
    /salon\s+de\s+belleza/, /software\s+peluquer/, /gestión\s+sal/,
    /\bundertcut\b/, /\bwolf\s+cut\b/, /\bbuzz\s+cut\b/,
    /\bpixie\b/, /\bflequillo\b/,
  ];
  if (SECTOR_PATTERNS.some(p => p.test(kw))) {
    return { valid: true, reason: 'Aprobado por sector-pattern', suggestedCluster: null };
  }

  // Caso ambiguo — llamar a Claude
  const prompt = `Evalúa si esta keyword es apropiada para un artículo en GuiaDelSalon.com, \
una web para PROFESIONALES de peluquería y barbería en España.

Keyword: "${keyword}"

Responde SOLO con JSON:
{
  "valid": true,
  "reason": "1 frase explicando por qué sí o no",
  "suggested_cluster": "uno de: cortes|coloracion|peinados|barberia|herramientas|tratamientos|productos|capilar_salud|tendencias|gestion|null"
}

Criterio: válida = el artículo ayudaría a un peluquero/barbero profesional en España.
Inválida = es ruido (animales, deportes, cocina, celebridades sin relación con el sector).`;

  try {
    const response = callClaude(prompt, { timeout: 20_000 });
    const result   = extractJSON(response, false);
    return {
      valid:            result.valid === true,
      reason:           result.reason || '',
      suggestedCluster: result.suggested_cluster || null,
    };
  } catch (err) {
    console.warn(`    ⚠️  Validación keyword fallida (${err.message}) — aprobando por defecto`);
    return { valid: true, reason: 'Fallback por error de validación', suggestedCluster: null };
  }
}

/**
 * Planifica los 5 posts del día.
 *
 * @param {string} date — 'YYYY-MM-DD'
 * @param {object} opts
 * @param {Set|null}  opts.usedKeywords  — keywords ya publicadas (se saltarán)
 * @param {string}    opts.supabaseUrl   — para verificar slugs únicos
 * @param {string}    opts.anonKey       — anon key de Supabase
 */
async function planDay(date, { usedKeywords = null, supabaseUrl = null, anonKey = null } = {}) {
  // ── TAREA 4: Obtener tendencias del día ───────────────────────────────────
  console.log('  Analizando tendencias del día...');
  const trends = await getTrendingKeywords();
  const hasTrendES = trends.es && trends.es.length > 0;
  const hasTrendUS = trends.us && trends.us.length > 0;

  // ── Obtener topics: 2 ES + 3 US ───────────────────────────────────────────
  let topicES0, topicNegocio, topicUS0, topicUS1, topicBridgeUS;
  let topCluster = 'cortes';
  try {
    // Slot 1 — cluster de mayor oportunidad del día
    topCluster   = getTopClusterForDay(date, usedKeywords, new Set(['gestion']));
    console.log(`  ✓ Top cluster para Slot 1: ${topCluster}`);
    topicES0     = getKeywordForDayByCluster(topCluster, date, 0, usedKeywords);

    // Slot 2 — cluster gestion/negocio para conectar con Cizura
    topicNegocio = getKeywordForDayByCluster('gestion', date, 0, usedKeywords)
                || getKeywordForDayByCluster('barberia', date, 0, usedKeywords)
                || getKeywordForDay('es', date, 1, usedKeywords);

    // Slots 3, 4 — mercado US (offsets distintos para no repetir keyword)
    topicUS0 = hasTrendUS
      ? trends.us[0]
      : getKeywordForDay('us', date, 0, usedKeywords);
    topicUS1 = getKeywordForDay('us', date, 1, usedKeywords);

    // Slot 5 bridge_us — trending US (índice 1) o Excel US offset 2
    topicBridgeUS = (hasTrendUS && trends.us[1])
      ? trends.us[1]
      : getKeywordForDay('us', date, 2, usedKeywords);

    console.log('  ✓ Keywords cargadas desde Semrush Excel');
    if (hasTrendUS) console.log(`  ✓ Slot 3 → tendencia US: "${topicUS0}"`);
    if (hasTrendUS && trends.us[1]) console.log(`  ✓ Slot 5 bridge_us → tendencia US: "${topicBridgeUS}"`);
  } catch (err) {
    console.warn(`  ⚠️  keyword-loader falló (${err.message}) — usando TOPICS_POOL fallback`);
    const dayNum   = new Date(date).getDate();
    const monthNum = new Date(date).getMonth();
    const pick = (arr, offset) => arr[(dayNum + monthNum * 3 + offset) % arr.length];
    topicES0      = pick(TOPICS_POOL.core, 0);
    topicNegocio  = pick(TOPICS_POOL.negocio, 0);
    topicUS0      = hasTrendUS ? trends.us[0] : pick(TOPICS_POOL.core_us, 0);
    topicUS1      = pick(TOPICS_POOL.core_us, 3);
    topicBridgeUS = (hasTrendUS && trends.us[1]) ? trends.us[1] : pick(TOPICS_POOL.bridge, 0);
  }

  // ── Slots: 2 ES + 3 US ───────────────────────────────────────────────────
  // Slot 1: core ES      — lang:'es' market:'es'
  // Slot 2: negocio ES   — lang:'es' market:'es'
  // Slot 3: core_us      — lang:'en' market:'us' (trending US o Excel offset 0)
  // Slot 4: core_us      — lang:'en' market:'us' (Excel offset 1)
  // Slot 5: bridge_us    — lang:'en' market:'us' (trending US[1] o Excel offset 2)
  const slots = [
    { slot: 1, type: 'core',      lang: 'es', market: 'es', topic: topicES0,      cluster: topCluster },
    { slot: 2, type: 'negocio',   lang: 'es', market: 'es', topic: topicNegocio,  cluster: 'gestion' },
    { slot: 3, type: 'core_us',   lang: 'en', market: 'us', topic: topicUS0 },
    { slot: 4, type: 'core_us',   lang: 'en', market: 'us', topic: topicUS1 },
    { slot: 5, type: 'bridge_us', lang: 'en', market: 'us', topic: topicBridgeUS },
  ];

  // ── VALIDACIÓN DE KEYWORDS ES ─────────────────────────────────────────────
  console.log('  Validando relevancia de keywords ES...');
  for (const s of slots.filter(s => s.market === 'es')) {
    const validation = await validateKeyword(s.topic);
    if (!validation.valid) {
      console.warn(`    ⚠️  Keyword inválida [slot ${s.slot}]: "${s.topic}" — ${validation.reason}`);
      console.warn(`    → Reemplazando con fallback del cluster...`);
      const cluster  = validation.suggestedCluster || s.cluster || topCluster || 'cortes';
      const offset   = s.slot + 10;
      const fallback = getKeywordForDayByCluster(cluster, date, offset, usedKeywords)
                    || getKeywordForDay('es', date, offset, usedKeywords);
      console.warn(`    → Nueva keyword: "${fallback}"`);
      s.topic = fallback;
    } else {
      console.log(`    ✓ [slot ${s.slot}] "${s.topic.slice(0, 50)}" — válida`);
    }
  }

  console.log('  Generando slug, meta y secondary keywords SEO...');
  const prompt = `Eres un experto SEO del sector peluquería/barbería.

Para estas keywords de Semrush, genera slugs SEO y datos de publicación:
${slots.map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] "${s.topic}"${s.market === 'us' ? ' ← MERCADO US' : ' ← MERCADO ES/LATAM'}`).join('\n')}

La keyword ya está definida (target_keyword = la keyword del post).
Genera SOLO: slug, meta_description y secondary_keywords.

Responde SOLO con un array JSON (sin texto adicional):
[
  {
    "target_keyword": "la misma keyword recibida, sin modificar",
    "secondary_keywords": ["keyword2 relacionada", "keyword3 relacionada"],
    "user_question": "pregunta real del profesional en el idioma del mercado",
    "slug": "slug-kebab-case-max-5-palabras en el idioma del mercado"
  }
]`;

  let keywordsData;
  try {
    const response = callClaude(prompt, { timeout: 60_000 });
    keywordsData = extractJSON(response, true);
  } catch (err) {
    console.warn(`  ⚠️  Error generando keywords: ${err.message} — usando fallbacks`);
    keywordsData = slots.map(s => ({
      target_keyword: s.topic.slice(0, 40),
      secondary_keywords: ['peluquería profesional', 'barbería'],
      user_question: `¿Cómo dominar ${s.topic}?`,
      slug: s.topic.toLowerCase()
        .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
        .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
        .replace(/[^a-z0-9]+/g, '-').slice(0, 50).replace(/-+$/, ''),
    }));
  }

  // ── TAREA 1a: Verificar unicidad de slugs en Supabase ────────────────────
  const postsRaw = slots.map((s, i) => ({
    ...s,
    target_keyword:     keywordsData[i]?.target_keyword     || s.topic.slice(0, 40),
    secondary_keywords: keywordsData[i]?.secondary_keywords || [],
    user_question:      keywordsData[i]?.user_question      || '',
    slug:               keywordsData[i]?.slug                || `post-${s.slot}-${date}`,
    cluster:            s.cluster || null,
    bridge_test: s.type === 'bridge' ? 'pending' : null,
  }));

  if (supabaseUrl && anonKey) {
    console.log('  Verificando unicidad de slugs en Supabase...');
    for (const post of postsRaw) {
      const uniqueSlug = await ensureUniqueSlug(post.slug, supabaseUrl, anonKey);
      if (uniqueSlug !== post.slug) {
        console.log(`    ⚠️  Slug "${post.slug}" duplicado → "${uniqueSlug}"`);
        post.slug = uniqueSlug;
      }
    }
  }

  return { date, posts: postsRaw };
}

module.exports = { planDay };
