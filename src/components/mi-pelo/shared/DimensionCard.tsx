import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DimensionCardProps {
  icon: LucideIcon;
  label: string;
  score: number;
  max: number;
  description?: string;
}

function getDamageColor(pct: number): string {
  if (pct >= 70) return 'bg-damage-low';
  if (pct >= 40) return 'bg-damage-med';
  return 'bg-damage-high';
}

export function DimensionCard({ icon: Icon, label, score, max, description }: DimensionCardProps) {
  const pct = Math.round((score / max) * 100);
  const barColor = getDamageColor(pct);

  return (
    <div className="bg-espresso border border-gold/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-gold" />
          <span className="text-cream text-sm font-semibold">{label}</span>
        </div>
        <span className="text-cream font-bold text-sm">
          {score}<span className="text-cream/40 text-xs font-normal">/{max}</span>
        </span>
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-cream/10 overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {description && (
        <p className="text-cream/50 text-xs leading-relaxed mt-2">{description}</p>
      )}
    </div>
  );
}
