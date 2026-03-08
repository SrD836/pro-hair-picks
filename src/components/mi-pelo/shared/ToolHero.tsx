import { cn } from '@/lib/utils';

interface ToolHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export function ToolHero({ title, subtitle, imageUrl, className }: ToolHeroProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        'relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-espresso flex items-end',
        className
      )}
    >
      {/* Background image (optional) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Espresso gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent" />

      {/* Text content — bottom-left */}
      <div className="relative z-10 p-6 md:p-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold italic text-cream leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-cream/80 text-sm md:text-base max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
