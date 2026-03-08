import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  name: string;
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  checked?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export function OptionCard({ name, value, label, description, icon, checked = false, onChange, className }: OptionCardProps) {
  return (
    <label
      className={cn(
        'group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300',
        'border-gold/10 bg-espresso/40 hover:border-gold/40 hover:bg-gold/5',
        checked && 'border-gold bg-gold/10 ring-1 ring-gold/30',
        className
      )}
    >
      {/* Icon — large and prominent */}
      {icon && (
        <span className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
          checked ? 'bg-gold/20 text-gold' : 'bg-gold/10 text-gold/60 group-hover:text-gold group-hover:bg-gold/15'
        )}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span className="text-sm font-semibold text-cream leading-snug">{label}</span>

      {/* Description */}
      {description && (
        <span className="text-xs text-cream/40 leading-relaxed">{description}</span>
      )}

      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
    </label>
  );
}
