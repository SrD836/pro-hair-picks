import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import ChemicalCompatibilityAnalyzer from "@/components/ChemicalCompatibilityAnalyzer";

export default function CompatibilidadQuimicaPage() {
  return (
    <>
      <Helmet>
        <title>
          Analizador de Compatibilidad Química Capilar | GuiaDelSalon.com
        </title>
        <meta
          name="description"
          content="Descubre si tus tratamientos capilares son compatibles entre sí. Base de datos química respaldada por literatura científica peer-reviewed (2018–2026). Decoloración, queratina, relajantes, henna."
        />
        <meta
          name="keywords"
          content="compatibilidad química capilar, decoloración keratina, relajante henna, ácido glioxílico NaOH, tioglicolato bleach, interacciones químicas pelo"
        />
        <link
          rel="canonical"
          href="https://guiadelsalon.com/compatibilidad-quimica"
        />
      </Helmet>

      {/* Hero section */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
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
              Herramienta de autoridad · GuiaDelSalon.com
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F0E8] mb-6 leading-tight">
              Compatibilidad
              <span className="block text-[#C4A97D]">Química Capilar</span>
            </h1>
            <p className="text-[#F5F0E8]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Verifica si tus tratamientos capilares son seguros de combinar.
              Datos respaldados por literatura científica peer-reviewed y
              guías de organismos como el CIR, SCCS y ANSES.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <ChemicalCompatibilityAnalyzer />
      </div>
    </>
  );
}
