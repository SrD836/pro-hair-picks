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

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}

function multiPageFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `guiadelsalon.com · ${new Date().toLocaleDateString('es-ES')} · Pág. ${i}/${pages}`,
      105,
      290,
      { align: 'center' }
    );
  }
}

export function generateCompletePDF(session: WizardSession) {
  const CREAM_COLOR: [number, number, number] = [245, 240, 232];
  const doc = new jsPDF();
  const pw = 210;
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // ═══ PAGE 1: Cover + Summary ═══
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('INFORME COMPLETO', pw / 2, 20, { align: 'center' });
  doc.setFontSize(24);
  doc.setTextColor(...CREAM_COLOR);
  doc.text('Diagnóstico Capilar Integral', pw / 2, 36, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(CREAM_COLOR[0], CREAM_COLOR[1], CREAM_COLOR[2]);
  doc.text(`Generado el ${dateStr}`, pw / 2, 44, { align: 'center' });

  // Summary card
  const cardX = 15, cardY = 54, cardW = pw - 30;
  doc.setFillColor(...CREAM_COLOR);
  doc.roundedRect(cardX, cardY, cardW, 230, 6, 6, 'F');

  let y = cardY + 14;

  // Overall scores overview
  doc.setFontSize(10);
  doc.setTextColor(...ORANGE);
  doc.text('RESUMEN DE RESULTADOS', cardX + 10, y);
  y += 10;

  WIZARD_TOOL_ORDER.forEach((toolId) => {
    const tool = TOOL_MAP[toolId];
    const result = session.completedModules[toolId];
    if (!tool || !result) return;

    const score = result.score;
    doc.setFontSize(9);
    doc.setTextColor(...ESPRESSO);
    doc.text(`${tool.emoji} ${tool.title}`, cardX + 10, y);

    if (score != null) {
      const color = riskColor(score);
      doc.setTextColor(...color);
      doc.text(`${score}/100`, cardX + cardW - 10, y, { align: 'right' });

      // bar
      const barX = cardX + 10, barW = cardW - 50, barH = 3;
      y += 4;
      doc.setFillColor(225, 222, 215);
      doc.roundedRect(barX, y, barW, barH, 1.5, 1.5, 'F');
      doc.setFillColor(...color);
      const pct = Math.min(1, score / 100);
      if (pct > 0) doc.roundedRect(barX, y, Math.max(3, barW * pct), barH, 1.5, 1.5, 'F');
      y += 6;
    } else {
      y += 4;
    }

    // Summary text
    doc.setFontSize(8);
    doc.setTextColor(100, 95, 85);
    const sLines = doc.splitTextToSize(result.summary, cardW - 24);
    doc.text(sLines, cardX + 10, y);
    y += sLines.length * 4 + 8;
  });

  // Separator
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.3);
  doc.line(cardX + 10, y, cardX + cardW - 10, y);
  y += 8;

  // Recommendations
  doc.setFontSize(10);
  doc.setTextColor(...ORANGE);
  doc.text('RECOMENDACIONES', cardX + 10, y);
  y += 8;

  const recommendations: string[] = [];
  const alopecia = session.completedModules['analizador-alopecia'];
  const canicie = session.completedModules['analizador-canicie'];
  const diag = session.completedModules['diagnostico-capilar'];

  if (alopecia?.rawResult) {
    const r = alopecia.rawResult;
    if (typeof r.recommendedAction === 'string') recommendations.push(`Alopecia: ${r.recommendedAction}`);
    if (typeof r.realisticExpectations === 'string') recommendations.push(`Expectativa: ${r.realisticExpectations}`);
  }
  if (canicie?.rawResult) {
    const r = canicie.rawResult;
    if (typeof r.realisticExpectations === 'string') recommendations.push(`Canicie: ${r.realisticExpectations}`);
  }
  if (diag?.rawResult) {
    if (typeof diag.rawResult.protocol === 'string') recommendations.push(`Protocolo capilar: ${diag.rawResult.protocol}`);
  }

  if (recommendations.length) {
    doc.setFontSize(8);
    doc.setTextColor(80, 75, 65);
    for (const rec of recommendations) {
      if (y > cardY + 225) break;
      const rLines = doc.splitTextToSize(`→ ${rec}`, cardW - 28);
      doc.text(rLines, cardX + 14, y);
      y += rLines.length * 3.8 + 3;
    }
  }

  // ═══ PAGE 2: Diagnóstico Capilar detail ═══
  if (diag?.rawResult) {
    doc.addPage();
    const raw = diag.rawResult as Record<string, unknown>;

    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('GuiaDelSalon.com · Informe Completo', 105, 12, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...ESPRESSO);
    doc.text('1. Diagnóstico Capilar', 105, 24, { align: 'center' });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);

    y = 36;

    // Health score
    const healthPct = typeof raw.healthPct === 'number' ? raw.healthPct : (diag.score ?? 0);
    const riskLabel = typeof raw.riskLabel === 'string' ? raw.riskLabel : String(raw.riskLevel ?? '');

    doc.setFontSize(28);
    doc.setTextColor(...riskColor(healthPct));
    doc.text(`${healthPct}/100`, 105, y + 4, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(riskLabel, 105, y + 12, { align: 'center' });
    y += 22;

    // Dimension scores
    const scores = raw.scores as Record<string, number> | undefined;
    if (scores) {
      y = scoreBar(doc, 'Cutícula', scores.cuticle ?? 0, 12, 20, y, 170);
      y = scoreBar(doc, 'Porosidad', scores.porosity ?? 0, 20, 20, y, 170);
      y = scoreBar(doc, 'Elasticidad', scores.elasticity ?? 0, 21, 20, y, 170);
      y = scoreBar(doc, 'Cuero Cabelludo', scores.scalp ?? 0, 12, 20, y, 170);
    }

    // Protocol
    if (typeof raw.protocol === 'string') {
      y += 4;
      y = sectionTitle(doc, 'Protocolo de Acción', y);
      y = bodyText(doc, raw.protocol, y);
    }

    // Products
    const products = raw.products as Array<{ name: string; description: string }> | undefined;
    if (products?.length) {
      y += 4;
      y = sectionTitle(doc, 'Productos Recomendados', y);
      y = bulletList(doc, products.map((p) => `${p.name} — ${p.description}`), y);
    }
  }

  // ═══ PAGE 3: Canicie detail ═══
  if (canicie?.rawResult) {
    doc.addPage();
    const raw = canicie.rawResult as Record<string, unknown>;

    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('GuiaDelSalon.com · Informe Completo', 105, 12, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...ESPRESSO);
    doc.text('2. Análisis de Canicie', 105, 24, { align: 'center' });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);

    y = 36;

    doc.setFontSize(11);
    doc.setTextColor(...ESPRESSO);
    if (typeof raw.canicieType === 'string') {
      doc.text(`Tipo: ${raw.canicieType}`, 20, y);
    }
    if (typeof raw.onsetClassification === 'string') {
      doc.text(`Inicio: ${raw.onsetClassification}`, 110, y);
    }
    y += 8;
    if (typeof raw.geneticWeight === 'number') {
      doc.text(`Peso genético: ${raw.geneticWeight}/10`, 20, y);
    }
    if (typeof raw.environmentalWeight === 'number') {
      doc.text(`Peso ambiental: ${raw.environmentalWeight}/10`, 110, y);
    }
    y += 10;

    const modFactors = raw.modifiableFactors as string[] | undefined;
    if (modFactors?.length) {
      y = sectionTitle(doc, 'Puedes Actuar Sobre', y);
      y = bulletList(doc, modFactors, y);
    }

    const nonModFactors = raw.nonModifiableFactors as string[] | undefined;
    if (nonModFactors?.length) {
      y = ensureSpace(doc, y, 20);
      y = sectionTitle(doc, 'Factores No Modificables', y + 2);
      y = bulletList(doc, nonModFactors, y);
    }

    if (raw.structuralCareNeeded) {
      y = ensureSpace(doc, y, 20);
      y = sectionTitle(doc, 'Cuidado Estructural', y + 2);
      y = bodyText(doc, 'Tu pelo canoso necesita hidratación lipídica activa (ceramidas, 18-MEA, aceites ligeros) y protección UV.', y);
    }

    const recs = raw.recommendations as Array<{ action: string; rationale: string; priority: string }> | undefined;
    if (recs?.length) {
      y = ensureSpace(doc, y, 20);
      y = sectionTitle(doc, 'Recomendaciones', y + 2);
      y = bulletList(doc, recs.map((r) => `[${r.priority}] ${r.action} — ${r.rationale}`), y);
    }

    if (typeof raw.realisticExpectations === 'string' && y < 260) {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Expectativa Realista', y + 2);
      y = bodyText(doc, `"${raw.realisticExpectations}"`, y);
    }
  }

  // ═══ PAGE 4: Alopecia detail ═══
  if (alopecia?.rawResult) {
    doc.addPage();
    const raw = alopecia.rawResult as Record<string, unknown>;

    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('GuiaDelSalon.com · Informe Completo', 105, 12, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...ESPRESSO);
    doc.text('3. Análisis de Alopecia', 105, 24, { align: 'center' });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);

    y = 38;

    const riskScore = typeof raw.riskScore === 'number' ? raw.riskScore : (alopecia.score ?? 0);
    const riskLevel = typeof raw.riskLevel === 'string' ? raw.riskLevel : '';
    const riskType = typeof raw.riskType === 'string' ? raw.riskType : '';

    doc.setFontSize(28);
    doc.setTextColor(...riskColor(riskScore));
    doc.text(`Riesgo: ${riskScore}/100`, 105, y, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Nivel: ${riskLevel} · Tipo: ${riskType}`, 105, y + 7, { align: 'center' });

    y += 16;

    if (typeof raw.recommendedAction === 'string') {
      y = sectionTitle(doc, 'Acción Recomendada', y);
      y = bodyText(doc, raw.recommendedAction, y);
    }

    if (typeof raw.estimatedProgression === 'string') {
      y = sectionTitle(doc, 'Progresión Estimada', y + 2);
      y = bodyText(doc, raw.estimatedProgression, y);
    }

    const modF = raw.modifiableFactors as string[] | undefined;
    if (modF?.length) {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Factores Modificables', y + 2);
      y = bulletList(doc, modF, y);
    }

    const nonModF = raw.nonModifiableFactors as string[] | undefined;
    if (nonModF?.length) {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Factores No Modificables', y + 2);
      y = bulletList(doc, nonModF, y);
    }

    const evidenceOpts = raw.evidenceOptions as Array<{ name: string; realistic_expectation: string }> | undefined;
    if (evidenceOpts?.length) {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Opciones con Respaldo Científico', y + 2);
      y = bulletList(doc, evidenceOpts.map((o) => `${o.name}: ${o.realistic_expectation}`), y);
    }

    const myths = raw.mythAlerts as string[] | undefined;
    if (myths?.length && y < 250) {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Alertas sobre Mitos', y + 2);
      y = bulletList(doc, myths, y);
    }

    if (typeof raw.realisticExpectations === 'string') {
      y = ensureSpace(doc, y, 15);
      y = sectionTitle(doc, 'Expectativa Realista', y + 2);
      y = bodyText(doc, `"${raw.realisticExpectations}"`, y);
    }
  }

  // Footer on all pages
  multiPageFooter(doc);

  doc.save('diagnostico-completo-guiadelsalon.pdf');
}

// ── Master Color Card PDF ────────────────────────────────────────────────────

const CREAM: [number, number, number] = [245, 240, 232];

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
