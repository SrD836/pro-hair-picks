/**
 * images.js — Descarga imagen de Pexels, convierte a WebP, sube a Supabase Storage
 * Fallback: URL de Unsplash curada si no hay PEXELS_API_KEY
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Mapa de categorías a queries de Pexels y foto IDs de Unsplash (fallback)
const IMAGE_QUERIES = {
  core: { pexels: 'hairdresser salon professional', unsplash: '1562322140-8baeececf3df' },
  bridge: { pexels: 'technology beauty salon', unsplash: '1522337360788-8b13dee7a37e' },
  negocio: { pexels: 'beauty salon business management', unsplash: '1521737604893-d14cc237f11d' },
};

const TOPIC_QUERIES = {
  color: { pexels: 'hair coloring salon', unsplash: '1522337360788-8b13dee7a37e' },
  barbería: { pexels: 'barber shop professional', unsplash: '1503951914875-452162b0f3f1' },
  tijera: { pexels: 'hairdresser scissors professional', unsplash: '1562322140-8baeececf3df' },
  secador: { pexels: 'hair dryer professional salon', unsplash: '1562322140-8baeececf3df' },
  clipper: { pexels: 'barber clipper haircut', unsplash: '1503951914875-452162b0f3f1' },
  keratina: { pexels: 'hair treatment salon', unsplash: '1522337360788-8b13dee7a37e' },
  tinte: { pexels: 'hair color dyeing professional', unsplash: '1522337360788-8b13dee7a37e' },
  rizado: { pexels: 'curly hair salon', unsplash: '1562322140-8baeececf3df' },
};

function getImageQuery(post) {
  const topic = (post.topic || '').toLowerCase();
  for (const [key, val] of Object.entries(TOPIC_QUERIES)) {
    if (topic.includes(key)) return val;
  }
  return IMAGE_QUERIES[post.type] || IMAGE_QUERIES.core;
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function searchPexels(query, apiKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      headers: { Authorization: apiKey },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > 0) {
            resolve(json.photos[0].src.large2x || json.photos[0].src.large);
          } else {
            reject(new Error('No photos found'));
          }
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function convertToWebP(inputPath, outputPath, width, height, quality = 85) {
  const sharpPath = 'C:/Users/david/AppData/Roaming/npm/node_modules/sharp-cli/node_modules/sharp';
  let sharp;
  try {
    sharp = require(sharpPath);
  } catch {
    try {
      sharp = require('sharp');
    } catch {
      console.warn('    ⚠️  sharp no disponible — se usará imagen original');
      fs.copyFileSync(inputPath, outputPath);
      return outputPath;
    }
  }

  await sharp(inputPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .webp({ quality })
    .toFile(outputPath);
  return outputPath;
}

async function uploadToSupabase(filePath, slug, supabaseUrl, anonKey) {
  const fileContent = fs.readFileSync(filePath);
  const fileName = `blog/${slug}-hero.webp`;

  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/storage/v1/object/public-images/${fileName}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'image/webp',
        'Content-Length': fileContent.length,
        'x-upsert': 'true',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(`${supabaseUrl}/storage/v1/object/public/public-images/${fileName}`);
        } else {
          // Si falla el upload, usar URL de Unsplash como fallback
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(fileContent);
    req.end();
  });
}

/**
 * Procesa las imágenes para todos los posts
 * Devuelve el plan con cover_image_url añadido a cada post
 */
async function processImages(dailyPlan, config) {
  const { PEXELS_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, OUTPUT_DIR } = config;
  const blogImagesDir = path.join(process.cwd(), 'public/images/blog');
  if (!fs.existsSync(blogImagesDir)) fs.mkdirSync(blogImagesDir, { recursive: true });

  const posts = [];
  for (const post of dailyPlan.posts) {
    console.log(`  🖼️  Procesando imagen para: ${post.slug}`);
    const query = getImageQuery(post);
    let sourceUrl = null;
    let coverImageUrl = null;

    try {
      // 1. Buscar en Pexels
      if (PEXELS_API_KEY) {
        sourceUrl = await searchPexels(query.pexels, PEXELS_API_KEY);
      }
    } catch {
      console.log(`    Pexels no disponible — usando Unsplash fallback`);
    }

    // 2. Fallback: Unsplash CDN (sin API key, URL directa)
    if (!sourceUrl) {
      sourceUrl = `https://images.unsplash.com/photo-${query.unsplash}?w=1200&q=80&fm=jpg`;
    }

    try {
      const tempPath = path.join(OUTPUT_DIR, `temp-${post.slug}.jpg`);
      const webpHeroPath = path.join(blogImagesDir, `${post.slug}-hero.webp`);

      // 3. Descargar fuente
      await downloadFile(sourceUrl, tempPath);

      // 4. Convertir a WebP 1200x630 (OG image)
      await convertToWebP(tempPath, webpHeroPath, 1200, 630, 85);
      fs.unlinkSync(tempPath);

      // 5. Subir a Supabase Storage (opcional)
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const storageUrl = await uploadToSupabase(webpHeroPath, post.slug, SUPABASE_URL, SUPABASE_ANON_KEY);
        coverImageUrl = storageUrl || `/images/blog/${post.slug}-hero.webp`;
      } else {
        coverImageUrl = `/images/blog/${post.slug}-hero.webp`;
      }

      console.log(`    ✓ ${post.slug}-hero.webp generada`);
    } catch (err) {
      console.warn(`    ⚠️  Error procesando imagen: ${err.message}`);
      // Usar imagen genérica del sitio como fallback
      coverImageUrl = '/images/hero-barbershop.webp';
    }

    posts.push({ ...post, cover_image_url: coverImageUrl });
  }

  return { ...dailyPlan, posts };
}

module.exports = { processImages };
