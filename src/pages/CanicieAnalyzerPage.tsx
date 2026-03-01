import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import CanicieAnalyzer from "@/components/CanicieAnalyzer";
import CanicieExpertVerdict from "@/components/CanicieExpertVerdict";
import { useWizardReturn } from "@/hooks/useWizardReturn";

export default function CanicieAnalyzerPage() {
  const { isWizardMode, completeWizardModule } = useWizardReturn('analizador-canicie');

  const handleWizardComplete = (summary: string, score?: number) => {
    completeWizardModule({ summary, score, rawResult: { summary } });
  };

  return (
    <>
      <Helmet>
        <title>Analizador de Canicie — GuiaDelSalon</title>
        <meta
          name="description"
          content="Descubre si tu canicie tiene origen genético, ambiental o mixto. Diagnóstico basado en biología del melanocito y factores modificables. Sin falsas promesas."
        />
        <link rel="canonical" href="https://guiadelsalon.com/analizador-canicie" />
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
              Analizador de{" "}
              <span className="block text-[#C4A97D]">Salud del Melanocito</span>
            </h1>
            <p className="text-[#F5F0E8]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Diagnóstico basado en biología real. Sin promesas de inversión de la
              canicie establecida. Solo honestidad científica y recomendaciones
              que puedes actuar hoy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <CanicieAnalyzer wizardContinue={isWizardMode ? handleWizardComplete : undefined} />
        {!isWizardMode && <CanicieExpertVerdict />}
      </div>
    </>
  );
}
