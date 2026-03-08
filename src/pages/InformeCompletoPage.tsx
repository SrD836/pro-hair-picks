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

// ── PDF generator ───────────────────────────────────────────────────────────
const ESPRESSO: [number, number, number] = [45, 34, 24];
const GOLD: [number, number, number] = [196, 169, 125];
const GREEN: [number, number, number] = [76, 175, 124];
const AMBER: [number, number, number] = [228, 184, 74];
const RED: [number, number, number] = [224, 107, 82];

function generateCompletePDF(session: WizardSession) {
  const doc = new jsPDF();
  const pw = 210;

  // Background
  doc.setFillColor(...ESPRESSO);
  doc.rect(0, 0, pw, 297, 'F');

  // Header
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('INFORME COMPLETO', pw / 2, 14, { align: 'center' });
  doc.setFontSize(22);
  doc.setTextColor(245, 240, 232);
  doc.text('Diagnóstico Capilar Integral', pw / 2, 28, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(245, 240, 232);
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    pw / 2,
    36,
    { align: 'center' }
  );

  // Cream card
  const cardX = 15, cardY = 44, cardW = pw - 30;
  doc.setFillColor(245, 240, 232);
  doc.roundedRect(cardX, cardY, cardW, 240, 6, 6, 'F');

  let y = cardY + 12;

  WIZARD_TOOL_ORDER.forEach((toolId, idx) => {
    const tool = TOOL_MAP[toolId];
    const result = session.completedModules[toolId];
    if (!tool || !result) return;

    // Section header
    doc.setFontSize(12);
    doc.setTextColor(...ESPRESSO);
    doc.text(`${idx + 1}. ${tool.title}`, cardX + 10, y);
    y += 6;

    // Date
    if (result.completedAt) {
      doc.setFontSize(7);
      doc.setTextColor(140, 135, 125);
      const d = new Date(result.completedAt);
      doc.text(
        d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) +
          ' · ' +
          d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        cardX + 10,
        y
      );
      y += 5;
    }

    // Score bar if available
    if (result.score != null) {
      const pct = Math.min(1, result.score / 100);
      const color: [number, number, number] = pct >= 0.7 ? GREEN : pct >= 0.4 ? AMBER : RED;
      const barX = cardX + 10, barW = cardW - 20, barH = 4;

      doc.setFillColor(225, 222, 215);
      doc.roundedRect(barX, y, barW, barH, 2, 2, 'F');
      doc.setFillColor(...color);
      if (barW * pct > 0) {
        doc.roundedRect(barX, y, Math.max(4, barW * pct), barH, 2, 2, 'F');
      }

      doc.setFontSize(8);
      doc.setTextColor(...color);
      doc.text(`${result.score}/100`, barX + barW + 2, y + 3.5);
      y += 9;
    }

    // Summary
    doc.setFontSize(9);
    doc.setTextColor(80, 75, 65);
    const summaryLines = doc.splitTextToSize(result.summary, cardW - 24);
    doc.text(summaryLines, cardX + 10, y);
    y += summaryLines.length * 4.5 + 4;

    // Raw result details
    const raw = result.rawResult;
    if (raw) {
      const details: string[] = [];
      // Extract useful fields from rawResult
      if (typeof raw.riskLevel === 'string') details.push(`Nivel de riesgo: ${raw.riskLevel}`);
      if (typeof raw.recommendedAction === 'string') details.push(`Acción: ${raw.recommendedAction}`);
      if (typeof raw.canicieType === 'string') details.push(`Tipo de canicie: ${raw.canicieType}`);
      if (typeof raw.protocol === 'string') details.push(`Protocolo: ${raw.protocol}`);
      if (typeof raw.riskLabel === 'string') details.push(`Estado: ${raw.riskLabel}`);

      if (details.length) {
        doc.setFontSize(8);
        doc.setTextColor(100, 95, 85);
        for (const detail of details) {
          if (y > 270) break;
          const lines = doc.splitTextToSize(`· ${detail}`, cardW - 28);
          doc.text(lines, cardX + 14, y);
          y += lines.length * 3.8 + 2;
        }
      }
    }

    // Separator
    if (idx < WIZARD_TOOL_ORDER.length - 1 && y < 265) {
      y += 2;
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.3);
      doc.line(cardX + 10, y, cardX + cardW - 10, y);
      y += 8;
    }
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.text(`guiadelsalon.com · ${new Date().toLocaleDateString('es-ES')}`, pw / 2, 290, {
    align: 'center',
  });

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
