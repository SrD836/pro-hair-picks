import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Magnetic Button ──────────────────────────────────────────────────────── */
function MagneticButton({ children, to }: { children: React.ReactNode; to: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Link
        to={to}
        className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-sm overflow-hidden transition-all active:scale-95"
        style={{ background: "#C4A97D", color: "#2D2218" }}
      >
        {/* Gold shimmer sweep */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        <span className="relative z-10 flex items-center gap-2">
          {children}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </motion.div>
  );
}

const Hero = () => {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0.85]);

  return (
    <section ref={ref} className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
        style={{ y: bgY }}
      >
        <picture>
          <source srcSet="/images/hero-barbershop.webp" type="image/webp" />
          <img
            src="/images/hero-barbershop.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </picture>
      </motion.div>

      {/* Gradient overlay with scroll-linked opacity */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: overlayOpacity,
          background: "linear-gradient(180deg, rgba(45,34,24,0.7) 0%, rgba(45,34,24,0.95) 100%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center px-5 py-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shimmer-badge"
            style={{ background: "rgba(196,169,125,0.15)", color: "#C4A97D", border: "1px solid rgba(196,169,125,0.25)" }}
          >
            ✦ {lang === "es" ? "Catálogo Profesional" : "Professional Catalog"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-[#F5F0E8] leading-[1.05] mb-6"
          style={{ fontSize: "clamp(2.4rem, 8vw, 4rem)" }}
        >
          {lang === "es"
            ? <>El catálogo que tu <span className="shimmer-gold">salón necesita</span></>
            : <>The catalog your <span className="shimmer-gold">salon needs</span></>}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#F5F0E8]/60 text-base md:text-lg mb-10 leading-relaxed max-w-lg mx-auto"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton to="/categorias">
            {lang === "es" ? "Explorar Catálogo" : "Explore Catalog"}
          </MagneticButton>

          <Link
            to="/diagnostico-capilar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all text-[#F5F0E8]/80 hover:text-[#F5F0E8] border border-[#F5F0E8]/15 hover:border-[#F5F0E8]/30 hover:bg-white/5"
          >
            🔬 {lang === "es" ? "Diagnóstico Capilar" : "Hair Diagnosis"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
