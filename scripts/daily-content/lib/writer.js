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
- Etiquetas: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table>
- Párrafos máximo 4 líneas (legibilidad mobile)
- Negritas SOLO en conceptos técnicos clave
- NUNCA empezar con "En este artículo...", "Hoy te traemos..."
- Keyword principal en el primer párrafo y en 2+ H2/H3
- Los H2 deben contener la keyword principal o variantes semánticas LSI (sinónimos, términos relacionados), NUNCA títulos genéricos como "Introducción" o "Conclusión"
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
${post.relatedPosts.map(p => `- <a href="/blog/${p.slug}">${p.title}</a>`).join('\n')}` : ''}

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
- Tags: <h2>, <h3>, <p>, <strong>, <ul>, <li>, <table>
- Paragraphs max 4 lines (mobile readability)
- Bold ONLY on key technical concepts
- NEVER start with "In this article...", "Today we bring you..."
- Primary keyword in first paragraph and in 2+ H2/H3
- H2 headings must contain the primary keyword or LSI semantic variants (synonyms, related terms), NEVER generic titles like "Introduction" or "Conclusion"
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
${post.relatedPosts.map(p => `- <a href="/blog/${p.slug}">${p.title}</a>`).join('\n')}` : ''}

RESPOND ONLY with the article HTML. No explanations before or after.`;
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

  // 2. Generar contenido principal (la llamada más larga — hasta 5 min)
  console.log(`     Generando contenido (puede tardar 2-4 min)...`);
  const mainContent = callClaudeWithRetry(
    isUS
      ? buildContentPromptUS({ ...post, ...titleData }, internalLinks)
      : buildContentPrompt({ ...post, ...titleData }, internalLinks),
    { timeout: 300_000 }
  );

  // 3. Para posts ES: traducir al inglés. Para posts US: ya está en inglés.
  let contentES, contentEN;
  if (isUS) {
    contentES = mainContent;
    contentEN = mainContent;
  } else {
    contentES = mainContent;
    console.log(`     Traduciendo al inglés...`);
    const translationPrompt = `Translate this hairdressing article from Spanish to professional English.
Keep all HTML tags intact. Adapt for UK/US professionals.
Keep internal links (<a href="...">) unchanged.
RESPOND ONLY with the translated HTML, no explanations.

${contentES}`;
    try {
      contentEN = callClaudeWithRetry(translationPrompt, { timeout: 300_000 });
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
    if (post.type === 'bridge' && post.bridge_test === 'failed') {
      console.log(`  ⚠️  Bridge test fallido → convirtiendo slot ${post.slot} a post CORE ES`);
      post.type = 'core';
      post.lang = 'es';
      post.market = 'es';
      post.topic = 'técnicas de coloración sin amoniaco: guía profesional definitiva';
    }
    try {
      const written = await writePost(post, dailyPlan.date);
      posts.push(written);
    } catch (err) {
      // Post fallido no mata el pipeline
      console.error(`  ❌ Error escribiendo slot ${post.slot} (${post.type}): ${err.message}`);
      console.error(`     El pipeline continuará con los posts restantes.`);
      // Guardar post de emergencia para no perder el slot
      posts.push({
        ...post,
        title: post.topic,
        title_en: post.topic,
        meta_description: `${post.target_keyword || post.topic}: guía para profesionales de peluquería. Técnicas, productos y consejos de aplicación en salón.`.slice(0, 155),
        category: 'Peluquería',
        category_en: 'Hairdressing',
        excerpt: `Artículo sobre ${post.topic}.`,
        excerpt_en: `Article about ${post.topic}.`,
        content: `<p>${post.topic} es un tema clave para profesionales de peluquería y barbería en España. En esta guía analizamos los aspectos fundamentales que todo profesional del salón debe conocer sobre ${post.target_keyword || post.topic}, incluyendo técnicas actuales, productos recomendados y consejos de aplicación profesional.</p>
<h2>¿Por qué es importante ${post.target_keyword || post.topic}?</h2>
<p>Los profesionales del sector valoran especialmente el dominio de ${post.target_keyword || post.topic} por su impacto directo en la satisfacción del cliente y la rentabilidad del servicio. Mantenemos esta guía en actualización continua con las últimas novedades del sector.</p>
<p>Consulta nuestras <a href="/blog">guías completas del salón</a> y las <a href="/categorias/clippers">comparativas de productos profesionales</a> para más recursos.</p>`,
        content_en: `<p>${post.topic} is a key topic for professional hairdressers and barbers. This guide covers the essential aspects of ${post.target_keyword || post.topic} for salon professionals, including current techniques, recommended products and professional application tips.</p>
<h2>Why does ${post.target_keyword || post.topic} matter?</h2>
<p>Salon professionals value expertise in ${post.target_keyword || post.topic} for its direct impact on client satisfaction and service profitability. We keep this guide updated with the latest industry developments.</p>
<p>Browse our <a href="/blog">complete salon guides</a> for more professional resources.</p>`,
        read_time_minutes: 2,
        has_expert_verdict: false,
        has_data_viz: false,
        keywords: [post.target_keyword],
        internal_links: ['/blog'],
        external_links: [],
        author: 'Equipo GuiaDelSalon',
        lang: post.lang || 'es',
        market: post.market || 'es',
        schema_markup: null,
        _failed: true, // flag para identificarlo en el report
      });
    }
  }
  return { ...dailyPlan, posts };
}

module.exports = { writeAllPosts, AMAZON_TAG };
