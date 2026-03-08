import { motion } from 'framer-motion';

interface ResultsHeroProps {
  badge?: string;
  title: string;
  score?: number;
  scoreLabel?: string;
  scoreColor?: string;
}

export function ResultsHero({
  badge,
  title,
  score,
  scoreLabel,
  scoreColor = 'text-gold',
}: ResultsHeroProps) {
  return (
    <div className="relative bg-espresso py-20 md:py-28 px-6 text-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 opacity-30" style={{
        background: 'radial-gradient(ellipse at 50% 80%, rgba(196,169,125,0.15) 0%, transparent 70%)'
      }} />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {badge && (
          <span className="text-gold/60 uppercase tracking-[0.3em] text-[11px] mb-6 font-medium block">
            {badge}
          </span>
        )}
        <h1 className="text-cream text-3xl md:text-5xl mb-6 italic font-display font-bold tracking-tight leading-tight">
          {title}
        </h1>
        {score !== undefined && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className={`text-7xl md:text-8xl font-bold font-display ${scoreColor}`}>
              {score}
            </span>
            {scoreLabel && (
              <span className="block text-cream/40 text-sm mt-3 tracking-wide">{scoreLabel}</span>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
