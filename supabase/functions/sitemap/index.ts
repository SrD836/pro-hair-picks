import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://guiadelsalon.com";

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/blog", priority: "0.9", changefreq: "daily" },
  { loc: "/comparar", priority: "0.8", changefreq: "weekly" },
  { loc: "/quiz", priority: "0.8", changefreq: "weekly" },
  { loc: "/calculadora-roi", priority: "0.7", changefreq: "monthly" },
  { loc: "/calculadora-precio", priority: "0.7", changefreq: "monthly" },
  { loc: "/sobre-nosotros", priority: "0.4", changefreq: "monthly" },
  { loc: "/contacto", priority: "0.4", changefreq: "monthly" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch published blog posts
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (postsError) throw postsError;

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug");

    if (catError) throw catError;

    const today = new Date().toISOString().split("T")[0];

    let urls = STATIC_PAGES.map(
      (p) =>
        `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    );

    // Blog posts
    if (posts) {
      for (const post of posts) {
        const lastmod = post.published_at
          ? new Date(post.published_at).toISOString().split("T")[0]
          : today;
        urls.push(`  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }

    // Categories
    if (categories) {
      for (const cat of categories) {
        urls.push(`  <url>
    <loc>${BASE_URL}/categoria/${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
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
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});
