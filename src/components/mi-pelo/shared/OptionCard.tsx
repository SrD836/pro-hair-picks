import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  name: string;
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  checked?: boolean;
  onChange: (value: string) => void;
  className?: string;
  color?: string;
}

export function OptionCard({ name, value, label, description, icon, checked = false, onChange, className, color }: OptionCardProps) {
  return (
    <label
      className={cn(
        'group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300',
        'border-espresso/8 bg-white hover:border-gold/40 hover:shadow-bento',
        checked && 'border-gold bg-gold/5 shadow-bento',
        className
      )}
    >
      {/* Checkmark */}
      {checked && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}

      {/* Color circle or Icon */}
      {color ? (
        <span
          className={cn(
            'w-14 h-14 rounded-full border-2 transition-all duration-300 shrink-0',
            checked ? 'border-gold shadow-gold' : 'border-espresso/10 group-hover:border-gold/40'
          )}
          style={{ backgroundColor: color }}
        />
      ) : icon ? (
        <span className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
          checked ? 'bg-gold/15 text-gold' : 'bg-espresso/5 text-espresso/50 group-hover:text-espresso group-hover:bg-espresso/8'
        )}>
          {icon}
        </span>
      ) : null}

      {/* Label */}
      <span className="text-sm font-semibold text-espresso leading-snug">{label}</span>

      {/* Description */}
      {description && (
        <span className="text-xs text-espresso/40 leading-relaxed">{description}</span>
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
