import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ||
                    Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("VITE_SUPABASE_ANON_KEY") ||
                    Deno.env.get("SUPABASE_ANON_KEY") || "";

const DEFAULT_TITLE = "Guía del Salón — Equipamiento Profesional de Peluquería";
const DEFAULT_DESC  = "Rankings honestos, precios reales y herramientas para profesionales del salón.";
const BRAND         = "Guía del Salón";

interface MetaData {
  title: string;
  description: string;
}

async function fetchSupabase(endpoint: string): Promise<any> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      // Timeout de 1.5s para no bloquear el render
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

async function getMetaForPath(pathname: string): Promise<MetaData> {
  // /blog/[slug]
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = await fetchSupabase(
      `blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,meta_description,excerpt&is_published=eq.true&limit=1`
    );
    if (post) {
      const rawTitle = post.title ?? DEFAULT_TITLE;
      // Aplicar misma lógica que buildPageTitle() del frontend
      const title = rawTitle.length <= 60
        ? `${rawTitle} | ${BRAND}`
        : post.keywords?.[0]
          ? `Top ${(post.keywords[0] as string).slice(0, 50)} 2026 | ${BRAND}`
          : `${rawTitle.slice(0, 57)}… | ${BRAND}`;
      const description = (post.meta_description || post.excerpt || DEFAULT_DESC).slice(0, 155);
      return { title, description };
    }
  }

  // /categorias/[slug]
  const catMatch = pathname.match(/^\/categorias\/([^/]+)\/?$/);
  if (catMatch) {
    const slug = catMatch[1];
    const cat = await fetchSupabase(
      `categories?slug=eq.${encodeURIComponent(slug)}&select=name,slug&limit=1`
    );
    if (cat) {
      const name = cat.name ?? slug.replace(/-/g, " ");
      return {
        title: `${name} profesional — Comparativa y precios | ${BRAND}`,
        description: `Comparativa profesional de ${name.toLowerCase()}: modelos mejor valorados, precios en Amazon España y análisis de rendimiento real para peluqueros y barberos.`.slice(0, 155),
      };
    }
  }

  // /productos/[slug]
  const prodMatch = pathname.match(/^\/productos\/([^/]+)\/?$/);
  if (prodMatch) {
    const slug = prodMatch[1];
    const product = await fetchSupabase(
      `products?slug=eq.${encodeURIComponent(slug)}&select=name,description&limit=1`
    );
    if (product) {
      const name = product.name ?? slug.replace(/-/g, " ");
      return {
        title: `${name.slice(0, 50)} — Análisis profesional | ${BRAND}`,
        description: (product.description
          ? product.description.replace(/<[^>]+>/g, "").slice(0, 155)
          : `Análisis profesional de ${name}. Especificaciones técnicas, precio actualizado y veredicto de experto para peluqueros y barberos.`.slice(0, 155)),
      };
    }
  }

  // Home
  if (pathname === "/" || pathname === "") {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
    };
  }

  // Cualquier otra página: título derivado del slug
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  const humanTitle = lastSegment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: humanTitle ? `${humanTitle} | ${BRAND}` : DEFAULT_TITLE,
    description: DEFAULT_DESC,
  };
}

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url);

  // Solo interceptar HTML (no assets, no API)
  const ext = url.pathname.split(".").pop()?.toLowerCase() ?? "";
  const isAsset = ["js", "css", "png", "jpg", "webp", "svg", "ico", "woff", "woff2", "json", "xml"].includes(ext);
  if (isAsset) return context.next();

  const response = await context.next();

  // Solo procesar respuestas HTML exitosas
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") || response.status !== 200) {
    return response;
  }

  const html = await response.text();

  // Si el HTML no tiene los placeholders, no modificar (evitar doble procesado)
  if (!html.includes("__META_DESCRIPTION__") && !html.includes("__PAGE_TITLE__")) {
    return new Response(html, response);
  }

  const { title, description } = await getMetaForPath(url.pathname);

  const injected = html
    .replace("__META_DESCRIPTION__", description.replace(/"/g, "&quot;"))
    .replace("__PAGE_TITLE__", title.replace(/</g, "&lt;"));

  return new Response(injected, {
    status: response.status,
    headers: response.headers,
  });
}
