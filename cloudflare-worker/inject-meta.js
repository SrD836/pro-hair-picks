// ─── CONFIG ────────────────────────────────────────────────────────────────
let SUPABASE_URL = '';
let SUPABASE_KEY = '';
const DEFAULT_TITLE = "Guía del Salón — Equipamiento Profesional de Peluquería";
const DEFAULT_DESC  = "Rankings honestos, precios reales y herramientas para profesionales del salón.";
const BRAND         = "Guía del Salón";

// ─── SUPABASE FETCH ────────────────────────────────────────────────────────
async function fetchSupabase(endpoint) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

// ─── META POR RUTA ─────────────────────────────────────────────────────────
async function getMetaForPath(pathname) {
  // /blog/[slug]
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const post = await fetchSupabase(
      `blog_posts?slug=eq.${encodeURIComponent(blogMatch[1])}&select=title,meta_description,excerpt,keywords&is_published=eq.true&limit=1`
    );
    if (post) {
      const raw = post.title ?? DEFAULT_TITLE;
      const kw  = Array.isArray(post.keywords) ? post.keywords[0] : null;
      const title = raw.length <= 60
        ? `${raw} | ${BRAND}`
        : kw
          ? `Top ${String(kw).slice(0, 50)} 2026 | ${BRAND}`
          : `${raw.slice(0, 57)}… | ${BRAND}`;
      return {
        title,
        description: (post.meta_description || post.excerpt || DEFAULT_DESC).slice(0, 155),
      };
    }
  }

  // /categorias/[slug]
  const catMatch = pathname.match(/^\/categorias\/([^/]+)\/?$/);
  if (catMatch) {
    const cat = await fetchSupabase(
      `categories?slug=eq.${encodeURIComponent(catMatch[1])}&select=name&limit=1`
    );
    const name = cat?.name ?? catMatch[1].replace(/-/g, " ");
    return {
      title: `${name} profesional — Comparativa y precios | ${BRAND}`,
      description: `Comparativa de ${name.toLowerCase()} para peluqueros y barberos: modelos mejor valorados, precios en Amazon España y análisis de rendimiento real en salón.`.slice(0, 155),
    };
  }

  // /productos/[slug]
  const prodMatch = pathname.match(/^\/productos\/([^/]+)\/?$/);
  if (prodMatch) {
    const prod = await fetchSupabase(
      `products?slug=eq.${encodeURIComponent(prodMatch[1])}&select=name,description&limit=1`
    );
    const name = prod?.name ?? prodMatch[1].replace(/-/g, " ");
    const rawDesc = prod?.description
      ? prod.description.replace(/<[^>]+>/g, "").slice(0, 155)
      : `Análisis de ${name}: especificaciones técnicas, precio y veredicto de experto para profesionales del salón.`.slice(0, 155);
    return {
      title: `${name.slice(0, 50)} — Análisis profesional | ${BRAND}`,
      description: rawDesc,
    };
  }

  // Home
  if (pathname === "/" || pathname === "") {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESC };
  }

  // Resto de páginas
  const seg = pathname.split("/").filter(Boolean).pop() ?? "";
  const human = seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: human ? `${human} | ${BRAND}` : DEFAULT_TITLE,
    description: DEFAULT_DESC,
  };
}

// ─── REWRITER HTML ────────────────────────────────────────────────────────
class MetaRewriter {
  constructor(meta) { this.meta = meta; this.done = false; }
  element(element) {
    if (this.done) return;
    if (element.tagName === "title") {
      element.setInnerContent(this.meta.title);
      this.done = true;
    }
    if (element.tagName === "meta" && element.getAttribute("name") === "description") {
      element.setAttribute("content", this.meta.description);
    }
    if (element.tagName === "meta" && element.getAttribute("property") === "og:description") {
      element.setAttribute("content", this.meta.description);
    }
    if (element.tagName === "meta" && element.getAttribute("property") === "og:title") {
      element.setAttribute("content", this.meta.title);
    }
  }
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    SUPABASE_URL = env.SUPABASE_URL_ENV || '';
    SUPABASE_KEY = env.SUPABASE_ANON_KEY_ENV || '';
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // Ignorar assets estáticos
  const ext = url.pathname.split(".").pop().toLowerCase();
  if (["js","css","png","jpg","webp","svg","ico","woff","woff2","json","xml","txt"].includes(ext)) {
    return fetch(request);
  }

  // Obtener respuesta del origen (Lovable)
  const response = await fetch(request);

  // Solo procesar HTML exitoso
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html") || response.status !== 200) return response;

  // Obtener meta para esta ruta
  const meta = await getMetaForPath(url.pathname);

  // Reescribir con HTMLRewriter de Cloudflare
  return new HTMLRewriter()
    .on("title", new MetaRewriter(meta))
    .on("meta[name='description']", new MetaRewriter(meta))
    .on("meta[property='og:description']", new MetaRewriter(meta))
    .on("meta[property='og:title']", new MetaRewriter(meta))
    .transform(response);
}
