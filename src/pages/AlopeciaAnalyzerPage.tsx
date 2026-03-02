import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import AlopeciaAnalyzer from "@/components/AlopeciaAnalyzer";
import AlopeciaExpertVerdict from "@/components/AlopeciaExpertVerdict";

export default function AlopeciaAnalyzerPage() {
  return (
    <>
      <SEOHead
        title="Analizador de Riesgo de Alopecia — GuiaDelSalon"
        description="¿Perderé el pelo? Análisis de riesgo de alopecia basado en genética, biología y factores modificables. Sin falsas promesas — solo ciencia."
      />

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#C4A97D] mb-4 font-medium">
              Tricología · Genética · Evidencia
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D2218] mb-6 leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Analizador de Riesgo
              <br />
              <span className="text-[#C4A97D]">de Alopecia</span>
            </h1>
            <p className="text-lg md:text-xl text-[#2D2218]/70 max-w-2xl mx-auto leading-relaxed">
              ¿Perderé el pelo? La genética, la biología y los factores
              modificables de tu calvicie — explicados sin rodeos.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#F5F0E8] min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <AlopeciaAnalyzer />
        </div>
      </div>

      {/* Expert Verdict */}
      <AlopeciaExpertVerdict />
    </>
  );
}
