import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toProductSlug(name: string): string {
  const from = 'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ';
  const to   = 'aeiouaeiouaeiounAEIOUAEIOUAEIOUN';
  const charMap: Record<string, string> = {};
  for (let i = 0; i < from.length; i++) charMap[from[i]] = to[i];

  return name
    .split('')
    .map((c) => charMap[c] ?? c)
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
