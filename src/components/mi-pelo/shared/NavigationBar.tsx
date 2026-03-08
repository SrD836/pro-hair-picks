interface NavigationBarProps {
  onPrev?: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  loading?: boolean;
}

export function NavigationBar({
  onPrev,
  onNext,
  disablePrev = false,
  disableNext = false,
  prevLabel = '← Anterior',
  nextLabel = 'CONTINUAR →',
  loading = false,
}: NavigationBarProps) {
  return (
    <div className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-espresso/5 px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        {/* Back — ghost */}
        {onPrev ? (
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className="text-espresso/40 hover:text-espresso text-sm font-medium transition-colors disabled:opacity-20 shrink-0"
          >
            {prevLabel}
          </button>
        ) : (
          <span />
        )}

        {/* Primary CTA — orange */}
        <button
          onClick={onNext}
          disabled={disableNext || loading}
          className="bg-accent-orange text-white font-bold rounded-xl px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-accent-orange-hover transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
