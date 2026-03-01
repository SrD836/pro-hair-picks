// ─── Types ────────────────────────────────────────────────────────────────────

export type LastTreatment =
  | "decoloracion"
  | "tinte"
  | "alisado_quimico"
  | "permanente"
  | "plex"
  | "calor_excesivo"
  | "ninguno";

export type HairPorosity = "baja" | "media" | "alta";
export type ScalpCondition = "normal" | "sensible" | "dermatitis" | "graso";
export type PhaseType = "hidratacion" | "reconstruccion" | "sellado" | "mantenimiento";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface RecoveryInput {
  damage_level: number; // 1–10
  last_treatment: LastTreatment;
  hair_porosity: HairPorosity;
  scalp_condition: ScalpCondition;
}

export interface Treatment {
  category: string;
  product_type: string;
  frequency: string;
  notes?: string;
}

export interface WeekPlan {
  week: number;
  phase: PhaseType;
  focus: string;
  focus_simple: string;
  treatments: Treatment[];
  avoid: string[];
  checkpoint: string;
}

export interface RecoveryCalendar {
  blocked: boolean;
  blocked_message?: string;
  damage_level: number;
  total_weeks: number;
  weeks: WeekPlan[];
  next_safe_treatment_date: string | null;
  chemical_rest_days: number;
  summary: {
    primary_concern: string;
    urgency: UrgencyLevel;
  };
}

// ─── Phase Content Library ────────────────────────────────────────────────────

const PHASE_CONTENT: Record<
  PhaseType,
  {
    focus: string;
    focus_simple: string;
    base_treatments: Treatment[];
    base_avoid: string[];
    base_checkpoint: string;
  }
> = {
  hidratacion: {
    focus:
      "Restaurar el pH de la fibra (4.5–5.5) y reponer la barrera lipídica (ceramidas, 18-MEA). Rehidratar la corteza sin carga proteica prematura.",
    focus_simple:
      "Tu cabello está bebiendo agua — no lo interrumpas con proteína todavía.",
    base_treatments: [
      {
        category: "Limpieza",
        product_type: "Champú pH ácido (4.5–5.5) o sin sulfatos",
        frequency: "2–3× por semana",
      },
      {
        category: "Hidratación profunda",
        product_type:
          "Mascarilla hidratante (ceramidas, pantenol, ácido hialurónico)",
        frequency: "2–3× por semana · dejar 15–20 min",
      },
      {
        category: "Sin aclarado",
        product_type: "Leave-in acondicionador o crema sin aclarado",
        frequency: "A diario en longitudes y puntas",
      },
      {
        category: "Lípidos ligeros",
        product_type:
          "Aceite de argán, jojoba o sésamo (bajo peso molecular)",
        frequency: "3× por semana en puntas y longitudes",
      },
    ],
    base_avoid: [
      "Proteína/queratina hidrolizada (demasiado pronto)",
      "Calor directo superior a 150 °C",
      "Procesos químicos oxidativos (tinte, decoloración)",
      "Cepillado agresivo en húmedo",
      "Champús con SLS o SLES a concentración alta",
    ],
    base_checkpoint:
      "El cabello absorbe el acondicionador con facilidad. Se siente más suave y flexible al tacto. La rotura seca disminuye notablemente.",
  },
  reconstruccion: {
    focus:
      "Reposición de proteínas hidrolizadas de bajo peso molecular (<1000 Da) en la corteza. Reconstitución de enlaces mediante tecnología Plex si el nivel de daño lo justifica. Mejora del módulo de Young (elasticidad medida por tracción).",
    focus_simple:
      "Reponemos el cemento natural entre las capas de tu pelo para que no se rompa.",
    base_treatments: [
      {
        category: "Proteína",
        product_type:
          "Tratamiento proteico (queratina hidrolizada <1000 Da, proteína de soja o trigo hidrolizada)",
        frequency: "1–2× por semana",
        notes: "No superar 2× por semana para evitar sobre-proteización",
      },
      {
        category: "Bond builder",
        product_type:
          "Tratamiento Plex (Olaplex N°3, K18, Wellaplex o similar) si disponible",
        frequency: "1× cada 2 semanas",
      },
      {
        category: "Reconstrucción profunda",
        product_type:
          "Mascarilla de reconstrucción (aminoácidos + aceites + lípidos)",
        frequency: "2× por semana · dejar 20–30 min",
      },
      {
        category: "Lípidos",
        product_type: "Aceite de jojoba o aguacate en puntas",
        frequency: "2× por semana",
      },
    ],
    base_avoid: [
      "Procesos oxidativos (tinte o decoloración)",
      "Alisado o permanente",
      "Calor directo superior a 180 °C",
      "Más de 2 aplicaciones de proteína a la semana (riesgo de sobre-proteización: rigidez, rotura seca)",
    ],
    base_checkpoint:
      "El cabello recupera elasticidad visible: al estirarlo vuelve a su posición sin romperse. El frizz se reduce. Las puntas se ven más sanas.",
  },
  sellado: {
    focus:
      "Sellado de la cutícula mediante acidificación controlada (pH 4.0–4.5). Creación de capa hidrofóbica protectora con lípidos y silicones de alto peso molecular. Cierre definitivo de escamas.",
    focus_simple:
      "Sellamos todo lo que reconstruimos, como barnizar madera restaurada. Esta semana: brillo y protección.",
    base_treatments: [
      {
        category: "Acidificación",
        product_type:
          "Enjuague sellador: vinagre de sidra 1:4 en agua o ácido cítrico diluido al 0.5%",
        frequency: "2× por semana tras el acondicionador",
      },
      {
        category: "Gloss / Brillo",
        product_type:
          "Baño de brillo o glossing sin oxidación (sin peróxido)",
        frequency: "1× por semana",
      },
      {
        category: "Sellado de cutícula",
        product_type:
          "Mascarilla selladora (dimeticona, manteca de karité, cera de carnaúba)",
        frequency: "1× por semana · aclarar con agua fría",
      },
      {
        category: "Protección exterior",
        product_type:
          "Aceite denso en puntas (argán, ricino o coco fraccionado)",
        frequency: "3× por semana antes de salir",
      },
    ],
    base_avoid: [
      "Productos con pH superior a 7 (alcalinos)",
      "Calor intenso sin protector (>150 °C sin producto de barrera)",
      "Humedad sin protección (no salir con el cabello húmedo a la lluvia o vapor intenso)",
      "Nueva carga proteica",
    ],
    base_checkpoint:
      "El cabello tiene brillo visible y las puntas lucen más lisas. No se esponja con la humedad ambiental. El tacto es suave sin ser pesado.",
  },
  mantenimiento: {
    focus:
      "Consolidación de los resultados obtenidos. Rutina de mantenimiento estable que prevenga el deterioro. Monitorización de la ventana de re-tratamiento químico (fecha de seguridad alcanzada o próxima).",
    focus_simple:
      "Tu cabello está estabilizado — ahora solo necesita consistencia para no perder lo ganado.",
    base_treatments: [
      {
        category: "Limpieza",
        product_type:
          "Champú de mantenimiento (sin sulfatos o pH equilibrado 4.5–5.5)",
        frequency: "2–3× por semana",
      },
      {
        category: "Hidratación",
        product_type:
          "Mascarilla de mantenimiento (ceramidas o proteína ligera)",
        frequency: "1× por semana",
      },
      {
        category: "Protección térmica",
        product_type:
          "Protector de calor antes de cualquier styling térmico",
        frequency: "Siempre que uses calor",
      },
      {
        category: "Lípidos",
        product_type: "Aceite ligero en puntas",
        frequency: "2–3× por semana",
      },
    ],
    base_avoid: [
      "Cambios bruscos de toda la rutina a la vez",
      "Mezclar productos alcalinos y ácidos el mismo día",
      "Saltarse la protección térmica",
    ],
    base_checkpoint:
      "El estado del cabello se mantiene estable semana a semana. La elasticidad y el brillo de fases anteriores se conservan. Has alcanzado (o estás próximo a) la ventana de re-tratamiento seguro.",
  },
};

// ─── Treatment modifiers per context ─────────────────────────────────────────

const SCALP_OVERRIDES: Partial<
  Record<ScalpCondition, { add_treatments?: Treatment[]; add_avoid?: string[] }>
> = {
  sensible: {
    add_treatments: [
      {
        category: "Cuero cabelludo",
        product_type:
          "Tónico calmante (pantenol, bisabolol, agua termal) — solo en cuero cabelludo",
        frequency: "3× por semana",
      },
    ],
    add_avoid: [
      "Champús con alcohol desnaturalizado o perfume intenso",
      "Aplicar mascarillas directamente sobre el cuero cabelludo",
    ],
  },
  dermatitis: {
    add_treatments: [
      {
        category: "Cuero cabelludo",
        product_type:
          "Champú sin sulfatos o de avena coloidal (co-wash) — solo en cuero cabelludo",
        frequency: "2× por semana máximo",
      },
      {
        category: "Calmante",
        product_type:
          "Sérum o aceite de árbol de té al 0.5% en cuero cabelludo",
        frequency: "2× por semana",
      },
    ],
    add_avoid: [
      "Cualquier producto con fragancia o alcohol en el cuero cabelludo",
      "Rascado o frotado agresivo al lavar",
    ],
  },
  graso: {
    add_treatments: [
      {
        category: "Cuero cabelludo",
        product_type:
          "Tónico astringente (zinc, arcilla, extracto de corteza de sauce) — solo raíz",
        frequency: "2× por semana",
        notes: "No aplicar en longitudes",
      },
    ],
    add_avoid: [
      "Aceites o mascarillas pesadas directamente en el cuero cabelludo",
    ],
  },
};

const POROSITY_NOTES: Record<HairPorosity, string> = {
  baja:
    "Porosidad baja: aplica los productos con vapor o envoltura caliente (toalla húmeda tibia) para facilitar la absorción. Deja los productos el doble del tiempo indicado.",
  media: "",
  alta:
    "Porosidad alta: usa el método LCO (Leave-in → Cream → Oil) para sellar la humedad en capas. Los productos deben aplicarse en cabello húmedo, no mojado.",
};

// ─── Chemical Rest Calculation ────────────────────────────────────────────────

const BASE_REST_DAYS: Record<LastTreatment, number> = {
  decoloracion: 28,
  tinte: 14,
  alisado_quimico: 35,
  permanente: 28,
  plex: 7,
  calor_excesivo: 7,
  ninguno: 7,
};

const DAMAGE_MULTIPLIER: Record<number, number> = {
  1: 1.0, 2: 1.0, 3: 1.0,
  4: 1.3, 5: 1.5, 6: 1.7,
  7: 2.0, 8: 2.5, 9: 3.0,
};

const POROSITY_MULTIPLIER: Record<HairPorosity, number> = {
  baja: 0.85,
  media: 1.0,
  alta: 1.3,
};

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDateES(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Phase Sequence Builder ────────────────────────────────────────────────────

function buildPhaseSequence(damageLevel: number): PhaseType[] {
  if (damageLevel <= 3) {
    return [
      "hidratacion", "hidratacion",
      "mantenimiento", "mantenimiento",
    ];
  }
  if (damageLevel <= 6) {
    return [
      "hidratacion", "hidratacion",
      "reconstruccion", "reconstruccion",
      "mantenimiento", "mantenimiento",
    ];
  }
  // 7–9
  return [
    "hidratacion", "hidratacion",
    "reconstruccion", "reconstruccion",
    "sellado", "sellado",
    "mantenimiento", "mantenimiento",
  ];
}

function buildWeek(
  weekNumber: number,
  phase: PhaseType,
  porosity: HairPorosity,
  scalp: ScalpCondition,
  damageLevel: number
): WeekPlan {
  const content = PHASE_CONTENT[phase];

  const treatments: Treatment[] = [...content.base_treatments];
  const avoid: string[] = [...content.base_avoid];

  // Apply scalp overrides
  const scalpMod = SCALP_OVERRIDES[scalp];
  if (scalpMod) {
    if (scalpMod.add_treatments) treatments.push(...scalpMod.add_treatments);
    if (scalpMod.add_avoid) avoid.push(...scalpMod.add_avoid);
  }

  // Apply porosity note
  const porosityNote = POROSITY_NOTES[porosity];
  if (porosityNote) {
    const firstTreatment = treatments[0];
    if (firstTreatment) {
      firstTreatment.notes = porosityNote;
    }
  }

  // For high damage in reconstruction phase, add Plex as more prominent
  let focus = content.focus;
  let focus_simple = content.focus_simple;
  if (phase === "reconstruccion" && damageLevel >= 7) {
    focus_simple =
      "Reponemos el cemento natural entre las capas de tu pelo. El daño es severo: sé constante y no saltes este paso.";
  }

  // For high porosity in sealing phase
  if (phase === "sellado" && porosity === "alta") {
    focus_simple =
      "Sellamos todo lo reconstruido. Tu porosidad alta hace este paso especialmente crítico — sin sellado, el cabello pierde la hidratación en horas.";
  }

  return {
    week: weekNumber,
    phase,
    focus,
    focus_simple,
    treatments,
    avoid,
    checkpoint: content.base_checkpoint,
  };
}

// ─── Main Algorithm ────────────────────────────────────────────────────────────

export function generateRecoveryCalendar(
  input: RecoveryInput
): RecoveryCalendar {
  const { damage_level, last_treatment, hair_porosity, scalp_condition } =
    input;

  // ── Block if damage = 10 ──────────────────────────────────────────────────
  if (damage_level >= 10) {
    return {
      blocked: true,
      blocked_message:
        "Este nivel de daño requiere diagnóstico profesional presencial. La fibra está al límite de la rotura estructural: un calendario genérico puede empeorar el estado. Consulta a un tricólogo o técnico capilar especializado antes de continuar.",
      damage_level,
      total_weeks: 0,
      weeks: [],
      next_safe_treatment_date: null,
      chemical_rest_days: 0,
      summary: {
        primary_concern:
          "Daño extremo — estructura capilar comprometida al máximo",
        urgency: "critical",
      },
    };
  }

  // ── Chemical rest days ────────────────────────────────────────────────────
  const baseDays = BASE_REST_DAYS[last_treatment];
  const dmg = Math.min(Math.max(Math.floor(damage_level), 1), 9);
  const dmgMult = DAMAGE_MULTIPLIER[dmg] ?? 1.0;
  const porMult = POROSITY_MULTIPLIER[hair_porosity];
  const chemical_rest_days = Math.round(baseDays * dmgMult * porMult);

  const today = new Date().toISOString().split("T")[0];
  const next_safe_treatment_date = addDays(today, chemical_rest_days);

  // ── Phase sequence ────────────────────────────────────────────────────────
  const phases = buildPhaseSequence(damage_level);
  const total_weeks = phases.length;

  const weeks: WeekPlan[] = phases.map((phase, idx) =>
    buildWeek(idx + 1, phase, hair_porosity, scalp_condition, damage_level)
  );

  // ── Summary ───────────────────────────────────────────────────────────────
  const urgencyMap: Record<number, UrgencyLevel> = {
    1: "low", 2: "low", 3: "low",
    4: "medium", 5: "medium", 6: "medium",
    7: "high", 8: "high", 9: "high",
  };

  const TREATMENT_CONCERNS: Record<LastTreatment, string> = {
    decoloracion:
      "Daño oxidativo severo + pérdida de melanina y proteínas estructurales",
    tinte: "Alteración del pH y pérdida parcial de lípidos cuticulares",
    alisado_quimico:
      "Reducción de puentes disulfuro y aplanamiento permanente de la cutícula",
    permanente:
      "Rotura y re-formación de puentes disulfuro con estrés estructural residual",
    plex: "Intervención de reconstrucción reciente — curar adecuadamente",
    calor_excesivo:
      "Desnaturalización proteica térmica y pérdida de la capa lipídica superficial",
    ninguno: "Sin tratamiento agresivo previo documentado",
  };

  return {
    blocked: false,
    damage_level,
    total_weeks,
    weeks,
    next_safe_treatment_date: formatDateES(next_safe_treatment_date),
    chemical_rest_days,
    summary: {
      primary_concern: TREATMENT_CONCERNS[last_treatment],
      urgency: urgencyMap[dmg] ?? "medium",
    },
  };
}
