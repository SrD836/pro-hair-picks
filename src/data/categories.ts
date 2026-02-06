export interface Product {
  rank: number;
  name: string;
  classification: "top" | "calidad-precio" | "comienzo";
  features?: string[];
  imageUrl?: string;
}

export interface Category {
  name: string;
  slug: string;
  gender: "hombre" | "mujer";
  icon: string;
  products: Product[];
}

export const menCategories: { name: string; slug: string; icon: string }[] = [
  { name: "Clippers (Máquinas de Corte)", slug: "clippers", icon: "✂️" },
  { name: "Trimmers (Perfiladores)", slug: "trimmers", icon: "🔧" },
  { name: "Shavers (Afeitadoras)", slug: "shavers", icon: "🪒" },
  { name: "Tijeras Profesionales", slug: "tijeras", icon: "✂️" },
  { name: "Peines Profesionales", slug: "peines", icon: "🪥" },
  { name: "Cepillos", slug: "cepillos", icon: "🖌️" },
  { name: "Navajas y Cuchillas", slug: "navajas", icon: "🔪" },
  { name: "Productos para el Cabello", slug: "productos-cabello", icon: "💈" },
  { name: "Productos para la Barba", slug: "productos-barba", icon: "🧔" },
  { name: "Ceras y Pomadas", slug: "ceras-pomadas", icon: "🫙" },
  { name: "After Shave y Bálsamos", slug: "after-shave-balsamos", icon: "🧴" },
  { name: "Sillones de Barbero", slug: "sillones-barbero", icon: "💺" },
  { name: "Lavacabezas", slug: "lavacabezas", icon: "🚿" },
  { name: "Postes de Barbero", slug: "postes-barbero", icon: "🏪" },
  { name: "Tocadores y Espejos LED", slug: "tocadores-espejos-led", icon: "🪞" },
  { name: "Sillas de Espera", slug: "sillas-espera", icon: "🪑" },
  { name: "Esterilizadores", slug: "esterilizadores", icon: "🧫" },
  { name: "Mantenimiento de Máquinas", slug: "mantenimiento-maquinas", icon: "🛠️" },
  { name: "Desechables", slug: "desechables", icon: "🗑️" },
  { name: "Calentadores de Toallas", slug: "calentadores-toallas", icon: "🔥" },
  { name: "Vaporizadores Faciales", slug: "vaporizadores-faciales", icon: "💨" },
  { name: "Calentadores de Cera", slug: "calentadores-cera", icon: "🕯️" },
  { name: "Talqueras y Brochas", slug: "talqueras-brochas", icon: "🖌️" },
  { name: "Pulverizadores de Agua", slug: "pulverizadores-agua", icon: "💧" },
  { name: "Alfombras Antifatiga", slug: "alfombras-antifatiga", icon: "🧱" },
  { name: "Organizadores de Estación", slug: "organizadores-estacion", icon: "📦" },
  { name: "Mochilas y Maletines", slug: "mochilas-maletines", icon: "🎒" },
  { name: "Capas y Delantales", slug: "capas-delantales", icon: "👔" },
  { name: "Aros de Luz y Trípodes", slug: "aros-luz-tripodes", icon: "💡" },
];

export const womenCategories: { name: string; slug: string; icon: string }[] = [
  { name: "Secadores Profesionales", slug: "secadores-profesionales", icon: "💨" },
  { name: "Planchas de Pelo", slug: "planchas-pelo", icon: "🔥" },
  { name: "Herramientas Ondas y Rizos", slug: "herramientas-ondas-rizos", icon: "🌀" },
  { name: "Cepillos Eléctricos", slug: "cepillos-electricos", icon: "🖌️" },
  { name: "Tintes y Coloración", slug: "tintes-coloracion", icon: "🎨" },
  { name: "Decoloración", slug: "decoloracion", icon: "⭐" },
  { name: "Champús Técnicos", slug: "champus-tecnicos", icon: "🧴" },
  { name: "Tratamientos Capilares", slug: "tratamientos-capilares", icon: "💆" },
  { name: "Alisados Profesionales", slug: "alisados-profesionales", icon: "✨" },
  { name: "Tijeras de Peluquería", slug: "tijeras-peluqueria", icon: "✂️" },
  { name: "Cepillos Térmicos", slug: "cepillos-termicos", icon: "🌡️" },
  { name: "Productos Styling", slug: "productos-styling", icon: "💅" },
  { name: "Extensiones", slug: "extensiones", icon: "💇" },
  { name: "Sillones de Tocador", slug: "sillones-tocador", icon: "💺" },
  { name: "Lavacabezas Profesionales", slug: "lavacabezas-profesionales", icon: "🚿" },
  { name: "Toallas Profesionales", slug: "toallas-profesionales", icon: "🛁" },
  { name: "Capas de Tinte", slug: "capas-tinte", icon: "👔" },
  { name: "Guantes Profesionales", slug: "guantes-profesionales", icon: "🧤" },
  { name: "Maniquíes de Práctica", slug: "maniquies-practica", icon: "👩" },
  { name: "Espejos de Mano", slug: "espejos-mano", icon: "🪞" },
];

// Sample products for Clippers category
export const clippersProducts: Product[] = [
  // TOP
  { rank: 1, name: "StyleCraft Instinct Metal Edition", classification: "top", features: ["Motor de 11.500 RPM", "Cuchilla DLC de titanio", "Batería de litio 4h", "Diseño ergonómico premium"] },
  { rank: 2, name: "JRL Onyx 2020C", classification: "top", features: ["Motor Cool Blade Technology", "Pantalla LCD", "Batería 4.5h", "Cuerpo de fibra de carbono"] },
  { rank: 3, name: "BaBylissPRO GoldFX Boost+", classification: "top", features: ["Motor Ferrari de alto rendimiento", "Cuchilla DLC 2.0", "Batería dual de litio", "Acabado dorado premium"] },
  { rank: 4, name: "Wahl Hi-Viz", classification: "top", features: ["Motor profesional potente", "Cuchillas de precisión autoafilables", "Diseño de alta visibilidad", "Incluye 6 peines guía"] },
  { rank: 5, name: "Lim Hair Devourer 15k", classification: "top", features: ["Motor 15.000 RPM", "Cuchilla cerámica japonesa", "Batería 5h autonomía", "Ultra silenciosa"] },
  // CALIDAD-PRECIO
  { rank: 6, name: "Wahl Magic Clip Cordless (Ed. Burdeos)", classification: "calidad-precio", features: ["Cuchillas Stagger-Tooth", "90 min autonomía", "Ideal para degradados", "Marca de confianza"] },
  { rank: 7, name: "Gamma+ Boosted", classification: "calidad-precio", features: ["Motor magnético Modena", "Cuchilla DLC estacionaria", "Ligera y potente", "Gran relación calidad-precio"] },
  { rank: 8, name: "Kiepe Diavel", classification: "calidad-precio", features: ["Fabricación italiana", "Motor lineal potente", "Cuchilla de acero", "Diseño compacto"] },
  // COMIENZO
  { rank: 9, name: "Kemei 1986", classification: "comienzo", features: ["Precio imbatible", "Cable e inalámbrica", "Pantalla LCD", "Ideal para principiantes"] },
  { rank: 10, name: "Madeshow M10", classification: "comienzo", features: ["Motor silencioso", "Cuchilla de cerámica", "Ligera y compacta", "Batería recargable USB"] },
];

export function getCategoryBySlug(gender: "hombre" | "mujer", slug: string) {
  const categories = gender === "hombre" ? menCategories : womenCategories;
  return categories.find(c => c.slug === slug);
}
