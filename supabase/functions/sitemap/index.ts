import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TODO: If total URLs ever reaches ~45,000, split into a sitemap index:
//   /sitemap.xml (index) → /sitemap-products.xml · /sitemap-blog.xml · /sitemap-categories.xml
// Current projected count: ~20 static + 431 products + 81 posts + ~20 categories ≈ 552 URLs

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://guiadelsalon.com";

const today = new Date().toISOString().split("T")[0];

// Static pages — ordered by priority desc
const STATIC_PAGES = [
  { loc: "/",                    priority: "1.0", changefreq: "daily",   lastmod: today },
  { loc: "/blog",                priority: "0.9", changefreq: "daily",   lastmod: today },
  { loc: "/categorias",          priority: "0.8", changefreq: "weekly",  lastmod: today },
  { loc: "/comparar",            priority: "0.8", changefreq: "weekly",  lastmod: today },
  { loc: "/gestionar-mi-local",  priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: "/quiz",                priority: "0.8", changefreq: "weekly",  lastmod: today },
  // Mi Pelo tools
  { loc: "/mi-pelo",             priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/asesor-color",        priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/diagnostico-capilar", priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/compatibilidad-quimica", priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/inci-check",          priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/recuperacion-capilar",priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/analizador-canicie",  priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/analizador-alopecia", priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/pasaporte-capilar",   priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/cursos-peluqueria",   priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/calculadora-roi",     priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: "/calculadora-precio",  priority: "0.7", changefreq: "monthly", lastmod: today },
  // Informational
  { loc: "/sobre-nosotros",      priority: "0.4", changefreq: "monthly", lastmod: today },
  { loc: "/contacto",            priority: "0.4", changefreq: "monthly", lastmod: today },
  // Legal
  { loc: "/politica-privacidad", priority: "0.3", changefreq: "yearly",  lastmod: today },
  { loc: "/politica-cookies",    priority: "0.3", changefreq: "yearly",  lastmod: today },
  { loc: "/terminos",            priority: "0.3", changefreq: "yearly",  lastmod: today },
];

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function toDate(ts: string | null | undefined): string {
  if (!ts) return today;
  try { return new Date(ts).toISOString().split("T")[0]; } catch { return today; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Parallel data fetching ──────────────────────────────────────────────
    const [postsRes, productsRes, categoriesRes, catLastmodRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("slug, published_at")
        .eq("is_published", true)
        .not("slug", "is", null)
        .order("published_at", { ascending: false }),

      supabase
        .from("products")
        .select("slug, created_at")
        .not("slug", "is", null)
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id, slug")
        .not("slug", "is", null),

      // MAX created_at per category_id from products (for dynamic lastmod)
      supabase
        .from("products")
        .select("category_id, created_at")
        .not("category_id", "is", null)
        .order("created_at", { ascending: false }),
    ]);

    // Build category_id → MAX(created_at) map
    const catLastmodMap: Record<string, string> = {};
    for (const p of (catLastmodRes.data ?? [])) {
      if (p.category_id && !catLastmodMap[p.category_id]) {
        catLastmodMap[p.category_id] = toDate(p.created_at);
      }
    }

    const categoryRows: Array<{ slug: string; last_product_date: string | null }> =
      (categoriesRes.data ?? []).map((c: { id: string; slug: string }) => ({
        slug: c.slug,
        last_product_date: catLastmodMap[c.id] ?? null,
      }));

    // ── Build URL entries ───────────────────────────────────────────────────
    const urls: string[] = [];

    // 1. Static pages
    for (const p of STATIC_PAGES) {
      urls.push(urlEntry(p.loc, p.lastmod, p.changefreq, p.priority));
    }

    // 2. Category pages — priority 0.9, weekly, lastmod dynamic
    for (const cat of categoryRows) {
      if (!cat.slug) continue;
      const lastmod = toDate(cat.last_product_date);
      urls.push(urlEntry(`/categorias/${cat.slug}`, lastmod, "weekly", "0.9"));
    }

    // 3. Product pages — priority 0.8, weekly, lastmod: created_at
    for (const product of (productsRes.data ?? [])) {
      if (!product.slug) continue;
      urls.push(urlEntry(`/productos/${product.slug}`, toDate(product.created_at), "weekly", "0.8"));
    }

    // 4. Blog post pages — priority 0.7, monthly, lastmod: published_at
    for (const post of (postsRes.data ?? [])) {
      if (!post.slug) continue;
      urls.push(urlEntry(`/blog/${post.slug}`, toDate(post.published_at), "monthly", "0.7"));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});

// Validar en: https://www.xml-sitemaps.com/validate-xml-sitemap.html
// Enviar a GSC: Search Console → Sitemaps → https://guiadelsalon.com/sitemap.xml
