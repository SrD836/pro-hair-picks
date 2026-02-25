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
    { slot: 1, type: 'core',    topic: pick(TOPICS_POOL.core, 0) },
    { slot: 2, type: 'core',    topic: pick(TOPICS_POOL.core, 7) },
    { slot: 3, type: 'core',    topic: pick(TOPICS_POOL.core, 14) },
    { slot: 4, type: 'bridge',  topic: pick(TOPICS_POOL.bridge, 0) },
    { slot: 5, type: 'negocio', topic: pick(TOPICS_POOL.negocio, 0) },
  ];

  console.log('  Generando keywords y slugs SEO...');
  const prompt = `Eres un experto SEO del sector peluquería/barbería en España.

Para estos temas de blog, genera keywords y slugs SEO optimizados:
${slots.map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.topic}`).join('\n')}

Responde SOLO con un array JSON (sin texto adicional):
[
  {
    "target_keyword": "keyword principal con 200-2000 búsquedas/mes en ES",
    "secondary_keywords": ["keyword2", "keyword3"],
    "user_question": "pregunta real del profesional que el post responde",
    "slug": "slug-kebab-case-max-5-palabras"
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
