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
    <div className="relative bg-espresso py-16 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-espresso via-espresso/90 to-espresso/80" />
      <motion.div
        className="relative z-10 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {badge && (
          <span className="text-gold uppercase tracking-[0.3em] text-xs mb-4 font-semibold block">
            {badge}
          </span>
        )}
        <h1 className="text-cream text-3xl md:text-4xl mb-4 italic font-display font-bold">
          {title}
        </h1>
        {score !== undefined && (
          <div className="mt-6">
            <span className={`text-6xl font-bold font-display ${scoreColor}`}>
              {score}
            </span>
            {scoreLabel && (
              <span className="block text-cream/50 text-sm mt-2">{scoreLabel}</span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
