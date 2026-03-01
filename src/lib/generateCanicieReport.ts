// ── Canicie Analyzer — Diagnostic Algorithm ───────────────────────────────────
// Pure function: no side-effects, no network calls.

// ── Types ──────────────────────────────────────────────────────────────────────

export type CaniciePercentage = "0-25" | "25-50" | "50-75" | "75-100";
export type DietQuality = "deficiente" | "regular" | "buena" | "óptima";
export type KnownDeficiency = "b12" | "hierro" | "cobre" | "zinc" | "ninguna";

export type CanicieType =
  | "genética_predominante"
  | "mixta"
  | "ambiental_predominante";

export type OnsetClassification = "prematura" | "temprana" | "normal";

export interface CanicieInput {
  age: number;                         // 18–80
  canicie_onset_age: number;           // age of first grey hair
  canicie_percentage: CaniciePercentage;
  family_history: boolean;             // parents/grandparents with early grey
  stress_level: number;                // 1–10 chronic self-reported
  diet_quality: DietQuality;
  smoker: boolean;
  known_deficiencies: KnownDeficiency[];
  hair_texture_change: boolean;        // grey hair noticeably drier/coarser
}

export interface Recommendation {
  priority: "alta" | "media" | "baja";
  action: string;
  rationale: string;
  modifiable: boolean;
}

export interface CanicieReport {
  canicie_type: CanicieType;
  onset_classification: OnsetClassification;
  early_medical_alert: boolean;        // onset < 20 years
  genetic_weight: number;              // 0–10 internal score
  environmental_weight: number;        // 0–10 internal score
  modifiable_factors: string[];
  non_modifiable_factors: string[];
  structural_care_needed: boolean;
  recommendations: Recommendation[];
  realistic_expectations: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function classifyOnset(onsetAge: number): OnsetClassification {
  if (onsetAge < 25) return "prematura";
  if (onsetAge <= 35) return "temprana";
  return "normal";
}

function buildGeneticScore(
  input: CanicieInput,
  onset: OnsetClassification
): number {
  let score = 0;
  if (input.family_history) score += 3;
  if (onset === "prematura") score += 3;
  else if (onset === "temprana") score += 1;
  // Canicie percentage as proxy of genetic progression
  if (input.canicie_percentage === "75-100") score += 2;
  else if (input.canicie_percentage === "50-75") score += 1;
  return Math.min(score, 10);
}

function buildEnvironmentalScore(input: CanicieInput): number {
  let score = 0;
  if (input.stress_level >= 8) score += 3;
  else if (input.stress_level >= 6) score += 2;
  else if (input.stress_level >= 4) score += 1;

  if (input.diet_quality === "deficiente") score += 2;
  else if (input.diet_quality === "regular") score += 1;

  if (input.smoker) score += 2;

  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );
  if (realDeficiencies.length >= 2) score += 2;
  else if (realDeficiencies.length === 1) score += 1;

  return Math.min(score, 10);
}

function classifyType(
  geneticScore: number,
  envScore: number
): CanicieType {
  if (geneticScore >= 5 && envScore <= 2) return "genética_predominante";
  if (envScore >= 5 && geneticScore <= 2) return "ambiental_predominante";
  return "mixta";
}

// ── Factor extraction ─────────────────────────────────────────────────────────

function getModifiableFactors(input: CanicieInput): string[] {
  const factors: string[] = [];

  if (input.stress_level >= 6) {
    factors.push(
      `Estrés crónico elevado (nivel ${input.stress_level}/10) — vía norepinefrina y depleción de McSCs`
    );
  }

  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );
  if (realDeficiencies.includes("b12")) {
    factors.push("Déficit de vitamina B12 — causa reversible documentada de canicie prematura");
  }
  if (realDeficiencies.includes("hierro")) {
    factors.push("Déficit de hierro — cofactor de catalasa y enzimas de reparación de DNA folicular");
  }
  if (realDeficiencies.includes("cobre")) {
    factors.push("Déficit de cobre — cofactor directo de la Tirosinasa (enzima clave en melanogénesis)");
  }
  if (realDeficiencies.includes("zinc")) {
    factors.push("Déficit de zinc — cofactor de Cu/Zn-SOD y enzimas de reparación del DNA");
  }

  if (input.smoker) {
    factors.push("Tabaquismo — radicales libres y vasoconstricción folicular (OR 2.5–4.0 para canicie prematura)");
  }

  if (input.diet_quality === "deficiente" || input.diet_quality === "regular") {
    factors.push(
      `Calidad de dieta ${input.diet_quality} — el déficit crónico de micronutrientes impacta la melanogénesis`
    );
  }

  return factors;
}

function getNonModifiableFactors(
  input: CanicieInput,
  onset: OnsetClassification
): string[] {
  const factors: string[] = [];

  if (input.family_history) {
    factors.push(
      "Antecedentes familiares — predisposición genética documentada (posible variante IRF4, BCL2 u otras)"
    );
  }

  if (onset === "prematura" || onset === "temprana") {
    factors.push("Edad de inicio — cuanto más temprana la aparición, mayor es el componente genético");
  }

  factors.push(
    "Envejecimiento fisiológico — el agotamiento progresivo de McSCs es un proceso biológico universal"
  );

  if (input.canicie_percentage === "75-100") {
    factors.push(
      "Progresión avanzada — el pool de McSCs puede estar ya severamente reducido, limitando la reversibilidad"
    );
  }

  return factors;
}

// ── Recommendations ────────────────────────────────────────────────────────────

function buildRecommendations(
  input: CanicieInput,
  type: CanicieType,
  onset: OnsetClassification
): Recommendation[] {
  const recs: Recommendation[] = [];

  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );

  // Medical alert
  if (input.canicie_onset_age < 20) {
    recs.push({
      priority: "alta",
      action: "Consulta con dermatólogo o tricólogo",
      rationale:
        "La canicie antes de los 20 años puede tener causas médicas tratables (déficit de B12, enfermedad tiroidea, síndrome de Werner). Requiere evaluación clínica.",
      modifiable: true,
    });
  }

  // B12 deficiency
  if (realDeficiencies.includes("b12")) {
    recs.push({
      priority: "alta",
      action: "Corregir déficit de vitamina B12 con analítica y suplementación guiada",
      rationale:
        "El déficit de B12 es la causa nutricional más documentada de canicie reversible. La repleción puede recuperar el color en casos de canicie por esta causa.",
      modifiable: true,
    });
  }

  // Copper deficiency
  if (realDeficiencies.includes("cobre")) {
    recs.push({
      priority: "alta",
      action: "Evaluar niveles séricos de cobre y ajustar la dieta (marisco, frutos secos, legumbres)",
      rationale:
        "El cobre es cofactor directo de la Tirosinasa. Su déficit reduce directamente la síntesis de eumelanina.",
      modifiable: true,
    });
  }

  // Iron / zinc deficiencies
  if (realDeficiencies.includes("hierro") || realDeficiencies.includes("zinc")) {
    recs.push({
      priority: "media",
      action: "Analítica completa de ferritina y zinc con corrección nutricional o suplementación médica",
      rationale:
        "Hierro y zinc son cofactores de enzimas antioxidantes que protegen los melanocitos del estrés oxidativo folicular.",
      modifiable: true,
    });
  }

  // Stress
  if (input.stress_level >= 7) {
    recs.push({
      priority: "alta",
      action: "Implementar estrategias de manejo del estrés crónico (técnicas cognitivo-conductuales, ejercicio regular, sueño reparador)",
      rationale:
        "El estrés activa el SNS y libera norepinefrina que agota las McSCs del folículo. La reducción del estrés puede preservar el reservorio melanocítico residual.",
      modifiable: true,
    });
  } else if (input.stress_level >= 5) {
    recs.push({
      priority: "media",
      action: "Monitorizar y reducir el nivel de estrés crónico mediante técnicas validadas",
      rationale:
        "Nivel de estrés moderado-alto con impacto documentado sobre la biología de los melanocitos.",
      modifiable: true,
    });
  }

  // Smoking
  if (input.smoker) {
    recs.push({
      priority: "alta",
      action: "Dejar de fumar",
      rationale:
        "El tabaquismo multiplica por 2.5–4 el riesgo de canicie prematura y agota las defensas antioxidantes foliculares.",
      modifiable: true,
    });
  }

  // Diet
  if (input.diet_quality === "deficiente") {
    recs.push({
      priority: "alta",
      action: "Mejorar la calidad nutricional (dieta mediterránea variada con proteínas completas, verduras de hoja oscura, marisco)",
      rationale:
        "Una dieta deficiente acumula múltiples déficits de micronutrientes que impactan la síntesis de melanina y las defensas antioxidantes foliculares.",
      modifiable: true,
    });
  } else if (input.diet_quality === "regular") {
    recs.push({
      priority: "media",
      action: "Reforzar la dieta con fuentes de B12, cobre, zinc y antioxidantes naturales",
      rationale:
        "Una dieta regular puede tener déficits subclínicos que impactan la melanogénesis a largo plazo.",
      modifiable: true,
    });
  }

  // Structural care
  if (input.hair_texture_change) {
    recs.push({
      priority: "media",
      action: "Implementar rutina de hidratación lipídica específica para pelo canoso (ceramidas, argán, jojoba, protector UV)",
      rationale:
        "El pelo canoso pierde la capa F-lipídica (18-MEA) y tiene el CMC reducido. Necesita hidratación lipídica activa y protección UV, ya que la melanina (fotoprotector natural) está ausente.",
      modifiable: true,
    });
  }

  // If mainly genetic, set realistic expectations
  if (type === "genética_predominante") {
    recs.push({
      priority: "baja",
      action: "Considerar coloración cosmética profesional como opción estética libre de falsas promesas",
      rationale:
        "Cuando el componente genético es predominante, los hábitos pueden ralentizar pero no revertir el proceso. La coloración cosmética es la única opción con efecto visible garantizado.",
      modifiable: true,
    });
  }

  return recs;
}

// ── Realistic expectations ─────────────────────────────────────────────────────

function buildExpectations(
  type: CanicieType,
  onset: OnsetClassification,
  input: CanicieInput
): string {
  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );

  if (onset === "prematura" && input.family_history) {
    return "Con este perfil, el componente genético es dominante. Corregir déficits nutricionales y reducir el estrés puede ralentizar el proceso y mejorar la salud general del folículo, pero no revertirá la canicie ya establecida. No existe ningún producto o hábito con evidencia de reversión para canicie genética. La honestidad científica es esta.";
  }

  if (realDeficiencies.includes("b12") && type !== "genética_predominante") {
    return "Hay factores modificables relevantes en tu caso, especialmente el déficit de B12 — que es una causa tratable y potencialmente reversible. Con corrección nutricional y manejo del estrés, es razonable esperar una ralentización del proceso. La reversión completa solo es posible si la causa es exclusivamente nutricional.";
  }

  if (type === "ambiental_predominante") {
    return "El perfil ambiental de tu canicie sugiere que los hábitos tienen un peso real. Dejar de fumar, corregir los déficits nutricionales y reducir el estrés crónico pueden ralentizar significativamente el proceso. Sin embargo, los folículos ya despigmentados no recuperan el color. El objetivo realista es preservar los folículos que aún funcionan.";
  }

  return "Tu canicie tiene componentes tanto genéticos como modificables. Los cambios de hábitos pueden ralentizar el proceso y mejorar la calidad del pelo canoso existente, pero no revertirán los folículos ya despigmentados. Las expectativas honestas son: menos progresión, no retrocesión.";
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateCanicieReport(input: CanicieInput): CanicieReport {
  const onset = classifyOnset(input.canicie_onset_age);
  const geneticScore = buildGeneticScore(input, onset);
  const envScore = buildEnvironmentalScore(input);
  const type = classifyType(geneticScore, envScore);

  return {
    canicie_type: type,
    onset_classification: onset,
    early_medical_alert: input.canicie_onset_age < 20,
    genetic_weight: geneticScore,
    environmental_weight: envScore,
    modifiable_factors: getModifiableFactors(input),
    non_modifiable_factors: getNonModifiableFactors(input, onset),
    structural_care_needed: input.hair_texture_change,
    recommendations: buildRecommendations(input, type, onset),
    realistic_expectations: buildExpectations(type, onset, input),
  };
}
