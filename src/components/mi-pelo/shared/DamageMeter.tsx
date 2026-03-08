import { cn } from '@/lib/utils';

interface DamageMeterProps {
  score: number;       // 0–100 damage score
  className?: string;
}

function getDamageLabel(score: number): string {
  if (score < 35) return 'Bajo';
  if (score < 65) return 'Moderado';
  return 'Alto';
}

function getDamageColor(score: number): string {
  if (score < 35) return 'bg-damage-low';
  if (score < 65) return 'bg-damage-med';
  return 'bg-damage-high';
}

export function DamageMeter({ score, className }: DamageMeterProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const label = getDamageLabel(clampedScore);
  const barColor = getDamageColor(clampedScore);

  return (
    <div className={cn('bg-espresso rounded-2xl p-5 text-cream', className)}>
      <p className="text-xs font-medium text-cream/60 uppercase tracking-wider mb-3">
        Daño capilar estimado
      </p>

      {/* Score display */}
      <div className="flex items-end gap-2 mb-3">
        <span className="font-display text-4xl font-bold leading-none">{clampedScore}</span>
        <span className="text-cream/60 text-sm mb-1">/100</span>
      </div>

      {/* Bar */}
      <div
        className="w-full h-2 bg-cream/10 rounded-full overflow-hidden mb-2"
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Daño capilar: ${clampedScore}/100 — ${label}`}
        aria-valuetext={`${clampedScore}/100 — ${label}`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${clampedScore}%` }}
        />
      </div>

      {/* Label */}
      <p className="text-xs text-cream/60">Nivel: <span className="text-cream font-medium">{label}</span></p>
    </div>
  );
}
