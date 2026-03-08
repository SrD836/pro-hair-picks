import { useMemo, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
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

// ── Component ───────────────────────────────────────────────────────────────
export default function InformeCompletoPage() {
  const session = loadSession();

  const orderedTools = useMemo(
    () => WIZARD_TOOL_ORDER.map((id) => TOOLS_CONFIG.find((t) => t.id === id)!),
    []
  );

  const completedIds = session
    ? (Object.keys(session.completedModules) as ToolId[])
    : [];

  const isAllDone = orderedTools.every((t) => completedIds.includes(t.id));

  // If not all done, redirect back to wizard
  if (!session || !isAllDone) {
    return <Navigate to="/mi-pelo/diagnostico-completo" replace />;
  }

  const handleDownloadPDF = () => {
    generateCompletePDF(session);
  };

  const handleReset = () => {
    localStorage.removeItem(WIZARD_KEY);
    window.location.href = '/mi-pelo/diagnostico-completo';
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
            className="text-center mb-10"
          >
            <div className="text-5xl mb-4">📋</div>
            <h1
              className="font-display font-bold text-[#F5F0E8] mb-2"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}
            >
              Tu Informe Completo
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm max-w-md mx-auto">
              Resumen consolidado de los {orderedTools.length} módulos completados.
            </p>
          </motion.div>

          {/* Results cards */}
          <div className="space-y-4 mb-10">
            {orderedTools.map((tool, i) => {
              const result = session.completedModules[tool.id];
              if (!result) return null;
              const date = new Date(result.completedAt);
              const score = result.score;
              const scoreColor =
                score == null
                  ? '#C4A97D'
                  : score >= 70
                    ? '#4ADE80'
                    : score >= 40
                      ? '#E4B84A'
                      : '#E06B52';

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl p-5 md:p-6"
                  style={{
                    background: 'rgba(245,240,232,0.04)',
                    border: '1px solid rgba(196,169,125,0.15)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{tool.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-[#F5F0E8] font-semibold text-base">{tool.title}</h3>
                        {score != null && (
                          <span
                            className="text-sm font-bold shrink-0"
                            style={{ color: scoreColor }}
                          >
                            {score}/100
                          </span>
                        )}
                      </div>

                      {/* Score bar */}
                      {score != null && (
                        <div className="w-full h-1.5 rounded-full bg-[#F5F0E8]/10 mb-3">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, score)}%`,
                              background: scoreColor,
                            }}
                          />
                        </div>
                      )}

                      <p className="text-[#F5F0E8]/70 text-sm leading-relaxed">
                        {result.summary}
                      </p>

                      <p className="text-[#F5F0E8]/30 text-xs mt-2">
                        📅{' '}
                        {date.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        ·{' '}
                        {date.toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
