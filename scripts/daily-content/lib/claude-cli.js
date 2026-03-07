/**
 * claude-cli.js — Wrapper para llamar a `claude -p` (modo no-interactivo)
 * Usa la autenticación existente de Claude Code (suscripción del usuario).
 * No requiere ANTHROPIC_API_KEY separada.
 *
 * IMPORTANTE: Ejecutar este script FUERA de una sesión de Claude Code activa.
 * Desde una terminal independiente: npm run content
 */
const { spawnSync } = require('child_process');

/**
 * Llama a `claude -p "prompt"` y devuelve el texto de la respuesta.
 * @param {string} prompt
 * @param {object} options
 * @param {number} options.timeout — ms (default: 3 min)
 * @returns {string}
 */
function callClaude(prompt, options = {}) {
  const timeout = options.timeout || 180_000; // 3 minutos por defecto

  // Eliminar CLAUDECODE del env para permitir ejecución standalone
  const env = { ...process.env };
  delete env.CLAUDECODE;

  const result = spawnSync('claude', ['-p', prompt], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024, // 10 MB
    timeout,
    env,
  });

  if (result.error) {
    if (result.error.code === 'ETIMEDOUT') {
      throw new Error(`Timeout (${timeout / 1000}s) esperando respuesta de Claude`);
    }
    throw result.error;
  }

  if (result.status !== 0) {
    const errMsg = result.stderr || result.stdout || 'Error desconocido';
    throw new Error(`claude -p terminó con código ${result.status}: ${errMsg.slice(0, 200)}`);
  }

  return result.stdout.trim();
}

/**
 * Extrae el primer bloque JSON del texto de respuesta de Claude.
 * Claude a veces añade texto explicativo antes/después del JSON,
 * trailing commas o saltos de línea dentro de strings.
 */
function extractJSON(text, arrayExpected = false) {
  const open  = arrayExpected ? '[' : '{';
  const close = arrayExpected ? ']' : '}';
  const start = text.indexOf(open);
  const end   = text.lastIndexOf(close);
  if (start === -1 || end === -1) throw new Error(`No se encontró JSON en la respuesta`);
  const raw = text.slice(start, end + 1);

  // Intento 1: parseo directo
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // Intento 2: sanitización
  try {
    let sanitized = raw
      // Eliminar trailing commas antes de } y ]
      .replace(/,(\s*[}\]])/g, '$1')
      // Reemplazar saltos de línea literales dentro de strings JSON
      .replace(/"((?:[^"\\]|\\.)*)"/g, (match) =>
        match.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
      );
    return JSON.parse(sanitized);
  } catch (_) {}

  // Intento 3: regex permisivo — extraer strings individuales del JSON
  throw new Error(`No se pudo parsear JSON (${raw.slice(0, 80).replace(/\n/g, ' ')}...)`);
}

module.exports = { callClaude, extractJSON };
