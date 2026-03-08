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
    <div className="min-h-screen bg-background-light pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-espresso/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-espresso/50 text-xs font-bold uppercase tracking-[0.15em]">{toolName}</span>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-espresso/5 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-espresso/40" />
          </button>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-espresso/40 text-[10px] font-bold uppercase tracking-[0.2em]">
              Paso {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-espresso/30 text-[10px] font-mono tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="h-2 bg-espresso/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
