import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { Download, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TOOLS_CONFIG, WIZARD_TOOL_ORDER } from '@/data/tools.config';
import type { WizardSession, ToolId } from '@/types/tools.types';
import jsPDF from 'jspdf';

const WIZARD_KEY = 'wizard_session';
const TOOL_MAP = Object.fromEntries(TOOLS_CONFIG.map((t) => [t.id, t]));

function loadSession(): WizardSession | null {
  try {
    const raw = localStorage.getItem(WIZARD_KEY);
    return raw ? (JSON.parse(raw) as WizardSession) : null;
  } catch {
    return null;
  }
}

// ── PDF colors ──────────────────────────────────────────────────────────────
const ESPRESSO: [number, number, number] = [45, 34, 24];
const GOLD: [number, number, number] = [196, 169, 125];
const ORANGE: [number, number, number] = [236, 91, 19];
const GRAY: [number, number, number] = [120, 120, 120];
const GREEN: [number, number, number] = [76, 175, 124];
const AMBER: [number, number, number] = [228, 184, 74];
const RED: [number, number, number] = [224, 107, 82];
const CREAM: [number, number, number] = [245, 240, 232];

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

function pdfSectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(11);
  doc.setTextColor(...ESPRESSO);
  doc.text(text, 20, y);
  return y + 7;
}

function pdfBody(doc: jsPDF, text: string, y: number, maxWidth = 170): number {
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + lines.length * 4.5;
}

function pdfBullets(doc: jsPDF, items: string[], y: number, maxWidth = 164): number {
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  let cy = y;
  for (const item of items) {
    cy = ensureSpace(doc, cy, 8);
    const lines = doc.splitTextToSize(`· ${item}`, maxWidth);
    doc.text(lines, 24, cy);
    cy += lines.length * 4;
  }
  return cy + 2;
}

function pdfScoreBar(doc: jsPDF, label: string, score: number, max: number, x: number, y: number, width: number): number {
  const pct = Math.min(1, score / max);
  const color = riskColor(score, max);
  doc.setFontSize(8);
  doc.setTextColor(...ESPRESSO);
  doc.text(label, x, y);
  doc.text(`${score}/${max}`, x + width, y, { align: 'right' });
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(x, y + 2, width, 3, 1.5, 1.5, 'F');
  doc.setFillColor(...color);
  if (pct > 0) doc.roundedRect(x, y + 2, Math.max(3, width * pct), 3, 1.5, 1.5, 'F');
  return y + 12;
}

function pdfFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`guiadelsalon.com · ${new Date().toLocaleDateString('es-ES')} · Pág. ${i}/${pages}`, 105, 290, { align: 'center' });
  }
}

// ── Main PDF generator ──────────────────────────────────────────────────────
function generateCompletePDF(session: WizardSession) {
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
  doc.setTextColor(...CREAM);
  doc.text('Diagnóstico Capilar Integral', pw / 2, 36, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(CREAM[0], CREAM[1], CREAM[2]);
  doc.text(`Generado el ${dateStr}`, pw / 2, 44, { align: 'center' });

  // Summary card
  const cardX = 15, cardY = 54, cardW = pw - 30;
  doc.setFillColor(...CREAM);
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
      y = pdfScoreBar(doc, 'Cutícula', scores.cuticle ?? 0, 12, 20, y, 170);
      y = pdfScoreBar(doc, 'Porosidad', scores.porosity ?? 0, 20, 20, y, 170);
      y = pdfScoreBar(doc, 'Elasticidad', scores.elasticity ?? 0, 21, 20, y, 170);
      y = pdfScoreBar(doc, 'Cuero Cabelludo', scores.scalp ?? 0, 12, 20, y, 170);
    }

    // Protocol
    if (typeof raw.protocol === 'string') {
      y += 4;
      y = pdfSectionTitle(doc, 'Protocolo de Acción', y);
      y = pdfBody(doc, raw.protocol, y);
    }

    // Products
    const products = raw.products as Array<{ name: string; description: string }> | undefined;
    if (products?.length) {
      y += 4;
      y = pdfSectionTitle(doc, 'Productos Recomendados', y);
      y = pdfBullets(doc, products.map(p => `${p.name} — ${p.description}`), y);
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

    // Type info
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

    // Modifiable factors
    const modFactors = raw.modifiableFactors as string[] | undefined;
    if (modFactors?.length) {
      y = pdfSectionTitle(doc, 'Puedes Actuar Sobre', y);
      y = pdfBullets(doc, modFactors, y);
    }

    // Non-modifiable factors
    const nonModFactors = raw.nonModifiableFactors as string[] | undefined;
    if (nonModFactors?.length) {
      y = ensureSpace(doc, y, 20);
      y = pdfSectionTitle(doc, 'Factores No Modificables', y + 2);
      y = pdfBullets(doc, nonModFactors, y);
    }

    // Structural care
    if (raw.structuralCareNeeded) {
      y = ensureSpace(doc, y, 20);
      y = pdfSectionTitle(doc, 'Cuidado Estructural', y + 2);
      y = pdfBody(doc, 'Tu pelo canoso necesita hidratación lipídica activa (ceramidas, 18-MEA, aceites ligeros) y protección UV.', y);
    }

    // Recommendations
    const recs = raw.recommendations as Array<{ action: string; rationale: string; priority: string }> | undefined;
    if (recs?.length) {
      y = ensureSpace(doc, y, 20);
      y = pdfSectionTitle(doc, 'Recomendaciones', y + 2);
      y = pdfBullets(doc, recs.map(r => `[${r.priority}] ${r.action} — ${r.rationale}`), y);
    }

    // Realistic expectations
    if (typeof raw.realisticExpectations === 'string' && y < 260) {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Expectativa Realista', y + 2);
      y = pdfBody(doc, `"${raw.realisticExpectations}"`, y);
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

    // Risk score
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

    // Recommended action
    if (typeof raw.recommendedAction === 'string') {
      y = pdfSectionTitle(doc, 'Acción Recomendada', y);
      y = pdfBody(doc, raw.recommendedAction, y);
    }

    // Estimated progression
    if (typeof raw.estimatedProgression === 'string') {
      y = pdfSectionTitle(doc, 'Progresión Estimada', y + 2);
      y = pdfBody(doc, raw.estimatedProgression, y);
    }

    // Modifiable factors
    const modF = raw.modifiableFactors as string[] | undefined;
    if (modF?.length) {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Factores Modificables', y + 2);
      y = pdfBullets(doc, modF, y);
    }

    // Non-modifiable
    const nonModF = raw.nonModifiableFactors as string[] | undefined;
    if (nonModF?.length) {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Factores No Modificables', y + 2);
      y = pdfBullets(doc, nonModF, y);
    }

    // Evidence options
    const evidenceOpts = raw.evidenceOptions as Array<{ name: string; realistic_expectation: string }> | undefined;
    if (evidenceOpts?.length) {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Opciones con Respaldo Científico', y + 2);
      y = pdfBullets(doc, evidenceOpts.map(o => `${o.name}: ${o.realistic_expectation}`), y);
    }

    // Myth alerts
    const myths = raw.mythAlerts as string[] | undefined;
    if (myths?.length && y < 250) {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Alertas sobre Mitos', y + 2);
      y = pdfBullets(doc, myths, y);
    }

    // Realistic expectations
    if (typeof raw.realisticExpectations === 'string') {
      y = ensureSpace(doc, y, 15);
      y = pdfSectionTitle(doc, 'Expectativa Realista', y + 2);
      y = pdfBody(doc, `"${raw.realisticExpectations}"`, y);
    }
  }

  // Footer on all pages
  pdfFooter(doc);

  doc.save('diagnostico-completo-guiadelsalon.pdf');
}

// ── Consolidated summary logic ──────────────────────────────────────────────
function buildSummary(session: WizardSession) {
  const diag = session.completedModules['diagnostico-capilar'];
  const canicie = session.completedModules['analizador-canicie'];
  const alopecia = session.completedModules['analizador-alopecia'];

  const scores: { label: string; score: number | undefined; emoji: string }[] = [
    { label: 'Salud capilar', score: diag?.score, emoji: '🔬' },
    { label: 'Canicie', score: canicie?.score, emoji: '🦳' },
    { label: 'Riesgo alopecia', score: alopecia?.score, emoji: '💈' },
  ];

  // Overall health assessment
  const validScores = scores.filter((s) => s.score != null).map((s) => s.score!);
  const avgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  let overallLabel = 'Sin datos suficientes';
  let overallEmoji = '📊';
  if (avgScore != null) {
    if (avgScore <= 25) { overallLabel = 'Estado capilar excelente'; overallEmoji = '🟢'; }
    else if (avgScore <= 50) { overallLabel = 'Estado capilar bueno'; overallEmoji = '🟡'; }
    else if (avgScore <= 75) { overallLabel = 'Atención recomendada'; overallEmoji = '🟠'; }
    else { overallLabel = 'Consulta profesional aconsejada'; overallEmoji = '🔴'; }
  }

  // Key findings
  const findings: string[] = [];
  if (diag) findings.push(diag.summary);
  if (canicie) findings.push(canicie.summary);
  if (alopecia) findings.push(alopecia.summary);

  // Extract recommendations from rawResult
  const recommendations: string[] = [];
  if (alopecia?.rawResult) {
    const raw = alopecia.rawResult;
    if (typeof raw.riskLevel === 'string') {
      if (raw.riskLevel === 'bajo') recommendations.push('Tu riesgo de alopecia es bajo. Mantén hábitos saludables.');
      else if (raw.riskLevel === 'moderado') recommendations.push('Riesgo moderado de alopecia. Consulta con un tricólogo para seguimiento.');
      else recommendations.push('Riesgo elevado de alopecia. Se recomienda evaluación profesional.');
    }
  }
  if (canicie?.rawResult) {
    const raw = canicie.rawResult;
    if (typeof raw.canicieType === 'string' && raw.canicieType.includes('mixta')) {
      recommendations.push('Tu canicie tiene componente ambiental: puedes actuar sobre factores como estrés y nutrición.');
    }
  }
  if (diag?.rawResult) {
    const raw = diag.rawResult;
    if (typeof raw.riskLevel === 'string' && raw.riskLevel !== 'optimal') {
      recommendations.push('Tu pelo necesita atención: sigue el protocolo de acción del diagnóstico capilar.');
    }
  }

  return { scores, avgScore, overallLabel, overallEmoji, findings, recommendations };
}

// ── Component ───────────────────────────────────────────────────────────────
export default function InformeCompletoPage() {
  const navigate = useNavigate();
  const session = loadSession();

  const orderedTools = useMemo(
    () => WIZARD_TOOL_ORDER.map((id) => TOOLS_CONFIG.find((t) => t.id === id)!),
    []
  );

  const isAllDone = orderedTools.every((t) => Boolean(session?.completedModules[t.id]));

  useEffect(() => {
    if (!session || !isAllDone) {
      navigate('/mi-pelo/diagnostico-completo', { replace: true });
    }
  }, [session, isAllDone, navigate]);

  if (!session || !isAllDone) return null;

  const summary = buildSummary(session);

  const handleDownloadPDF = () => {
    generateCompletePDF(session);
  };

  const handleReset = () => {
    localStorage.removeItem(WIZARD_KEY);
    window.location.href = '/mi-pelo/diagnostico-completo';
  };

  const getScoreColor = (score: number | undefined) => {
    if (score == null) return '#C4A97D';
    if (score <= 25) return '#4ADE80';
    if (score <= 50) return '#E4B84A';
    return '#E06B52';
  };

  return (
    <>
      <SEOHead title="Informe Completo · GuiaDelSalon.com" noIndex />

      <div
        className="min-h-screen py-16 md:py-24 px-4"
        style={{ background: 'linear-gradient(180deg, #1a1008 0%, #0f0a06 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(196,169,125,0.12)', color: '#C4A97D', border: '1px solid rgba(196,169,125,0.25)' }}
            >
              INFORME COMPLETO
            </span>
            <h1
              className="font-display font-bold text-[#F5F0E8] mb-2"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}
            >
              Diagnóstico Capilar Integral
            </h1>
            <p className="text-[#F5F0E8]/40 text-sm">
              Generado el {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </motion.div>

          {/* ── Overall Score Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 md:p-8 mb-6 text-center"
            style={{ background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(196,169,125,0.2)' }}
          >
            <div className="text-4xl mb-3">{summary.overallEmoji}</div>
            <h2 className="text-[#F5F0E8] font-display font-bold text-xl mb-1">
              {summary.overallLabel}
            </h2>
            {summary.avgScore != null && (
              <p className="text-[#F5F0E8]/40 text-sm mb-6">
                Puntuación media: <span className="font-bold" style={{ color: getScoreColor(summary.avgScore) }}>{summary.avgScore}/100</span>
              </p>
            )}

            {/* Score mini-bars */}
            <div className="grid grid-cols-3 gap-3">
              {summary.scores.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl mb-1">{s.emoji}</div>
                  <p className="text-[#F5F0E8]/60 text-[11px] mb-1.5">{s.label}</p>
                  {s.score != null ? (
                    <>
                      <div className="w-full h-1.5 rounded-full bg-[#F5F0E8]/10 mb-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, s.score)}%`, background: getScoreColor(s.score) }}
                        />
                      </div>
                      <p className="text-xs font-bold" style={{ color: getScoreColor(s.score) }}>
                        {s.score}/100
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#F5F0E8]/30">—</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Key Findings ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 md:p-6 mb-4"
            style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(196,169,125,0.12)' }}
          >
            <h3 className="text-[#C4A97D] text-xs font-bold uppercase tracking-widest mb-4">
              📊 Hallazgos principales
            </h3>
            <div className="space-y-3">
              {orderedTools.map((tool, i) => {
                const result = session.completedModules[tool.id];
                if (!result) return null;
                return (
                  <div key={tool.id} className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F5F0E8] text-sm font-semibold">{tool.title}</p>
                      <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">{result.summary}</p>
                    </div>
                    {result.score != null && (
                      <span className="text-sm font-bold shrink-0" style={{ color: getScoreColor(result.score) }}>
                        {result.score}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Recommendations ── */}
          {summary.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-5 md:p-6 mb-6"
              style={{ background: 'rgba(196,169,125,0.06)', border: '1px solid rgba(196,169,125,0.15)' }}
            >
              <h3 className="text-[#C4A97D] text-xs font-bold uppercase tracking-widest mb-4">
                💡 Recomendaciones
              </h3>
              <ul className="space-y-2.5">
                {summary.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-[#F5F0E8]/75 leading-relaxed">
                    <span className="text-[#C4A97D] shrink-0 mt-0.5">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* ── Detailed Results ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h3 className="text-[#F5F0E8]/40 text-xs font-bold uppercase tracking-widest mb-4 text-center">
              Detalle por módulo
            </h3>
            <div className="space-y-3">
              {orderedTools.map((tool, i) => {
                const result = session.completedModules[tool.id];
                if (!result) return null;
                const date = new Date(result.completedAt);
                const raw = result.rawResult;
                const details: { label: string; value: string }[] = [];

                if (raw) {
                  if (typeof raw.riskLevel === 'string') details.push({ label: 'Nivel', value: raw.riskLevel as string });
                  if (typeof raw.riskLabel === 'string') details.push({ label: 'Estado', value: raw.riskLabel as string });
                  if (typeof raw.canicieType === 'string') details.push({ label: 'Tipo', value: raw.canicieType as string });
                  if (typeof raw.recommendedAction === 'string') details.push({ label: 'Acción', value: raw.recommendedAction as string });
                  if (typeof raw.protocol === 'string') details.push({ label: 'Protocolo', value: raw.protocol as string });
                  if (raw.scores && typeof raw.scores === 'object') {
                    const s = raw.scores as Record<string, number>;
                    if (s.cuticle != null) details.push({ label: 'Cutícula', value: `${s.cuticle}/12` });
                    if (s.porosity != null) details.push({ label: 'Porosidad', value: `${s.porosity}/20` });
                    if (s.elasticity != null) details.push({ label: 'Elasticidad', value: `${s.elasticity}/21` });
                    if (s.scalp != null) details.push({ label: 'Cuero cabelludo', value: `${s.scalp}/12` });
                  }
                }

                return (
                  <div
                    key={tool.id}
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(245,240,232,0.03)', border: '1px solid rgba(196,169,125,0.08)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{tool.emoji}</span>
                      <p className="text-[#F5F0E8] text-sm font-semibold flex-1">{tool.title}</p>
                      <p className="text-[#F5F0E8]/25 text-[11px]">
                        {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} · {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {details.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {details.map((d) => (
                          <span
                            key={d.label}
                            className="inline-block text-[11px] px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(196,169,125,0.08)', color: 'rgba(245,240,232,0.6)' }}
                          >
                            <span className="text-[#F5F0E8]/40">{d.label}:</span> {d.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row justify-center gap-3 mb-8"
          >
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="gap-2 px-8"
              style={{ background: '#C4A97D', color: '#2D2218' }}
            >
              <Download className="w-4 h-4" /> Descargar PDF
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Repetir diagnóstico
            </Button>
          </motion.div>

          {/* Back links */}
          <div className="text-center space-y-2">
            <Link
              to="/mi-pelo/mis-resultados"
              className="text-sm text-[#C4A97D] hover:underline inline-block"
            >
              Guardar en mis diagnósticos →
            </Link>
            <br />
            <Link
              to="/mi-pelo"
              className="text-sm text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Volver a Mi Pelo
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
