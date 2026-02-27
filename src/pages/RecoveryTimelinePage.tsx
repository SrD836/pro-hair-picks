import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import RecoveryTimeline from "@/components/RecoveryTimeline";
import RecoveryExpertVerdict from "@/components/RecoveryExpertVerdict";

export default function RecoveryTimelinePage() {
  return (
    <>
      <Helmet>
        <title>Calculadora de Recuperación Capilar — GuiaDelSalon</title>
        <meta
          name="description"
          content="Genera tu calendario personalizado de recuperación capilar. Basado en nivel de daño, porosidad y último tratamiento. Respaldado por evidencia científica."
        />
        <link rel="canonical" href="https://guiadelsalon.com/recuperacion-capilar" />
      </Helmet>

      {/* Hero */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #C4A97D 0%, transparent 50%), radial-gradient(circle at 75% 50%, #C4A97D 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D] mb-4">
              Herramienta profesional
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E8] mb-6 leading-tight">
              Calculadora de{" "}
              <span className="block text-[#C4A97D]">Recuperación Capilar</span>
            </h1>
            <p className="text-[#F5F0E8]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Basada en nivel de daño real, no en estimaciones. Tu cabello tiene un reloj biológico
              — este calendario lo respeta.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <RecoveryTimeline />
        <RecoveryExpertVerdict />
      </div>
    </>
  );
}
