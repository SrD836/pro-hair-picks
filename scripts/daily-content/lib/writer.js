/**
 * writer.js — FASE 2-4: Redacción, visualización y enlazado
 * Usa `claude -p` para generar HTML de alta calidad SEO
 */
const { callClaude, extractJSON } = require('./claude-cli');

const AMAZON_TAG = 'guiadelsalo09-21';

const INTERNAL_LINKS_MAP = {
  color:        ['/asesor-color', '/categorias/tintes'],
  corte:        ['/categorias/clippers', '/categorias/tijeras-profesionales'],
  barbería:     ['/categorias/trimmers', '/categorias/productos-para-la-barba'],
  capilar:      ['/categorias/secadores-profesionales', '/categorias/planchas-de-pelo'],
  equipamiento: ['/categorias/sillones-de-barbero-hidraulico', '/categorias/capas-y-delantales'],
  bridge_ia:    ['/asesor-color', '/blog'],
  negocio:      ['/calculadora-precio', '/calculadora-roi'],
  default:      ['/blog', '/asesor-color'],
};

function getInternalLinks(post) {
  const t = (post.topic || '').toLowerCase();
  if (t.includes('color') || t.includes('tinte') || t.includes('coloración')) return INTERNAL_LINKS_MAP.color;
  if (t.includes('clipper') || t.includes('tijera') || t.includes('corte') || t.includes('maquinilla')) return INTERNAL_LINKS_MAP.corte;
  if (t.includes('barba') || t.includes('trimmer') || t.includes('barbería')) return INTERNAL_LINKS_MAP.barbería;
  if (t.includes('secador') || t.includes('plancha') || t.includes('capilar') || t.includes('keratina')) return INTERNAL_LINKS_MAP.capilar;
  if (t.includes('sillón') || t.includes('equipo') || t.includes('extensiones')) return INTERNAL_LINKS_MAP.equipamiento;
  if (post.type === 'bridge') return INTERNAL_LINKS_MAP.bridge_ia;
  if (post.type === 'negocio') return INTERNAL_LINKS_MAP.negocio;
  return INTERNAL_LINKS_MAP.default;
}

function estimateReadTime(html) {
  const text = html.replace(/<[^>]+>/g, ' ');
  return Math.max(3, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

function extractExcerpt(html) {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!match) return '';
  const text = match[1].replace(/<[^>]+>/g, '').trim();
  return text.length > 155 ? text.slice(0, 152) + '...' : text;
}

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
    description: post.meta_description || post.excerpt || '',
    keywords: (post.keywords || []).join(', '),
    inLanguage: 'es-ES',
  };
}

function buildContentPrompt(post, internalLinks) {
  return `Eres un redactor experto en peluquería y barbería profesional con 15 años en el sector español. Escribes para GuiaDelSalon.com, dirigido a peluqueros y barberos profesionales en España.

TONO: profesional de igual a igual, técnico pero accesible. NUNCA condescendiente ni promocional.

ASIGNACIÓN:
- Tipo: ${post.type.toUpperCase()}
- Tema: ${post.topic}
- Keyword principal: ${post.target_keyword}
- Keywords secundarias: ${(post.secondary_keywords || []).join(', ')}
- Pregunta a responder: ${post.user_question || post.topic}
${post.type === 'bridge' ? `- Ángulo puente: ${post.bridge_angle || post.topic}
- Acción práctica: ${post.actionable || ''}
- Límite tecnológico (OBLIGATORIO mencionar en Veredicto): ${post.tech_limitation || 'aún requiere el criterio del profesional'}` : ''}

CONTEXTO DE INVESTIGACIÓN:
${post.research_context || 'Usa tu conocimiento del sector.'}

ESCRIBE EL ARTÍCULO COMPLETO en HTML semántico. REGLAS:
- Extensión: mínimo 900 palabras, objetivo 1.100
- Sin etiquetas <html>, <head>, <body>
- Etiquetas: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table>
- Párrafos máximo 4 líneas (legibilidad mobile)
- Negritas SOLO en conceptos técnicos clave
- NUNCA empezar con "En este artículo...", "Hoy te traemos..."
- Keyword principal en el primer párrafo y en 2+ H2/H3
- Densidad keyword: 1-1.5% (no más)

ESTRUCTURA OBLIGATORIA:

<p>[Hook: dato impactante o paradoja, identifica al lector con el problema en ≤30 palabras]</p>

<h2>[Bloque 1 — 150-200 palabras]</h2>
<p>[Contenido técnico concreto]</p>

<h2>[Bloque 2]</h2>
<p>[Contenido...]</p>

<h2>[Bloque 3]</h2>
<p>[Contenido...]</p>

<h2>[Bloque 4]</h2>
<p>[Contenido...]</p>

<!-- Tabla comparativa OBLIGATORIA (al menos una) -->
<table class="data-table">
  <thead><tr><th>Característica</th><th>Opción A</th><th>Opción B</th><th>Veredicto</th></tr></thead>
  <tbody>
    <tr><td>...</td><td>...</td><td>...</td><td>...</td></tr>
  </tbody>
</table>

<!-- VEREDICTO DEL EXPERTO — sección final OBLIGATORIA -->
<div class="expert-verdict">
  <p class="verdict-title">⚡ Veredicto del Experto</p>
  <p>[Síntesis autoritaria 80-120 palabras. ${post.type === 'bridge' ? 'INCLUIR: "Lo que esta tecnología todavía no puede hacer es..."' : 'Cierra con recomendación profesional concreta.'}]</p>
</div>

<!-- BIBLIOGRAFÍA -->
<section class="bibliography">
  <h3>Fuentes</h3>
  <ul>
    <li>[Fuente externa 1 — <a href="URL_REAL" target="_blank" rel="noopener noreferrer">Nombre organización</a>]</li>
    <li>[Fuente externa 2]</li>
    <li>GuiaDelSalon.com — <a href="${internalLinks[0]}">Ver productos relacionados</a></li>
  </ul>
</section>

ENLACES INTERNOS (2 mínimo, integrados naturalmente en el texto):
- <a href="${internalLinks[0]}">texto descriptivo</a>
- <a href="${internalLinks[1] || internalLinks[0]}">texto descriptivo</a>

AMAZON (máximo 3, solo si aplican al tema):
- Tag: ${AMAZON_TAG}
- Anchor text: "Ver precio en Amazon" (NUNCA "Comprar")
- Formato: <a href="https://amazon.es/dp/ASIN?tag=${AMAZON_TAG}" rel="nofollow" target="_blank">Ver precio en Amazon</a>
${post.type === 'negocio' ? `\nCIZURA: Menciona "software de gestión como Cizura" máximo 2 veces, solo como solución a un problema concreto del artículo.` : ''}

RESPONDE SOLO con el HTML del artículo. Sin explicaciones previas ni posteriores.`;
}

async function writePost(post, date) {
  console.log(`  ✍️  Escribiendo [${post.type}] slot ${post.slot}: ${(post.topic || '').slice(0, 55)}...`);
  const internalLinks = getInternalLinks(post);

  // 1. Generar título y metadatos
  const titlePrompt = `Para el artículo sobre "${post.topic}" (keyword: "${post.target_keyword}"):
Genera SOLO este JSON (sin texto adicional):
{"title":"[título SEO español max 65 chars, keyword al inicio]","title_en":"[English SEO title max 65 chars]","meta_description":"[max 155 chars, incluye keyword y CTA implícito]","category":"[1-2 palabras español]","category_en":"[1-2 words English]"}`;

  let titleData = {};
  try {
    const titleResp = callClaude(titlePrompt, { timeout: 45_000 });
    titleData = extractJSON(titleResp, false);
  } catch {
    titleData = {
      title: post.topic.slice(0, 65),
      title_en: post.topic.slice(0, 65),
      meta_description: `Guía profesional sobre ${post.target_keyword}. Todo lo que necesitas saber para el salón.`,
      category: 'Técnica',
      category_en: 'Technique',
    };
  }

  // 2. Generar contenido principal (la llamada más larga — hasta 5 min)
  console.log(`     Generando contenido (puede tardar 2-4 min)...`);
  const contentES = callClaude(buildContentPrompt({ ...post, ...titleData }, internalLinks), { timeout: 300_000 });

  // 3. Traducir al inglés
  console.log(`     Traduciendo al inglés...`);
  const translationPrompt = `Translate this hairdressing article from Spanish to professional English.
Keep all HTML tags intact. Adapt for UK/US professionals.
Keep internal links (<a href="...">) unchanged.
RESPOND ONLY with the translated HTML, no explanations.

${contentES}`;
  let contentEN = '';
  try {
    contentEN = callClaude(translationPrompt, { timeout: 300_000 });
  } catch {
    contentEN = contentES; // fallback: mismo contenido
  }

  const excerpt = titleData.meta_description || extractExcerpt(contentES);

  return {
    ...post,
    title:           titleData.title || post.topic,
    title_en:        titleData.title_en || post.topic,
    meta_description: titleData.meta_description || excerpt,
    category:        titleData.category || 'Peluquería',
    category_en:     titleData.category_en || 'Hairdressing',
    excerpt,
    excerpt_en:      extractExcerpt(contentEN),
    content:         contentES,
    content_en:      contentEN,
    read_time_minutes: estimateReadTime(contentES),
    has_expert_verdict: contentES.includes('expert-verdict'),
    has_data_viz:    contentES.includes('<table') || contentES.includes('data-table'),
    keywords:        [post.target_keyword, ...(post.secondary_keywords || [])],
    internal_links:  internalLinks,
    external_links:  [],
    author:          'Equipo GuiaDelSalon',
    schema_markup:   generateSchema({ ...post, ...titleData, excerpt }, date),
  };
}

async function writeAllPosts(dailyPlan) {
  const posts = [];
  for (const post of dailyPlan.posts) {
    if (post.type === 'bridge' && post.bridge_test === 'failed') {
      console.log(`  ⚠️  Bridge test fallido → convirtiendo slot ${post.slot} a post CORE`);
      post.type = 'core';
      post.topic = 'técnicas de coloración sin amoniaco: guía profesional definitiva';
    }
    posts.push(await writePost(post, dailyPlan.date));
  }
  return { ...dailyPlan, posts };
}

module.exports = { writeAllPosts, AMAZON_TAG };
