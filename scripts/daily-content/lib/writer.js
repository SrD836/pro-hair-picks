/**
 * writer.js — FASE 2 + 3 + 4: Redacción, visualización y enlazado
 * Genera HTML listo para insertar en Supabase (campo content)
 */

const AMAZON_TAG = 'guiadelsalo09-21';

// Mapa de categorías a rutas internas
const INTERNAL_LINKS = {
  core_color: ['/asesor-color', '/categorias/tintes'],
  core_corte: ['/categorias/clippers', '/categorias/tijeras-profesionales'],
  core_barberia: ['/categorias/trimmers', '/categorias/productos-para-la-barba'],
  core_salud: ['/categorias/secadores-profesionales', '/categorias/planchas-de-pelo'],
  core_equipamiento: ['/categorias/sillones-de-barbero-hidraulico', '/categorias/capas-y-delantales'],
  bridge_ia: ['/asesor-color', '/blog'],
  negocio: ['/calculadora-precio', '/calculadora-roi'],
  default: ['/blog', '/asesor-color'],
};

function getInternalLinks(post) {
  const topic = (post.topic || '').toLowerCase();
  if (topic.includes('color') || topic.includes('tinte')) return INTERNAL_LINKS.core_color;
  if (topic.includes('clipper') || topic.includes('cortador') || topic.includes('corte')) return INTERNAL_LINKS.core_corte;
  if (topic.includes('barba') || topic.includes('trimmer') || topic.includes('barbería')) return INTERNAL_LINKS.core_barberia;
  if (topic.includes('secador') || topic.includes('plancha') || topic.includes('capilar')) return INTERNAL_LINKS.core_salud;
  if (topic.includes('sillón') || topic.includes('equipo')) return INTERNAL_LINKS.core_equipamiento;
  if (post.type === 'bridge' && (topic.includes('ia') || topic.includes('inteligencia'))) return INTERNAL_LINKS.bridge_ia;
  if (post.type === 'negocio') return INTERNAL_LINKS.negocio;
  return INTERNAL_LINKS.default;
}

/**
 * Genera el prompt de escritura para Claude
 */
function buildWritingPrompt(post) {
  const internalLinks = getInternalLinks(post);
  const isEN = false; // Generamos español primero

  const basePrompt = `Eres un redactor experto en peluquería y barbería profesional, con 15 años de experiencia en el sector español. Escribes para GuiaDelSalon.com, dirigido a peluqueros y barberos profesionales en España y Latinoamérica.

TONO: profesional de igual a igual, técnico pero accesible, nunca condescendiente ni promocional.

CONTEXTO DE INVESTIGACIÓN:
${post.research_context || 'Sin contexto adicional disponible.'}

ASIGNACIÓN:
- Tipo: ${post.type.toUpperCase()}
- Keyword principal: ${post.target_keyword}
- Keywords secundarias: ${(post.secondary_keywords || []).join(', ')}
- Pregunta a responder: ${post.user_question || 'Ver tema'}
${post.type === 'bridge' ? `- Ángulo puente: ${post.bridge_angle || post.topic}
- Acción práctica: ${post.actionable || ''}
- Límite tecnológico (obligatorio mencionar): ${post.tech_limitation || 'aún requiere criterio humano del profesional'}` : ''}

ESCRIBE EL ARTÍCULO COMPLETO en HTML semántico con estas reglas:
1. EXTENSIÓN: mínimo 900 palabras, objetivo 1.100
2. Sin etiqueta <html>, <head>, <body> — solo el contenido del artículo
3. Usa: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table>
4. Párrafos máximo 4 líneas (legibilidad mobile)
5. Una idea central por párrafo
6. Negritas SOLO en conceptos técnicos clave, no decorativas
7. NUNCA empieces con "En este artículo...", "Hoy te traemos...", "Bienvenido..."

ESTRUCTURA OBLIGATORIA:

<!-- HOOK: primeras 3 líneas impactantes -->
<p>[Dato impactante o paradoja que identifique al lector con el problema en <30 palabras]</p>

<!-- H2 bloques de 150-200 palabras cada uno -->
<h2>[Título del primer bloque]</h2>
<p>[Contenido...]</p>

[Mínimo 4 bloques H2]

<!-- Tabla comparativa o datos (obligatorio) -->
<table class="data-table">
  <thead><tr><th>...</th></tr></thead>
  <tbody><tr><td>...</td></tr></tbody>
</table>

<!-- VEREDICTO DEL EXPERTO — sección final obligatoria -->
<div class="expert-verdict">
  <p class="verdict-title">⚡ Veredicto del Experto</p>
  <p>[Síntesis autoritaria 80-120 palabras. Para posts BRIDGE incluir: "Lo que esta tecnología todavía no puede hacer es..."]</p>
</div>

<!-- BIBLIOGRAFÍA -->
<section class="bibliography">
  <h3>Fuentes</h3>
  <ul>
    <li>[Fuente 1 con enlace externo <a href="URL" target="_blank" rel="noopener noreferrer">Texto</a>]</li>
    <li>[Fuente 2]</li>
    <li>GuiaDelSalon.com — <a href="${internalLinks[0]}">Ver productos relacionados</a></li>
  </ul>
</section>

REGLAS DE ENLACES:
- Incluir 2 enlaces internos naturales al texto: ${internalLinks.map(l => `<a href="${l}">`).join(', ')}
- Máximo 3 productos Amazon con tag="${AMAZON_TAG}" y anchor text "Ver precio en Amazon"
- Mínimo 2 fuentes externas de autoridad (abrir en nueva pestaña)
- La keyword principal debe aparecer en el primer párrafo y en al menos 2 H2/H3
- Densidad keyword: 1-1.5% (no más)

${post.type === 'negocio' ? `GANCHO CIZURA: menciona "software de gestión de salones como Cizura" máximo 2 veces, siempre en contexto de solución a un problema concreto mencionado en el artículo.` : ''}

RESPONDE SOLO con el HTML del artículo, sin explicaciones previas ni posteriores.`;

  return basePrompt;
}

/**
 * Genera una versión inglesa del post (traducción + adaptación)
 */
function buildTranslationPrompt(spanishContent, post) {
  return `Translate this Spanish hairdressing/barbershop article to professional English.
Adapt for international audience (UK/US professionals).
Keep all HTML tags intact. Keep <table> structure.
Translate the expert verdict maintaining the authoritative tone.
Keep internal links as-is (same paths).
Spanish keyword: "${post.target_keyword}" → use natural English equivalent.

SPANISH CONTENT:
${spanishContent}

RESPOND ONLY with the translated HTML, no explanations.`;
}

/**
 * Extrae el read_time estimado del HTML
 */
function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(wordCount / 200));
}

/**
 * Extrae el excerpt del primer párrafo del HTML
 */
function extractExcerpt(html) {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/s);
  if (!match) return '';
  const text = match[1].replace(/<[^>]+>/g, '').trim();
  return text.length > 155 ? text.slice(0, 152) + '...' : text;
}

/**
 * Genera el schema markup JSON-LD para el post
 */
function generateSchema(post, date) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Organization', name: 'Guía del Salón' },
    publisher: {
      '@type': 'Organization',
      name: 'Guía del Salón',
      logo: { '@type': 'ImageObject', url: 'https://guiadelsalon.com/logo-160.webp' },
    },
    image: `https://guiadelsalon.com/images/blog/${post.slug}-hero.webp`,
    description: post.meta_description || post.excerpt,
    keywords: (post.keywords || []).join(', '),
    inLanguage: 'es-ES',
  };
}

/**
 * Escribe un post completo usando Claude
 */
async function writePost(client, post, date) {
  console.log(`  ✍️  Escribiendo [${post.type}] slot ${post.slot}: ${(post.topic || '').slice(0, 50)}...`);

  // Generar título SEO primero
  const titlePrompt = `Para el artículo sobre "${post.topic}" (keyword: "${post.target_keyword}"):
Genera exactamente:
1. title: título SEO en español, max 65 chars, keyword al inicio
2. title_en: English SEO title, max 65 chars
3. meta_description: max 155 chars, incluye keyword y CTA implícito, en español
4. category: categoría en español (1-2 palabras)
5. category_en: English category
Responde solo con JSON: {"title":"...","title_en":"...","meta_description":"...","category":"...","category_en":"..."}`;

  const titleMsg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    temperature: 0.3,
    messages: [{ role: 'user', content: titlePrompt }],
  });

  let titleData = {};
  try {
    const text = titleMsg.content[0].text;
    titleData = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    titleData = {
      title: post.topic.slice(0, 65),
      title_en: post.topic.slice(0, 65),
      meta_description: `Guía profesional sobre ${post.target_keyword}. Todo lo que necesitas saber.`,
      category: 'Técnica',
      category_en: 'Technique',
    };
  }

  // Generar contenido principal
  const contentMsg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [{ role: 'user', content: buildWritingPrompt({ ...post, ...titleData }) }],
  });
  const contentES = contentMsg.content[0].text.trim();

  // Traducir al inglés
  const translationMsg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.4,
    messages: [{ role: 'user', content: buildTranslationPrompt(contentES, post) }],
  });
  const contentEN = translationMsg.content[0].text.trim();

  const excerpt = titleData.meta_description || extractExcerpt(contentES);
  const internalLinks = getInternalLinks(post);

  const result = {
    ...post,
    title: titleData.title || post.topic,
    title_en: titleData.title_en || post.topic,
    meta_description: titleData.meta_description || excerpt,
    category: titleData.category || 'Peluquería',
    category_en: titleData.category_en || 'Hairdressing',
    excerpt,
    excerpt_en: extractExcerpt(contentEN),
    content: contentES,
    content_en: contentEN,
    read_time_minutes: estimateReadTime(contentES),
    has_expert_verdict: contentES.includes('expert-verdict'),
    has_data_viz: contentES.includes('<table') || contentES.includes('recharts'),
    keywords: [post.target_keyword, ...(post.secondary_keywords || [])],
    internal_links: internalLinks,
    external_links: [],
    schema_markup: generateSchema({ ...post, ...titleData, excerpt }, date),
    author: 'Equipo GuiaDelSalon',
  };

  return result;
}

/**
 * Escribe todos los posts del plan del día
 */
async function writeAllPosts(client, dailyPlan) {
  const posts = [];
  for (const post of dailyPlan.posts) {
    // Si bridge test falló, convertir en core adicional
    if (post.type === 'bridge' && post.bridge_test === 'failed') {
      console.log(`  ⚠️  Bridge test fallido para slot ${post.slot} — convirtiendo a post CORE`);
      post.type = 'core';
      post.topic = 'técnicas profesionales de coloración sin amoniaco: guía definitiva';
    }
    posts.push(await writePost(client, post, dailyPlan.date));
  }
  return { ...dailyPlan, posts };
}

module.exports = { writeAllPosts, AMAZON_TAG };
