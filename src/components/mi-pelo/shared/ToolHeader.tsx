import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolHeaderProps {
  badge: string;
  title: ReactNode;
  subtitle: string;
  microTrust: string;
  onStart: () => void;
  startLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
}

export function ToolHeader({
  badge,
  title,
  subtitle,
  microTrust,
  onStart,
  startLabel = 'Comenzar →',
  secondaryAction,
}: ToolHeaderProps) {
  return (
    <div className="bg-espresso">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-cream/40">
          <Link to="/mi-pelo" className="hover:text-cream/70 transition-colors">
            Mi Pelo
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cream/60">{typeof title === 'string' ? title : badge}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5 border border-gold/30 bg-gold/10 text-gold">
            HERRAMIENTA PROFESIONAL · {badge}
          </span>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold italic text-cream mb-4 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-cream/70 text-base max-w-2xl leading-relaxed mb-3">
            {subtitle}
          </p>

          {/* Micro-trust */}
          <p className="text-cream/40 text-sm mb-8">{microTrust}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold text-espresso font-semibold text-lg hover:bg-gold-light transition-colors"
            >
              {startLabel}
            </button>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gold/40 text-cream/70 font-medium hover:text-cream hover:border-gold/70 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
