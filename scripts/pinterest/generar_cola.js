#!/usr/bin/env node
/**
 * generar_cola.js — Genera pins_prueba.json a partir de articulos.json
 *
 * Lee: scripts/pinterest/articulos.json
 *   [ { "titulo": "...", "url": "https://guiadelsalon.com/...", "board_id": "..." } ]
 *
 * Escribe: scripts/pinterest/pins_prueba.json
 *   Listo para: npm run pinterest:publish -- --queue=scripts/pinterest/pins_prueba.json
 *
 * Reglas de descripción:
 *   - Máximo 120 caracteres totales
 *   - 1-2 emoticonos al principio según tema
 *   - Tono comercial directo, beneficio claro
 *   - CTA fijo: "→ Guía completa en GuiaDelSalon.com"
 *
 * Uso: node scripts/pinterest/generar_cola.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Rutas ──────────────────────────────────────────────────────────────────
const ARTICULOS_PATH = path.join(__dirname, 'articulos.json');
const OUTPUT_PATH    = path.join(__dirname, 'pins_prueba.json');

// Último recurso si el artículo no tiene imagen y tampoco hay OG image
const FALLBACK_IMAGE_LAST = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=1800&fit=crop';

// ── CTA fijo ───────────────────────────────────────────────────────────────
const CTA     = '→ Guía completa en GuiaDelSalon.com';
const MAX_LEN = 120;

// Espacio disponible para cuerpo (emoji + espacio + cuerpo + espacio + CTA)
// Se calcula dinámicamente según la longitud del emoji elegido

// ── Diccionario de imperativos ES (infinitivo → tú imperativo) ────────────
const IMPERATIVOS = {
  elegir:      'Elige',
  escoger:     'Escoge',
  seleccionar: 'Selecciona',
  usar:        'Usa',
  utilizar:    'Utiliza',
  aplicar:     'Aplica',
  hacer:       'Haz',
  conseguir:   'Consigue',
  lograr:      'Logra',
  evitar:      'Evita',
  mejorar:     'Mejora',
  cuidar:      'Cuida',
  tratar:      'Trata',
  crear:       'Crea',
  conocer:     'Conoce',
  aprender:    'Aprende',
  descubrir:   'Descubre',
  entender:    'Entiende',
  identificar: 'Identifica',
  preparar:    'Prepara',
  dominar:     'Domina',
  combinar:    'Combina',
  proteger:    'Protege',
  reparar:     'Repara',
  hidratar:    'Hidrata',
  nutrir:      'Nutre',
  lavar:       'Lava',
  peinar:      'Peina',
  cortar:      'Corta',
  teñir:       'Tiñe',
  aclarar:     'Aclara',
  colorear:    'Colorea',
};

// ── Emojis por tema ────────────────────────────────────────────────────────
function pickEmojis(titulo) {
  const t = titulo.toLowerCase();
  if (/tinte|tono|coloraci|colorimetr|mechas|balayage|reflejo/.test(t)) return '✂️🎨';
  if (/barber|barbería|fade|degradado|navaja|beard|bigot/.test(t))       return '💈✂️';
  if (/canas|gris|canicie|plateado/.test(t))                             return '🌿✨';
  if (/alopecia|caída|pérdida|calvicie|densidad/.test(t))                return '💆‍♀️';
  if (/alisad|keratina|permanente|quím|liso/.test(t))                    return '🧴✨';
  if (/uñ|manicura|pedicura|nail/.test(t))                               return '💅✨';
  if (/color\b/.test(t))                                                 return '🎨✂️';
  return '✂️';
}

// ── Contexto profesional según tema ───────────────────────────────────────
function pickContext(titulo) {
  const t = titulo.toLowerCase();
  if (/tinte|tono|coloraci|colorimetr|mechas|balayage|color/.test(t)) return 'Técnica profesional de coloristas.';
  if (/barber|barbería|fade|degradado|navaja/.test(t))                 return 'Consejos de barberos expertos.';
  if (/canas|canicie/.test(t))                                         return 'Guía para coloristas profesionales.';
  if (/alopecia|caída/.test(t))                                        return 'Protocolo capilar profesional.';
  if (/alisad|keratina|quím/.test(t))                                  return 'Técnica de estilistas certificados.';
  return 'Técnica profesional de estilistas.';
}

// ── Normalizar vocal acentuada para lookup de diccionario ─────────────────
function normalizarVocales(str) {
  return str.replace(/[áéíóú]/g, c => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] || c));
}

// ── Construir cuerpo de descripción (sin emoji ni CTA) ────────────────────
function buildBody(titulo) {
  const t = titulo.trim();

  // Patrón: "Cómo [infinitivo] [resto]"
  const comoMatch = t.match(/^c[oó]mo\s+(\w+)\s+(.+)/i);
  if (comoMatch) {
    const infinitivoBruto = comoMatch[1].toLowerCase();
    const infinitivoNorm  = normalizarVocales(infinitivoBruto);
    const resto           = comoMatch[2].trim();
    const imperativo      = IMPERATIVOS[infinitivoNorm] || IMPERATIVOS[infinitivoBruto];
    if (imperativo) {
      const frase   = imperativo + ' ' + resto + ' sin errores.';
      const context = pickContext(t);
      return frase + ' ' + context;
    }
  }

  // Patrón: "Qué es [nombre]"
  if (/^qu[eé]\s+es\s+/i.test(t)) {
    const noun = t.replace(/^qu[eé]\s+es\s+/i, '').trim();
    return 'Descubre ' + noun.toLowerCase() + ' explicado por profesionales.';
  }

  // Patrón: "Guía [de/para/del] ..."
  if (/^gu[ií]a\s+(de|para|del|de la)\s+/i.test(t)) {
    return t + '. Paso a paso con técnica profesional.';
  }

  // Patrón: "Los mejores / Las mejores ..."
  if (/^los?\s+mejores?\s+|^las?\s+mejores?\s+/i.test(t)) {
    return t + ' recomendados por profesionales.';
  }

  // Fallback: título directo + contexto
  const context = pickContext(t);
  return t + '. ' + context;
}

// ── Truncar respetando límites de frase ───────────────────────────────────
function trimBody(body, maxChars) {
  if (body.length <= maxChars) return body;
  // Intentar cortar en el último punto antes del límite
  const dotIdx = body.lastIndexOf('.', maxChars);
  if (dotIdx > 10) return body.slice(0, dotIdx + 1);
  return body.slice(0, maxChars - 1) + '…';
}

// ── Ensamblar descripción completa ────────────────────────────────────────
function buildDescription(titulo) {
  const emojis = pickEmojis(titulo);
  const rawBody = buildBody(titulo);

  // Espacio disponible para el cuerpo: MAX_LEN - emoji - ' ' - ' ' - CTA
  const overhead = emojis.length + 1 + 1 + CTA.length; // emoji + espacio + espacio + cta
  const maxBody  = MAX_LEN - overhead;

  const body        = trimBody(rawBody, maxBody);
  const description = emojis + ' ' + body + ' ' + CTA;

  // Garantía final (por si emojis tienen longitud variable con surrogates)
  if (description.length > MAX_LEN) {
    const hardMax = MAX_LEN - CTA.length - emojis.length - 3;
    return emojis + ' ' + body.slice(0, hardMax) + '… ' + CTA;
  }
  return description;
}

// ── Título de pin: "[Tema principal] — GuiaDelSalon.com" (≤60 chars) ───────
const TITLE_SUFFIX = ' — GuiaDelSalon.com'; // 19 chars
const MAX_TITLE    = 60;
const MAX_TOPIC    = MAX_TITLE - TITLE_SUFFIX.length; // 41

// Prefijos a eliminar del inicio (se aplican en bucle hasta que no haya cambios)
const STRIP_LEAD = [
  /^c[oó]mo\s+hacer\s+/i,
  /^c[oó]mo\s+/i,
  /^descubr[ei]\s+/i,
  /^aprender?\s+/i,
  /^gu[ií]a\s+(de|para|del|completa)\s+/i,
  /^todo\s+sobre\s+/i,
  /^los?\s+/i,
  /^las?\s+/i,
  /^el\s+/i,
  /^la\s+/i,
  /^un\s+/i,
  /^una\s+/i,
];

// Preposiciones o artículos colgantes al final tras truncar
const TRAILING_PREPS = /\s+(de|del|en|para|con|y|a|o|e|al|un|una|los|las|el|la)$/i;

function buildPinTitle(titulo) {
  if (!titulo) return TITLE_SUFFIX.trim();
  let t = titulo.trim();

  // 1. Eliminar prefijos verbales/artículos en bucle (multi-pase)
  let prev;
  do {
    prev = t;
    for (const re of STRIP_LEAD) {
      const stripped = t.replace(re, '');
      if (stripped !== t) {
        t = stripped.charAt(0).toUpperCase() + stripped.slice(1);
        break;
      }
    }
  } while (t !== prev);

  // 2. Cortar en el primer ":" si aparece en rango razonable (extrae el tema)
  const colonIdx = t.indexOf(':');
  if (colonIdx > 3 && colonIdx < 55) {
    t = t.slice(0, colonIdx).trim();
  }

  // 3. Segundo pase de strip (puede quedar artículo tras extraer el tema del colon)
  do {
    prev = t;
    for (const re of STRIP_LEAD) {
      const stripped = t.replace(re, '');
      if (stripped !== t) {
        t = stripped.charAt(0).toUpperCase() + stripped.slice(1);
        break;
      }
    }
  } while (t !== prev);

  // 4. Truncar al límite de MAX_TOPIC en límite de palabra
  if (t.length > MAX_TOPIC) {
    const spaceIdx = t.lastIndexOf(' ', MAX_TOPIC - 1);
    t = spaceIdx > 3 ? t.slice(0, spaceIdx) : t.slice(0, MAX_TOPIC);
  }

  // 5. Eliminar preposición/artículo colgante al final
  t = t.replace(TRAILING_PREPS, '').trim();

  return t + TITLE_SUFFIX;
}

// ── Main ───────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(ARTICULOS_PATH)) {
    console.error('❌ No se encontró articulos.json en: ' + ARTICULOS_PATH);
    console.error('   Crea el archivo con formato:');
    console.error('   [ { "titulo": "...", "url": "https://guiadelsalon.com/...", "board_id": "..." } ]');
    process.exit(1);
  }

  let articulos;
  try {
    articulos = JSON.parse(fs.readFileSync(ARTICULOS_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ Error al parsear articulos.json: ' + e.message);
    process.exit(1);
  }

  if (!Array.isArray(articulos) || articulos.length === 0) {
    console.error('❌ articulos.json debe ser un array no vacío.');
    process.exit(1);
  }

  const usedImages = new Set();

  const pins = articulos.map((art, i) => {
    const titulo  = String(art.titulo   || '').trim();
    const url     = String(art.url      || '').trim();
    const boardId = String(art.board_id || '').trim();

    if (!titulo || !url || !boardId) {
      console.warn('⚠️  Artículo #' + (i + 1) + ' tiene campos incompletos — se incluye igual.');
    }

    // Imagen: 1) del artículo, 2) OG del post, 3) último fallback Unsplash
    const slug    = url.split('/blog/')[1] || '';
    const ogImage = slug ? 'https://guiadelsalon.com/og-' + slug + '.jpg' : null;
    let imageUrl  = art.image_url || ogImage || FALLBACK_IMAGE_LAST;

    // Deduplicación: si esta imagen ya se usó en la misma cola, usar OG o fallback
    if (usedImages.has(imageUrl)) {
      const alt = (ogImage && !usedImages.has(ogImage)) ? ogImage : FALLBACK_IMAGE_LAST;
      console.warn('⚠️  Pin #' + (i + 1) + ': imagen duplicada → usando fallback: ' + alt.slice(0, 60));
      imageUrl = alt;
    }
    usedImages.add(imageUrl);

    const imgOrigen = art.image_url
      ? 'supabase'
      : (ogImage ? 'og-fallback' : 'unsplash');

    return {
      title:       buildPinTitle(titulo),
      description: buildDescription(titulo),
      link:        url,
      board_id:    boardId,
      image_url:   imageUrl,
      _img_origen: imgOrigen,  // campo de auditoría, no se envía a Pinterest
    };
  });

  const pinsClean = pins.map(({ _img_origen, ...rest }) => rest);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(pinsClean, null, 2), 'utf8');

  // ── Preview ────────────────────────────────────────────────────────────
  const sep = '═'.repeat(64);
  const div = '─'.repeat(64);
  console.log('\n' + sep);
  console.log('  COLA GENERADA — ' + pins.length + ' pins → pins_prueba.json');
  console.log(sep);
  pins.forEach((pin, i) => {
    const tLen = pin.title.length;
    const dLen = pin.description.length;
    const tOk  = tLen <= 60  ? '✅' : '⚠️ ';
    const dOk  = dLen <= 120 ? '✅' : '⚠️ ';
    console.log('\n  ┌─ Pin #' + (i + 1) + ' ─────────────────────────────────────────');
    console.log('  │ Título:  ' + tOk + ' (' + tLen + '/60)  ' + pin.title);
    console.log('  │ Desc:    ' + dOk + ' (' + dLen + '/120) ' + pin.description);
    console.log('  │ Imagen:  [' + (pin._img_origen || '?') + '] ' + pin.image_url.slice(0, 65));
    console.log('  │ Link:    ' + pin.link);
    console.log('  └─ Board:  ' + pin.board_id);
  });
  console.log('\n' + div);
  console.log('  Guardado en: ' + path.relative(process.cwd(), OUTPUT_PATH));
  console.log(div);
  console.log('  ▸ npm run pinterest:publish -- --queue=scripts/pinterest/pins_prueba.json\n');
}

main();
