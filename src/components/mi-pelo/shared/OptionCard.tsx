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
  image?: string;
}

export function OptionCard({ name, value, label, description, icon, checked = false, onChange, className, color, image }: OptionCardProps) {
  // Image card variant
  if (image) {
    return (
      <label
        className={cn(
          'group relative block overflow-hidden rounded-2xl cursor-pointer transition-all duration-300',
          'border-2',
          checked ? 'border-accent-orange shadow-lg' : 'border-transparent hover:border-accent-orange/30',
          className
        )}
      >
        <img src={image} alt={label} className="w-full h-40 object-cover" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Label */}
        <span className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow-md">{label}</span>
        {/* Checkmark */}
        {checked && (
          <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent-orange flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 text-white" />
          </span>
        )}
        <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      </label>
    );
  }

  return (
    <label
      className={cn(
        'group relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300',
        'bg-white hover:shadow-bento',
        checked
          ? 'border-accent-orange shadow-bento'
          : 'border-espresso/8 hover:border-accent-orange/30',
        className
      )}
    >
      {/* Checkmark */}
      {checked && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-orange flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}

      {/* Color circle or Icon */}
      {color ? (
        <span
          className={cn(
            'w-14 h-14 rounded-full border-2 transition-all duration-300 shrink-0',
            checked ? 'border-accent-orange shadow-lg' : 'border-espresso/10 group-hover:border-accent-orange/40'
          )}
          style={{ backgroundColor: color }}
        />
      ) : icon ? (
        <span className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
          checked ? 'bg-accent-orange/15 text-accent-orange' : 'bg-espresso/5 text-espresso/50 group-hover:text-espresso group-hover:bg-espresso/8'
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
