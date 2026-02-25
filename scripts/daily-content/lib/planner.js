/**
 * planner.js — FASE 0: Clasifica los 5 posts del día
 * Distribución: 3 core · 1 bridge · 1 negocio
 */
const Anthropic = require('@anthropic-ai/sdk');

const TOPICS_POOL = {
  core: [
    // Técnica / química
    'coloración vegetal sin amoniaco: guía técnica 2026',
    'técnica balayage vs highlights: diferencias y cuándo usar cada una',
    'cuidado del cabello rizado: rutina CGM para salón',
    'tratamiento de keratina brasileña: pasos, tiempos y contraindicaciones',
    'cortes con maquinilla: guía de números y técnicas de fundido',
    'trenzas box braids: proceso completo y cuidado posterior',
    'alisado japonés vs keratina: comparativa técnica definitiva',
    'colorimetría avanzada: corrección de color en cabello dañado',
    'extensiones de cabello: tipos, técnicas de aplicación y mantenimiento',
    'permanente moderna: técnicas actuales y productos de nueva generación',
    // Equipamiento
    'mejores clippers profesionales para barbería 2026: análisis y ranking',
    'secadores de iones vs secadores convencionales: qué recomienda la ciencia',
    'tijeras de barbero: acero japonés vs acero alemán, todo lo que necesitas saber',
    'planchas de pelo profesionales: comparativa de las 8 mejores del mercado',
    'sillones de barbero hidráulicos: guía de compra para equipar tu local',
    'trimmers sin cable para barbería: análisis de los modelos más vendidos',
    // Productos
    'mejores tintes sin amoniaco del mercado: ranking para profesionales',
    'mascarillas de reparación capilar: ingredientes que realmente funcionan',
    'aceites capilares profesionales: argan vs keratina vs argán+CBD',
    'productos para barba: aceites, bálsamos y ceras en comparativa',
  ],
  bridge: [
    // IA / tecnología
    'IA de reconocimiento facial aplicada al diagnóstico capilar en salones',
    'apps de prueba virtual de color: cómo la realidad aumentada está cambiando el salón',
    'automatización de agenda: comparativa de software con IA para peluquerías',
    'análisis de cuero cabelludo por cámara: tecnología trichoscopia al alcance del barbero',
    // Sostenibilidad
    'nuevas normativas de tintes sin amoníaco en la UE 2026: impacto en proveedores',
    'peluquería eco-friendly: cómo reducir residuos químicos en el salón',
    // Economía / mercado
    'inflación en el sector de la peluquería España 2026: análisis de precios',
    'cómo calcular el precio de tus servicios de peluquería según costes reales',
    // Salud / ergonomía
    'lesiones laborales en peluqueros: síndrome del túnel carpiano y cómo prevenirlo',
    'productos químicos del salón y salud respiratoria: lo que la ciencia dice',
  ],
  negocio: [
    'cómo digitalizar la gestión de tu salón de peluquería en 2026',
    'marketing en redes sociales para peluquerías: estrategia con resultados reales',
    'fidelización de clientes en peluquería: sistemas que funcionan',
    'análisis de rentabilidad de un salón: métricas clave que debes medir',
    'normativa fiscal para autónomos peluqueros España 2026: VeriFactu y más',
    'cómo contratar personal para tu peluquería sin errores legales',
    'ticket medio en peluquería: cómo aumentarlo sin perder clientes',
    'gestión de citas online para peluquerías: comparativa de las mejores apps',
    'costes fijos y variables de una peluquería: guía de control financiero',
    'cómo abrir una peluquería en España 2026: pasos y requisitos legales',
  ],
};

async function planDay(client, date) {
  // Seleccionar temas evitando repeticiones — usar fecha como seed
  const dayNum = new Date(date).getDate();
  const pick = (arr, offset) => arr[(dayNum + offset) % arr.length];

  const slots = [
    { slot: 1, type: 'core',    topic: pick(TOPICS_POOL.core, 0) },
    { slot: 2, type: 'core',    topic: pick(TOPICS_POOL.core, 7) },
    { slot: 3, type: 'core',    topic: pick(TOPICS_POOL.core, 14) },
    { slot: 4, type: 'bridge',  topic: pick(TOPICS_POOL.bridge, 0) },
    { slot: 5, type: 'negocio', topic: pick(TOPICS_POOL.negocio, 0) },
  ];

  // Usar Claude para generar keywords objetivo por slot
  const prompt = `Eres un experto SEO especializado en el sector de peluquería y barbería en España.

Para cada uno de estos temas de blog, genera:
1. target_keyword: keyword principal (volumen medio-alto, competencia media)
2. secondary_keywords: array de 2-3 keywords secundarias
3. user_question: pregunta real del usuario que el post debe responder
4. slug: slug kebab-case max 5 palabras sin stop words

Temas:
${slots.map((s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.topic}`).join('\n')}

Responde SOLO con un array JSON válido con exactamente ${slots.length} objetos:
[{"target_keyword":"...","secondary_keywords":["..."],"user_question":"...","slug":"..."}]`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });

  let keywords;
  try {
    const text = msg.content[0].text.trim();
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    keywords = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch {
    keywords = slots.map(() => ({
      target_keyword: 'peluquería profesional',
      secondary_keywords: ['barbería', 'salón de belleza'],
      user_question: '¿Cómo hacerlo correctamente?',
      slug: 'guia-profesional',
    }));
  }

  return {
    date,
    posts: slots.map((s, i) => ({
      ...s,
      target_keyword: keywords[i]?.target_keyword || s.topic.slice(0, 40),
      secondary_keywords: keywords[i]?.secondary_keywords || [],
      user_question: keywords[i]?.user_question || '',
      slug: keywords[i]?.slug || s.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
      bridge_test: s.type === 'bridge' ? 'pending' : null,
    })),
  };
}

module.exports = { planDay };
