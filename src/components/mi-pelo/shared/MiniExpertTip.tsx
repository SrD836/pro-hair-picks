import { Lightbulb } from 'lucide-react';

interface MiniExpertTipProps {
  tip: string;
  className?: string;
}

export function MiniExpertTip({ tip, className = '' }: MiniExpertTipProps) {
  if (!tip) return null;
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2 rounded-lg bg-gold/5 border border-gold/10 ${className}`}>
      <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5" />
      <p className="text-cream/50 text-xs leading-relaxed">{tip}</p>
    </div>
  );
}
