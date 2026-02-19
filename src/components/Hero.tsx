import { motion } from "framer-motion";

const BarberPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="barber-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Scissors */}
        <g transform="translate(20, 20) rotate(30)" fill="currentColor">
          <ellipse cx="-6" cy="0" rx="8" ry="3" />
          <ellipse cx="6" cy="0" rx="8" ry="3" />
          <circle cx="0" cy="0" r="2" />
        </g>
        {/* Razor blade */}
        <g transform="translate(60, 55) rotate(-15)" fill="currentColor">
          <rect x="-10" y="-2" width="20" height="4" rx="1" />
          <rect x="-12" y="-4" width="4" height="8" rx="1" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#barber-pattern)" />
  </svg>
);

const Hero = () => (
  <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
    <BarberPattern />

    <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary text-sm font-medium">Rankings actualizados diariamente</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
          El catálogo profesional que tu{" "}
          <span className="text-secondary">barbería</span> necesita
        </h1>

        <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Rankings honestos, precios reales, herramientas que funcionan.
        </p>

        <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/60 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            +2.000 productos
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            49 categorías
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Precios verificados
          </span>
        </div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
