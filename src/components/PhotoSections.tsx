import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

const sections = [
  {
    title: "Barbería & Hombre",
    description: "Clippers, trimmers, navajas y todo el equipamiento que necesitas",
    image: "/images/section-barber.jpg",
    link: "/categorias/clippers",
    linkText: "Ver productos de hombre",
  },
  {
    title: "Peluquería & Mujer",
    description: "Secadores, planchas, tintes y tratamientos profesionales",
    image: "/images/section-salon.jpg",
    link: "/categorias/secadores-profesionales",
    linkText: "Ver productos de mujer",
  },
  {
    title: "Salón Mixto",
    description: "Capas, maniquíes y productos comunes para todo tipo de salón",
    image: "/images/section-mixto.jpg",
    link: "/categorias/capas-y-delantales",
    linkText: "Ver productos mixtos",
  },
];

const PhotoSections = () => (
  <section className="container mx-auto px-4 py-16 md:py-20 space-y-8">
    {sections.map((s, i) => {
      const isReversed = i % 2 === 1;
      return <PhotoCard key={s.title} section={s} reversed={isReversed} index={i} />;
    })}
  </section>
);

function PhotoCard({ section, reversed, index }: { section: typeof sections[0]; reversed: boolean; index: number }) {
  const fade = useFadeIn();

  return (
    <div
      ref={fade.ref}
      className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} gap-6 items-stretch transition-all duration-700 ${fade.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Image */}
      <Link
        to={section.link}
        className="relative overflow-hidden rounded-2xl md:w-1/2 aspect-[4/3] group"
      >
        <img
          src={section.image}
          alt={section.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display text-2xl font-bold text-white">{section.title}</h3>
        </div>
      </Link>

      {/* Text */}
      <div className="md:w-1/2 flex flex-col justify-center p-4 md:p-8">
        <p className="text-muted-foreground text-lg mb-6">{section.description}</p>
        <Link
          to={section.link}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity w-fit text-sm"
        >
          {section.linkText} →
        </Link>
      </div>
    </div>
  );
}

export default PhotoSections;
