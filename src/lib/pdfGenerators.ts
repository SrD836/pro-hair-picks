/**
 * PDF generators for all diagnostic tools.
 * Uses jsPDF to create single-page, optimized reports.
 */
import jsPDF from "jspdf";
import type { WizardSession } from '@/types/tools.types';
import { WIZARD_TOOL_ORDER, TOOLS_CONFIG } from '@/data/tools.config';

// ── Shared helpers ──────────────────────────────────────────────────────────────

const ESPRESSO: [number, number, number] = [45, 34, 24];
const GOLD: [number, number, number] = [196, 169, 125];
const CREAM: [number, number, number] = [245, 240, 232];
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
  const color = pct <= 0.3 ? GREEN : pct <= 0.6 ? AMBER : RED;

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
  const pw = 210; // page width
  const color: [number, number, number] = data.healthPct >= 70 ? GREEN : data.healthPct >= 40 ? AMBER : RED;
  const statusLabel = data.healthPct >= 70 ? 'Cabello Saludable' : data.healthPct >= 40 ? 'Cabello Comprometido' : 'Cabello en Riesgo';

  // ── Full page espresso background
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, "F");

  // ── Header text
  doc.setFontSize(8);
  doc.setTextColor(196, 169, 125);
  doc.text("INFORME PERSONALIZADO", pw / 2, 16, { align: "center" });
  doc.setFontSize(22);
  doc.setTextColor(245, 240, 232);
  doc.text("Tu Pasaporte Capilar", pw / 2, 28, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(245, 240, 232);
  doc.text("Diagnóstico Capilar Profesional", pw / 2, 35, { align: "center" });

  // ── Cream card background
  const cardX = 15, cardY = 42, cardW = pw - 30, cardH = 240;
  doc.setFillColor(245, 240, 232);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, "F");

  // ── Score circle (drawn with arc)
  const cx = pw / 2, cy = 78, r = 22;
  // Track circle
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(3);
  doc.circle(cx, cy, r, "S");
  // Colored arc (approximate with full circle in the score color)
  doc.setDrawColor(...color);
  doc.setLineWidth(3.5);
  // Draw arc proportional to score
  const startAngle = -90;
  const endAngle = startAngle + (data.healthPct / 100) * 360;
  // jsPDF doesn't have arc, so draw colored circle overlay
  for (let angle = startAngle; angle < endAngle; angle += 2) {
    const rad = (angle * Math.PI) / 180;
    const rad2 = ((angle + 2) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad);
    const y1 = cy + r * Math.sin(rad);
    const x2 = cx + r * Math.cos(rad2);
    const y2 = cy + r * Math.sin(rad2);
    doc.line(x1, y1, x2, y2);
  }

  // Score number inside circle
  doc.setFontSize(24);
  doc.setTextColor(...ESPRESSO);
  doc.text(`${data.healthPct}`, cx, cy + 3, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(120, 115, 105);
  doc.text("/ 100", cx, cy + 9, { align: "center" });

  // Risk badge
  doc.setFillColor(...color);
  const badgeW = doc.getTextWidth(data.riskLabel) + 12;
  doc.roundedRect(cx - badgeW / 2, cy + r + 3, badgeW, 7, 3, 3, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(data.riskLabel, cx, cy + r + 8, { align: "center" });

  // Status label
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text("SALUD CAPILAR", cx, cy + r + 18, { align: "center" });
  doc.setFontSize(14);
  doc.setTextColor(...ESPRESSO);
  doc.text(statusLabel, cx, cy + r + 26, { align: "center" });

  // ── Dimension score cards (2x2 grid)
  const gridY = cy + r + 34;
  const gridX = cardX + 8;
  const cellW = (cardW - 24) / 2;
  const cellH = 22;
  const gap = 5;

  const dims = [
    { label: "Cutícula", score: data.cuticle, max: 12 },
    { label: "Porosidad", score: data.porosity, max: 20 },
    { label: "Elasticidad", score: data.elasticity, max: 21 },
    { label: "Cuero Cabelludo", score: data.scalp, max: 12 },
  ];

  dims.forEach((dim, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const dx = gridX + col * (cellW + gap);
    const dy = gridY + row * (cellH + gap);
    const pct = Math.min(1, dim.score / dim.max);
    const dimColor: [number, number, number] = pct <= 0.3 ? GREEN : pct <= 0.6 ? AMBER : RED;

    // Card bg
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(dx, dy, cellW, cellH, 3, 3, "F");
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.roundedRect(dx, dy, cellW, cellH, 3, 3, "S");

    // Label + score
    doc.setFontSize(8);
    doc.setTextColor(...ESPRESSO);
    doc.text(dim.label, dx + 4, dy + 7);
    doc.setTextColor(...dimColor);
    doc.setFontSize(11);
    doc.text(`${dim.score}`, dx + cellW - 16, dy + 8, { align: "right" });
    doc.setFontSize(7);
    doc.setTextColor(160, 155, 145);
    doc.text(`/${dim.max}`, dx + cellW - 4, dy + 8, { align: "right" });

    // Progress bar
    const barX = dx + 4, barY = dy + 13, barW = cellW - 8, barH = 3;
    doc.setFillColor(235, 232, 225);
    doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, "F");
    doc.setFillColor(...dimColor);
    if (barW * pct > 0) {
      doc.roundedRect(barX, barY, Math.max(3, barW * pct), barH, 1.5, 1.5, "F");
    }
  });

  // ── Protocol section
  let y = gridY + 2 * (cellH + gap) + 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX + 8, y - 2, cardW - 16, 1, 0, 0, "F");
  doc.setDrawColor(230, 225, 215);
  doc.line(cardX + 8, y - 2, cardX + cardW - 8, y - 2);

  y += 4;
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text("Protocolo de Acción", cardX + 10, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 95, 85);
  const protocolLines = doc.splitTextToSize(data.protocol, cardW - 24);
  doc.text(protocolLines, cardX + 10, y);
  y += protocolLines.length * 4 + 6;

  // ── Products section
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text("Productos Recomendados", cardX + 10, y);
  y += 6;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 95, 85);
  for (const p of data.products) {
    if (y > cardY + cardH - 10) break;
    const line = `· ${p.name} — ${p.description}`;
    const pLines = doc.splitTextToSize(line, cardW - 24);
    doc.text(pLines, cardX + 10, y);
    y += pLines.length * 3.8 + 2;
  }

  // ── Footer
  doc.setFontSize(7);
  doc.setTextColor(196, 169, 125);
  doc.text(
    `guiadelsalon.com · ${new Date().toLocaleDateString("es-ES")}`,
    pw / 2,
    290,
    { align: "center" }
  );

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

// ── Complete Diagnostic PDF ──────────────────────────────────────────────────

const TOOL_MAP = Object.fromEntries(TOOLS_CONFIG.map((t) => [t.id, t]));

function riskColor(score: number, max = 100): [number, number, number] {
  const pct = score / max;
  return pct <= 0.3 ? GREEN : pct <= 0.6 ? AMBER : RED;
}

function statusLabel(score: number): string {
  if (score <= 25) return 'Excelente';
  if (score <= 50) return 'Bueno';
  if (score <= 75) return 'Atención recomendada';
  return 'Consulta profesional';
}

// Draw a branded page with espresso background + optional cream card
function brandedPage(doc: jsPDF, opts: {
  badge?: string;
  title: string;
  subtitle?: string;
  showCard?: boolean;
  cardHeight?: number;
}): { cardX: number; cardY: number; cardW: number; y: number } {
  const pw = 210;
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, 'F');

  let y = 18;
  if (opts.badge) {
    // Badge pill (light gold tint)
    doc.setFillColor(220, 210, 195);
    const bw = doc.setFontSize(7).getTextWidth(opts.badge) + 14;
    doc.roundedRect(pw / 2 - bw / 2, y - 4, bw, 8, 4, 4, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(opts.badge, pw / 2, y + 1, { align: 'center' });
    y += 12;
  }

  doc.setFontSize(20);
  doc.setTextColor(...CREAM);
  doc.text(opts.title, pw / 2, y + 4, { align: 'center' });
  y += 10;

  if (opts.subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
    doc.text(opts.subtitle, pw / 2, y + 2, { align: 'center' });
    y += 10;
  }

  // Gold separator line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(40, y, pw - 40, y);
  y += 6;

  const cardX = 15, cardW = pw - 30;
  let cardY = y;

  if (opts.showCard !== false) {
    const cardH = opts.cardHeight ?? 230;
    doc.setFillColor(...CREAM);
    doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');
    y = cardY + 12;
  }

  return { cardX, cardY, cardW, y };
}

// Draw a score arc circle like on the web
function drawScoreCircle(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  score: number,
  max: number,
  color: [number, number, number]
) {
  // Track
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(3);
  doc.circle(cx, cy, r, 'S');
  // Colored arc
  doc.setDrawColor(...color);
  doc.setLineWidth(3.5);
  const pct = Math.min(1, score / max);
  const startAngle = -90;
  const endAngle = startAngle + pct * 360;
  for (let angle = startAngle; angle < endAngle; angle += 2) {
    const rad = (angle * Math.PI) / 180;
    const rad2 = ((angle + 2) * Math.PI) / 180;
    doc.line(
      cx + r * Math.cos(rad), cy + r * Math.sin(rad),
      cx + r * Math.cos(rad2), cy + r * Math.sin(rad2)
    );
  }
  // Number
  doc.setFontSize(22);
  doc.setTextColor(...ESPRESSO);
  doc.text(`${score}`, cx, cy + 3, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(140, 135, 125);
  doc.text(`/ ${max}`, cx, cy + 9, { align: 'center' });
}

// Small inline progress bar inside a cream card
function cardScoreBar(
  doc: jsPDF,
  label: string,
  score: number,
  max: number,
  x: number,
  y: number,
  width: number
): number {
  const pct = Math.min(1, score / max);
  const color = pct <= 0.3 ? GREEN : pct <= 0.6 ? AMBER : RED;

  doc.setFontSize(8);
  doc.setTextColor(...ESPRESSO);
  doc.text(label, x, y);
  doc.setTextColor(...color);
  doc.text(`${score}/${max}`, x + width, y, { align: 'right' });

  // Track
  doc.setFillColor(235, 232, 225);
  doc.roundedRect(x, y + 2, width, 3, 1.5, 1.5, 'F');
  // Fill
  doc.setFillColor(...color);
  if (pct > 0) doc.roundedRect(x, y + 2, Math.max(3, width * pct), 3, 1.5, 1.5, 'F');

  return y + 12;
}

// Card section title with gold accent
function cardSectionTitle(doc: jsPDF, text: string, x: number, y: number): number {
  doc.setFillColor(...ORANGE);
  doc.roundedRect(x, y - 3, 2, 8, 1, 1, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...ESPRESSO);
  doc.text(text, x + 6, y + 2);
  return y + 10;
}

// Bullet list inside cream card
function cardBulletList(doc: jsPDF, items: string[], x: number, y: number, maxWidth: number): number {
  doc.setFontSize(8);
  doc.setTextColor(80, 75, 65);
  let cy = y;
  for (const item of items) {
    doc.setTextColor(...ORANGE);
    doc.text('→', x, cy);
    doc.setTextColor(80, 75, 65);
    const lines = doc.splitTextToSize(item, maxWidth - 8);
    doc.text(lines, x + 6, cy);
    cy += lines.length * 4 + 2;
  }
  return cy + 2;
}

// Body text inside card
function cardBodyText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number {
  doc.setFontSize(8.5);
  doc.setTextColor(90, 85, 75);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 4.5 + 2;
}

function ensureCardSpace(doc: jsPDF, y: number, needed: number, cardBottom: number): number {
  if (y + needed > cardBottom) {
    // Can't fit, just return y — caller should skip
    return y;
  }
  return y;
}

function multiPageFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(
      `guiadelsalon.com · ${new Date().toLocaleDateString('es-ES')} · Pág. ${i}/${pages}`,
      105,
      290,
      { align: 'center' }
    );
  }
}

export function generateCompletePDF(session: WizardSession) {
  const doc = new jsPDF();
  const pw = 210;
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const diag = session.completedModules['diagnostico-capilar'];
  const canicie = session.completedModules['analizador-canicie'];
  const alopecia = session.completedModules['analizador-alopecia'];

  // Compute averages
  const validScores = [diag, canicie, alopecia]
    .filter((m) => m?.score != null)
    .map((m) => m!.score!);
  const avgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER + OVERALL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, 'F');

  // Subtle radial glow (simulate with a lighter circle)
  doc.setFillColor(60, 48, 34);
  doc.circle(pw / 2, 80, 60, 'F');
  // Cover back over
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 10, 'F');

  // Badge
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text('INFORME COMPLETO', pw / 2, 22, { align: 'center' });

  // Title
  doc.setFontSize(24);
  doc.setTextColor(...CREAM);
  doc.text('Diagnóstico Capilar Integral', pw / 2, 38, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text(`Generado el ${dateStr}`, pw / 2, 47, { align: 'center' });

  // Gold separator
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(50, 52, pw - 50, 52);

  // ── Overall score circle ──
  const cx = pw / 2, cy = 82, r = 22;
  const avgColor = riskColor(avgScore);
  drawScoreCircle(doc, cx, cy, r, avgScore, 100, avgColor);

  // Status label below circle
  const overallStatus = statusLabel(avgScore);
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text('ESTADO GENERAL', cx, cy + r + 10, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(...CREAM);
  doc.text(overallStatus, cx, cy + r + 18, { align: 'center' });

  // ── Cream summary card ──
  const cardX = 15, cardY = cy + r + 26, cardW = pw - 30, cardH = 170;
  doc.setFillColor(...CREAM);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');

  let y = cardY + 12;

  // Three module mini-cards (grid)
  const modules = [
    { id: 'diagnostico-capilar', emoji: '🔬', label: 'Salud Capilar' },
    { id: 'analizador-canicie', emoji: '🦳', label: 'Canicie' },
    { id: 'analizador-alopecia', emoji: '💈', label: 'Riesgo Alopecia' },
  ];

  const cellW = (cardW - 24) / 3;
  const cellH = 36;
  modules.forEach((mod, i) => {
    const result = session.completedModules[mod.id];
    const dx = cardX + 8 + i * (cellW + 4);
    const dy = y;

    // Mini card bg
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(dx, dy, cellW, cellH, 3, 3, 'F');
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.roundedRect(dx, dy, cellW, cellH, 3, 3, 'S');

    // Emoji + label
    doc.setFontSize(7);
    doc.setTextColor(140, 135, 125);
    doc.text(mod.label, dx + cellW / 2, dy + 7, { align: 'center' });

    if (result?.score != null) {
      const sc = result.score;
      const col = riskColor(sc);

      // Score
      doc.setFontSize(18);
      doc.setTextColor(...col);
      doc.text(`${sc}`, dx + cellW / 2, dy + 20, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(160, 155, 145);
      doc.text('/100', dx + cellW / 2 + 10, dy + 20);

      // Progress bar
      const barX = dx + 4, barY = dy + 26, barW = cellW - 8, barH = 3;
      doc.setFillColor(235, 232, 225);
      doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, 'F');
      doc.setFillColor(...col);
      const pct = Math.min(1, sc / 100);
      if (pct > 0) doc.roundedRect(barX, barY, Math.max(3, barW * pct), barH, 1.5, 1.5, 'F');
    } else {
      doc.setFontSize(10);
      doc.setTextColor(180, 175, 165);
      doc.text('—', dx + cellW / 2, dy + 20, { align: 'center' });
    }
  });

  y += cellH + 10;

  // ── Hallazgos principales ──
  y = cardSectionTitle(doc, 'Hallazgos Principales', cardX + 8, y);

  WIZARD_TOOL_ORDER.forEach((toolId) => {
    const tool = TOOL_MAP[toolId];
    const result = session.completedModules[toolId];
    if (!tool || !result || y > cardY + cardH - 20) return;

    doc.setFontSize(8.5);
    doc.setTextColor(...ESPRESSO);
    doc.text(`${tool.title}`, cardX + 10, y);

    if (result.score != null) {
      doc.setTextColor(...riskColor(result.score));
      doc.text(`${result.score}/100`, cardX + cardW - 10, y, { align: 'right' });
    }
    y += 5;

    doc.setFontSize(7.5);
    doc.setTextColor(100, 95, 85);
    const sLines = doc.splitTextToSize(result.summary, cardW - 24);
    doc.text(sLines, cardX + 10, y);
    y += sLines.length * 3.5 + 5;
  });

  // ── Recomendaciones ──
  if (y < cardY + cardH - 30) {
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(cardX + 10, y, cardX + cardW - 10, y);
    y += 8;

    y = cardSectionTitle(doc, 'Recomendaciones', cardX + 8, y);

    const recommendations: string[] = [];
    if (alopecia?.rawResult) {
      const r = alopecia.rawResult;
      if (typeof r.recommendedAction === 'string') recommendations.push(r.recommendedAction);
    }
    if (canicie?.rawResult) {
      const r = canicie.rawResult;
      if (typeof r.realisticExpectations === 'string') recommendations.push(r.realisticExpectations);
    }
    if (diag?.rawResult) {
      if (typeof diag.rawResult.protocol === 'string') recommendations.push(diag.rawResult.protocol);
    }

    if (recommendations.length) {
      y = cardBulletList(doc, recommendations, cardX + 10, y, cardW - 20);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: DIAGNÓSTICO CAPILAR DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if (diag?.rawResult) {
    doc.addPage();
    const raw = diag.rawResult as Record<string, unknown>;

    doc.setFillColor(...ESPRESSO);
    doc.rect(0, 0, pw, 297, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text('MÓDULO 1 DE 3', pw / 2, 16, { align: 'center' });
    doc.setFontSize(20);
    doc.setTextColor(...CREAM);
    doc.text('Diagnóstico Capilar', pw / 2, 30, { align: 'center' });

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(50, 35, pw - 50, 35);

    // Cream card
    const cX = 15, cY = 42, cW = pw - 30, cH = 240;
    doc.setFillColor(...CREAM);
    doc.roundedRect(cX, cY, cW, cH, 6, 6, 'F');

    // Score circle
    const healthPct = typeof raw.healthPct === 'number' ? raw.healthPct : (diag.score ?? 0);
    const riskLabel = typeof raw.riskLabel === 'string' ? raw.riskLabel : String(raw.riskLevel ?? '');
    const scoreCol = riskColor(healthPct);

    drawScoreCircle(doc, pw / 2, cY + 30, 20, healthPct, 100, scoreCol);

    // Risk badge
    doc.setFillColor(...scoreCol);
    const bw = doc.setFontSize(7).getTextWidth(riskLabel) + 12;
    doc.roundedRect(pw / 2 - bw / 2, cY + 53, bw, 7, 3, 3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(riskLabel, pw / 2, cY + 58, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...ORANGE);
    doc.text('SALUD CAPILAR', pw / 2, cY + 68, { align: 'center' });

    // Dimension score cards (2x2)
    const scores = raw.scores as Record<string, number> | undefined;
    if (scores) {
      const gridY = cY + 76;
      const gX = cX + 8;
      const gcW = (cW - 24) / 2;
      const gcH = 22;
      const gap = 5;

      const dims = [
        { label: 'Cutícula', score: scores.cuticle ?? 0, max: 12 },
        { label: 'Porosidad', score: scores.porosity ?? 0, max: 20 },
        { label: 'Elasticidad', score: scores.elasticity ?? 0, max: 21 },
        { label: 'Cuero Cabelludo', score: scores.scalp ?? 0, max: 12 },
      ];

      dims.forEach((dim, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const dx = gX + col * (gcW + gap);
        const dy = gridY + row * (gcH + gap);
        const pct = Math.min(1, dim.score / dim.max);
        const dimCol: [number, number, number] = pct <= 0.3 ? GREEN : pct <= 0.6 ? AMBER : RED;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(dx, dy, gcW, gcH, 3, 3, 'F');
        doc.setDrawColor(230, 225, 215);
        doc.setLineWidth(0.3);
        doc.roundedRect(dx, dy, gcW, gcH, 3, 3, 'S');

        doc.setFontSize(8);
        doc.setTextColor(...ESPRESSO);
        doc.text(dim.label, dx + 4, dy + 7);
        doc.setTextColor(...dimCol);
        doc.setFontSize(11);
        doc.text(`${dim.score}`, dx + gcW - 16, dy + 8, { align: 'right' });
        doc.setFontSize(7);
        doc.setTextColor(160, 155, 145);
        doc.text(`/${dim.max}`, dx + gcW - 4, dy + 8, { align: 'right' });

        const barX = dx + 4, barY2 = dy + 13, barW = gcW - 8, barH = 3;
        doc.setFillColor(235, 232, 225);
        doc.roundedRect(barX, barY2, barW, barH, 1.5, 1.5, 'F');
        doc.setFillColor(...dimCol);
        if (barW * pct > 0) doc.roundedRect(barX, barY2, Math.max(3, barW * pct), barH, 1.5, 1.5, 'F');
      });

      y = gridY + 2 * (gcH + gap) + 8;
    } else {
      y = cY + 78;
    }

    // Divider
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(cX + 10, y, cX + cW - 10, y);
    y += 8;

    // Protocol
    if (typeof raw.protocol === 'string') {
      y = cardSectionTitle(doc, 'Protocolo de Acción', cX + 8, y);
      y = cardBodyText(doc, raw.protocol, cX + 10, y, cW - 24);
      y += 4;
    }

    // Products
    const products = raw.products as Array<{ name: string; description: string }> | undefined;
    if (products?.length && y < cY + cH - 15) {
      y = cardSectionTitle(doc, 'Productos Recomendados', cX + 8, y);
      doc.setFontSize(7.5);
      doc.setTextColor(90, 85, 75);
      for (const p of products) {
        if (y > cY + cH - 10) break;
        const line = `${p.name} — ${p.description}`;
        y = cardBulletList(doc, [line], cX + 10, y, cW - 24);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3: CANICIE DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if (canicie?.rawResult) {
    doc.addPage();
    const raw = canicie.rawResult as Record<string, unknown>;

    doc.setFillColor(...ESPRESSO);
    doc.rect(0, 0, pw, 297, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text('MÓDULO 2 DE 3', pw / 2, 16, { align: 'center' });
    doc.setFontSize(20);
    doc.setTextColor(...CREAM);
    doc.text('Análisis de Canicie', pw / 2, 30, { align: 'center' });

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(50, 35, pw - 50, 35);

    // Cream card
    const cX = 15, cY = 42, cW = pw - 30, cH = 240;
    doc.setFillColor(...CREAM);
    doc.roundedRect(cX, cY, cW, cH, 6, 6, 'F');

    y = cY + 14;

    // Type + onset badges
    const canicieType = typeof raw.canicieType === 'string' ? raw.canicieType : '';
    const onset = typeof raw.onsetClassification === 'string' ? raw.onsetClassification : '';

    if (canicieType || onset) {
      const badges = [canicieType && `Tipo: ${canicieType}`, onset && `Inicio: ${onset}`].filter(Boolean);
      doc.setFontSize(8);
      let bx = cX + 10;
      badges.forEach((b) => {
        const tw = doc.getTextWidth(b!) + 10;
        doc.setFillColor(...ESPRESSO);
        doc.roundedRect(bx, y - 4, tw, 8, 4, 4, 'F');
        doc.setTextColor(...CREAM);
        doc.text(b!, bx + 5, y + 1);
        bx += tw + 4;
      });
      y += 12;
    }

    // Genetic vs environmental bars
    const genW = typeof raw.geneticWeight === 'number' ? raw.geneticWeight : 0;
    const envW = typeof raw.environmentalWeight === 'number' ? raw.environmentalWeight : 0;

    y = cardScoreBar(doc, 'Componente genético', genW, 10, cX + 10, y, cW - 24);
    y = cardScoreBar(doc, 'Componente ambiental', envW, 10, cX + 10, y, cW - 24);

    // Divider
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(cX + 10, y, cX + cW - 10, y);
    y += 8;

    // Modifiable factors
    const modFactors = raw.modifiableFactors as string[] | undefined;
    if (modFactors?.length && y < cY + cH - 30) {
      y = cardSectionTitle(doc, 'Puedes Actuar Sobre', cX + 8, y);
      y = cardBulletList(doc, modFactors, cX + 10, y, cW - 24);
    }

    // Non-modifiable factors
    const nonModFactors = raw.nonModifiableFactors as string[] | undefined;
    if (nonModFactors?.length && y < cY + cH - 30) {
      y = cardSectionTitle(doc, 'Factores No Modificables', cX + 8, y);
      y = cardBulletList(doc, nonModFactors, cX + 10, y, cW - 24);
    }

    // Structural care
    if (raw.structuralCareNeeded && y < cY + cH - 25) {
      y = cardSectionTitle(doc, 'Cuidado Estructural', cX + 8, y);
      y = cardBodyText(doc, 'Tu pelo canoso necesita hidratación lipídica activa (ceramidas, 18-MEA, aceites ligeros) y protección UV.', cX + 10, y, cW - 24);
    }

    // Recommendations
    const recs = raw.recommendations as Array<{ action: string; rationale: string; priority: string }> | undefined;
    if (recs?.length && y < cY + cH - 20) {
      y = cardSectionTitle(doc, 'Recomendaciones', cX + 8, y);
      y = cardBulletList(doc, recs.map((r) => `[${r.priority}] ${r.action} — ${r.rationale}`), cX + 10, y, cW - 24);
    }

    // Realistic expectations
    if (typeof raw.realisticExpectations === 'string' && y < cY + cH - 15) {
      y = cardSectionTitle(doc, 'Expectativa Realista', cX + 8, y);
      doc.setFontSize(8.5);
      doc.setTextColor(90, 85, 75);
      const eLines = doc.splitTextToSize(`"${raw.realisticExpectations}"`, cW - 28);
      doc.text(eLines, cX + 10, y);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4: ALOPECIA DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if (alopecia?.rawResult) {
    doc.addPage();
    const raw = alopecia.rawResult as Record<string, unknown>;

    doc.setFillColor(...ESPRESSO);
    doc.rect(0, 0, pw, 297, 'F');

    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text('MÓDULO 3 DE 3', pw / 2, 16, { align: 'center' });
    doc.setFontSize(20);
    doc.setTextColor(...CREAM);
    doc.text('Análisis de Alopecia', pw / 2, 30, { align: 'center' });

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(50, 35, pw - 50, 35);

    // Cream card
    const cX = 15, cY = 42, cW = pw - 30, cH = 240;
    doc.setFillColor(...CREAM);
    doc.roundedRect(cX, cY, cW, cH, 6, 6, 'F');

    // Score circle
    const riskScore = typeof raw.riskScore === 'number' ? raw.riskScore : (alopecia.score ?? 0);
    const riskLevel = typeof raw.riskLevel === 'string' ? raw.riskLevel : '';
    const riskType = typeof raw.riskType === 'string' ? raw.riskType : '';
    const alopeciaCol = riskColor(riskScore);

    drawScoreCircle(doc, pw / 2, cY + 30, 20, riskScore, 100, alopeciaCol);

    // Risk badge
    const rlabel = `${riskLevel.toUpperCase()}`;
    doc.setFillColor(...alopeciaCol);
    const rbw = doc.setFontSize(7).getTextWidth(rlabel) + 12;
    doc.roundedRect(pw / 2 - rbw / 2, cY + 53, rbw, 7, 3, 3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(rlabel, pw / 2, cY + 58, { align: 'center' });

    if (riskType) {
      doc.setFontSize(8);
      doc.setTextColor(140, 135, 125);
      doc.text(`Tipo: ${riskType}`, pw / 2, cY + 68, { align: 'center' });
    }

    y = cY + 76;

    // Divider
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(cX + 10, y, cX + cW - 10, y);
    y += 8;

    // Recommended action
    if (typeof raw.recommendedAction === 'string') {
      y = cardSectionTitle(doc, 'Acción Recomendada', cX + 8, y);
      y = cardBodyText(doc, raw.recommendedAction, cX + 10, y, cW - 24);
      y += 2;
    }

    // Estimated progression
    if (typeof raw.estimatedProgression === 'string' && y < cY + cH - 25) {
      y = cardSectionTitle(doc, 'Progresión Estimada', cX + 8, y);
      y = cardBodyText(doc, raw.estimatedProgression, cX + 10, y, cW - 24);
      y += 2;
    }

    // Modifiable factors
    const modF = raw.modifiableFactors as string[] | undefined;
    if (modF?.length && y < cY + cH - 25) {
      y = cardSectionTitle(doc, 'Factores Modificables', cX + 8, y);
      y = cardBulletList(doc, modF, cX + 10, y, cW - 24);
    }

    // Non-modifiable
    const nonModF = raw.nonModifiableFactors as string[] | undefined;
    if (nonModF?.length && y < cY + cH - 25) {
      y = cardSectionTitle(doc, 'Factores No Modificables', cX + 8, y);
      y = cardBulletList(doc, nonModF, cX + 10, y, cW - 24);
    }

    // Evidence options
    const evidenceOpts = raw.evidenceOptions as Array<{ name: string; realistic_expectation: string }> | undefined;
    if (evidenceOpts?.length && y < cY + cH - 20) {
      y = cardSectionTitle(doc, 'Opciones con Respaldo Científico', cX + 8, y);
      y = cardBulletList(doc, evidenceOpts.map((o) => `${o.name}: ${o.realistic_expectation}`), cX + 10, y, cW - 24);
    }

    // Myth alerts
    const myths = raw.mythAlerts as string[] | undefined;
    if (myths?.length && y < cY + cH - 15) {
      y = cardSectionTitle(doc, 'Alertas sobre Mitos', cX + 8, y);
      y = cardBulletList(doc, myths, cX + 10, y, cW - 24);
    }

    // Realistic expectations
    if (typeof raw.realisticExpectations === 'string' && y < cY + cH - 12) {
      y = cardSectionTitle(doc, 'Expectativa Realista', cX + 8, y);
      doc.setFontSize(8.5);
      doc.setTextColor(90, 85, 75);
      const eLines = doc.splitTextToSize(`"${raw.realisticExpectations}"`, cW - 28);
      doc.text(eLines, cX + 10, y);
    }
  }

  // Footer on all pages
  multiPageFooter(doc);

  doc.save('diagnostico-completo-guiadelsalon.pdf');
}

// ── Master Color Card PDF ────────────────────────────────────────────────────

export function generateMasterColorCardPDF(selections: Record<number, unknown>) {
  const doc = new jsPDF();
  const pw = 210;

  // Background
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, 'F');

  // Header
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('DIAGNÓSTICO DE COLORIMETRÍA', pw / 2, 16, { align: 'center' });
  doc.setFontSize(22);
  doc.setTextColor(...CREAM);
  doc.text('Master Color Card', pw / 2, 28, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(245, 240, 232);
  doc.text('Expert Color Matcher — GuiaDelSalon.com', pw / 2, 36, { align: 'center' });

  // Cream card
  const cardX = 15, cardY = 44, cardW = pw - 30, cardH = 228;
  doc.setFillColor(...CREAM);
  doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F');

  // Match badge
  doc.setFillColor(...ORANGE);
  doc.roundedRect(cardX + cardW / 2 - 20, cardY + 10, 40, 10, 5, 5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('MATCH 98%', pw / 2, cardY + 17, { align: 'center' });

  // Tono recomendado
  doc.setFontSize(8);
  doc.setTextColor(...ORANGE);
  doc.text('TONO RECOMENDADO', pw / 2, cardY + 34, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(...ESPRESSO);
  doc.text('10.1 Rubio Platino', pw / 2, cardY + 46, { align: 'center' });

  // Demo disclaimer
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('* Análisis de demostración — el resultado personalizado estará disponible próximamente', pw / 2, cardY + 54, { align: 'center' });

  // Tags
  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text('Estación: Invierno  ·  Subtono: Frío / Ceniza', pw / 2, cardY + 62, { align: 'center' });

  // Divider
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(cardX + 10, cardY + 68, cardX + cardW - 10, cardY + 68);

  // Expert analysis
  let y = cardY + 78;
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text('Análisis del Experto', cardX + 10, y);
  y += 7;
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const analysisText = '"Al tener venas azuladas y piel clara, los tonos dorados excesivos pueden apagar tu luminosidad natural. El matiz ceniza es tu mejor aliado para resaltar la profundidad de tus ojos y definir suavemente tus facciones."';
  const analysisLines = doc.splitTextToSize(analysisText, cardW - 20);
  doc.text(analysisLines, cardX + 10, y);
  y += analysisLines.length * 4.5 + 8;

  // Divider
  doc.setDrawColor(...GOLD);
  doc.line(cardX + 10, y, cardX + cardW - 10, y);
  y += 8;

  // Answers summary
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text('Resumen de Respuestas', cardX + 10, y);
  y += 7;

  const stepLabels: Record<number, string> = {
    1: 'Tono de piel',
    2: 'Test de venas',
    3: 'Metal favorito',
    4: 'Color iluminación',
    5: 'Color de ojos',
    6: 'Nivel natural',
    7: 'Color actual',
  };

  doc.setFontSize(8);
  for (let i = 1; i <= 7; i++) {
    const val = selections[i];
    if (val !== undefined && y < cardY + cardH - 10) {
      doc.setTextColor(...ESPRESSO);
      doc.text(`${stepLabels[i]}:`, cardX + 10, y);
      doc.setTextColor(80, 80, 80);
      doc.text(String(val), cardX + 55, y);
      y += 6;
    }
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(`guiadelsalon.com · ${new Date().toLocaleDateString('es-ES')}`, pw / 2, 290, { align: 'center' });

  doc.save('master-color-card-guiadelsalon.pdf');
}
