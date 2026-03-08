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
  nextLabel = 'Siguiente →',
  loading = false,
}: NavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-espresso/90 backdrop-blur-md border-t border-gold/5 px-6 py-4">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        {onPrev ? (
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className="text-cream/40 hover:text-cream text-sm font-medium transition-colors disabled:opacity-20"
          >
            {prevLabel}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={disableNext || loading}
          className="bg-gold text-espresso font-bold rounded-xl px-8 py-3 text-sm hover:bg-gold-light transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-[0_4px_20px_-4px_rgba(196,169,125,0.4)]"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-espresso/30 border-t-espresso rounded-full animate-spin" />
          )}
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
