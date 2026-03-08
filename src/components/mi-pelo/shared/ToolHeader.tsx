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
    <div className="bg-background-light">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-espresso/40">
          <Link to="/mi-pelo" className="hover:text-espresso/70 transition-colors">
            Mi Pelo
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-espresso/60">{typeof title === 'string' ? title : badge}</span>
        </nav>
      </div>

      {/* Hero card */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-espresso rounded-3xl p-8 md:p-12 text-center"
        >
          {/* Badge */}
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-6 border border-accent-orange/30 bg-accent-orange/10 text-accent-orange">
            {badge}
          </span>

          {/* Title */}
          <h1 className="font-display text-[2.5rem] md:text-5xl font-bold italic text-cream mb-5 leading-[1.1] tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-cream/60 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-4">
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
              className="px-10 py-4 rounded-2xl bg-accent-orange text-white font-bold text-lg hover:bg-accent-orange-hover transition-all duration-300"
            >
              {startLabel}
            </button>
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-10 py-4 rounded-2xl border border-cream/20 text-cream/60 font-medium hover:text-cream hover:border-cream/40 transition-all duration-300"
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
