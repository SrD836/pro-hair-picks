import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardShellProps {
  toolName: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onClose?: () => void;
  /** Dynamic section name shown on the right of the progress header */
  stepLabel?: string;
}

export function WizardShell({ toolName, currentStep, totalSteps, children, onClose, stepLabel }: WizardShellProps) {
  const navigate = useNavigate();
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/mi-pelo');
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-30 bg-white border-b border-espresso/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Top row: tool name + close */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-orange" />
              <span className="text-espresso/60 text-xs font-bold uppercase tracking-[0.15em]">{toolName}</span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-espresso/5 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-espresso/40" />
            </button>
          </div>

          {/* Step label row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-espresso/40 text-[10px] font-bold uppercase tracking-[0.2em]">
              Paso {currentStep + 1} de {totalSteps}
            </span>
            {stepLabel && (
              <span className="text-accent-orange text-sm font-semibold">
                {stepLabel}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-espresso/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-orange rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable content — flex-1 centers content when short, scrolls when long */}
      <main className="flex-1 flex flex-col justify-center w-full">
        {children}
      </main>
    </div>
  );
}
