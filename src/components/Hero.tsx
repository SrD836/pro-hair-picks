import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const Hero = () => {
  const c1 = useCountUp(431);
  const c2 = useCountUp(47);

  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-barbershop.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85" />

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Logo en el hero */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo-full.png"
              alt="Guía del Salón"
              className="h-40 w-auto md:h-56"
              style={{ filter: "invert(1) brightness(1.8)" }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Seleccionado por profesionales</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            El catálogo profesional que tu{" "}
            <span className="shimmer-gold">salón</span> necesita
          </h1>

          <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Probado en salones reales. Rankings honestos, precios reales, herramientas que funcionan.
          </p>

          {/* Animated counters */}
          <div className="flex flex-wrap justify-center gap-8 text-white/70 text-sm">
            <div ref={c1.ref} className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-secondary">{c1.count}</span>
              <span>productos analizados</span>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div ref={c2.ref} className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-secondary">{c2.count}</span>
              <span>categorías</span>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-secondary">✓</span>
              <span>Precios actualizados hoy</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
