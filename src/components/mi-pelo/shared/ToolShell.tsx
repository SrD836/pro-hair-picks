import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ToolShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ToolShell({ title, subtitle, children, className }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Sticky header — z-40, below global Navbar if present */}
      <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-espresso/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div>
            <h1 className="font-display text-lg font-semibold text-espresso leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-espresso/60 leading-none mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className={cn('max-w-5xl mx-auto px-4 py-8', className)}>
        {children}
      </main>
    </div>
  );
}
