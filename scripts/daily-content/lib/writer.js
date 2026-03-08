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

function extractFAQSchema(html) {
  if (!html || !html.includes('faq-section')) return null;
  const faqStart = html.indexOf('faq-section');
  if (faqStart === -1) return null;
  const faqSection = html.slice(faqStart, faqStart + 4000);
  const items = [];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = h3Regex.exec(faqSection)) !== null && items.length < 5) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    const answer   = match[2].replace(/<[^>]+>/g, '').trim();
    if (question && answer) {
      items.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      });
    }
  }
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

function generateSchema(post, date) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    url: `https://guiadelsalon.com/blog/${post.slug}`,
    alternateName: post.title_en || post.title,
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
    inLanguage: post.lang === 'en' ? 'en-US' : 'es-ES',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://guiadelsalon.com/blog/${post.slug}`,
    },
  };
  if (post.market === 'us') {
    article.sameAs = `https://guiadelsalon.com/blog/${post.slug}`;
  }
  const faqSchema = extractFAQSchema(post.content || '');
  return faqSchema ? [article, faqSchema] : article;
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
- Extensión: mínimo 1.200 palabras, objetivo 1.500. Sin los 4 elementos obligatorios (lista ≥5 items, tabla comparativa, FAQ, veredicto experto) el artículo es incompleto.
- Sin etiquetas <html>, <head>, <body>
- Etiquetas permitidas: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table> — NUNCA usar <img>: las imágenes las gestiona el pipeline externamente
- Si por algún motivo incluyes un <img>, DEBE llevar alt descriptivo basado en la keyword objetivo (ej: alt="[keyword] — técnica profesional de peluquería")
- Párrafos máximo 4 líneas (legibilidad mobile)
- Negritas SOLO en conceptos técnicos clave
- NUNCA empezar con "En este artículo...", "Hoy te traemos..."
- Keyword principal en el primer párrafo y en 2+ H2/H3
- Los H2 deben contener la keyword principal o variantes semánticas LSI (sinónimos, términos relacionados), NUNCA títulos genéricos como "Introducción" o "Conclusión"
- LÍMITE DE ENCABEZADOS (ESTRICTO): máximo 6 H2 en todo el artículo · máximo 3 H3 en todo el artículo (reservados para FAQ y Bibliografía) · NUNCA usar H4, H5, H6
- Los bloques de contenido (Bloque 1–4) usan SOLO <p>, <ul>, <li>, <table>: PROHIBIDO añadir <h3> dentro del cuerpo de cada bloque
- Cada H2 y H3 debe ser único: sin texto idéntico ni casi idéntico entre encabezados del mismo artículo
- Densidad keyword: 1-1.5% (no más)
- E-E-A-T OBLIGATORIO: mencionar al menos 3 marcas reales del sector (Wahl, BaByliss Pro, Andis, Dyson, L'Oréal Professionnel, Schwarzkopf, Revlon Professional), al menos 1 institución o estudio real (CNAE, Cosmoprof, Intercoiffure, BOE), e incluir al menos 1 precio orientativo en euros

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

<!-- FAQ — 3 preguntas reales que buscaría un profesional. Activa "People also ask" en Google. OBLIGATORIO -->
<div class="faq-section">
  <h2>Preguntas frecuentes</h2>
  <div class="faq-item">
    <h3>[Pregunta 1 con keyword LSI — pregunta que escribiría un peluquero/barbero en Google]</h3>
    <p>[Respuesta directa 40-60 palabras, sin rodeos]</p>
  </div>
  <div class="faq-item">
    <h3>[Pregunta 2 con variante semántica de la keyword]</h3>
    <p>[Respuesta 40-60 palabras]</p>
  </div>
  <div class="faq-item">
    <h3>[Pregunta 3 orientada a precio/comparativa/recomendación]</h3>
    <p>[Respuesta 40-60 palabras]</p>
  </div>
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
${post.relatedPosts && post.relatedPosts.length > 0 ? `
ENLACES INTERNOS OBLIGATORIOS a artículos relacionados del blog (integrar naturalmente dentro del cuerpo del artículo, no solo en bibliografía):
REGLA DE TEXTO ANCLA: el texto visible de cada enlace debe incluir la keyword principal del artículo destino, NO frases genéricas como "ver más", "leer más", "este artículo" o "aquí". Máximo 60 caracteres.
${post.relatedPosts.map(p => `- Destino: /blog/${p.slug} | Keyword destino: "${p.title}" → usa ese texto o una variante descriptiva como texto ancla`).join('\n')}` : ''}

RESPONDE SOLO con el HTML del artículo. Sin explicaciones previas ni posteriores.`;
}

function buildContentPromptUS(post, internalLinks) {
  return `You are an expert hairdressing and barbering writer with 15 years of professional experience in the US market. You write for GuiaDelSalon.com targeting professional hairdressers and barbers in the United States.

TONE: Professional peer-to-peer, technical but accessible. NEVER condescending or promotional.

ASSIGNMENT:
- Type: CORE US
- Topic: ${post.topic}
- Primary keyword: ${post.target_keyword}
- Secondary keywords: ${(post.secondary_keywords || []).join(', ')}
- Question to answer: ${post.user_question || post.topic}

US MARKET CRITERIA:
- Prioritize brands available on Amazon.com: Andis, Oster, Wahl Professional, StyleCraft, BaByliss Pro
- Reference US salon chains where relevant: Sport Clips, Great Clips, Regis
- Use American English terminology and measurements

RESEARCH CONTEXT:
${post.research_context || 'Use your knowledge of the US professional hair industry.'}

WRITE THE COMPLETE ARTICLE in semantic HTML. RULES:
- Length: minimum 1,200 words, target 1,500. Without all 4 mandatory elements (list ≥5 items, comparison table, FAQ, expert verdict) the article is incomplete.
- No <html>, <head>, <body> tags
- Allowed tags: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table> — NEVER use <img>: images are managed externally by the pipeline
- If you ever include an <img>, it MUST have a descriptive alt based on the target keyword (e.g., alt="[keyword] — professional hairdressing technique")
- Paragraphs max 4 lines (mobile readability)
- Bold ONLY on key technical concepts
- NEVER start with "In this article...", "Today we bring you..."
- Primary keyword in first paragraph and in 2+ H2/H3
- H2 headings must contain the primary keyword or LSI semantic variants (synonyms, related terms), NEVER generic titles like "Introduction" or "Conclusion"
- HEADING LIMIT (STRICT): maximum 6 H2 in the entire article · maximum 3 H3 in the entire article (reserved for FAQ and Bibliography only) · NEVER use H4, H5, H6
- Content blocks (Block 1–4) use ONLY <p>, <ul>, <li>, <table>: adding <h3> inside content block bodies is FORBIDDEN
- Every H2 and H3 must be unique: no identical or near-identical text between headings in the same article
- Keyword density: 1-1.5% (no more)
- E-E-A-T MANDATORY: mention at least 3 real industry brands (Andis, Wahl Professional, Oster, StyleCraft, BaByliss Pro, Dyson, L'Oréal Professionnel), at least 1 real institution or study (Bureau of Labor Statistics, NAHA, CosmoProf, American Board of Certified Haircolorists), and include at least 1 price in USD

MANDATORY STRUCTURE:

<p>[Hook: impactful stat or paradox, professional identifies with the problem in ≤30 words]</p>

<h2>[Block 1 — 150-200 words]</h2>
<p>[Concrete technical content]</p>

<h2>[Block 2]</h2>
<p>[Content...]</p>

<h2>[Block 3]</h2>
<p>[Content...]</p>

<h2>[Block 4]</h2>
<p>[Content...]</p>

<!-- Comparison table MANDATORY (at least one) -->
<table class="data-table">
  <thead><tr><th>Feature</th><th>Option A</th><th>Option B</th><th>Verdict</th></tr></thead>
  <tbody>
    <tr><td>...</td><td>...</td><td>...</td><td>...</td></tr>
  </tbody>
</table>

<!-- EXPERT VERDICT — mandatory final section -->
<div class="expert-verdict">
  <p class="verdict-title">⚡ Expert Verdict</p>
  <p>[Authoritative summary 80-120 words. Close with concrete professional recommendation.]</p>
</div>

<!-- FAQ — 3 real questions a professional would search for. Triggers "People also ask" in Google. MANDATORY -->
<div class="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>[Question 1 with LSI keyword — what a barber/stylist would type into Google]</h3>
    <p>[Direct answer 40-60 words, no padding]</p>
  </div>
  <div class="faq-item">
    <h3>[Question 2 with semantic keyword variant]</h3>
    <p>[Answer 40-60 words]</p>
  </div>
  <div class="faq-item">
    <h3>[Question 3 focused on price/comparison/recommendation]</h3>
    <p>[Answer 40-60 words]</p>
  </div>
</div>

<!-- BIBLIOGRAPHY -->
<section class="bibliography">
  <h3>Sources</h3>
  <ul>
    <li>[External source 1 — <a href="URL_REAL" target="_blank" rel="noopener noreferrer">Organization name</a>]</li>
    <li>[External source 2]</li>
    <li>GuiaDelSalon.com — <a href="${internalLinks[0]}">See related products</a></li>
  </ul>
</section>

INTERNAL LINKS (min 2, integrated naturally in text):
- <a href="${internalLinks[0]}">descriptive text</a>
- <a href="${internalLinks[1] || internalLinks[0]}">descriptive text</a>

AMAZON (max 3, only if applicable to topic):
- Tag: ${AMAZON_TAG}
- Anchor text: "Check price on Amazon" (NEVER "Buy")
- Format: <a href="https://amazon.com/dp/ASIN?tag=${AMAZON_TAG}" rel="nofollow" target="_blank">Check price on Amazon</a>
${post.relatedPosts && post.relatedPosts.length > 0 ? `
MANDATORY INTERNAL LINKS to related blog articles (integrate naturally within the article body, not just in bibliography):
ANCHOR TEXT RULE: the visible link text must include the destination article's primary keyword — NEVER generic phrases like "read more", "see more", "this article", or "here". Maximum 60 characters.
${post.relatedPosts.map(p => `- Destination: /blog/${p.slug} | Target keyword: "${p.title}" → use that text or a descriptive variant as anchor text`).join('\n')}` : ''}

RESPOND ONLY with the article HTML. No explanations before or after.`;
}

/**
 * Post-procesado: elimina párrafos y elementos de lista duplicados (>20 palabras).
 * Mantiene siempre la primera aparición; elimina las subsiguientes.
 * Evita que Claude repita CTAs, introducciones o conclusiones dentro del mismo artículo.
 *
 * @param {string} html - HTML del artículo generado
 * @returns {string} HTML sin bloques duplicados
 */
function deduplicateContent(html) {
  if (!html || typeof html !== 'string') return html;

  const seen = new Set();
  let removed = 0;

  const deduped = html.replace(/<(p|li)([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, _attrs, inner) => {
    // Texto plano normalizado para comparación (sin tags, sin mayúsculas, sin espacios extra)
    const plain = inner
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const wordCount = plain.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 20) return match; // bloques cortos: no se comprueban

    if (seen.has(plain)) {
      removed++;
      return ''; // eliminar duplicado, conservar la primera aparición
    }

    seen.add(plain);
    return match;
  });

  if (removed > 0) {
    console.log(`     🔁 Deduplicación: ${removed} bloque(s) duplicado(s) eliminado(s)`);
  }

  // Limpiar líneas vacías consecutivas que puedan quedar tras eliminar bloques
  return deduped.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Valida la densidad de encabezados del HTML generado.
 * Emite warnings si se supera el umbral de 15 H2+H3 en total o si hay duplicados.
 * No bloquea el pipeline — solo informa para revisión manual.
 *
 * @param {string} html  - HTML del artículo
 * @param {string} label - Identificador para el log (slug o topic)
 */
function validateHeadings(html, label) {
  if (!html) return;

  const h2count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3count = (html.match(/<h3[^>]*>/gi) || []).length;
  const total   = h2count + h3count;

  if (total > 15) {
    console.warn('     ⚠️  [' + label + '] Encabezados excesivos: ' + h2count + ' H2 + ' + h3count + ' H3 = ' + total + ' (límite recomendado: 15)');
  }

  // Detectar encabezados duplicados (texto normalizado)
  const matches   = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)];
  const texts     = matches.map(m => m[1].replace(/<[^>]+>/g, '').trim().toLowerCase());
  const duplicates = [...new Set(texts.filter((t, i) => texts.indexOf(t) !== i))];
  if (duplicates.length > 0) {
    console.warn('     ⚠️  [' + label + '] Encabezados duplicados: ' + duplicates.map(d => '"' + d + '"').join(', '));
  }
}

function callClaudeWithRetry(prompt, options = {}, maxRetries = 2) {
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = callClaude(prompt, options);
      if (result && result.trim().length > 100) return result;
      throw new Error('Respuesta vacía o muy corta');
    } catch (err) {
      lastErr = err;
      if (i < maxRetries) {
        console.log(`     ⚠️  Retry ${i + 1}/${maxRetries} — ${err.message.slice(0, 60)}`);
      }
    }
  }
  throw lastErr;
}

async function writePost(post, date) {
  const isUS = post.market === 'us';
  console.log(`  ✍️  Escribiendo [${post.type}] slot ${post.slot}: ${(post.topic || '').slice(0, 55)}...`);
  const internalLinks = getInternalLinks(post);

  // 1. Generar título y metadatos
  const titlePrompt = isUS
    ? `For the article about "${post.topic}" (keyword: "${post.target_keyword}"):
Generate ONLY this JSON (no additional text):
{"title":"[SEO title maximum 43 characters, keyword at start, no subtitle]","title_en":"[same as title]","meta_description":"[exactly 145-155 chars. Structure: primary keyword + concrete benefit with number if possible + implicit CTA. Example: 'Best professional clippers 2026: tested on 12 models in real barbershops. Updated ranking for serious barbers and stylists.']","category":"[1-2 words English]","category_en":"[1-2 words English]"}`
    : `Para el artículo sobre "${post.topic}" (keyword: "${post.target_keyword}"):
Genera SOLO este JSON (sin texto adicional):
{"title":"[título SEO español máximo 43 caracteres, keyword al inicio, sin subtítulo]","title_en":"[English SEO title maximum 43 characters, no subtitle]","meta_description":"[exactamente 145-155 chars. Estructura: keyword principal + beneficio concreto con número si posible + CTA implícito. Ejemplo: 'Mejores clippers profesionales 2026: análisis de 12 modelos con prueba real en barbería. Ranking actualizado para barberos exigentes.']","category":"[1-2 palabras español]","category_en":"[1-2 words English]"}`;

  let titleData = {};
  try {
    const titleResp = callClaudeWithRetry(titlePrompt, { timeout: 45_000 });
    titleData = extractJSON(titleResp, false);
  } catch {
    titleData = isUS ? {
      title: post.topic.slice(0, 43),
      title_en: post.topic.slice(0, 43),
      meta_description: `Professional guide on ${post.target_keyword}. Everything US salon professionals need to know.`,
      category: 'Technique',
      category_en: 'Technique',
    } : {
      title: post.topic.slice(0, 43),
      title_en: post.topic.slice(0, 43),
      meta_description: `Guía profesional sobre ${post.target_keyword}. Todo lo que necesitas saber para el salón.`,
      category: 'Técnica',
      category_en: 'Technique',
    };
  }

  // 2. Generar contenido principal (la llamada más larga — hasta 7 min para US)
  console.log(`     Generando contenido (puede tardar ${isUS ? '3-6 min' : '2-4 min'})...`);
  const mainContent = callClaudeWithRetry(
    isUS
      ? buildContentPromptUS({ ...post, ...titleData }, internalLinks)
      : buildContentPrompt({ ...post, ...titleData }, internalLinks),
    { timeout: isUS ? 420_000 : 300_000 }, // 7 min para US (era 5 min), 5 min para ES
    isUS ? 3 : 2                            // 3 reintentos para US (era 2)
  );

  // Validar proporción de encabezados antes de procesar
  validateHeadings(mainContent, post.slug || post.topic.slice(0, 40));

  // 3. Para posts ES: traducir al inglés. Para posts US: ya está en inglés.
  let contentES, contentEN;
  if (isUS) {
    contentES = deduplicateContent(mainContent);
    contentEN = contentES;
  } else {
    contentES = deduplicateContent(mainContent);
    console.log(`     Traduciendo al inglés...`);
    const translationPrompt = `Translate this hairdressing article from Spanish to professional English.
Keep all HTML tags intact. Adapt for UK/US professionals.
Keep internal links (<a href="...">) unchanged.
RESPOND ONLY with the translated HTML, no explanations.

${contentES}`;
    try {
      contentEN = deduplicateContent(callClaudeWithRetry(translationPrompt, { timeout: 300_000 }));
    } catch {
      contentEN = contentES;
    }
  }

  const primaryContent = isUS ? contentEN : contentES;
  const excerpt = titleData.meta_description || extractExcerpt(primaryContent);

  return {
    ...post,
    title:            titleData.title || post.topic,
    title_en:         titleData.title_en || post.topic,
    meta_description: titleData.meta_description || excerpt,
    category:         titleData.category || (isUS ? 'Technique' : 'Peluquería'),
    category_en:      titleData.category_en || 'Hairdressing',
    excerpt,
    excerpt_en:       isUS ? excerpt : extractExcerpt(contentEN),
    content:          contentES,
    content_en:       contentEN,
    read_time_minutes: estimateReadTime(primaryContent),
    has_expert_verdict: primaryContent.includes('expert-verdict'),
    has_data_viz:     primaryContent.includes('<table') || primaryContent.includes('data-table'),
    has_faq:          primaryContent.includes('faq-section'),
    keywords:         [post.target_keyword, ...(post.secondary_keywords || [])],
    internal_links:   internalLinks,
    external_links:   [],
    author:           isUS ? 'GuiaDelSalon Team' : 'Equipo GuiaDelSalon',
    lang:             post.lang || (isUS ? 'en' : 'es'),
    market:           post.market || (isUS ? 'us' : 'es'),
    hreflang:         isUS ? 'en-us' : 'es',
    canonical:        `https://guiadelsalon.com/blog/${post.slug}`,
    schema_markup:    generateSchema({ ...post, ...titleData, excerpt, content: contentES }, date),
  };
}

async function writeAllPosts(dailyPlan) {
  const posts = [];
  for (const post of dailyPlan.posts) {
    if ((post.type === 'bridge' || post.type === 'bridge_us') && post.bridge_test === 'failed') {
      const isUS = post.market === 'us';
      post.type  = isUS ? 'core_us' : 'core';
      // Usar bridge_fallback_topic si existe (definido en planner), si no mantener el topic original
      post.topic = post.bridge_fallback_topic || post.topic;
      console.log(`  ↳ Bridge fallido → convirtiendo a ${post.type}: "${post.topic.slice(0, 50)}"`);
    }
    try {
      const written = await writePost(post, dailyPlan.date);
      posts.push(written);
    } catch (err) {
      // Post fallido no mata el pipeline
      console.error(`  ❌ Error escribiendo slot ${post.slot} (${post.type}): ${err.message}`);
      console.error(`     El pipeline continuará con los posts restantes.`);
      // Guardar post de emergencia para no perder el slot
      const kw = post.target_keyword || post.topic;
      const isUSFallback = post.market === 'us';
      posts.push({
        ...post,
        title: post.topic,
        title_en: post.topic,
        meta_description: `${kw}: guía para profesionales de peluquería. Técnicas, productos y consejos de aplicación en salón.`.slice(0, 155),
        category: isUSFallback ? 'Technique' : 'Peluquería',
        category_en: 'Hairdressing',
        excerpt: `Artículo sobre ${post.topic}.`,
        excerpt_en: `Article about ${post.topic}.`,
        content: `<p>${kw} es una de las técnicas más buscadas por profesionales de peluquería y barbería en España. En esta guía analizamos los aspectos esenciales que todo profesional del salón debe dominar.</p>

<h2>Por qué dominar ${kw} marca la diferencia</h2>
<p>Los profesionales que dominan ${kw} reportan mayor satisfacción del cliente y servicios mejor valorados. Marcas como Wahl, BaByliss Pro y L'Oréal Professionnel han desarrollado productos específicos para optimizar este servicio.</p>

<h2>Técnica profesional paso a paso</h2>
<p>La correcta aplicación de ${kw} requiere preparación del cabello, elección del producto adecuado y seguimiento del protocolo recomendado por los fabricantes.</p>
<ul>
  <li>Diagnóstico previo del tipo de cabello</li>
  <li>Selección del producto según necesidades</li>
  <li>Aplicación según protocolo técnico</li>
  <li>Control de tiempos de exposición</li>
  <li>Acabado y recomendaciones al cliente</li>
</ul>

<h2>Productos recomendados para profesionales</h2>
<p>En el mercado español, los productos para ${kw} oscilan entre los 15€ y los 80€ según la gama profesional. Consulta las <a href="/categorias/clippers">comparativas de productos profesionales</a> para más información.</p>

<table class="data-table">
  <thead><tr><th>Gama</th><th>Precio orientativo</th><th>Idóneo para</th></tr></thead>
  <tbody>
    <tr><td>Iniciación</td><td>15-30€</td><td>Salones en formación</td></tr>
    <tr><td>Profesional</td><td>30-60€</td><td>Uso diario intensivo</td></tr>
    <tr><td>Premium</td><td>60-80€</td><td>Resultados de alta demanda</td></tr>
  </tbody>
</table>

<div class="expert-verdict">
  <p class="verdict-title">⚡ Veredicto del Experto</p>
  <p>Dominar ${kw} es una inversión en la calidad de tu servicio. Consulta con tu distribuidor de confianza para recibir formación actualizada sobre las últimas técnicas y productos disponibles en España. Mantente actualizado a través de <a href="/blog">nuestra guía completa del salón</a>.</p>
</div>

<div class="faq-section">
  <h2>Preguntas frecuentes</h2>
  <div class="faq-item">
    <h3>¿Cuánto tiempo tarda el servicio de ${kw}?</h3>
    <p>El tiempo varía según el tipo de cabello y la técnica aplicada, generalmente entre 30 y 90 minutos. Un diagnóstico previo permite optimizar el proceso y ofrecer al cliente una estimación precisa.</p>
  </div>
  <div class="faq-item">
    <h3>¿Qué productos profesionales se recomiendan para ${kw}?</h3>
    <p>Las marcas de referencia para profesionales en España incluyen L'Oréal Professionnel, Schwarzkopf Professional y Wella Professionals. La elección depende del resultado deseado y el tipo de cabello del cliente.</p>
  </div>
  <div class="faq-item">
    <h3>¿Cada cuánto se recomienda repetir el tratamiento?</h3>
    <p>Depende de la técnica y del cabello de cada cliente, aunque el promedio en salones españoles es cada 4-8 semanas. Establece un protocolo de mantenimiento personalizado para fidelizar al cliente.</p>
  </div>
</div>`,
        content_en: `<p>${kw} is one of the most in-demand techniques among professional hairdressers and barbers. This guide covers the essential aspects every salon professional must master.</p>

<h2>Why mastering ${kw} makes a difference</h2>
<p>Professionals who master ${kw} report higher client satisfaction and better-rated services. Brands like Wahl Professional, BaByliss Pro and Andis have developed specific products to optimize this service.</p>

<h2>Professional technique step by step</h2>
<p>Proper application of ${kw} requires hair preparation, product selection and following manufacturer-recommended protocols.</p>
<ul>
  <li>Pre-service hair diagnosis</li>
  <li>Product selection based on client needs</li>
  <li>Application following technical protocol</li>
  <li>Processing time management</li>
  <li>Finishing and client aftercare recommendations</li>
</ul>

<div class="expert-verdict">
  <p class="verdict-title">⚡ Expert Verdict</p>
  <p>Mastering ${kw} is an investment in your service quality. Consult with your trusted distributor for updated training on the latest techniques and products. Stay current through <a href="/blog">our complete salon guide</a>.</p>
</div>

<div class="faq-section">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-item">
    <h3>How long does a ${kw} service take?</h3>
    <p>Time varies by hair type and technique, typically 30 to 90 minutes. A pre-service consultation allows you to optimize the process and give the client an accurate estimate.</p>
  </div>
  <div class="faq-item">
    <h3>What professional products are recommended for ${kw}?</h3>
    <p>Leading brands for US professionals include Wahl Professional, Andis, Oster, and BaByliss Pro. The right choice depends on desired results and the client's hair type.</p>
  </div>
  <div class="faq-item">
    <h3>How often should ${kw} treatments be repeated?</h3>
    <p>It depends on the technique and individual hair, but most salon professionals recommend every 4-8 weeks. Establish a personalized maintenance protocol to build client loyalty.</p>
  </div>
</div>`,
        read_time_minutes: 4,
        has_expert_verdict: true,
        has_data_viz: true,
        has_faq: true,
        keywords: [post.target_keyword],
        internal_links: ['/blog'],
        external_links: [],
        author: isUSFallback ? 'GuiaDelSalon Team' : 'Equipo GuiaDelSalon',
        lang: post.lang || 'es',
        market: post.market || 'es',
        schema_markup: null,
        _failed: true, // flag para identificarlo en el report
      });
    }
  }
  return { ...dailyPlan, posts };
}

module.exports = { writeAllPosts, deduplicateContent, AMAZON_TAG };
