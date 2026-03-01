// src/components/WizardProgress.tsx
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import type { ToolConfig } from '@/types/tools.types';

interface WizardProgressProps {
  tools: ToolConfig[];
  currentIndex: number;
  completedIds: string[];
}

export default function WizardProgress({ tools, currentIndex, completedIds }: WizardProgressProps) {
  const { t } = useLanguage();
  const percent = Math.round((completedIds.length / tools.length) * 100);

  return (
    <div className="w-full">
      {/* Stepper dots */}
      <div className="flex items-center justify-between mb-3">
        {tools.map((tool, i) => {
          const isDone = completedIds.includes(tool.id);
          const isCurrent = i === currentIndex;
          const translatedName = t(`wizard.tools.${tool.id}`) || tool.title;
          return (
            <div key={tool.id} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300"
                style={{
                  background: isDone
                    ? '#4ade80'
                    : isCurrent
                      ? tool.accentColor
                      : 'rgba(245,240,232,0.1)',
                  border: isCurrent && !isDone
                    ? `2px solid ${tool.accentColor}`
                    : '2px solid transparent',
                  color: isDone || isCurrent ? '#2D2218' : '#F5F0E8',
                  opacity: i > currentIndex && !isDone ? 0.4 : 1,
                }}
              >
                {isDone ? '✓' : tool.emoji}
              </div>
              <span
                className="text-[9px] text-center hidden sm:block max-w-[64px] leading-tight"
                style={{ color: isCurrent ? '#F5F0E8' : 'rgba(245,240,232,0.4)' }}
              >
                {translatedName.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,240,232,0.1)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#C4A97D' }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-[#F5F0E8]/40">{completedIds.length} / {tools.length} {t("wizard.modules")}</span>
        <span className="text-[10px] text-[#F5F0E8]/40">{percent}%</span>
      </div>
    </div>
  );
}
