import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const _slugFrom = 'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ';
const _slugTo   = 'aeiouaeiouaeiounAEIOUAEIOUAEIOUN';
const _slugCharMap: Record<string, string> = {};
for (let i = 0; i < _slugFrom.length; i++) _slugCharMap[_slugFrom[i]] = _slugTo[i];

export function toProductSlug(name: string): string {
  return name
    .split('')
    .map((c) => _slugCharMap[c] ?? c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Parity assertions — verify JS output matches SQL translate() formula
console.assert(toProductSlug('Wahl Senior') === 'wahl-senior', 'slug parity: Wahl Senior');
console.assert(toProductSlug('Panasonic ER-1512 - Cortapelos') === 'panasonic-er-1512-cortapelos', 'slug parity: ER-1512');
console.assert(toProductSlug('Diseño Antiquemaduras') === 'diseno-antiquemaduras', 'slug parity: accents');
