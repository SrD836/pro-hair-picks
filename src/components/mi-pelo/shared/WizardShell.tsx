import type { ReactNode } from 'react';

interface WizardShellProps {
  toolName: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
}

export function WizardShell({ toolName, currentStep, totalSteps, children }: WizardShellProps) {
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-espresso pb-20">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-30 bg-espresso border-b border-gold/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-gold text-sm font-mono">{toolName}</span>
          <span className="text-cream/50 text-xs">
            Paso {currentStep + 1}/{totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gold/20">
          <div
            className="h-full bg-gold transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
