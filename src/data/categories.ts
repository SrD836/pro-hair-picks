export interface CategoryItem {
  name: string;       // Exact DB category name
  slug: string;       // URL-friendly slug
  icon: string;
}

export interface CategoryGroup {
  section: string;
  items: CategoryItem[];
}

// Helper to generate slug from category name
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // remove accents
    .replace(/[()]/g, "")       // remove parentheses
    .replace(/\s+/g, "-")       // spaces → hyphens
    .replace(/-+/g, "-")        // collapse multiple hyphens
    .replace(/^-|-$/g, "");     // trim hyphens
}

// ── HOMBRE ──────────────────────────────────────────
export const menGroups: CategoryGroup[] = [
  {
    section: "Hardware Core",
    items: [
      { name: "Clippers", slug: "clippers", icon: "✂️" },
      { name: "Trimmers", slug: "trimmers", icon: "🔧" },
      { name: "Cortapelos Nariz/Orejas", slug: "cortapelos-nariz-orejas", icon: "👃" },
      { name: "Shavers (afeitadoras)", slug: "shavers-afeitadoras", icon: "🪒" },
      { name: "Navajas y cuchillas", slug: "navajas-y-cuchillas", icon: "🔪" },
    ],
  },
  {
    section: "Styling",
    items: [
      { name: "Ceras y pomadas", slug: "ceras-y-pomadas", icon: "🫙" },
      { name: "Productos para la barba", slug: "productos-para-la-barba", icon: "🧔" },
      { name: "Aceites y Serums Barba", slug: "aceites-y-serums-barba", icon: "🧴" },
      { name: "Kits de Fade/Degradado", slug: "kits-de-fade-degradado", icon: "💈" },
      { name: "Afther shave y bálsamos", slug: "afther-shave-y-balsamos", icon: "🧊" },
    ],
  },
  {
    section: "Mobiliario",
    items: [
      { name: "Sillones de barbero hidráulico", slug: "sillones-de-barbero-hidraulico", icon: "💺" },
      { name: "Lavacabezas (portátiles y fijos)", slug: "lavacabezas-portatiles-y-fijos", icon: "🚿" },
      { name: "Tocadores y espejos con LED", slug: "tocadores-y-espejos-con-led", icon: "🪞" },
      { name: "Sillas de espera", slug: "sillas-de-espera", icon: "🪑" },
    ],
  },
  {
    section: "Equipamiento",
    items: [
      { name: "Esterilizadores y desinfección", slug: "esterilizadores-y-desinfeccion", icon: "🧫" },
      { name: "Mantenimiento de máquinas", slug: "mantenimiento-de-maquinas", icon: "🛠️" },
      { name: "Desechables", slug: "desechables", icon: "🗑️" },
      { name: "Calentadores de toallas", slug: "calentadores-de-toallas", icon: "🔥" },
      { name: "Talqueras y brochas quita pelos", slug: "talqueras-y-brochas-quita-pelos", icon: "🖌️" },
      { name: "Pulverizadores de agua", slug: "pulverizadores-de-agua", icon: "💧" },
      { name: "Organizadores de estación", slug: "organizadores-de-estacion", icon: "📦" },
    ],
  },
];

// ── MUJER ──────────────────────────────────────────
export const womenGroups: CategoryGroup[] = [
  {
    section: "Herramientas Térmicas",
    items: [
      { name: "Secadores profesionales", slug: "secadores-profesionales", icon: "💨" },
      { name: "Planchas de pelo", slug: "planchas-de-pelo", icon: "🔥" },
      { name: "Herramientas ondas y rizos", slug: "herramientas-ondas-y-rizos", icon: "🌀" },
      { name: "Cepillos eléctricos", slug: "cepillos-electricos", icon: "🖌️" },
      { name: "Rizadores Automáticos", slug: "rizadores-automaticos", icon: "💫" },
    ],
  },
  {
    section: "Color",
    items: [
      { name: "Tintes", slug: "tintes", icon: "🎨" },
      { name: "Decoloración", slug: "decoloracion", icon: "⭐" },
      { name: "Baños de color", slug: "banos-de-color", icon: "🌈" },
    ],
  },
  {
    section: "Tratamiento",
    items: [
      { name: "Champús técnicos", slug: "champus-tecnicos", icon: "🧴" },
      { name: "Tratamientos capilares profundos", slug: "tratamientos-capilares-profundos", icon: "💆" },
      { name: "Alisados profesionales", slug: "alisados-profesionales", icon: "✨" },
      { name: "Protectores térmicos", slug: "protectores-termicos", icon: "🛡️" },
    ],
  },
  {
    section: "Corte/Styling",
    items: [
      { name: "Tijeras profesionales", slug: "tijeras-profesionales", icon: "✂️" },
      { name: "Cepillos térmicos", slug: "cepillos-termicos", icon: "🌡️" },
      { name: "Cepillos Desenredantes", slug: "cepillos-desenredantes", icon: "🪮" },
      { name: "Lacas", slug: "lacas", icon: "💅" },
      { name: "Espuma", slug: "espuma", icon: "🫧" },
    ],
  },
  {
    section: "Técnico",
    items: [
      { name: "Extensiones", slug: "extensiones", icon: "💇" },
      { name: "Medidores de humedad capilar", slug: "medidores-de-humedad-capilar", icon: "📊" },
    ],
  },
];

// ── MIXTO ──────────────────────────────────────────
export const mixedCategories: CategoryItem[] = [
  { name: "Capas y delantales", slug: "capas-y-delantales", icon: "👔" },
  { name: "Vaporizadores faciales", slug: "vaporizadores-faciales", icon: "💨" },
  { name: "Calentadores de cera", slug: "calentadores-de-cera", icon: "🕯️" },
  { name: "Sillones de tocador", slug: "sillones-de-tocador", icon: "💺" },
  { name: "Maniquíes de práctica", slug: "maniquies-de-practica", icon: "👩" },
  { name: "Productos para el cabello", slug: "productos-para-el-cabello", icon: "💈" },
];

// ── Flat lists for backwards compat ─────────────────
export const menCategories = menGroups.flatMap((g) => g.items);
export const womenCategories = womenGroups.flatMap((g) => g.items);
export const allCategories = [...menCategories, ...womenCategories, ...mixedCategories];

// ── Slug → DB name map ──────────────────────────────
const _slugToName: Record<string, string> = {};
for (const cat of allCategories) {
  _slugToName[cat.slug] = cat.name;
}
export const slugToName = _slugToName;

export function getCategoryNameBySlug(slug: string): string | undefined {
  return slugToName[slug];
}
