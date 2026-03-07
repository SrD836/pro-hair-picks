'use strict';
const { getKeywordForDay, getKeywords } = require('./keyword-loader');

const today = new Date().toISOString().split('T')[0];

console.log('\n📊 Cargando keywords de Semrush...\n');

const es = getKeywords('es');
const us = getKeywords('us');

console.log(`Keywords filtradas ES: ${es.length}`);
console.log(`Keywords filtradas US: ${us.length}`);
console.log(`\nMuestra top-5 ES: ${es.slice(0, 5).join(' | ')}`);
console.log(`Muestra top-5 US: ${us.slice(0, 5).join(' | ')}`);

console.log(`\n📅 Keywords para hoy (${today}):\n`);
console.log(`  Slot 1 [core ES]    : ${getKeywordForDay('es', today, 0)}`);
console.log(`  Slot 2 [core ES]    : ${getKeywordForDay('es', today, 1)}`);
console.log(`  Slot 3 [core US]    : ${getKeywordForDay('us', today, 0)}`);
console.log(`  Slot 4 [bridge ES]  : ${getKeywordForDay('es', today, 2)}`);
console.log(`  Slot 5 [negocio ES] : ${getKeywordForDay('es', today, 3)}`);

console.log('\n📅 Keywords para mañana:\n');
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
console.log(`  Slot 1 [core ES]    : ${getKeywordForDay('es', tomorrow, 0)}`);
console.log(`  Slot 2 [core ES]    : ${getKeywordForDay('es', tomorrow, 1)}`);
console.log(`  Slot 3 [core US]    : ${getKeywordForDay('us', tomorrow, 0)}`);
console.log(`  Slot 4 [bridge ES]  : ${getKeywordForDay('es', tomorrow, 2)}`);
console.log(`  Slot 5 [negocio ES] : ${getKeywordForDay('es', tomorrow, 3)}`);

console.log(`\n✅ Test completado\n`);
