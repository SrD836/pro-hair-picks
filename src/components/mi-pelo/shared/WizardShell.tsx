import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardShellProps {
  toolName: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onClose?: () => void;
}

export function WizardShell({ toolName, currentStep, totalSteps, children, onClose }: WizardShellProps) {
  const navigate = useNavigate();
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/mi-pelo');
  };

  return (
    <div className="min-h-screen bg-background-light pb-28">
      {/* Sticky header — dark espresso */}
      <div className="sticky top-0 z-30 bg-espresso">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent-orange" />
            <span className="text-cream/80 text-xs font-bold uppercase tracking-[0.15em]">{toolName}</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-cream/50" />
          </button>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cream/40 text-[10px] font-bold uppercase tracking-[0.2em]">
              Paso {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-accent-orange text-[10px] font-bold tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-2 bg-cream/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-orange rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
