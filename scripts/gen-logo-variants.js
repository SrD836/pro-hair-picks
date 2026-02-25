/**
 * gen-logo-variants.js — Genera variantes de logo WebP para srcSet retina
 * Uso: node scripts/gen-logo-variants.js
 */
const sharp = require("sharp");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "../public");

const sizes = [
  { input: "logo-full.png",    output: "logo-80.webp",          size: 80  },
  { input: "logo-full.png",    output: "logo-160.webp",         size: 160 },
  { input: "logo-full.png",    output: "logo-240.webp",         size: 240 },
  { input: "logo-full.png",    output: "logo-320.webp",         size: 320 },
  { input: "logo-compact.png", output: "logo-compact-40.webp",  size: 40  },
  { input: "logo-compact.png", output: "logo-compact-80.webp",  size: 80  },
  { input: "logo-compact.png", output: "logo-compact-160.webp", size: 160 },
];

Promise.all(
  sizes.map(({ input, output, size }) =>
    sharp(path.join(PUBLIC, input))
      .resize(size, size)
      .webp({ quality: 85 })
      .toFile(path.join(PUBLIC, output))
      .then((r) => console.log(`✓ ${output.padEnd(28)} ${(r.size / 1024).toFixed(1)} KB`))
  )
).catch((e) => { console.error(e); process.exit(1); });
