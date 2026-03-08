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
    <div className="min-h-screen bg-espresso pb-24">
      {/* Minimal sticky progress */}
      <div className="sticky top-0 z-30 bg-espresso/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-gold/70 text-xs font-medium tracking-wide">{toolName}</span>
          <span className="text-cream/30 text-xs tabular-nums">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        {/* Thin progress line */}
        <div className="h-px bg-gold/10">
          <div
            className="h-full bg-gold/60 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
