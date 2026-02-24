// ── Expert Color Matcher Engine ──────────────────────
// Based on professional colorimetry, seasonal analysis, and level/reflect theory.

export type SkinTone = "light" | "medium" | "tan" | "dark";
export type Undertone = "cool" | "warm" | "neutral";
export type EyeColor = "blue_gray" | "green" | "hazel" | "brown" | "black";
export type Season = "winter" | "summer" | "autumn" | "spring";
export type VeinColor = "blue" | "green" | "mixed";
export type JewelryPref = "silver" | "gold" | "both";
export type ColorReaction = "pink" | "orange" | "both";

export type FantasyColor = "fantasy_red" | "fantasy_blue" | "fantasy_pink" | "fantasy_orange" | "fantasy_purple" | "fantasy_green";

export const FANTASY_COLORS: { value: FantasyColor; hex: string; label: { es: string; en: string } }[] = [
  { value: "fantasy_red", hex: "#c0392b", label: { es: "Rojo teñido", en: "Dyed Red" } },
  { value: "fantasy_blue", hex: "#2e86c1", label: { es: "Azul teñido", en: "Dyed Blue" } },
  { value: "fantasy_pink", hex: "#e074a8", label: { es: "Rosa teñido", en: "Dyed Pink" } },
  { value: "fantasy_orange", hex: "#e67e22", label: { es: "Naranja teñido", en: "Dyed Orange" } },
  { value: "fantasy_purple", hex: "#8e44ad", label: { es: "Morado teñido", en: "Dyed Purple" } },
  { value: "fantasy_green", hex: "#27ae60", label: { es: "Verde teñido", en: "Dyed Green" } },
];

// Compute undertone from 3 sub-tests
export function computeUndertone(veins: VeinColor, jewelry: JewelryPref, colorReaction: ColorReaction): Undertone {
  let coolPoints = 0;
  let warmPoints = 0;
  if (veins === "blue") coolPoints += 2;
  else if (veins === "green") warmPoints += 2;
  else { coolPoints += 1; warmPoints += 1; }

  if (jewelry === "silver") coolPoints += 1;
  else if (jewelry === "gold") warmPoints += 1;
  else { coolPoints += 0.5; warmPoints += 0.5; }

  if (colorReaction === "pink") coolPoints += 1;
  else if (colorReaction === "orange") warmPoints += 1;
  else { coolPoints += 0.5; warmPoints += 0.5; }

  if (coolPoints > warmPoints + 0.5) return "cool";
  if (warmPoints > coolPoints + 0.5) return "warm";
  return "neutral";
}

export interface UserProfile {
  skinTone: SkinTone;
  undertone: Undertone;
  eyeColor: EyeColor;
  naturalLevel: number;
  currentLevel: number;
  currentFantasy?: FantasyColor | null;
}

// Season clothing & avoid palettes
export interface SeasonStyle {
  icon: string; // emoji fallback
  clothingColors: { hex: string; name: { es: string; en: string } }[];
  avoidColors: { hex: string; name: { es: string; en: string } }[];
  contrast: { es: string; en: string };
}

export const SEASON_STYLES: Record<Season, SeasonStyle> = {
  winter: {
    icon: "❄️",
    clothingColors: [
      { hex: "#ffffff", name: { es: "Blanco puro", en: "Pure White" } },
      { hex: "#0a0a0a", name: { es: "Negro", en: "Black" } },
      { hex: "#0047ab", name: { es: "Azul Klein", en: "Klein Blue" } },
      { hex: "#c0392b", name: { es: "Rojo cereza", en: "Cherry Red" } },
      { hex: "#e8dcc8", name: { es: "Plata", en: "Silver" } },
    ],
    avoidColors: [
      { hex: "#f5deb3", name: { es: "Beige cálido", en: "Warm Beige" } },
      { hex: "#e67e22", name: { es: "Naranja", en: "Orange" } },
      { hex: "#d4a574", name: { es: "Camel", en: "Camel" } },
    ],
    contrast: { es: "Alto contraste: colores intensos y definidos", en: "High contrast: intense and defined colors" },
  },
  summer: {
    icon: "🌊",
    clothingColors: [
      { hex: "#b0c4de", name: { es: "Azul lavanda", en: "Lavender Blue" } },
      { hex: "#d8bfd8", name: { es: "Malva", en: "Mauve" } },
      { hex: "#c0c0c0", name: { es: "Gris perla", en: "Pearl Gray" } },
      { hex: "#e8b4c8", name: { es: "Rosa empolvado", en: "Dusty Rose" } },
      { hex: "#6b8e8a", name: { es: "Verde salvia", en: "Sage Green" } },
    ],
    avoidColors: [
      { hex: "#e67e22", name: { es: "Naranja intenso", en: "Intense Orange" } },
      { hex: "#0a0a0a", name: { es: "Negro puro", en: "Pure Black" } },
      { hex: "#b8860b", name: { es: "Dorado intenso", en: "Intense Gold" } },
    ],
    contrast: { es: "Bajo contraste: colores suaves y empolvados", en: "Low contrast: soft and powdery colors" },
  },
  autumn: {
    icon: "🍂",
    clothingColors: [
      { hex: "#8b4513", name: { es: "Marrón tierra", en: "Earth Brown" } },
      { hex: "#d2691e", name: { es: "Terracota", en: "Terracotta" } },
      { hex: "#556b2f", name: { es: "Verde oliva", en: "Olive Green" } },
      { hex: "#b8860b", name: { es: "Mostaza", en: "Mustard" } },
      { hex: "#8b0000", name: { es: "Burdeos", en: "Burgundy" } },
    ],
    avoidColors: [
      { hex: "#ff69b4", name: { es: "Rosa chicle", en: "Bubblegum Pink" } },
      { hex: "#0047ab", name: { es: "Azul eléctrico", en: "Electric Blue" } },
      { hex: "#c0c0c0", name: { es: "Gris frío", en: "Cool Gray" } },
    ],
    contrast: { es: "Contraste medio-bajo: colores cálidos y terrosos", en: "Medium-low contrast: warm and earthy colors" },
  },
  spring: {
    icon: "🌸",
    clothingColors: [
      { hex: "#ffd700", name: { es: "Amarillo dorado", en: "Golden Yellow" } },
      { hex: "#ff6347", name: { es: "Coral", en: "Coral" } },
      { hex: "#98fb98", name: { es: "Verde menta", en: "Mint Green" } },
      { hex: "#40e0d0", name: { es: "Turquesa", en: "Turquoise" } },
      { hex: "#f5deb3", name: { es: "Melocotón", en: "Peach" } },
    ],
    avoidColors: [
      { hex: "#0a0a0a", name: { es: "Negro", en: "Black" } },
      { hex: "#4a4a4a", name: { es: "Gris marengo", en: "Charcoal Gray" } },
      { hex: "#4b0082", name: { es: "Morado oscuro", en: "Dark Purple" } },
    ],
    contrast: { es: "Contraste medio-alto: colores claros y vibrantes", en: "Medium-high contrast: light and vibrant colors" },
  },
};

export interface ColorRecommendation {
  code: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  hexPreview: string;
  season: Season;
  verdict: { es: string; en: string };
  complementary: { hex: string; name: { es: string; en: string } }[];
  levelJump: number;
  requiresSalon: boolean;
  requiresDecolor: boolean;
  amazonSearchTerm: string;
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
  reflect: number;
  seasons: Season[];
  undertones: Undertone[];
}

const COLOR_DB: ColorEntry[] = [
  // Winters
  { code: "1.0", hex: "#0a0a0a", name: { es: "Negro Azabache", en: "Jet Black" }, level: 1, reflect: 0, seasons: ["winter"], undertones: ["cool", "neutral"] },
  { code: "9.1", hex: "#c4b49a", name: { es: "Rubio Muy Claro Ceniza", en: "Very Light Ash Blonde" }, level: 9, reflect: 1, seasons: ["winter", "summer"], undertones: ["cool"] },
  { code: "5.62", hex: "#6b2340", name: { es: "Castaño Claro Rojo Violeta", en: "Light Brown Red Violet" }, level: 5, reflect: 6, seasons: ["winter"], undertones: ["cool"] },
  { code: "4.5", hex: "#5c2020", name: { es: "Castaño Caoba", en: "Mahogany Brown" }, level: 4, reflect: 5, seasons: ["winter", "autumn"], undertones: ["cool", "neutral"] },
  { code: "4.62", hex: "#5a1a38", name: { es: "Castaño Borgoña Violeta", en: "Burgundy Violet Brown" }, level: 4, reflect: 6, seasons: ["winter"], undertones: ["cool"] },
  // Summers
  { code: "8.1", hex: "#b8a88a", name: { es: "Rubio Claro Ceniza", en: "Light Ash Blonde" }, level: 8, reflect: 1, seasons: ["summer"], undertones: ["cool", "neutral"] },
  { code: "7.1", hex: "#9a8a70", name: { es: "Rubio Ceniza", en: "Ash Blonde" }, level: 7, reflect: 1, seasons: ["summer"], undertones: ["cool"] },
  { code: "6.1", hex: "#7a6a55", name: { es: "Rubio Oscuro Ceniza", en: "Dark Ash Blonde" }, level: 6, reflect: 1, seasons: ["summer"], undertones: ["cool", "neutral"] },
  { code: "7.2", hex: "#a08a78", name: { es: "Rubio Irisado", en: "Iridescent Blonde" }, level: 7, reflect: 2, seasons: ["summer"], undertones: ["cool"] },
  // Autumns
  { code: "6.4", hex: "#8a5530", name: { es: "Rubio Oscuro Cobrizo", en: "Dark Copper Blonde" }, level: 6, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.4", hex: "#7a4520", name: { es: "Castaño Claro Cobrizo", en: "Light Copper Brown" }, level: 5, reflect: 4, seasons: ["autumn"], undertones: ["warm", "neutral"] },
  { code: "4.3", hex: "#6a4528", name: { es: "Castaño Chocolate Dorado", en: "Golden Chocolate Brown" }, level: 4, reflect: 3, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.5", hex: "#6e3028", name: { es: "Castaño Claro Caoba", en: "Light Mahogany Brown" }, level: 5, reflect: 5, seasons: ["autumn"], undertones: ["warm", "neutral"] },
  { code: "7.4", hex: "#a06a40", name: { es: "Rubio Cobrizo", en: "Copper Blonde" }, level: 7, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "6.64", hex: "#a03020", name: { es: "Rubio Oscuro Rojo Cobrizo", en: "Dark Red Copper Blonde" }, level: 6, reflect: 6, seasons: ["autumn"], undertones: ["warm"] },
  { code: "7.44", hex: "#b86830", name: { es: "Rubio Cobrizo Intenso", en: "Intense Copper Blonde" }, level: 7, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "6.46", hex: "#993318", name: { es: "Cobrizo Rojo Intenso", en: "Intense Red Copper" }, level: 6, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.6", hex: "#8b2020", name: { es: "Castaño Claro Rojo", en: "Light Red Brown" }, level: 5, reflect: 6, seasons: ["autumn"], undertones: ["warm", "neutral"] },
  { code: "4.45", hex: "#7a3018", name: { es: "Castaño Caoba Cobrizo", en: "Copper Mahogany Brown" }, level: 4, reflect: 4, seasons: ["autumn"], undertones: ["warm"] },
  { code: "8.4", hex: "#c08048", name: { es: "Rubio Claro Cobrizo", en: "Light Copper Blonde" }, level: 8, reflect: 4, seasons: ["autumn", "spring"], undertones: ["warm"] },
  { code: "7.64", hex: "#b05028", name: { es: "Rubio Rojo Cobrizo", en: "Red Copper Blonde" }, level: 7, reflect: 6, seasons: ["autumn"], undertones: ["warm"] },
  { code: "5.64", hex: "#883020", name: { es: "Castaño Claro Pelirrojo", en: "Light Ginger Brown" }, level: 5, reflect: 6, seasons: ["autumn"], undertones: ["warm"] },
  { code: "6.6", hex: "#a03028", name: { es: "Rubio Oscuro Rojo", en: "Dark Red Blonde" }, level: 6, reflect: 6, seasons: ["autumn", "winter"], undertones: ["warm", "cool"] },
  // Springs
  { code: "8.3", hex: "#c4a060", name: { es: "Rubio Claro Dorado", en: "Light Golden Blonde" }, level: 8, reflect: 3, seasons: ["spring"], undertones: ["warm", "neutral"] },
  { code: "7.3", hex: "#a08850", name: { es: "Rubio Dorado", en: "Golden Blonde" }, level: 7, reflect: 3, seasons: ["spring"], undertones: ["warm"] },
  { code: "6.3", hex: "#8a7040", name: { es: "Rubio Oscuro Dorado", en: "Dark Golden Blonde" }, level: 6, reflect: 3, seasons: ["spring"], undertones: ["warm", "neutral"] },
  { code: "7.31", hex: "#a89060", name: { es: "Rubio Dorado Ceniza", en: "Golden Ash Blonde" }, level: 7, reflect: 3, seasons: ["spring", "summer"], undertones: ["neutral", "warm"] },
  { code: "5.3", hex: "#7a6038", name: { es: "Castaño Claro Dorado", en: "Light Golden Brown" }, level: 5, reflect: 3, seasons: ["spring"], undertones: ["warm"] },
  { code: "7.34", hex: "#b08848", name: { es: "Rubio Dorado Cobrizo", en: "Golden Copper Blonde" }, level: 7, reflect: 3, seasons: ["spring", "autumn"], undertones: ["warm"] },
  { code: "8.34", hex: "#c89858", name: { es: "Rubio Claro Dorado Cobrizo", en: "Light Golden Copper Blonde" }, level: 8, reflect: 3, seasons: ["spring"], undertones: ["warm"] },
  // Neutrals
  { code: "6.0", hex: "#7a6a50", name: { es: "Rubio Oscuro Natural", en: "Natural Dark Blonde" }, level: 6, reflect: 0, seasons: ["summer", "spring"], undertones: ["neutral"] },
  { code: "5.0", hex: "#5a4a38", name: { es: "Castaño Claro Natural", en: "Natural Light Brown" }, level: 5, reflect: 0, seasons: ["autumn", "spring"], undertones: ["neutral"] },
  { code: "10.1", hex: "#e8dcc8", name: { es: "Rubio Platino", en: "Platinum Blonde" }, level: 10, reflect: 1, seasons: ["winter", "summer"], undertones: ["cool"] },
  { code: "3.0", hex: "#3a2a1e", name: { es: "Castaño Oscuro Natural", en: "Natural Dark Brown" }, level: 3, reflect: 0, seasons: ["winter", "autumn"], undertones: ["neutral", "cool", "warm"] },
];

// ── Main recommendation algorithm ─────────────────────
export function getRecommendation(profile: UserProfile): ColorRecommendation {
  const season = determineSeason(profile);
  const isFantasy = !!profile.currentFantasy;

  const scored = COLOR_DB.map((c) => {
    let score = 0;
    if (c.seasons.includes(season)) score += 40;
    if (c.undertones.includes(profile.undertone)) score += 25;
    const levelDist = Math.abs(c.level - profile.naturalLevel);
    score += Math.max(0, 20 - levelDist * 5);
    if (profile.undertone === "cool" && profile.skinTone === "light") {
      if (c.reflect === 1 || c.reflect === 2) score += 10;
      if (c.reflect === 4 || c.reflect === 6) score -= 15;
    }
    if (profile.undertone === "warm" && (profile.skinTone === "medium" || profile.skinTone === "tan")) {
      if (c.reflect === 3 || c.reflect === 4) score += 10;
    }
    if ((season === "autumn" || season === "spring") && profile.undertone === "warm") {
      if (c.reflect === 4 || c.reflect === 6 || c.reflect === 5) score += 8;
    }
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const complementary = scored.slice(1).filter((c) => c.code !== best.code).slice(0, 3);

  const targetLevelJump = isFantasy ? 99 : Math.abs(best.level - profile.currentLevel);
  const requiresSalon = targetLevelJump > 3;
  const requiresDecolor = isFantasy || (profile.currentLevel < best.level && targetLevelJump > 3);
  const amazonSearchTerm = encodeURIComponent(`tinte capilar ${best.name.es} ${best.code}`);
  const verdictEs = buildVerdictEs(season, profile, best, isFantasy, requiresDecolor);
  const verdictEn = buildVerdictEn(season, profile, best, isFantasy, requiresDecolor);

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
    complementary: complementary.map((c) => ({ hex: c.hex, name: c.name })),
    levelJump: targetLevelJump,
    requiresSalon,
    requiresDecolor,
    amazonSearchTerm,
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

function buildVerdictEs(season: Season, profile: UserProfile, color: ColorEntry, isFantasy: boolean, requiresDecolor: boolean): string {
  const skinMap: Record<SkinTone, string> = { light: "clara", medium: "media", tan: "bronceada", dark: "oscura" };
  const eyeMap: Record<EyeColor, string> = { blue_gray: "claros", green: "verdes", hazel: "miel", brown: "marrones", black: "oscuros" };
  let base = `Con tu piel ${skinMap[profile.skinTone]} y ojos ${eyeMap[profile.eyeColor]}, perteneces a la estación ${getSeasonNameEs(season)}. El tono ${color.name.es} (${color.code}) crea un contraste armonioso que realza tus rasgos naturales. El reflejo ${getReflectNameEs(color.reflect).toLowerCase()} ${profile.undertone === "cool" ? "neutraliza la calidez no deseada y aporta luminosidad fría" : profile.undertone === "warm" ? "potencia tu calidez natural y aporta brillo" : "equilibra perfectamente tu tono de piel"}.`;
  if (isFantasy) base += ` ⚠️ Tu cabello actualmente tiene un color fantasía/teñido. Para lograr este resultado será imprescindible un proceso de decoloración y/o decapado profesional previo. No intentes este cambio en casa: acude a un colorista profesional que evalúe el estado de tu fibra capilar.`;
  else if (requiresDecolor) base += ` ⚠️ Tu cabello actual es más oscuro que el tono recomendado y el salto de nivel es considerable. Necesitarás un proceso de decoloración previo realizado por un profesional para proteger la integridad de tu cabello.`;
  return base;
}

function buildVerdictEn(season: Season, profile: UserProfile, color: ColorEntry, isFantasy: boolean, requiresDecolor: boolean): string {
  const skinMap: Record<SkinTone, string> = { light: "light", medium: "medium", tan: "tan", dark: "dark" };
  const eyeMap: Record<EyeColor, string> = { blue_gray: "light", green: "green", hazel: "hazel", brown: "brown", black: "dark" };
  let base = `With your ${skinMap[profile.skinTone]} skin and ${eyeMap[profile.eyeColor]} eyes, you belong to the ${season} season. The ${color.name.en} shade (${color.code}) creates a harmonious contrast that enhances your natural features. The ${getReflectNameEn(color.reflect).toLowerCase()} reflect ${profile.undertone === "cool" ? "neutralizes unwanted warmth and adds cool luminosity" : profile.undertone === "warm" ? "enhances your natural warmth and adds brilliance" : "perfectly balances your skin tone"}.`;
  if (isFantasy) base += ` ⚠️ Your hair currently has a fantasy/dyed color. Achieving this result will require a professional bleaching and/or color removal process. Do not attempt this at home — visit a professional colorist who can assess your hair fiber condition.`;
  else if (requiresDecolor) base += ` ⚠️ Your current hair is darker than the recommended shade and the level jump is significant. You'll need a professional bleaching process first to protect your hair's integrity.`;
  return base;
}
