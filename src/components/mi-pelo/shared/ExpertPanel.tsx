import { cn } from '@/lib/utils';

interface ExpertPanelProps {
  tip: string;
  title?: string;
  className?: string;
}

export function ExpertPanel({ tip, title = 'Consejo experto', className }: ExpertPanelProps) {
  return (
    <div className={cn('bg-gold/10 border border-gold/20 rounded-2xl p-5', className)}>
      <p className="text-xs font-medium text-espresso/60 uppercase tracking-wider mb-2">
        {title}
      </p>
      <p className="text-sm text-espresso leading-relaxed">{tip}</p>
    </div>
  );
}
