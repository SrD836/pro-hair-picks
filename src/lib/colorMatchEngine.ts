// ── Expert Color Matcher Engine ──────────────────────
// Based on professional colorimetry, seasonal analysis, and level/reflect theory.

export type SkinTone = "light" | "medium" | "tan" | "dark";
export type Undertone = "cool" | "warm" | "neutral";
export type EyeColor = "blue_gray" | "green" | "hazel" | "brown" | "black";
export type Season = "winter" | "summer" | "autumn" | "spring";

export interface UserProfile {
  skinTone: SkinTone;
  undertone: Undertone;
  eyeColor: EyeColor;
  naturalLevel: number; // 1-10
  currentLevel: number; // 1-10
}

export interface ColorRecommendation {
  code: string;           // e.g. "7.31"
  name: { es: string; en: string };
  description: { es: string; en: string };
  hexPreview: string;
  season: Season;
  verdict: { es: string; en: string };
  complementary: { hex: string; name: { es: string; en: string } }[];
  levelJump: number;
  requiresSalon: boolean;
}

// ── Season determination ──────────────────────────────
export function determineSeason(profile: UserProfile): Season {
  const { skinTone, undertone, eyeColor } = profile;
  const intensEyes = eyeColor === "blue_gray" || eyeColor === "black" || eyeColor === "green";
  const lightEyes = eyeColor === "blue_gray" || eyeColor === "green" || eyeColor === "hazel";

  if (undertone === "cool") {
    if ((skinTone === "light" || skinTone === "dark") && intensEyes) return "winter";
    if ((skinTone === "light" || skinTone === "medium") && lightEyes) return "summer";
    return "winter";
  }
  if (undertone === "warm") {
    if (skinTone === "tan" || skinTone === "dark") return "autumn";
    if (skinTone === "light" || skinTone === "medium") return "spring";
    return "autumn";
  }
  // Neutral → blend based on skin
  if (skinTone === "light") return "summer";
  if (skinTone === "medium") return "spring";
  if (skinTone === "tan") return "autumn";
  return "winter";
}

// ── Color database ────────────────────────────────────
interface ColorEntry {
  code: string;
  hex: string;
  name: { es: string; en: string };
  level: number;
  reflect: number; // .0 natural, .1 ash, .2 iridescent, .3 gold, .4 copper, .5 mahogany, .6 red
  seasons: Season[];
  undertones: Undertone[];
}

const COLOR_DB: ColorEntry[] = [
  // ── Winters ──
  { code: "1.0", hex: "#0a0a0a", name: { es: "Negro Azabache", en: "Jet Black" }, level: 1, reflect: 0, seasons: ["winter"], undertones: ["cool", "neutral"] },
  { code: "9.1", hex: "#c4b49a", name: { es: "Rubio Muy Claro Ceniza", en: "Very Light Ash Blonde" }, level: 9, reflect: 1, seasons: ["winter", "summer"], undertones: ["cool"] },
  { code: "5.62", hex: "#6b2340", name: { es: "Castaño Claro Rojo Violeta", en: "Light Brown Red Violet" }, level: 5, reflect: 6, seasons: ["winter"], undertones: ["cool"] },
  { code: "4.5", hex: "#5c2020", name: { es: "Castaño Caoba", en: "Mahogany Brown" }, level: 4, reflect: 5, seasons: ["winter", "autumn"], undertones: ["cool", "neutral"] },

  // ── Summers ──
  { code: "8.1", hex: "#b8a88a", name: { es: "Rubio Claro Ceniza", en: "Light Ash Blonde" }, level: 8, reflect: 1, seasons: ["summer"], undertones: ["cool", "neutral"] },
  { code: "7.1", hex: "#9a8a70", name: { es: "Rubio Ceniza", en: "Ash Blonde" }, level: 7, reflect: 1, seasons: ["summer"], undertones: ["cool"] },
  { code: "6.1", hex: "#7a6a55", name: { es: "Rubio Oscuro Ceniza", en: "Dark Ash Blonde" }, level: 6, reflect: 1, seasons: ["summer"], undertones: ["cool", "neutral"] },
  { code: "7.2", hex: "#a08a78", name: { es: "Rubio Irisado", en: "Iridescent Blonde" }, level: 7, reflect: 2, seasons: ["summer"], undertones: ["cool"] },

  // ── Autumns ──
  { code: "6.4", hex: "#8a5530", name: { es: "Rubio Oscuro Cobrizo", en: "Dark Copper Blonde" }, level: 6, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.4", hex: "#7a4520", name: { es: "Castaño Claro Cobrizo", en: "Light Copper Brown" }, level: 5, reflect: 4, seasons: ["autumn"], undertones: ["warm", "neutral"] },
  { code: "4.3", hex: "#6a4528", name: { es: "Castaño Chocolate Dorado", en: "Golden Chocolate Brown" }, level: 4, reflect: 3, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.5", hex: "#6e3028", name: { es: "Castaño Claro Caoba", en: "Light Mahogany Brown" }, level: 5, reflect: 5, seasons: ["autumn"], undertones: ["warm", "neutral"] },
  { code: "7.4", hex: "#a06a40", name: { es: "Rubio Cobrizo", en: "Copper Blonde" }, level: 7, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },

  // ── Springs ──
  { code: "8.3", hex: "#c4a060", name: { es: "Rubio Claro Dorado", en: "Light Golden Blonde" }, level: 8, reflect: 3, seasons: ["spring"], undertones: ["warm", "neutral"] },
  { code: "7.3", hex: "#a08850", name: { es: "Rubio Dorado", en: "Golden Blonde" }, level: 7, reflect: 3, seasons: ["spring"], undertones: ["warm"] },
  { code: "6.3", hex: "#8a7040", name: { es: "Rubio Oscuro Dorado", en: "Dark Golden Blonde" }, level: 6, reflect: 3, seasons: ["spring"], undertones: ["warm", "neutral"] },
  { code: "7.31", hex: "#a89060", name: { es: "Rubio Dorado Ceniza", en: "Golden Ash Blonde" }, level: 7, reflect: 3, seasons: ["spring", "summer"], undertones: ["neutral", "warm"] },
  { code: "5.3", hex: "#7a6038", name: { es: "Castaño Claro Dorado", en: "Light Golden Brown" }, level: 5, reflect: 3, seasons: ["spring"], undertones: ["warm"] },

  // ── Neutrals / versatile ──
  { code: "6.0", hex: "#7a6a50", name: { es: "Rubio Oscuro Natural", en: "Natural Dark Blonde" }, level: 6, reflect: 0, seasons: ["summer", "spring"], undertones: ["neutral"] },
  { code: "5.0", hex: "#5a4a38", name: { es: "Castaño Claro Natural", en: "Natural Light Brown" }, level: 5, reflect: 0, seasons: ["autumn", "spring"], undertones: ["neutral"] },
  { code: "10.1", hex: "#e8dcc8", name: { es: "Rubio Platino", en: "Platinum Blonde" }, level: 10, reflect: 1, seasons: ["winter", "summer"], undertones: ["cool"] },
  { code: "3.0", hex: "#3a2a1e", name: { es: "Castaño Oscuro Natural", en: "Natural Dark Brown" }, level: 3, reflect: 0, seasons: ["winter", "autumn"], undertones: ["neutral", "cool", "warm"] },
];

// ── Main recommendation algorithm ─────────────────────
export function getRecommendation(profile: UserProfile): ColorRecommendation {
  const season = determineSeason(profile);
  const levelJump = Math.abs(profile.currentLevel - profile.naturalLevel);

  // Score each color
  const scored = COLOR_DB.map((c) => {
    let score = 0;

    // Season match (highest weight)
    if (c.seasons.includes(season)) score += 40;

    // Undertone match
    if (c.undertones.includes(profile.undertone)) score += 25;

    // Level proximity to natural (prefer ±2 levels from natural)
    const levelDist = Math.abs(c.level - profile.naturalLevel);
    score += Math.max(0, 20 - levelDist * 5);

    // Neutralization rules
    // Skin with redness → avoid reds/coppers, favor ash
    if (profile.undertone === "cool" && profile.skinTone === "light") {
      if (c.reflect === 1 || c.reflect === 2) score += 10; // ash/iridescent
      if (c.reflect === 4 || c.reflect === 6) score -= 15; // copper/red
    }

    // Dull/grayish skin → favor gold/copper for warmth
    if (profile.undertone === "warm" && (profile.skinTone === "medium" || profile.skinTone === "tan")) {
      if (c.reflect === 3 || c.reflect === 4) score += 10;
    }

    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const complementary = scored
    .slice(1)
    .filter((c) => c.code !== best.code)
    .slice(0, 3);

  const targetLevelJump = Math.abs(best.level - profile.currentLevel);
  const requiresSalon = targetLevelJump > 3;

  // Build verdict
  const verdictEs = buildVerdictEs(season, profile, best);
  const verdictEn = buildVerdictEn(season, profile, best);

  return {
    code: best.code,
    name: best.name,
    description: {
      es: `Nivel ${best.level} con reflejo ${getReflectNameEs(best.reflect)}. Ideal para la estación ${getSeasonNameEs(season)}.`,
      en: `Level ${best.level} with ${getReflectNameEn(best.reflect)} reflect. Ideal for the ${season} season.`,
    },
    hexPreview: best.hex,
    season,
    verdict: { es: verdictEs, en: verdictEn },
    complementary: complementary.map((c) => ({
      hex: c.hex,
      name: c.name,
    })),
    levelJump: targetLevelJump,
    requiresSalon,
  };
}

// ── Helpers ───────────────────────────────────────────
function getReflectNameEs(r: number): string {
  const map: Record<number, string> = { 0: "Natural", 1: "Ceniza", 2: "Irisado", 3: "Dorado", 4: "Cobrizo", 5: "Caoba", 6: "Rojo" };
  return map[r] ?? "Natural";
}
function getReflectNameEn(r: number): string {
  const map: Record<number, string> = { 0: "Natural", 1: "Ash", 2: "Iridescent", 3: "Golden", 4: "Copper", 5: "Mahogany", 6: "Red" };
  return map[r] ?? "Natural";
}
function getSeasonNameEs(s: Season): string {
  const map: Record<Season, string> = { winter: "Invierno", summer: "Verano", autumn: "Otoño", spring: "Primavera" };
  return map[s];
}

function buildVerdictEs(season: Season, profile: UserProfile, color: ColorEntry): string {
  const skinMap: Record<SkinTone, string> = { light: "clara", medium: "media", tan: "bronceada", dark: "oscura" };
  const eyeMap: Record<EyeColor, string> = { blue_gray: "claros", green: "verdes", hazel: "miel", brown: "marrones", black: "oscuros" };
  return `Con tu piel ${skinMap[profile.skinTone]} y ojos ${eyeMap[profile.eyeColor]}, perteneces a la estación ${getSeasonNameEs(season)}. El tono ${color.name.es} (${color.code}) crea un contraste armonioso que realza tus rasgos naturales. El reflejo ${getReflectNameEs(color.reflect).toLowerCase()} ${profile.undertone === "cool" ? "neutraliza la calidez no deseada y aporta luminosidad fría" : profile.undertone === "warm" ? "potencia tu calidez natural y aporta brillo" : "equilibra perfectamente tu tono de piel"}.`;
}

function buildVerdictEn(season: Season, profile: UserProfile, color: ColorEntry): string {
  const skinMap: Record<SkinTone, string> = { light: "light", medium: "medium", tan: "tan", dark: "dark" };
  const eyeMap: Record<EyeColor, string> = { blue_gray: "light", green: "green", hazel: "hazel", brown: "brown", black: "dark" };
  return `With your ${skinMap[profile.skinTone]} skin and ${eyeMap[profile.eyeColor]} eyes, you belong to the ${season} season. The ${color.name.en} shade (${color.code}) creates a harmonious contrast that enhances your natural features. The ${getReflectNameEn(color.reflect).toLowerCase()} reflect ${profile.undertone === "cool" ? "neutralizes unwanted warmth and adds cool luminosity" : profile.undertone === "warm" ? "enhances your natural warmth and adds brilliance" : "perfectly balances your skin tone"}.`;
}
