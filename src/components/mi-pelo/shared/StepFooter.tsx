import { cn } from '@/lib/utils';

interface StepFooterProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disablePrev?: boolean;
  disableNext?: boolean;
  className?: string;
}

export function StepFooter({
  onPrev,
  onNext,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  disablePrev = false,
  disableNext = false,
  className,
}: StepFooterProps) {
  return (
    <div className={cn('flex items-center justify-between h-14', className)}>
      {/* Ghost prev button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={disablePrev || !onPrev}
        className={cn(
          'px-5 h-10 rounded-xl text-sm font-medium transition-all duration-200',
          'text-espresso border border-espresso/20 hover:border-espresso/40 hover:bg-espresso/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <span aria-hidden="true">←</span> {prevLabel}
      </button>

      {/* Solid espresso next button */}
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext || !onNext}
        className={cn(
          'px-6 h-10 rounded-xl text-sm font-medium transition-all duration-200',
          'bg-espresso text-cream hover:bg-espresso/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {nextLabel} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
