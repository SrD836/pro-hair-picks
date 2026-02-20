import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Scissors, Sparkles, Users } from "lucide-react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

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

const sections = [
  {
    title: "Barbería & Hombre",
    subtitle: "Desde el fade perfecto hasta el afeitado clásico",
    image: "/images/section-barber.jpg",
    link: "/categorias/clippers",
    linkText: "Explorar productos de hombre",
    icon: Scissors,
    categoryCount: 22,
  },
  {
    title: "Peluquería & Mujer",
    subtitle: "Herramientas que los profesionales eligen cada día",
    image: "/images/section-salon.jpg",
    link: "/categorias/secadores-profesionales",
    linkText: "Explorar productos de mujer",
    icon: Sparkles,
    categoryCount: 16,
  },
  {
    title: "Salón Mixto",
    subtitle: "Equipamiento para salones que lo quieren todo",
    image: "/images/section-mixto.jpg",
    link: "/categorias/capas-y-delantales",
    linkText: "Explorar productos mixtos",
    icon: Users,
    categoryCount: 6,
  },
];

const PhotoSections = () => (
  <section className="py-16 md:py-24 space-y-0">
    {sections.map((s, i) => (
      <PhotoCard key={s.title} section={s} index={i} />
    ))}
  </section>
);

function PhotoCard({ section, index }: { section: typeof sections[0]; index: number }) {
  const fade = useFadeIn();
  const counter = useCountUp(section.categoryCount);
  const Icon = section.icon;

  return (
    <div
      ref={fade.ref}
      className="relative overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${section.image}')` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Content — slides in from left */}
      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`max-w-lg transition-all duration-700 ease-out ${fade.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          style={{ transitionDelay: "0.1s" }}
        >
          {/* Icon */}
          <div className="inline-flex items-center gap-2 mb-4">
            <Icon className="w-5 h-5 text-secondary" />
            <span className="text-secondary text-sm font-medium uppercase tracking-wider">
              {section.title}
            </span>
          </div>

          {/* Big number */}
          <div className="mb-4">
            <span
              ref={counter.ref}
              className="font-display text-6xl md:text-7xl font-bold text-white/90"
            >
              {counter.count}
            </span>
            <span className="text-white/50 text-lg ml-2">categorías</span>
          </div>

          {/* Subtitle */}
          <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed italic">
            {section.subtitle}
          </p>

          {/* CTA with underline hover */}
          <Link
            to={section.link}
            className="cta-underline text-secondary font-semibold text-base hover:text-secondary/80 transition-colors"
          >
            {section.linkText} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PhotoSections;
