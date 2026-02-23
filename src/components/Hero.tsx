import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-barbershop.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(24,29%,9%)]/85 via-[hsl(24,29%,9%)]/70 to-transparent" />
      <HeroParticles />

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <img
              src="/logo-full.png"
              alt="Guía del Salón"
              className="h-40 w-auto md:h-52 brightness-0 invert drop-shadow-lg"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-secondary/20 bg-card/30 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-foreground/80 text-sm font-medium">{t("hero.badge")}</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
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

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
            className="w-[60px] h-px bg-secondary mx-auto mb-10"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            <div ref={c1.ref} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-card/50 border border-secondary/30 backdrop-blur-sm">
              <span className="font-display text-2xl font-bold text-secondary">{c1.count}</span>
              <span className="text-muted-foreground">{t("hero.productsAnalyzed")}</span>
            </div>
            <div ref={c2.ref} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-card/50 border border-secondary/30 backdrop-blur-sm">
              <span className="font-display text-2xl font-bold text-secondary">{c2.count}</span>
              <span className="text-muted-foreground">{t("hero.categories")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-sm bg-card/50 border border-secondary/30 backdrop-blur-sm">
              <span className="font-display text-2xl font-bold text-secondary">✓</span>
              <span className="text-muted-foreground">{t("hero.pricesUpdated")}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
