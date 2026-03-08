import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  name: string;          // radio group name
  value: string;         // radio value
  label: string;         // display text
  icon?: ReactNode;      // optional Lucide icon on the left
  checked?: boolean;
  onChange: (value: string) => void;
  className?: string;
}

export function OptionCard({ name, value, label, icon, checked = false, onChange, className }: OptionCardProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
        'border-espresso/15 bg-white hover:border-gold/50 hover:bg-gold/5',
        'has-[:checked]:border-gold has-[:checked]:bg-gold/10',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0 text-espresso/60 w-5 h-5">
          {icon}
        </span>
      )}

      {/* Label text */}
      <span className="flex-1 text-sm font-medium text-espresso">{label}</span>

      {/* Hidden radio input + custom styled radio */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="radio-custom flex-shrink-0" aria-hidden="true" />
    </label>
  );
}
