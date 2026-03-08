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
  swatches?: ReactNode;
}

export function ToolHeader({
  badge,
  title,
  subtitle,
  microTrust,
  onStart,
  startLabel = 'Comenzar →',
  secondaryAction,
  swatches,
}: ToolHeaderProps) {
  return (
    <div className="bg-espresso">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-cream/40">
          <Link to="/mi-pelo" className="hover:text-cream/70 transition-colors">
            Mi Pelo
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cream/60">{typeof title === 'string' ? title : badge}</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 pt-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-6 border border-gold/20 bg-gold/5 text-gold">
            {badge}
          </span>

          {/* Title */}
          <h1 className="font-display text-[2.5rem] md:text-6xl font-bold italic text-cream mb-5 leading-[1.1] tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-4">
            {subtitle}
          </p>

          {/* Micro-trust */}
          <p className="text-cream/30 text-sm mb-8">{microTrust}</p>

          {/* Optional swatches */}
          {swatches && <div className="mb-10">{swatches}</div>}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="px-10 py-4.5 rounded-2xl bg-gold text-espresso font-bold text-lg hover:bg-gold-light transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(196,169,125,0.4)]"
            >
              {startLabel}
            </button>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-10 py-4.5 rounded-2xl border border-gold/30 text-cream/60 font-medium hover:text-cream hover:border-gold/60 transition-all duration-300"
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
