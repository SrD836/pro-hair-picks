/**
 * planner.js — FASE 0: Clasifica los 5 posts del día
 * Distribución: 3 core · 1 bridge · 1 negocio
 * Usa `claude -p` (autenticación de Claude Code, sin API key separada)
 */
const { callClaude, extractJSON } = require('./claude-cli');

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

async function planDay(date) {
  const dayNum = new Date(date).getDate();
  const monthNum = new Date(date).getMonth();
  const pick = (arr, offset) => arr[(dayNum + monthNum * 3 + offset) % arr.length];

  const slots = [
    { slot: 1, type: 'core',    lang: 'es', market: 'es', topic: pick(TOPICS_POOL.core, 0) },
    { slot: 2, type: 'core',    lang: 'es', market: 'es', topic: pick(TOPICS_POOL.core, 7) },
    { slot: 3, type: 'core_us', lang: 'en', market: 'us', topic: pick(TOPICS_POOL.core_us, 0) },
    { slot: 4, type: 'bridge',  lang: 'es', market: 'es', topic: pick(TOPICS_POOL.bridge, 0) },
    { slot: 5, type: 'negocio', lang: 'es', market: 'es', topic: pick(TOPICS_POOL.negocio, 0) },
  ];

  console.log('  Generando keywords y slugs SEO...');
  const prompt = `Eres un experto SEO del sector peluquería/barbería.

Para estos temas de blog, genera keywords y slugs SEO optimizados:
${slots.map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.topic}${s.market === 'us' ? ' ← MERCADO US: keywords en inglés americano' : ' ← MERCADO ES/LATAM: keywords en español'}`).join('\n')}

CRITERIOS POR MERCADO:
- Posts ES/LATAM (CORE, BRIDGE, NEGOCIO): keywords en español, 200-2000 búsquedas/mes en España
- Posts US (CORE_US): keywords en inglés americano (ej: "best professional clippers 2026"), 500-5000 búsquedas/mes en EEUU

Responde SOLO con un array JSON (sin texto adicional):
[
  {
    "target_keyword": "keyword principal según mercado del post",
    "secondary_keywords": ["keyword2", "keyword3"],
    "user_question": "pregunta real del profesional (en el idioma del mercado)",
    "slug": "slug-kebab-case-max-5-palabras (en el idioma del mercado)"
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
      slug: s.topic.toLowerCase().replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i').replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n').replace(/[^a-z0-9]+/g, '-').slice(0, 50).replace(/-+$/, ''),
    }));
  }

  return {
    date,
    posts: slots.map((s, i) => ({
      ...s,
      target_keyword:    keywordsData[i]?.target_keyword    || s.topic.slice(0, 40),
      secondary_keywords: keywordsData[i]?.secondary_keywords || [],
      user_question:     keywordsData[i]?.user_question     || '',
      slug:              keywordsData[i]?.slug               || `post-${s.slot}-${date}`,
      bridge_test: s.type === 'bridge' ? 'pending' : null,
    })),
  };
}

module.exports = { planDay };
