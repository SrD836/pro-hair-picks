import { cn } from '@/lib/utils';

interface MultiSelectPillsProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function MultiSelectPills({ options, selected, onChange, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby }: MultiSelectPillsProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>
      {options.map(opt => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            aria-pressed={isSelected}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              'border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1',
              isSelected
                ? 'bg-espresso text-cream border-espresso'
                : 'bg-white text-espresso border-espresso/20 hover:border-gold/50 hover:bg-gold/5'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
