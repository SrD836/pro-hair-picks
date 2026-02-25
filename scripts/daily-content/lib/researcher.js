/**
 * researcher.js — FASE 1: Investigación de contenido
 * 1A: keywords + datos para posts core/negocio
 * 1B: detección de tendencia + test del puente para post bridge
 */
const Anthropic = require('@anthropic-ai/sdk');

/**
 * FASE 1A — Investiga un post core o negocio
 * Devuelve: contexto enriquecido con datos, estadísticas y ángulo
 */
async function researchCorePost(client, post) {
  const searchQuery = `${post.target_keyword} peluquería profesional España 2025 2026`;

  let searchContext = '';
  try {
    // Usar web_search si está disponible
    const searchMsg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Busca información actual sobre: "${searchQuery}".
                  Encuentra: estadísticas recientes, tendencias 2025-2026, datos de mercado España,
                  estudios científicos relevantes, preguntas frecuentes de profesionales.
                  Responde con los datos más útiles para escribir un artículo de blog profesional.`,
      }],
    });
    searchContext = searchMsg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
  } catch {
    // Fallback sin web_search: generar contexto desde conocimiento del modelo
    const fallbackMsg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.4,
      messages: [{
        role: 'user',
        content: `Genera contexto para un artículo sobre "${post.topic}" dirigido a profesionales de peluquería en España.
                  Incluye: estadísticas del sector, datos técnicos relevantes, tendencias actuales, preguntas comunes.
                  Responde en formato de notas de investigación, no como artículo.`,
      }],
    });
    searchContext = fallbackMsg.content[0].text;
  }

  return { ...post, research_context: searchContext };
}

/**
 * FASE 1B — Investiga tendencia externa + aplica bridge test
 * Devuelve el post con bridge_test: 'passed' | 'failed' y el ángulo validado
 */
async function researchBridgePost(client, post) {
  // PASO 1: Detectar tendencia actual relevante al sector
  let trendData = '';
  try {
    const trendMsg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Busca las tendencias tecnológicas, económicas o regulatorias más importantes
                  en España esta semana que puedan impactar al sector de peluquería y barbería.
                  Categorías: IA aplicada, apps de belleza, normativa UE cosmética, economía del sector,
                  salud laboral, sostenibilidad.
                  Dame el dato o noticia más relevante y reciente.`,
      }],
    });
    trendData = trendMsg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
  } catch {
    trendData = `Contexto general: avances en IA aplicada al análisis capilar,
                 nueva regulación EU sobre aditivos en tintes,
                 crecimiento del mercado de peluquería eco-friendly en España`;
  }

  // PASO 2: Bridge test
  const bridgeTestPrompt = `Eres un editor de contenido especializado en peluquería y barbería.

TENDENCIA DETECTADA: ${trendData}

TEMA DEL POST: ${post.topic}

Aplica el TEST DEL PUENTE. El puente es válido si cumple AL MENOS 2 de estas 3 condiciones:
a) Existe una aplicación o herramienta del sector que usa esta tecnología (con URL real verificable)
b) El profesional del salón puede tomar una decisión de negocio o técnica basándose en el artículo
c) La tendencia tiene impacto económico o regulatorio directo en el sector

Responde con JSON:
{
  "bridge_test": "passed" | "failed",
  "conditions_met": ["a","b","c"] (solo los que se cumplen),
  "reason": "explicación en 2 frases",
  "trend_angle": "titular exacto del post bridge (sector primero, tecnología después)",
  "actionable": "qué puede HACER el profesional con esta información",
  "bridge_trend_topic": "IA | sostenibilidad | economia | salud | regulacion",
  "tech_limitation": "qué NO puede hacer todavía esta tecnología (para posts IA)"
}`;

  const bridgeMsg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    temperature: 0.2,
    messages: [{ role: 'user', content: bridgeTestPrompt }],
  });

  let bridgeResult = { bridge_test: 'failed', reason: 'no se pudo evaluar' };
  try {
    const text = bridgeMsg.content[0].text;
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    bridgeResult = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch { /* keep default */ }

  // Si falla, actualizar el topic al ángulo validado
  const updatedPost = {
    ...post,
    bridge_test: bridgeResult.bridge_test,
    bridge_reason: bridgeResult.reason,
    bridge_trend_topic: bridgeResult.bridge_trend_topic || null,
    research_context: trendData,
    bridge_angle: bridgeResult.trend_angle || post.topic,
    actionable: bridgeResult.actionable || '',
    tech_limitation: bridgeResult.tech_limitation || '',
  };

  if (bridgeResult.bridge_test === 'passed') {
    updatedPost.topic = bridgeResult.trend_angle || post.topic;
  }

  return updatedPost;
}

/**
 * Punto de entrada: enriquece todos los posts con contexto de investigación
 */
async function researchAllPosts(client, dailyPlan) {
  const enriched = [];
  for (const post of dailyPlan.posts) {
    console.log(`  📡 Investigando [${post.type}] slot ${post.slot}: ${post.topic.slice(0, 60)}...`);
    if (post.type === 'bridge') {
      enriched.push(await researchBridgePost(client, post));
    } else {
      enriched.push(await researchCorePost(client, post));
    }
  }
  return { ...dailyPlan, posts: enriched };
}

module.exports = { researchAllPosts };
