/**
 * researcher.js — FASE 1: Investigación de contenido
 * Usa `claude -p` con el conocimiento del modelo (sin web_search en modo CLI)
 */
const { callClaude, extractJSON } = require('./claude-cli');

async function researchCorePost(post) {
  const prompt = `Eres un experto en peluquería y barbería con 15 años de experiencia en España.

Genera contexto de investigación para un artículo de blog sobre:
TEMA: ${post.topic}
KEYWORD: ${post.target_keyword}
PREGUNTA A RESPONDER: ${post.user_question}

Proporciona:
1. 3 estadísticas o datos concretos del sector (con fuente si la conoces)
2. 2-3 tendencias actuales relevantes (2024-2026)
3. Los 3 errores más comunes de los profesionales en este tema
4. 1 estudio o investigación relevante citando fuente
5. Contexto del mercado español (precios, marcas, distribuidores principales)

Responde como si fueran notas de investigación para el redactor. Directo, sin introducción.`;

  try {
    const response = callClaude(prompt, { timeout: 90_000 });
    return { ...post, research_context: response };
  } catch (err) {
    console.warn(`  ⚠️  Error en research core: ${err.message}`);
    return { ...post, research_context: '' };
  }
}

async function researchCorePostUS(post) {
  const prompt = `You are a professional hairdressing and barbering expert with 15 years of experience in the US market.

Generate research context for a blog article about:
TOPIC: ${post.topic}
KEYWORD: ${post.target_keyword}
QUESTION TO ANSWER: ${post.user_question}

Provide:
1. 3 statistics or concrete data points about the US professional hair industry (with source if known)
2. 2-3 current trends (2024-2026) relevant to US salons and barbershops
3. The 3 most common mistakes US professionals make regarding this topic
4. 1 relevant study or research with source citation
5. US market context: price ranges, leading brands (Andis, Wahl Professional, Oster, StyleCraft, BaByliss Pro), main distributors (Amazon.com, Sally Beauty, CosmoProf)

Respond as research notes for the writer. Direct, no introduction.`;

  try {
    const response = callClaude(prompt, { timeout: 90_000 });
    return { ...post, research_context: response };
  } catch (err) {
    console.warn(`  ⚠️  Error en research US: ${err.message}`);
    return { ...post, research_context: '' };
  }
}

async function researchBridgePost(post) {
  // PASO 1: Evaluar la tendencia y aplicar bridge test
  const bridgePrompt = `Eres editor de contenido especializado en peluquería y barbería.

TEMA DEL POST BRIDGE: ${post.topic}

PASO 1 — Identifica la tendencia tecnológica/económica/regulatoria más relevante y actual que se conecta con este tema.

PASO 2 — Aplica el TEST DEL PUENTE. El puente es válido si cumple AL MENOS 2 de estas 3 condiciones:
a) Existe una app o herramienta del sector que ya usa esta tecnología
b) El profesional del salón puede tomar una decisión de negocio basada en el artículo
c) La tendencia tiene impacto económico o regulatorio directo en el sector

Responde SOLO con JSON (sin texto adicional):
{
  "bridge_test": "passed",
  "conditions_met": ["b", "c"],
  "reason": "explicación en 1 frase",
  "trend_angle": "Cómo [tecnología/tendencia] está cambiando [aspecto concreto] en los salones",
  "actionable": "Qué puede HACER el profesional con esta información (1 frase)",
  "bridge_trend_topic": "IA",
  "tech_limitation": "Qué NO puede hacer todavía esta tecnología",
  "research_context": "4-5 frases de contexto factual sobre la tendencia"
}

Valores válidos para bridge_trend_topic: IA, sostenibilidad, economia, salud, regulacion`;

  let bridgeResult = {
    bridge_test: 'failed',
    reason: 'No se pudo evaluar',
    research_context: '',
  };

  try {
    const response = callClaude(bridgePrompt, { timeout: 90_000 });
    bridgeResult = extractJSON(response, false);
  } catch (err) {
    console.warn(`  ⚠️  Error en bridge test: ${err.message} — usando fallback`);
  }

  return {
    ...post,
    bridge_test:        bridgeResult.bridge_test || 'failed',
    bridge_reason:      bridgeResult.reason || '',
    bridge_trend_topic: bridgeResult.bridge_trend_topic || null,
    bridge_angle:       bridgeResult.trend_angle || post.topic,
    actionable:         bridgeResult.actionable || '',
    tech_limitation:    bridgeResult.tech_limitation || '',
    research_context:   bridgeResult.research_context || '',
    topic: bridgeResult.bridge_test === 'passed'
      ? (bridgeResult.trend_angle || post.topic)
      : post.topic,
  };
}

async function researchAllPosts(dailyPlan) {
  const enriched = [];
  for (const post of dailyPlan.posts) {
    console.log(`  📡 Investigando [${post.type}] slot ${post.slot}...`);
    if (post.type === 'bridge') {
      enriched.push(await researchBridgePost(post));
    } else if (post.type === 'core_us') {
      enriched.push(await researchCorePostUS(post));
    } else {
      enriched.push(await researchCorePost(post));
    }
  }

  const bridgePost = enriched.find(p => p.type === 'bridge');
  if (bridgePost) {
    console.log(`  Bridge test: ${bridgePost.bridge_test} — ${bridgePost.bridge_reason}`);
  }

  return { ...dailyPlan, posts: enriched };
}

module.exports = { researchAllPosts };
