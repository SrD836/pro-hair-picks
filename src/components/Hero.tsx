import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import HeroParticles from "./HeroParticles";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t } = useLanguage();

  const titleWords = t("hero.titleWords").split(",");

  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* ── Background image ── */}
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/images/hero-barbershop-mobile.webp"
          type="image/webp"
        />
        <source srcSet="/images/hero-barbershop.webp" type="image/webp" />
        <img
          src="/images/hero-barbershop.webp"
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </picture>

      {/* ── Overlay gradient — slightly softer than before for the new aesthetic ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2D2218]/88 via-[#2D2218]/72 to-[#2D2218]/40" />
      <HeroParticles />

      {/* ── Content ── */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet="/logo-240.webp 1x, /logo-320.webp 2x"
                type="image/webp"
              />
              <source srcSet="/logo-160.webp 1x, /logo-240.webp 2x" type="image/webp" />
              <img
                src="/logo-160.webp"
                alt="Guía del Salón"
                width={160}
                height={160}
                fetchPriority="high"
                className="h-36 w-auto md:h-48 brightness-0 invert drop-shadow-lg"
              />
            </picture>
          </div>

          {/* Badge — softer pill with gold border */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C4A97D]/30 bg-[#C4A97D]/10 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C4A97D]" />
            <span className="text-[#F5F0E8]/90 text-sm font-medium tracking-wide">{t("hero.badge")}</span>
          </motion.div>

          {/* Title — animated word by word */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E8] mb-6 leading-tight">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + titleWords.length * 0.1, duration: 0.5, ease: "easeOut" }}
              className="shimmer-gold inline-block mr-[0.3em]"
            >
              {t("hero.titleHighlight")}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + (titleWords.length + 1) * 0.1, duration: 0.5, ease: "easeOut" }}
              className="inline-block"
            >
              {t("hero.titleEnd")}
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="text-[#F5F0E8]/70 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
            className="w-[60px] h-px bg-[#C4A97D] mx-auto mb-10"
          />

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Primary CTA — rounded-full, gold */}
            <Link
              to="/hombre"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C4A97D] text-[#2D2218] rounded-full font-semibold text-sm hover:bg-[#D4C0A1] transition-all duration-200 shadow-lg shadow-[#C4A97D]/20 group"
            >
              {t("hero.cta") || "Explorar Catálogo"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Secondary CTA — ghost pill */}
            <Link
              to="/diagnostico-capilar"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#F5F0E8]/20 text-[#F5F0E8] rounded-full font-medium text-sm hover:bg-[#F5F0E8]/10 transition-all duration-200 backdrop-blur-sm"
            >
              {t("hero.ctaSecondary") || "Diagnóstico Capilar"}
            </Link>
          </motion.div>

          {/* ── Stats row — bento-style floating pills ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mt-10 flex-wrap"
          >
            {/* Stat: Products */}
            <div
              ref={c1.ref}
              className="flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-md rounded-full border border-white/10"
            >
              <span className="text-[#C4A97D] font-display font-bold text-lg">{c1.count}+</span>
              <span className="text-[#F5F0E8]/70 text-xs font-medium">Productos</span>
            </div>

            {/* Divider dot */}
            <div className="w-1 h-1 rounded-full bg-[#C4A97D]/40 hidden sm:block" />

            {/* Stat: Categories */}
            <div
              ref={c2.ref}
              className="flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-md rounded-full border border-white/10"
            >
              <span className="text-[#C4A97D] font-display font-bold text-lg">{c2.count}</span>
              <span className="text-[#F5F0E8]/70 text-xs font-medium">Categorías</span>
            </div>

            {/* Divider dot */}
            <div className="w-1 h-1 rounded-full bg-[#C4A97D]/40 hidden sm:block" />

            {/* Stat: Rating badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[#C4A97D] font-display font-bold text-lg">4.9</span>
              <span className="text-[#F5F0E8]/70 text-xs font-medium">Rating Pro</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
