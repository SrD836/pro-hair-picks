// ── Alopecia Risk Analyzer — Diagnostic Algorithm ─────────────────────────────
// Pure function: no side-effects, no network calls.

// ── Types ──────────────────────────────────────────────────────────────────────

export type AlopeciaRiskLevel = "bajo" | "moderado" | "alto" | "muy_alto";
export type AlopeciaRiskType =
  | "genetico_predominante"
  | "mixto"
  | "ambiental_reversible";
export type HairlossSex = "male" | "female";
export type HairlossStage = "ninguna" | "leve" | "moderada" | "avanzada";
export type AlopeciaRecommendedAction =
  | "observacion"
  | "dermatologo_recomendado"
  | "dermatologo_urgente"
  | "tratamiento_mantenimiento";
export type AlopeciaDietQuality = "deficiente" | "regular" | "buena" | "óptima";
export type AlopeciaScalpCondition =
  | "normal"
  | "seborreico"
  | "sensible"
  | "psoriasis";
export type AlopeciaKnownDeficiency =
  | "hierro"
  | "vitamina_d"
  | "zinc"
  | "ninguna";
export type AlopeciaCurrentTreatment =
  | "minoxidil"
  | "finasterida"
  | "prp"
  | "suplementos"
  | "ninguno";

export interface AlopeciaInput {
  age: number;
  sex: HairlossSex;
  current_hairloss_stage: HairlossStage;
  hamilton_self_reported: number | null;
  ludwig_self_reported: number | null;
  father_bald: boolean;
  mother_father_bald: boolean;
  siblings_bald: boolean;
  hairloss_onset_age: number | null;
  stress_level: number;
  diet_quality: AlopeciaDietQuality;
  smoker: boolean;
  known_deficiencies: AlopeciaKnownDeficiency[];
  scalp_condition: AlopeciaScalpCondition;
  current_treatments: AlopeciaCurrentTreatment[];
}

export interface AlopeciaTreatmentOption {
  id: string;
  name: string;
  evidence_level: "A" | "B" | "C";
  type: string;
  realistic_expectation: string;
}

export interface AlopeciaReport {
  risk_level: AlopeciaRiskLevel;
  risk_score: number;
  risk_type: AlopeciaRiskType;
  estimated_progression: string;
  modifiable_factors: string[];
  non_modifiable_factors: string[];
  recommended_action: AlopeciaRecommendedAction;
  evidence_based_options: AlopeciaTreatmentOption[];
  realistic_expectations: string;
  myth_alerts: string[];
  possible_hormonal_cause: boolean;
  finasterida_contraindication_alert: boolean;
  _genetic_score: number;
  _onset_score: number;
  _external_score: number;
}

// ── Score builders ─────────────────────────────────────────────────────────────

function buildGeneticScore(input: AlopeciaInput): number {
  let score = 0;
  if (input.father_bald) score += 20;
  if (input.mother_father_bald) score += 12;
  if (input.siblings_bald) score += 8;
  if (
    input.sex === "female" &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada")
  ) {
    score += 5;
  }
  return Math.min(score, 50);
}

function buildOnsetScore(input: AlopeciaInput): number {
  const onset = input.hairloss_onset_age;
  if (onset === null) {
    return input.age < 30 ? 10 : input.age < 45 ? 6 : 3;
  }
  if (onset < 25) return 25;
  if (onset <= 30) return 20;
  if (onset <= 35) return 15;
  if (onset <= 45) return 10;
  return 5;
}

function buildExternalScore(input: AlopeciaInput): number {
  let score = 0;
  if (input.stress_level >= 8) score += 8;
  else if (input.stress_level >= 6) score += 5;
  else if (input.stress_level >= 4) score += 3;

  if (input.smoker) score += 5;

  if (input.diet_quality === "deficiente") score += 6;
  else if (input.diet_quality === "regular") score += 3;

  const realDeficiencies = input.known_deficiencies.filter(
    (d) => d !== "ninguna"
  );
  if (realDeficiencies.length >= 2) score += 6;
  else if (realDeficiencies.length === 1) score += 3;

  if (
    input.scalp_condition === "seborreico" ||
    input.scalp_condition === "psoriasis"
  ) {
    score += 2;
  }

  return Math.min(score, 25);
}

// ── Classification ─────────────────────────────────────────────────────────────

function classifyRiskLevel(score: number): AlopeciaRiskLevel {
  if (score <= 30) return "bajo";
  if (score <= 55) return "moderado";
  if (score <= 75) return "alto";
  return "muy_alto";
}

function classifyRiskType(
  geneticScore: number,
  externalScore: number
): AlopeciaRiskType {
  if (geneticScore >= 30 && externalScore <= 8) return "genetico_predominante";
  if (externalScore >= 15 && geneticScore <= 15) return "ambiental_reversible";
  return "mixto";
}

function determineRecommendedAction(
  input: AlopeciaInput,
  riskLevel: AlopeciaRiskLevel
): AlopeciaRecommendedAction {
  if (
    input.age < 25 &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada")
  ) {
    return "dermatologo_urgente";
  }
  if (riskLevel === "muy_alto") return "dermatologo_urgente";
  if (riskLevel === "alto") return "dermatologo_recomendado";
  if (riskLevel === "moderado") {
    const hasTreatment =
      input.current_treatments.length > 0 &&
      !input.current_treatments.includes("ninguno");
    return hasTreatment
      ? "tratamiento_mantenimiento"
      : "dermatologo_recomendado";
  }
  return "observacion";
}

// ── Factor extraction ─────────────────────────────────────────────────────────

function buildModifiableFactors(input: AlopeciaInput): string[] {
  const factors: string[] = [];
  if (input.stress_level >= 6)
    factors.push(`Estrés crónico elevado (${input.stress_level}/10)`);
  if (input.smoker) factors.push("Hábito tabáquico (vasoconstricción capilar)");
  if (input.diet_quality === "deficiente" || input.diet_quality === "regular")
    factors.push("Calidad de dieta mejorable");
  const realDef = input.known_deficiencies.filter((d) => d !== "ninguna");
  if (realDef.length > 0)
    factors.push(
      `Déficits nutricionales: ${realDef.map((d) => d.replace("_", " ")).join(", ")}`
    );
  if (input.scalp_condition === "seborreico")
    factors.push("Cuero cabelludo seborreico (inflamación subcrónica)");
  if (input.scalp_condition === "psoriasis")
    factors.push("Psoriasis en cuero cabelludo (inflamación folicular)");
  return factors;
}

function buildNonModifiableFactors(input: AlopeciaInput): string[] {
  const factors: string[] = [];
  if (input.father_bald)
    factors.push("Alopecia paterna (carga genética autosómica)");
  if (input.mother_father_bald)
    factors.push("Abuelo materno calvo (variante AR en cromosoma X)");
  if (input.siblings_bald)
    factors.push("Hermanos afectados (penetrancia alta en tu familia)");
  if (input.hairloss_onset_age !== null && input.hairloss_onset_age < 25)
    factors.push(
      `Inicio precoz (${input.hairloss_onset_age} años) — señal de alta susceptibilidad androgénica`
    );
  factors.push("Sensibilidad folicular a DHT (genéticamente determinada)");
  return factors;
}

function buildEvidenceOptions(
  input: AlopeciaInput
): AlopeciaTreatmentOption[] {
  const hamilton = input.hamilton_self_reported ?? 0;
  const ludwig = input.ludwig_self_reported ?? 0;
  const options: AlopeciaTreatmentOption[] = [];

  if (
    input.sex === "male"
      ? hamilton >= 1 && hamilton <= 5
      : ludwig >= 1 && ludwig <= 2
  ) {
    options.push({
      id: "minoxidil_topical",
      name: "Minoxidil tópico (2-5%)",
      evidence_level: "A",
      type: "farmacologico",
      realistic_expectation:
        "Pausa la progresión mientras se usa. Requiere uso continuo indefinido.",
    });
  }

  options.push({
    id: "minoxidil_oral",
    name: "Minoxidil oral (low-dose) — solo con prescripción médica",
    evidence_level: "B",
    type: "farmacologico",
    realistic_expectation:
      "Mayor cobertura que tópico. Requiere supervisión médica.",
  });

  if (input.sex === "male" && hamilton >= 1 && hamilton <= 4) {
    options.push({
      id: "finasterida",
      name: "Finasterida (1 mg/día) — solo con prescripción médica",
      evidence_level: "A",
      type: "farmacologico",
      realistic_expectation:
        "Frena la progresión en el 83% de los hombres. Discutir riesgos con médico.",
    });
  }

  if (
    (input.sex === "male" && hamilton >= 1 && hamilton <= 4) ||
    (input.sex === "female" && ludwig >= 1 && ludwig <= 2)
  ) {
    options.push({
      id: "prp",
      name: "PRP (plasma rico en plaquetas)",
      evidence_level: "B",
      type: "procedimiento",
      realistic_expectation:
        "Coadyuvante eficaz. No reemplaza tratamiento farmacológico.",
    });
  }

  if (
    (input.sex === "male" && hamilton >= 3) ||
    (input.sex === "female" && ludwig >= 2)
  ) {
    options.push({
      id: "fue_transplant",
      name: "Trasplante capilar FUE",
      evidence_level: "B",
      type: "procedimiento",
      realistic_expectation:
        "El pelo trasplantado es permanente; el nativo no. Combinar con tratamiento médico.",
    });
  }

  options.push({
    id: "ketoconazole_shampoo",
    name: "Champú de ketoconazol 2%",
    evidence_level: "B",
    type: "cosmético",
    realistic_expectation:
      "Coadyuvante útil, especialmente con cuero cabelludo seborreico.",
  });

  return options;
}

function buildMythAlerts(input: AlopeciaInput): string[] {
  const myths: string[] = [];
  if (input.mother_father_bald && !input.father_bald)
    myths.push(
      '"La calvicie viene solo del abuelo materno" — es el locus principal pero hay 63+ genes implicados, incluyendo paternos'
    );
  if (input.stress_level >= 7)
    myths.push(
      '"El estrés causa calvicie permanente" — el estrés causa efluvio telógeno (reversible), distinto a la AGA genética'
    );
  if (input.current_treatments.includes("finasterida") && input.sex === "male")
    myths.push(
      '"El minoxidil/finasterida funcionan para siempre sin efectos" — funcionan mientras se usan y tienen efectos secundarios documentados'
    );
  if (
    (input.sex === "male" && (input.hamilton_self_reported ?? 0) >= 3) ||
    (input.sex === "female" && (input.ludwig_self_reported ?? 0) >= 2)
  )
    myths.push(
      '"El trasplante no necesita mantenimiento" — el pelo nativo sigue cayendo sin tratamiento médico coadyuvante'
    );
  return myths;
}

function buildEstimatedProgression(
  input: AlopeciaInput,
  riskLevel: AlopeciaRiskLevel,
  riskType: AlopeciaRiskType
): string {
  if (riskLevel === "bajo") {
    return "Con tu perfil actual, el riesgo de progresión significativa en los próximos 5 años es bajo. Monitoriza cambios anuales y consulta si aparece pérdida visible.";
  }
  if (riskType === "ambiental_reversible") {
    return "Tu pérdida parece influida principalmente por factores modificables. Actuar sobre ellos puede ralentizar significativamente o revertir parte de la caída. Descarta causas médicas con un análisis.";
  }
  if (riskLevel === "moderado") {
    return "Sin intervención, es probable una progresión gradual en los próximos 3-7 años. Los tratamientos de primera línea en esta fase tienen mayor probabilidad de éxito que en estadios avanzados.";
  }
  if (riskLevel === "alto") {
    return "La progresión activa requiere evaluación profesional. Los tratamientos son más eficaces iniciados ahora. La ventana de acción óptima es la actual.";
  }
  return "Progresión significativa probable sin tratamiento. La evaluación dermatológica urgente permite determinar el protocolo más eficaz para tu perfil antes de que se reduzca la zona donante para trasplante.";
}

function buildRealisticExpectations(
  input: AlopeciaInput,
  riskType: AlopeciaRiskType
): string {
  if (riskType === "genetico_predominante") {
    return "Con tu perfil genético, los tratamientos pueden pausar la progresión, no revertirla. La ventana de acción más eficaz es ahora, antes de que los folículos miniaturizados sean irreversibles.";
  }
  if (riskType === "ambiental_reversible") {
    return "Al no existir una carga genética dominante, corregir los factores modificables puede producir mejoras reales en densidad y calidad capilar. El pronóstico con cambios de hábitos es favorable.";
  }
  return "Tu alopecia tiene componentes tanto genéticos como ambientales. Actuar sobre los factores modificables mejorará la respuesta a los tratamientos farmacológicos.";
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateAlopeciaReport(input: AlopeciaInput): AlopeciaReport {
  const geneticScore = buildGeneticScore(input);
  const onsetScore = buildOnsetScore(input);
  const externalScore = buildExternalScore(input);
  const riskScore = Math.min(geneticScore + onsetScore + externalScore, 100);

  const riskLevel = classifyRiskLevel(riskScore);
  const riskType = classifyRiskType(geneticScore, externalScore);
  const recommendedAction = determineRecommendedAction(input, riskLevel);

  const possibleHormonalCause =
    input.sex === "female" &&
    (input.current_hairloss_stage === "moderada" ||
      input.current_hairloss_stage === "avanzada" ||
      (input.ludwig_self_reported !== null && input.ludwig_self_reported >= 2));

  const finasteridaContraindicationAlert =
    input.sex === "female" &&
    input.current_treatments.includes("finasterida");

  return {
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_type: riskType,
    estimated_progression: buildEstimatedProgression(input, riskLevel, riskType),
    modifiable_factors: buildModifiableFactors(input),
    non_modifiable_factors: buildNonModifiableFactors(input),
    recommended_action: recommendedAction,
    evidence_based_options: buildEvidenceOptions(input),
    realistic_expectations: buildRealisticExpectations(input, riskType),
    myth_alerts: buildMythAlerts(input),
    possible_hormonal_cause: possibleHormonalCause,
    finasterida_contraindication_alert: finasteridaContraindicationAlert,
    _genetic_score: geneticScore,
    _onset_score: onsetScore,
    _external_score: externalScore,
  };
}
