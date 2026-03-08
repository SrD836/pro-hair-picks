#!/usr/bin/env node
/**
 * health-check.js — Verifica que el pipeline ejecutó exitosamente hoy.
 * Lee output/last_success.txt y compara con la fecha actual.
 *
 * Uso:
 *   node scripts/daily-content/health-check.js
 *
 * Códigos de salida:
 *   0 — Pipeline ejecutado hoy
 *   1 — Pipeline NO ejecutado hoy (o nunca)
 */

const fs   = require('fs');
const path = require('path');

const LAST_SUCCESS_PATH = path.join(__dirname, 'output', 'last_success.txt');
const PIPELINE_LOG      = path.join(__dirname, 'output', 'pipeline.log');
const today             = new Date().toISOString().slice(0, 10);

console.log(`Health check — ${new Date().toISOString()}`);
console.log(`Hoy: ${today}`);

if (!fs.existsSync(LAST_SUCCESS_PATH)) {
  console.error('ALERTA: last_success.txt no existe — el pipeline nunca ha completado exitosamente o el archivo fue eliminado.');
  console.error(`Ruta esperada: ${LAST_SUCCESS_PATH}`);
  process.exit(1);
}

const lastSuccessRaw  = fs.readFileSync(LAST_SUCCESS_PATH, 'utf8').trim();
const lastSuccessDate = lastSuccessRaw.slice(0, 10);

if (lastSuccessDate === today) {
  console.log(`OK: Pipeline completado hoy a las ${lastSuccessRaw.slice(11, 19)} UTC`);

  // Verificar si el último día fue incompleto (< 5 posts)
  const LAST_INCOMPLETE_PATH = path.join(__dirname, 'output', 'last_incomplete.txt');
  if (fs.existsSync(LAST_INCOMPLETE_PATH)) {
    const incompleteContent = fs.readFileSync(LAST_INCOMPLETE_PATH, 'utf8').trim();
    if (incompleteContent.startsWith(today)) {
      console.warn(`ALERTA: Pipeline de hoy fue INCOMPLETO:\n${incompleteContent}`);
      // No salir con error — el pipeline corrió pero fue parcial
    }
  }

  process.exit(0);
}

// Fallo — calcular días perdidos y mostrar últimas líneas del log
const daysMissed = Math.floor(
  (new Date(today) - new Date(lastSuccessDate)) / 86400000
);

console.error(`ALERTA: Último pipeline exitoso fue ${lastSuccessDate} (${daysMissed} día(s) sin ejecutar)`);

if (fs.existsSync(PIPELINE_LOG)) {
  const lines = fs.readFileSync(PIPELINE_LOG, 'utf8').trim().split('\n');
  const tail  = lines.slice(-10);
  console.error('\nÚltimas 10 líneas de pipeline.log:');
  tail.forEach(l => console.error('  ' + l));
} else {
  console.error('pipeline.log no encontrado.');
}

process.exit(1);
