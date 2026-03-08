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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-espresso/95 backdrop-blur border-t border-gold/10 px-4 py-3">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        {onPrev ? (
          <button
            onClick={onPrev}
            disabled={disablePrev}
            className="text-cream/50 hover:text-cream text-sm font-medium transition-colors disabled:opacity-30"
          >
            {prevLabel}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={disableNext || loading}
          className="bg-gold text-espresso font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
