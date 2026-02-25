/**
 * publisher.js — FASE 5: Inserta posts en Supabase y actualiza sitemap.xml
 * Usa el Management API de Supabase (bypassa RLS con el access token)
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Ejecuta SQL en Supabase via Management API (bypassa RLS)
 */
function supabaseQuery(sql, projectId, accessToken) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error));
          else resolve(json);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Escapa una cadena para SQL (previene injection)
 */
function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function sqlArray(arr) {
  if (!arr || arr.length === 0) return 'NULL';
  return `ARRAY[${arr.map(s => sqlEscape(s)).join(',')}]`;
}

function sqlJsonb(obj) {
  if (!obj) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

/**
 * Inserta un post en blog_posts (status: draft, is_published: false)
 */
async function insertPost(post, projectId, accessToken) {
  // Verificar si el slug ya existe
  const checkSql = `SELECT id FROM blog_posts WHERE slug = ${sqlEscape(post.slug)} LIMIT 1`;
  const existing = await supabaseQuery(checkSql, projectId, accessToken);
  if (existing && existing.length > 0) {
    console.log(`    ⏭️  Slug "${post.slug}" ya existe — saltando`);
    return { skipped: true, slug: post.slug };
  }

  const sql = `
INSERT INTO blog_posts (
  slug, title, title_en,
  excerpt, excerpt_en,
  content, content_en,
  category, category_en,
  author, cover_image_url,
  is_published, published_at,
  read_time_minutes,
  post_type, keywords, affiliate_products,
  has_expert_verdict, has_data_viz,
  bridge_trend_topic, meta_description,
  internal_links, external_links,
  schema_markup
) VALUES (
  ${sqlEscape(post.slug)},
  ${sqlEscape(post.title)},
  ${sqlEscape(post.title_en)},
  ${sqlEscape(post.excerpt)},
  ${sqlEscape(post.excerpt_en)},
  ${sqlEscape(post.content)},
  ${sqlEscape(post.content_en)},
  ${sqlEscape(post.category)},
  ${sqlEscape(post.category_en)},
  ${sqlEscape(post.author || 'Equipo GuiaDelSalon')},
  ${sqlEscape(post.cover_image_url)},
  false,
  ${sqlEscape(post.published_at || new Date().toISOString())},
  ${post.read_time_minutes || 5},
  ${sqlEscape(post.type)},
  ${sqlArray(post.keywords)},
  ${sqlArray(post.affiliate_products)},
  ${post.has_expert_verdict ? 'true' : 'false'},
  ${post.has_data_viz ? 'true' : 'false'},
  ${sqlEscape(post.bridge_trend_topic)},
  ${sqlEscape(post.meta_description)},
  ${sqlArray(post.internal_links)},
  ${sqlArray(post.external_links)},
  ${sqlJsonb(post.schema_markup)}
)
RETURNING id, slug`;

  const result = await supabaseQuery(sql, projectId, accessToken);
  return { inserted: true, slug: post.slug, id: result[0]?.id };
}

/**
 * Actualiza el sitemap.xml añadiendo las nuevas URLs
 */
function updateSitemap(posts, date) {
  const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn('    ⚠️  sitemap.xml no encontrado — no se actualizará');
    return;
  }

  let sitemap = fs.readFileSync(sitemapPath, 'utf8');

  const priorities = { negocio: '0.9', core: '0.8', bridge: '0.7' };

  for (const post of posts) {
    const url = `https://guiadelsalon.com/blog/${post.slug}`;
    if (sitemap.includes(url)) continue; // Ya existe

    const priority = priorities[post.type] || '0.8';
    const newEntry = `
  <url>
    <loc>${url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;

    sitemap = sitemap.replace('</urlset>', newEntry + '\n</urlset>');
  }

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`  ✓ sitemap.xml actualizado con ${posts.length} nuevas URLs`);
}

/**
 * Genera daily_report.md
 */
function generateReport(dailyPlan, results) {
  const lines = [
    `# Daily Content Report — ${dailyPlan.date}`,
    '',
    `**Posts generados:** ${results.filter(r => r.inserted).length} / ${results.length}`,
    `**Posts saltados (slug duplicado):** ${results.filter(r => r.skipped).length}`,
    '',
    '## Posts del día',
    '',
  ];

  for (const post of dailyPlan.posts) {
    const result = results.find(r => r.slug === post.slug) || {};
    const status = result.inserted ? '✅ Insertado' : result.skipped ? '⏭️ Saltado' : '❌ Error';
    lines.push(`### [${post.type.toUpperCase()}] ${post.title || post.topic}`);
    lines.push(`- **Slug:** \`${post.slug}\``);
    lines.push(`- **Keyword principal:** ${post.target_keyword}`);
    lines.push(`- **Keywords secundarias:** ${(post.secondary_keywords || []).join(', ')}`);
    if (post.type === 'bridge') {
      lines.push(`- **Bridge test:** ${post.bridge_test || 'n/a'} — ${post.bridge_reason || ''}`);
      lines.push(`- **Tendencia:** ${post.bridge_trend_topic || 'n/a'}`);
    }
    lines.push(`- **Veredicto:** ${post.has_expert_verdict ? 'Sí' : 'No'}`);
    lines.push(`- **Datos/tabla:** ${post.has_data_viz ? 'Sí' : 'No'}`);
    lines.push(`- **Estado:** ${status}`);
    if (result.id) lines.push(`- **ID Supabase:** ${result.id}`);
    lines.push('');
  }

  lines.push('## Instrucciones de publicación');
  lines.push('');
  lines.push('Los posts están en estado **draft** (is_published = false).');
  lines.push('Para publicar, revisar el contenido en Supabase Dashboard y cambiar is_published = true.');
  lines.push('');
  lines.push('```sql');
  lines.push(`-- Publicar todos los posts de hoy:`);
  lines.push(`UPDATE blog_posts SET is_published = true`);
  lines.push(`WHERE slug IN (${dailyPlan.posts.map(p => `'${p.slug}'`).join(', ')})`);
  lines.push(`AND is_published = false;`);
  lines.push('```');

  return lines.join('\n');
}

/**
 * Publica todos los posts y actualiza el sitemap
 */
async function publishAll(dailyPlan, config) {
  const { SUPABASE_PROJECT_ID, SUPABASE_ACCESS_TOKEN, OUTPUT_DIR } = config;

  const results = [];
  for (const post of dailyPlan.posts) {
    console.log(`  📤 Insertando en Supabase: ${post.slug}`);
    try {
      const result = await insertPost(post, SUPABASE_PROJECT_ID, SUPABASE_ACCESS_TOKEN);
      results.push(result);
      if (result.inserted) console.log(`    ✓ Insertado con ID ${result.id}`);
    } catch (err) {
      console.error(`    ❌ Error: ${err.message}`);
      results.push({ error: true, slug: post.slug, message: err.message });
    }
  }

  // Actualizar sitemap
  updateSitemap(dailyPlan.posts, dailyPlan.date);

  // Generar informe
  const report = generateReport(dailyPlan, results);
  const reportPath = path.join(OUTPUT_DIR, 'daily_report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`  ✓ Informe guardado: ${reportPath}`);

  return results;
}

module.exports = { publishAll };
