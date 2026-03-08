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

function getDamageTextColor(pct: number): string {
  if (pct >= 70) return 'text-damage-low';
  if (pct >= 40) return 'text-damage-med';
  return 'text-damage-high';
}

export function DimensionCard({ icon: Icon, label, score, max, description }: DimensionCardProps) {
  const pct = Math.round((score / max) * 100);
  const barColor = getDamageColor(pct);
  const textColor = getDamageTextColor(pct);

  return (
    <div className="bg-espresso border border-gold/8 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-cream text-sm font-semibold block">{label}</span>
        </div>
        <span className={`text-2xl font-bold font-display tabular-nums ${textColor}`}>
          {score}<span className="text-cream/20 text-sm font-normal">/{max}</span>
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-cream/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {description && (
        <p className="text-cream/40 text-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
