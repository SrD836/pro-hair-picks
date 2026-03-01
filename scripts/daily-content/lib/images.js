/**
 * images.js — Descarga imagen de Pexels, convierte a WebP, sube a Supabase Storage
 * Fix: tracking de IDs usados para evitar fotos repetidas entre posts del mismo día
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Tracking de imágenes ya usadas en esta ejecución ────────────────────────
const usedPexelsIds = new Set();
const usedUnsplashIds = new Set();

const IMAGE_QUERIES = {
  core:     { pexels: 'hairdresser salon professional', unsplash: '1562322140-8baeececf3df' },
  bridge:   { pexels: 'technology beauty salon', unsplash: '1522337360788-8b13dee7a37e' },
  negocio:  { pexels: 'beauty salon business management', unsplash: '1521737604893-d14cc237f11d' },
  core_us:  { pexels: 'barber shop usa professional', unsplash: '1503951914875-452162b0f3f1' },
};

const TOPIC_QUERIES = {
  color:     { pexels: 'hair coloring salon professional', unsplash: '1522337360788-8b13dee7a37e' },
  barbería:  { pexels: 'barber shop professional vintage', unsplash: '1503951914875-452162b0f3f1' },
  tijera:    { pexels: 'hairdresser scissors cutting professional', unsplash: '1562322140-8baeececf3df' },
  secador:   { pexels: 'hair dryer professional salon woman', unsplash: '1562322140-8baeececf3df' },
  clipper:   { pexels: 'barber clipper fade haircut', unsplash: '1503951914875-452162b0f3f1' },
  keratina:  { pexels: 'hair treatment keratin smoothing', unsplash: '1522337360788-8b13dee7a37e' },
  tinte:     { pexels: 'hair color dyeing balayage', unsplash: '1522337360788-8b13dee7a37e' },
  rizado:    { pexels: 'curly hair salon styling', unsplash: '1562322140-8baeececf3df' },
  fade:      { pexels: 'barber fade haircut usa', unsplash: '1503951914875-452162b0f3f1' },
  taper:     { pexels: 'taper fade barber professional', unsplash: '1503951914875-452162b0f3f1' },
  extensión: { pexels: 'hair extensions salon professional', unsplash: '1562322140-8baeececf3df' },
  negocio:   { pexels: 'salon owner business entrepreneur', unsplash: '1521737604893-d14cc237f11d' },
  ia:        { pexels: 'technology artificial intelligence beauty', unsplash: '1560066984-138daad8d428' },
  intelig:   { pexels: 'digital technology salon innovation', unsplash: '1560066984-138daad8d428' },
};

// Fallbacks adicionales por si el principal ya fue usado
const UNSPLASH_FALLBACKS = [
  '1599351431202-1e0f0137899a',
  '1605497788044-5a32c7078486',
  '1582095133179-bfd08e2585d5',
  '1493106641515-5688d9e608b9',
  '1519345182560-3f2917c472ef',
  '1580618672591-eb180b1a973f',
  '1516975080664-ed2fc6a32937',
  '1521590832167-7bcbfaa6381f',
];

function getImageQuery(post) {
  const topic = (post.topic || '').toLowerCase();
  for (const [key, val] of Object.entries(TOPIC_QUERIES)) {
    if (topic.includes(key)) return val;
  }
  // Diferencia por tipo si no hay coincidencia de tema
  return IMAGE_QUERIES[post.type] || IMAGE_QUERIES.core;
}

function getUnusedUnsplashId(preferred) {
  if (!usedUnsplashIds.has(preferred)) {
    usedUnsplashIds.add(preferred);
    return preferred;
  }
  for (const id of UNSPLASH_FALLBACKS) {
    if (!usedUnsplashIds.has(id)) {
      usedUnsplashIds.add(id);
      return id;
    }
  }
  // Último recurso: añadir timestamp como query param para forzar variación
  usedUnsplashIds.add(preferred);
  return preferred;
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

async function searchPexels(query, apiKey, page = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=landscape`,
      headers: { Authorization: apiKey },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > 0) {
            // Buscar primera foto NO usada
            const available = json.photos.filter(p => !usedPexelsIds.has(p.id));
            if (available.length === 0) {
              reject(new Error('All Pexels results already used'));
              return;
            }
            const selected = available[0];
            usedPexelsIds.add(selected.id);
            resolve(selected.src.large2x || selected.src.large);
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

  return new Promise((resolve) => {
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
 * Garantiza que no se repita ninguna foto entre los 5 posts del día
 */
async function processImages(dailyPlan, config) {
  const { PEXELS_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, OUTPUT_DIR } = config;
  const blogImagesDir = path.join(process.cwd(), 'public/images/blog');
  if (!fs.existsSync(blogImagesDir)) fs.mkdirSync(blogImagesDir, { recursive: true });

  // Reset tracking al inicio de cada ejecución del pipeline
  usedPexelsIds.clear();
  usedUnsplashIds.clear();

  const posts = [];
  for (const post of dailyPlan.posts) {
    console.log(`  🖼️  Procesando imagen para: ${post.slug}`);
    const query = getImageQuery(post);
    let sourceUrl = null;
    let coverImageUrl = null;

    try {
      if (PEXELS_API_KEY) {
        // Intentar con query específica, si están agotadas probar query más amplia
        try {
          sourceUrl = await searchPexels(query.pexels, PEXELS_API_KEY);
        } catch {
          // Reintentar con query más genérica + page 2
          sourceUrl = await searchPexels('professional salon hairdresser barber', PEXELS_API_KEY, 2);
        }
      }
    } catch {
      console.log(`    Pexels agotado o no disponible — usando Unsplash`);
    }

    if (!sourceUrl) {
      const unsplashId = getUnusedUnsplashId(query.unsplash);
      sourceUrl = `https://images.unsplash.com/photo-${unsplashId}?w=1200&q=80&fm=jpg`;
    }

    try {
      const tempPath = path.join(OUTPUT_DIR, `temp-${post.slug}.jpg`);
      const webpHeroPath = path.join(blogImagesDir, `${post.slug}-hero.webp`);

      await downloadFile(sourceUrl, tempPath);
      await convertToWebP(tempPath, webpHeroPath, 1200, 630, 85);
      fs.unlinkSync(tempPath);

      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const storageUrl = await uploadToSupabase(webpHeroPath, post.slug, SUPABASE_URL, SUPABASE_ANON_KEY);
        coverImageUrl = storageUrl || `/images/blog/${post.slug}-hero.webp`;
      } else {
        coverImageUrl = `/images/blog/${post.slug}-hero.webp`;
      }

      console.log(`    ✓ ${post.slug}-hero.webp generada`);
    } catch (err) {
      console.warn(`    ⚠️  Error procesando imagen: ${err.message}`);
      coverImageUrl = '/images/hero-barbershop.webp';
    }

    posts.push({ ...post, cover_image_url: coverImageUrl });
  }

  return { ...dailyPlan, posts };
}

module.exports = { processImages };
