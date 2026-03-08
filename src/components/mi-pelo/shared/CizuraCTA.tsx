import { cn } from '@/lib/utils';

interface CizuraCTAProps {
  className?: string;
}

export function CizuraCTA({ className }: CizuraCTAProps) {
  return (
    <div className={cn('bg-espresso rounded-3xl p-8 text-cream', className)}>
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-gold uppercase tracking-wider mb-3">
          Recomendado por expertos
        </p>
        <h3 className="font-display text-2xl md:text-3xl font-bold italic leading-snug mb-3">
          ¿Quieres un diagnóstico profesional?
        </h3>
        <p className="text-cream/70 text-sm md:text-base leading-relaxed mb-6">
          Reserva una consulta con nuestros estilistas certificados y recibe un plan capilar personalizado.
        </p>
        <a
          href="https://cizura.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium',
            'bg-gold text-espresso hover:bg-gold/90 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-espresso'
          )}
        >
          Reservar consulta →
        </a>
      </div>
    </div>
  );
}
