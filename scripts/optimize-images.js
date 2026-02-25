/**
 * optimize-images.js
 * Genera versiones WebP optimizadas de todos los assets estáticos.
 * Uso: node scripts/optimize-images.js
 * Requiere: npm install -g sharp-cli  (o sharp instalado localmente)
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const PUBLIC = path.resolve(__dirname, "../public");
const IMAGES = path.join(PUBLIC, "images");

async function run() {
  const tasks = [
    // ─── Logos redimensionados para uso responsive ───────────────────────────
    {
      input: path.join(PUBLIC, "logo-full.png"),
      output: path.join(PUBLIC, "logo-80.webp"),
      opts: { width: 80 },
    },
    {
      input: path.join(PUBLIC, "logo-full.png"),
      output: path.join(PUBLIC, "logo-160.webp"),
      opts: { width: 160 },
    },
    {
      input: path.join(PUBLIC, "logo-compact.png"),
      output: path.join(PUBLIC, "logo-compact-40.webp"),
      opts: { width: 40 },
    },
    {
      input: path.join(PUBLIC, "logo-compact.png"),
      output: path.join(PUBLIC, "logo-compact-80.webp"),
      opts: { width: 80 },
    },
    // ─── Hero: 1440px ancho, quality 70 → objetivo <80KB ─────────────────────
    {
      input: path.join(IMAGES, "hero-barbershop.jpg"),
      output: path.join(IMAGES, "hero-barbershop.webp"),
      opts: { width: 1440, quality: 70 },
    },
    // ─── Section salon a 601px (ancho real renderizado) ──────────────────────
    {
      input: path.join(IMAGES, "section-salon.jpg"),
      output: path.join(IMAGES, "section-salon-601.webp"),
      opts: { width: 601, quality: 80 },
    },
    // ─── Resto de secciones ───────────────────────────────────────────────────
    {
      input: path.join(IMAGES, "section-barber.jpg"),
      output: path.join(IMAGES, "section-barber.webp"),
      opts: { width: 1440, quality: 80 },
    },
    {
      input: path.join(IMAGES, "section-mixto.jpg"),
      output: path.join(IMAGES, "section-mixto.webp"),
      opts: { width: 1440, quality: 80 },
    },
  ];

  console.log("🖼  Optimizando imágenes...\n");

  for (const task of tasks) {
    if (!fs.existsSync(task.input)) {
      console.warn(`⚠  Skipping (not found): ${path.basename(task.input)}`);
      continue;
    }
    const s = sharp(task.input);
    if (task.opts.width) s.resize(task.opts.width);
    await s.webp({ quality: task.opts.quality ?? 85 }).toFile(task.output);
    const size = fs.statSync(task.output).size;
    console.log(`✓  ${path.basename(task.output).padEnd(28)} ${(size / 1024).toFixed(1)} KB`);
  }

  console.log("\n✅ Listo. Ejecuta 'npm run build' para incluir los assets en el deploy.");
}

run().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
