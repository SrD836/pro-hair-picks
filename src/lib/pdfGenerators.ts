/**
 * PDF generators for all diagnostic tools.
 * Uses jsPDF to create single-page, optimized reports.
 */
import jsPDF from "jspdf";

// ── Shared helpers ──────────────────────────────────────────────────────────────

const ESPRESSO: [number, number, number] = [45, 34, 24];
const GOLD: [number, number, number] = [196, 169, 125];
const ORANGE: [number, number, number] = [236, 91, 19];
const GRAY: [number, number, number] = [120, 120, 120];
const GREEN: [number, number, number] = [76, 175, 124];
const AMBER: [number, number, number] = [228, 184, 74];
const RED: [number, number, number] = [224, 107, 82];

function header(doc: jsPDF, title: string, subtitle: string) {
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("GuiaDelSalon.com", 105, 12, { align: "center" });
  doc.setFontSize(20);
  doc.setTextColor(...ESPRESSO);
  doc.text(title, 105, 24, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text(subtitle, 105, 32, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(20, 36, 190, 36);
}

function footer(doc: jsPDF) {
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(
    `guiadelsalon.com · ${new Date().toLocaleDateString("es-ES")}`,
    105,
    290,
    { align: "center" }
  );
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text(text, 20, y);
  return y + 7;
}

function bodyText(doc: jsPDF, text: string, y: number, maxWidth = 170): number {
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + lines.length * 4.5;
}

function bulletList(doc: jsPDF, items: string[], y: number, maxWidth = 164): number {
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  let cy = y;
  for (const item of items) {
    const lines = doc.splitTextToSize(`· ${item}`, maxWidth);
    doc.text(lines, 24, cy);
    cy += lines.length * 4;
  }
  return cy + 2;
}

function scoreBar(
  doc: jsPDF,
  label: string,
  score: number,
  max: number,
  x: number,
  y: number,
  width: number
) {
  const pct = Math.min(1, score / max);
  const color = pct >= 0.7 ? GREEN : pct >= 0.4 ? AMBER : RED;

  doc.setFontSize(8);
  doc.setTextColor(...ESPRESSO);
  doc.text(label, x, y);
  doc.text(`${score}/${max}`, x + width, y, { align: "right" });

  // Track
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(x, y + 2, width, 3, 1.5, 1.5, "F");
  // Fill
  doc.setFillColor(...color);
  doc.roundedRect(x, y + 2, width * pct, 3, 1.5, 1.5, "F");

  return y + 12;
}

// ── Diagnóstico Capilar PDF ─────────────────────────────────────────────────────

interface DiagnosticoPDFData {
  healthPct: number;
  riskLabel: string;
  cuticle: number;
  porosity: number;
  elasticity: number;
  scalp: number;
  protocol: string;
  products: { name: string; description: string }[];
}

export function generateDiagnosticoPDF(data: DiagnosticoPDFData) {
  const doc = new jsPDF();
  header(doc, "Tu Pasaporte Capilar", "Diagnóstico Capilar Profesional");

  // Score
  let y = 44;
  doc.setFontSize(36);
  const color = data.healthPct >= 70 ? GREEN : data.healthPct >= 40 ? AMBER : RED;
  doc.setTextColor(...color);
  doc.text(`${data.healthPct}`, 105, y, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`/ 100 — ${data.riskLabel}`, 105, y + 8, { align: "center" });

  // Module scores
  y = 62;
  const barW = 75;
  y = scoreBar(doc, "Cutícula", data.cuticle, 12, 20, y, barW);
  scoreBar(doc, "Porosidad", data.porosity, 20, 110, y - 12, barW);
  y = scoreBar(doc, "Elasticidad", data.elasticity, 21, 20, y, barW);
  scoreBar(doc, "Cuero Cabelludo", data.scalp, 12, 110, y - 12, barW);

  // Protocol
  y = sectionTitle(doc, "Protocolo de Acción", y + 4);
  y = bodyText(doc, data.protocol, y);

  // Products
  y = sectionTitle(doc, "Productos Recomendados", y + 4);
  const prodTexts = data.products.map((p) => `${p.name} — ${p.description}`);
  y = bulletList(doc, prodTexts, y);

  footer(doc);
  doc.save("diagnostico-capilar-guiadelsalon.pdf");
}

// ── Alopecia PDF ────────────────────────────────────────────────────────────────

interface AlopeciaPDFData {
  riskLevel: string;
  riskScore: number;
  riskType: string;
  estimatedProgression: string;
  modifiableFactors: string[];
  nonModifiableFactors: string[];
  recommendedAction: string;
  evidenceOptions: { name: string; realistic_expectation: string }[];
  realisticExpectations: string;
  mythAlerts: string[];
}

export function generateAlopeciaPDF(data: AlopeciaPDFData) {
  const doc = new jsPDF();
  header(doc, "Análisis de Alopecia", "Informe Personalizado");

  let y = 44;
  // Risk score
  doc.setFontSize(28);
  const color =
    data.riskLevel === "bajo" ? GREEN : data.riskLevel === "moderado" ? AMBER : RED;
  doc.setTextColor(...color);
  doc.text(`Riesgo: ${data.riskScore}/100`, 105, y, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Nivel: ${data.riskLevel} · Tipo: ${data.riskType}`, 105, y + 7, {
    align: "center",
  });

  y = 60;
  y = sectionTitle(doc, "Acción Recomendada", y);
  y = bodyText(doc, data.recommendedAction, y);

  y = sectionTitle(doc, "Progresión Estimada", y + 2);
  y = bodyText(doc, data.estimatedProgression, y);

  if (data.modifiableFactors.length) {
    y = sectionTitle(doc, "Factores Modificables", y + 2);
    y = bulletList(doc, data.modifiableFactors, y);
  }

  if (data.nonModifiableFactors.length) {
    y = sectionTitle(doc, "Factores No Modificables", y + 2);
    y = bulletList(doc, data.nonModifiableFactors, y);
  }

  if (data.evidenceOptions.length) {
    y = sectionTitle(doc, "Opciones con Respaldo Científico", y + 2);
    const opts = data.evidenceOptions.map(
      (o) => `${o.name}: ${o.realistic_expectation}`
    );
    y = bulletList(doc, opts, y);
  }

  if (data.mythAlerts.length && y < 240) {
    y = sectionTitle(doc, "Alertas sobre Mitos", y + 2);
    y = bulletList(doc, data.mythAlerts, y);
  }

  // Expectations
  if (y < 260) {
    y = sectionTitle(doc, "Expectativa Realista", y + 2);
    y = bodyText(doc, `"${data.realisticExpectations}"`, y);
  }

  footer(doc);
  doc.save("analisis-alopecia-guiadelsalon.pdf");
}

// ── Canicie PDF ─────────────────────────────────────────────────────────────────

interface CaniciePDFData {
  canicieType: string;
  onsetClassification: string;
  geneticWeight: number;
  environmentalWeight: number;
  modifiableFactors: string[];
  nonModifiableFactors: string[];
  structuralCareNeeded: boolean;
  recommendations: { action: string; rationale: string; priority: string }[];
  realisticExpectations: string;
}

export function generateCaniciePDF(data: CaniciePDFData) {
  const doc = new jsPDF();
  header(doc, "Análisis de Canicie", "Informe Personalizado");

  let y = 44;
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text(`Tipo: ${data.canicieType}`, 20, y);
  doc.text(`Inicio: ${data.onsetClassification}`, 110, y);
  y += 8;
  doc.text(`Peso genético: ${data.geneticWeight}/10`, 20, y);
  doc.text(`Peso ambiental: ${data.environmentalWeight}/10`, 110, y);

  y += 10;
  if (data.modifiableFactors.length) {
    y = sectionTitle(doc, "Puedes Actuar Sobre", y);
    y = bulletList(doc, data.modifiableFactors, y);
  }

  if (data.nonModifiableFactors.length) {
    y = sectionTitle(doc, "Factores No Modificables", y + 2);
    y = bulletList(doc, data.nonModifiableFactors, y);
  }

  if (data.structuralCareNeeded && y < 220) {
    y = sectionTitle(doc, "Cuidado Estructural", y + 2);
    y = bodyText(
      doc,
      "Tu pelo canoso necesita hidratación lipídica activa (ceramidas, 18-MEA, aceites ligeros) y protección UV.",
      y
    );
  }

  y = sectionTitle(doc, "Recomendaciones", y + 2);
  const recs = data.recommendations.map(
    (r) => `[${r.priority}] ${r.action} — ${r.rationale}`
  );
  y = bulletList(doc, recs, y);

  if (y < 260) {
    y = sectionTitle(doc, "Expectativa Realista", y + 2);
    y = bodyText(doc, `"${data.realisticExpectations}"`, y);
  }

  footer(doc);
  doc.save("analisis-canicie-guiadelsalon.pdf");
}

// ── Recovery Timeline PDF ───────────────────────────────────────────────────────

interface RecoveryPDFData {
  totalWeeks: number;
  nextSafeDate: string | null;
  primaryConcern: string;
  weeks: { week: number; label: string; focus: string; treatments: string[] }[];
  maintenance?: { label: string; focus: string };
}

export function generateRecoveryPDF(data: RecoveryPDFData) {
  const doc = new jsPDF();
  header(doc, "Calendario de Recuperación", "Timeline Capilar Personalizado");

  let y = 44;
  doc.setFontSize(10);
  doc.setTextColor(...ESPRESSO);
  doc.text(`Duración: ${data.totalWeeks} semanas`, 20, y);
  if (data.nextSafeDate)
    doc.text(`Próximo tratamiento: ${data.nextSafeDate}`, 110, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Enfoque principal: ${data.primaryConcern}`, 20, y);
  y += 10;

  // Weeks
  for (const week of data.weeks) {
    if (y > 260) break;
    doc.setFontSize(9);
    doc.setTextColor(...ORANGE);
    doc.text(`Semana ${week.week}: ${week.label}`, 20, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const focusLines = doc.splitTextToSize(week.focus, 170);
    doc.text(focusLines, 24, y);
    y += focusLines.length * 4 + 2;

    if (week.treatments.length && y < 255) {
      const tLines = doc.splitTextToSize(
        `Tratamientos: ${week.treatments.join(", ")}`,
        166
      );
      doc.text(tLines, 24, y);
      y += tLines.length * 4 + 4;
    }
  }

  if (data.maintenance && y < 260) {
    y = sectionTitle(doc, "Mantenimiento", y);
    y = bodyText(doc, data.maintenance.focus, y);
  }

  footer(doc);
  doc.save("calendario-recuperacion-guiadelsalon.pdf");
}
