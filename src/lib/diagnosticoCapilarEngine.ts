// ── Diagnóstico Capilar Engine ────────────────────────
// Scientific framework: cuticle integrity, porosity, elasticity, scalp health
// 4 modules, 12 questions, 65-point max scale

export type RiskLevel = 'optimal' | 'caution' | 'critical';

export interface QuestionOption {
  value: string;
  label: string;
  points: number;
}

export interface Question {
  id: string;
  module: 1 | 2 | 3 | 4;
  text: string;
  protocol?: string;
  options: QuestionOption[];
}

export interface ScoreBreakdown {
  cuticle: number;    // Module 1
  porosity: number;   // Module 2
  elasticity: number; // Module 3
  scalp: number;      // Module 4
  total: number;
}

export interface Product {
  asin: string;
  name: string;
  description: string;
  url: string;
}

// ── Questions ─────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // MODULE 1 — INTEGRIDAD DE LA CUTÍCULA (max 12 pts)
  {
    id: 'q1_1',
    module: 1,
    text: 'Test del Tacto Proximal-Distal',
    options: [
      { value: 'A', label: 'Textura uniforme de raíz a puntas, suave y sedosa', points: 0 },
      { value: 'B', label: 'Ligera diferencia de textura en las puntas, algo más áspero', points: 2 },
      { value: 'C', label: 'Diferencia notable, puntas claramente más ásperas y encrespadas', points: 4 },
      { value: 'D', label: 'Textura muy rugosa en puntas, sensación de paja o algodón', points: 6 },
    ],
  },
  {
    id: 'q1_2',
    module: 1,
    text: 'Índice de Brillo Visual',
    options: [
      { value: 'A', label: 'Brillo uniforme y natural en toda la longitud', points: 0 },
      { value: 'B', label: 'Brillo presente en raíz, ligeramente apagado en medios o puntas', points: 2 },
      { value: 'C', label: 'Brillo escaso, cabello visualmente opaco en gran parte', points: 4 },
      { value: 'D', label: 'Sin brillo, cabello completamente mate y sin vida', points: 6 },
    ],
  },

  // MODULE 2 — POROSIDAD CAPILAR (max 20 pts)
  {
    id: 'q2_1',
    module: 2,
    text: 'Test de Flotación',
    protocol: 'Toma 3-4 cabellos limpios (sin acondicionador). Deposítalos en un vaso de agua a temperatura ambiente. Observa a los 2-4 minutos.',
    options: [
      { value: 'A', label: 'Los cabellos flotan en la superficie durante más de 4 minutos', points: 0 },
      { value: 'B', label: 'Los cabellos flotan 2-3 minutos y luego se hunden lentamente', points: 2 },
      { value: 'C', label: 'Los cabellos se hunden en menos de 2 minutos', points: 5 },
      { value: 'D', label: 'Los cabellos se hunden inmediatamente al contacto con el agua', points: 7 },
    ],
  },
  {
    id: 'q2_2',
    module: 2,
    text: 'Velocidad de Absorción en Mojado',
    options: [
      { value: 'A', label: 'El cabello tarda en mojarse, el agua resbala inicialmente', points: 0 },
      { value: 'B', label: 'El cabello absorbe el agua a velocidad normal', points: 2 },
      { value: 'C', label: 'El cabello absorbe el agua rápidamente, se empapa enseguida', points: 4 },
      { value: 'D', label: 'El cabello absorbe el agua de forma instantánea y agresiva', points: 6 },
    ],
  },
  {
    id: 'q2_3',
    module: 2,
    text: 'Historial de Tratamientos Oxidativos',
    options: [
      { value: 'A', label: 'Sin tintes ni decoloraciones', points: 0 },
      { value: 'B', label: 'Tinte semipermanente o gloss ocasional', points: 1 },
      { value: 'C', label: 'Tinte permanente sin decoloración previa', points: 3 },
      { value: 'D', label: 'Decoloración 1-2 veces o mechas puntuales', points: 6 },
      { value: 'E', label: 'Decoloraciones repetidas, balayage frecuente o color fantasía', points: 7 },
    ],
  },

  // MODULE 3 — RESISTENCIA Y ELASTICIDAD (max 21 pts)
  {
    id: 'q3_1',
    module: 3,
    text: 'Test de Elasticidad en Mojado',
    protocol: 'Toma un cabello húmedo. Estíralo lentamente 2-3 cm.',
    options: [
      { value: 'A', label: 'Se estira y vuelve a su forma original sin romperse', points: 0 },
      { value: 'B', label: 'Se estira bien pero tarda en recuperar su forma', points: 2 },
      { value: 'C', label: 'Se estira con resistencia y no recupera del todo su forma', points: 5 },
      { value: 'D', label: 'Se rompe inmediatamente al estirarlo', points: 7 },
    ],
  },
  {
    id: 'q3_2',
    module: 3,
    text: 'Frecuencia y Temperatura de Herramientas Térmicas',
    options: [
      { value: 'A', label: 'No uso calor o uso protector y temperatura baja (<150°C)', points: 0 },
      { value: 'B', label: 'Uso ocasional (1-2 veces/semana) con protector térmico', points: 1 },
      { value: 'C', label: 'Uso frecuente (3-5 veces/semana) o temperatura media-alta', points: 3 },
      { value: 'D', label: 'Uso diario o temperatura muy alta (>200°C) sin protector', points: 6 },
    ],
  },
  {
    id: 'q3_3',
    module: 3,
    text: 'Cantidad de Rotura Mecánica Observable',
    options: [
      { value: 'A', label: 'No observo pelos rotos ni puntas abiertas', points: 0 },
      { value: 'B', label: 'Algunas puntas abiertas pero poca rotura visible', points: 2 },
      { value: 'C', label: 'Rotura visible frecuente y puntas muy abiertas', points: 4 },
      { value: 'D', label: 'Rotura severa, cabellos cortos irregulares y pelo muy frágil', points: 8 },
    ],
  },

  // MODULE 4 — SALUD DEL CUERO CABELLUDO (max 12 pts)
  {
    id: 'q4_1',
    module: 4,
    text: 'Estado de Producción de Sebo',
    options: [
      { value: 'A', label: 'Cuero cabelludo equilibrado, no graso ni seco', points: 0 },
      { value: 'B', label: 'Ligeramente graso al segundo día o algo seco con picor leve', points: 1 },
      { value: 'C', label: 'Graso antes de 24h o seco con descamación leve', points: 3 },
      { value: 'D', label: 'Muy graso en horas o muy seco con descamación abundante', points: 3 },
    ],
  },
  {
    id: 'q4_2',
    module: 4,
    text: 'Síntomas de Barrera Comprometida',
    options: [
      { value: 'A', label: 'Sin picor, irritación ni enrojecimiento', points: 0 },
      { value: 'B', label: 'Picor ocasional sin irritación visible', points: 1 },
      { value: 'C', label: 'Picor frecuente o enrojecimiento puntual', points: 3 },
      { value: 'D', label: 'Picor intenso, inflamación, enrojecimiento constante o eccema', points: 5 },
    ],
  },
  {
    id: 'q4_3',
    module: 4,
    text: 'Productos y pH de la Rutina',
    options: [
      { value: 'A', label: 'Champú con pH equilibrado (4.5-5.5) específico para mi tipo de cabello', points: 0 },
      { value: 'B', label: 'Champú estándar del supermercado, sin revisar el pH', points: 2 },
      { value: 'C', label: 'Productos con sulfatos agresivos o pH alcalino (jabón de Castilla, bicarbonato)', points: 4 },
    ],
  },
  {
    id: 'q4_4',
    module: 4,
    text: 'Frecuencia de Lavado y Manipulación del Cuero Cabelludo',
    options: [
      { value: 'A', label: 'Lavo mi cabello cada 2-3 días con técnica suave (sin frotar)', points: 0 },
      { value: 'B', label: 'Lavo diariamente o con mucha fricción en el cuero cabelludo', points: 2 },
      { value: 'C', label: 'Lavo muy poco (1 vez por semana o menos) con acumulación visible', points: 2 },
      { value: 'D', label: 'Uso scrubs abrasivos o herramientas de masaje con presión excesiva', points: 4 },
    ],
  },
];

// ── Score calculation ──────────────────────────────────

export function calculateScores(answers: Record<string, string>): ScoreBreakdown {
  let cuticle = 0;
  let porosity = 0;
  let elasticity = 0;
  let scalp = 0;

  for (const question of QUESTIONS) {
    const selectedValue = answers[question.id];
    if (selectedValue === undefined) continue;
    const option = question.options.find(o => o.value === selectedValue);
    if (!option) continue;
    const pts = option.points;
    if (question.module === 1) cuticle += pts;
    else if (question.module === 2) porosity += pts;
    else if (question.module === 3) elasticity += pts;
    else if (question.module === 4) scalp += pts;
  }

  return {
    cuticle,
    porosity,
    elasticity,
    scalp,
    total: cuticle + porosity + elasticity + scalp,
  };
}

// ── Risk level classification ─────────────────────────

export function getRiskLevel(total: number): RiskLevel {
  if (total <= 15) return 'optimal';
  if (total <= 35) return 'caution';
  return 'critical';
}

// ── Product recommendations ───────────────────────────
// URLs: provide real Amazon affiliate links for each product

const PRODUCTS: Record<RiskLevel, Product[]> = {
  optimal: [
    {
      asin: 'B07YM8DWRZ',
      name: 'Olaplex No.7 Bonding Oil',
      description: 'Aceite reparador ultraligero que sella la cutícula y aporta brillo espejo. Ideal para mantener la salud del cabello sano.',
      url: '#',
    },
    {
      asin: 'B00ILBE2W8',
      name: 'Moroccanoil Treatment',
      description: 'Tratamiento de acabado con aceite de argán. Aporta nutrición y brillo sin sobrecargar el cabello sano.',
      url: '#',
    },
    {
      asin: 'B01LXLMLOH',
      name: 'Kérastase Nutritive Masquintense',
      description: 'Mascarilla nutritiva de alta concentración para cabello sano que quiere mantenerse en su estado óptimo.',
      url: '#',
    },
  ],
  caution: [
    {
      asin: 'B07SVCNFMD',
      name: 'Olaplex No.3 Hair Perfector',
      description: 'Tratamiento en casa que repara los enlaces de disulfuro dañados. Reduce la porosidad y mejora la elasticidad en 4-6 semanas.',
      url: '#',
    },
    {
      asin: 'B09VQDTK4S',
      name: 'Redken Acidic Bonding Concentrate',
      description: 'Sistema acidificante que sella la cutícula y restaura la resistencia en cabello teñido con daño moderado.',
      url: '#',
    },
    {
      asin: 'B09F1NS9GW',
      name: 'Schwarzkopf Fibreplex No.2',
      description: 'Tratamiento de uso domiciliario que refuerza la fibra capilar y protege frente a roturas mecánicas.',
      url: '#',
    },
  ],
  critical: [
    {
      asin: 'B09J7Y3ZFH',
      name: 'K18 Leave-In Molecular Repair Hair Mask',
      description: 'Mascarilla sin aclarado con tecnología de péptidos bioactivos que repara el daño en la cadena de queratina desde el interior.',
      url: '#',
    },
    {
      asin: 'B08FKXLRJ1',
      name: 'Olaplex No.0 + No.3 System',
      description: 'Sistema intensivo de dos pasos que restablece los enlaces del cabello en situaciones de daño severo antes de cualquier servicio químico.',
      url: '#',
    },
    {
      asin: 'B092CXLZ5P',
      name: 'Philip Kingsley Bond Builder',
      description: 'Tratamiento de reconstrucción profunda formulado para cabello en estado crítico con alta porosidad y elasticidad comprometida.',
      url: '#',
    },
  ],
};

export function getProductRecommendations(level: RiskLevel): Product[] {
  return PRODUCTS[level];
}

