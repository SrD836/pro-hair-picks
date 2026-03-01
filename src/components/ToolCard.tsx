// src/components/ToolCard.tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ToolConfig } from '@/types/tools.types';

const BADGE_LABEL: Record<ToolConfig['badge'], string> = {
  IA: 'IA',
  CIENTÍFICO: 'CIENTÍFICO',
  TÉCNICO: 'TÉCNICO',
};

interface ToolCardProps {
  tool: ToolConfig;
  index?: number;
  /** If provided, card shows a completion checkmark */
  completed?: boolean;
  /** Append ?wizard=1 to the href */
  wizardMode?: boolean;
}

export default function ToolCard({ tool, index = 0, completed = false, wizardMode = false }: ToolCardProps) {
  const href = wizardMode ? `${tool.href}?wizard=1` : tool.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={href} className="block h-full group">
        <div
          className="relative rounded-2xl p-5 md:p-6 flex flex-col gap-4 h-full cursor-pointer"
          style={{
            background: 'linear-gradient(145deg, #3a2a1a 0%, #2d2015 100%)',
            border: `1px solid ${tool.accentColor}22`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          }}
        >
          {/* Badge */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: `${tool.accentColor}18`,
                color: tool.accentColor,
                border: `1px solid ${tool.accentColor}30`,
              }}
            >
              {BADGE_LABEL[tool.badge]}
            </span>
            {completed && (
              <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                ✓ Completado
              </span>
            )}
          </div>

          {/* Icon + title */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">{tool.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-[#F5F0E8] text-base leading-snug">
                {tool.title}
              </h3>
              <p className="text-xs text-[#F5F0E8]/50 mt-1 leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Duration + CTA */}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-[#F5F0E8]/40">
              {tool.questionsCount} preguntas · {tool.duration}
            </span>
            <span
              className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all duration-200"
              style={{ color: tool.accentColor }}
            >
              {completed ? 'Repetir' : 'Comenzar'}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
