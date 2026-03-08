// src/pages/DiagnosticoCompletoPage.tsx
import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WizardProgress from '@/components/WizardProgress';
import { TOOLS_CONFIG, WIZARD_TOOL_ORDER } from '@/data/tools.config';
import { useLanguage } from '@/i18n/LanguageContext';
import type { WizardSession, ToolId } from '@/types/tools.types';

const WIZARD_KEY = 'wizard_session';

function loadSession(): WizardSession | null {
  try {
    const raw = localStorage.getItem(WIZARD_KEY);
    return raw ? (JSON.parse(raw) as WizardSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: WizardSession) {
  localStorage.setItem(WIZARD_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(WIZARD_KEY);
}

export default function DiagnosticoCompletoPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const session = loadSession();

  const orderedTools = useMemo(
    () => WIZARD_TOOL_ORDER.map((id) => TOOLS_CONFIG.find((t) => t.id === id)!),
    []
  );

  const completedIds = session
    ? (Object.keys(session.completedModules) as ToolId[])
    : [];

  const currentIndex = orderedTools.findIndex((t) => !completedIds.includes(t.id));
  const isAllDone = completedIds.length === orderedTools.length;
  const nextTool = currentIndex >= 0 ? orderedTools[currentIndex] : null;

  // Initialize session on first visit
  useEffect(() => {
    if (!session) {
      saveSession({ startedAt: new Date().toISOString(), completedModules: {} });
    }
  }, []);

  const startNextTool = () => {
    if (!nextTool) return;
    navigate(`${nextTool.href}?wizard=1`);
  };

  const resetWizard = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <>
      <SEOHead
        title={`${t("wizard.title")} · GuiaDelSalon.com`}
        description={t("wizard.subtitle")}
      />

      <div
        className="min-h-screen py-16 md:py-24 px-4"
        style={{ background: 'linear-gradient(180deg, #1a1008 0%, #0f0a06 100%)' }}
      >
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(196,169,125,0.12)', color: '#C4A97D', border: '1px solid rgba(196,169,125,0.25)' }}
            >
              {t("wizard.badge")}
            </span>
            <h1
              className="font-display font-bold text-[#F5F0E8] mb-3"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}
            >
              {t("wizard.title")}
            </h1>
            <p className="text-[#F5F0E8]/55 text-sm max-w-md mx-auto leading-relaxed">
              {t("wizard.subtitle")}
            </p>
          </motion.div>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 p-5 rounded-2xl"
            style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(196,169,125,0.12)' }}
          >
            <WizardProgress
              tools={orderedTools}
              currentIndex={Math.max(currentIndex, 0)}
              completedIds={completedIds}
            />
          </motion.div>

          {/* Module list */}
          <div className="space-y-3 mb-10">
            {orderedTools.map((tool, i) => {
              const isDone = completedIds.includes(tool.id);
              const isCurrent = i === currentIndex;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: isCurrent
                      ? `${tool.accentColor}12`
                      : 'rgba(245,240,232,0.03)',
                    border: isCurrent
                      ? `1px solid ${tool.accentColor}30`
                      : '1px solid rgba(245,240,232,0.06)',
                    opacity: i > currentIndex && !isDone ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: isDone ? 'rgba(74,222,128,0.15)' : `${tool.accentColor}15` }}
                  >
                    {isDone ? '✓' : tool.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F0E8] text-sm font-semibold">{t(`wizard.tools.${tool.id}`) || tool.title}</p>
                    <p className="text-[#F5F0E8]/40 text-xs">{tool.questionsCount} {t("wizard.questions")} · {tool.duration}</p>
                    {isDone && (
                      <p className="text-green-400 text-xs mt-0.5">
                        ✓ {session?.completedModules[tool.id]?.summary ?? t("wizard.completed")}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-[#F5F0E8]/30 font-medium">
                    {isDone ? t("wizard.done") : isCurrent ? t("wizard.now") : `${i + 1}`}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center space-y-3"
          >
            {isAllDone ? (
              <div>
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="font-display font-bold text-[#F5F0E8] text-xl mb-2">
                  {t("wizard.allDoneTitle")}
                </h2>
                <p className="text-[#F5F0E8]/55 text-sm mb-6">
                  {t("wizard.allDoneSubtitle").replace("{count}", String(orderedTools.length))}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    to="/mi-pelo/informe-completo"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
                    style={{ background: '#C4A97D', color: '#2D2218' }}
                  >
                    {t("wizard.viewResults")} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Button variant="outline" onClick={resetWizard} className="gap-2">
                    <RotateCcw className="w-4 h-4" /> {t("wizard.repeatDiagnosis")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  onClick={startNextTool}
                  size="lg"
                  className="w-full sm:w-auto px-10 gap-2"
                >
                  {completedIds.length === 0 ? t("wizard.startBtn") : t("wizard.continueBtn")} — {nextTool ? (t(`wizard.tools.${nextTool.id}`) || nextTool.title) : ''}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[#F5F0E8]/30 text-xs">
                  {t("wizard.pauseNote")}
                </p>
              </>
            )}
          </motion.div>

          {/* Back */}
          <div className="mt-8 text-center">
            <Link to="/mi-pelo" className="text-sm text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 transition-colors">
              {t("wizard.backToMyHair")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
