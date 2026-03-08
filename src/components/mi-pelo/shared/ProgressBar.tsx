import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;   // 1-based current step
  total: number;     // total steps
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.round((current / safeTotal) * 100);
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-espresso/60">Paso {current} de {total}</span>
        <span className="text-xs font-medium text-espresso">{pct}%</span>
      </div>
      <div
        className="w-full h-1.5 bg-espresso/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Paso ${current} de ${total}`}
      >
        <div
          className="h-full bg-gold rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
