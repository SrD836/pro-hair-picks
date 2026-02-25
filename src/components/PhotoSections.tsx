import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Scissors, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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

const PhotoSections = () => {
  const { t } = useLanguage();

  const sections = [
    {
      title: t("sections.barber.title"),
      subtitle: t("sections.barber.subtitle"),
      image: "/images/section-barber.jpg",
      imageWebp: "/images/section-barber.webp",
      link: "/categorias/clippers",
      linkText: t("sections.barber.cta"),
      icon: Scissors,
      categoryCount: 22,
    },
    {
      title: t("sections.salon.title"),
      subtitle: t("sections.salon.subtitle"),
      image: "/images/section-salon.jpg",
      imageWebp: "/images/section-salon.webp",
      link: "/categorias/secadores-profesionales",
      linkText: t("sections.salon.cta"),
      icon: Sparkles,
      categoryCount: 16,
    },
    {
      title: t("sections.mixed.title"),
      subtitle: t("sections.mixed.subtitle"),
      image: "/images/section-mixto.jpg",
      imageWebp: "/images/section-mixto.webp",
      link: "/categorias/capas-y-delantales",
      linkText: t("sections.mixed.cta"),
      icon: Users,
      categoryCount: 6,
    },
  ];

  return (
    <section className="py-16 md:py-24 space-y-0">
      {sections.map((s, i) => (
        <PhotoCard key={i} section={s} index={i} categoriesLabel={t("sections.categoriesLabel")} />
      ))}
    </section>
  );
};

function PhotoCard({ section, index, categoriesLabel }: { section: { title: string; subtitle: string; image: string; imageWebp: string; link: string; linkText: string; icon: any; categoryCount: number }; index: number; categoriesLabel: string }) {
  const fade = useFadeIn();
  const counter = useCountUp(section.categoryCount);
  const Icon = section.icon;

  return (
    <div
      ref={fade.ref}
      className="relative overflow-hidden min-h-[50vh] md:min-h-[60vh] flex items-center"
    >
      <picture>
        <source srcSet={section.imageWebp} type="image/webp" />
        <img
          src={section.image}
          alt=""
          loading="lazy"
          decoding="async"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`max-w-lg transition-all duration-700 ease-out ${fade.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          style={{ transitionDelay: "0.1s" }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Icon className="w-5 h-5 text-secondary" />
            <span className="text-secondary text-sm font-medium uppercase tracking-wider">
              {section.title}
            </span>
          </div>

          <div className="mb-4">
            <span
              ref={counter.ref}
              className="font-display text-6xl md:text-7xl font-bold text-white/90"
            >
              {counter.count}
            </span>
            <span className="text-white/50 text-lg ml-2">{categoriesLabel}</span>
          </div>

          <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed italic">
            {section.subtitle}
          </p>

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
