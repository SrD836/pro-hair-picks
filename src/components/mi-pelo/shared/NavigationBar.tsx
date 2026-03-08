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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-espresso/5 px-6 py-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {/* Primary CTA — full width gold */}
        <button
          onClick={onNext}
          disabled={disableNext || loading}
          className="w-full bg-gold text-white font-bold rounded-2xl px-8 py-4 text-sm uppercase tracking-wider hover:bg-gold-light transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-gold"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {nextLabel}
        </button>

        {/* Back link — ghost */}
        {onPrev && (
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className="text-espresso/30 hover:text-espresso/60 text-sm font-medium transition-colors disabled:opacity-20 text-center"
          >
            {prevLabel}
          </button>
        )}
      </div>
    </div>
  );
}
