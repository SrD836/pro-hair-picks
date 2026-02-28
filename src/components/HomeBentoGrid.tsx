import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Microscope, Palette, Calculator, FlaskConical } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const tools = [
  {
    icon: Microscope,
    labelKey: "bento.diagnosticoTitle",
    defaultLabel: "Diagnóstico Capilar",
    descKey: "bento.diagnosticoDesc",
    defaultDesc: "Analiza el estado de tu cabello con IA y recibe recomendaciones personalizadas.",
    href: "/diagnostico-capilar",
    gradient: "from-[#3E2D1F] to-[#2D2218]",
  },
  {
    icon: Palette,
    labelKey: "colorMatch.navLabel",
    defaultLabel: "Asesor de Color",
    descKey: "bento.colorDesc",
    defaultDesc: "Encuentra el tono perfecto para tu tipo de cabello y tono de piel.",
    href: "https://guiadelsalon.com/asesor-color",
    gradient: "from-[#4A3B2C] to-[#3E2D1F]",
    external: true,
  },
  {
    icon: Calculator,
    labelKey: "bento.roiCalc",
    defaultLabel: "Calculadora de ROI",
    descKey: "bento.roiDesc",
    defaultDesc: "Calcula el retorno de inversión de tus herramientas profesionales.",
    href: "/calculadora-roi",
    gradient: "from-[#3E2D1F] to-[#4A3B2C]",
  },
  {
    icon: FlaskConical,
    labelKey: "bento.chemCompat",
    defaultLabel: "INCI Check",
    descKey: "bento.chemCompatDesc",
    defaultDesc: "Verifica la compatibilidad química entre tratamientos capilares.",
    href: "/inci-check",
    gradient: "from-[#4A3B2C] to-[#2D2218]",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const HomeBentoGrid = () => {
  const { t } = useLanguage();

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8"
      style={{ background: "linear-gradient(180deg, #3E2D1F 0%, #2D2218 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2
            className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#F5F0E8" }}
          >
            {t("bento.labTitle") || "Herramientas del Salón"}
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#C4A97D", opacity: 0.7 }}>
            {t("bento.labSubtitle") || "Diagnósticos, análisis y calculadoras para profesionales."}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            const content = (
              <motion.div
                variants={cardVariants}
                className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br ${tool.gradient} border border-white/8 p-6 md:p-8 flex flex-col justify-between min-h-[200px] glass-border-hover transition-shadow duration-300 hover:shadow-gold`}
              >
                {/* Glassmorphism accent */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C4A97D]/5 blur-3xl pointer-events-none" />

                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm"
                    style={{ background: "rgba(196,169,125,0.1)", border: "1px solid rgba(196,169,125,0.15)" }}
                  >
                    <Icon className="w-5 h-5 text-[#C4A97D]" />
                  </div>

                  <h3 className="font-display font-bold text-lg md:text-xl text-[#F5F0E8] mb-2">
                    {t(tool.labelKey) || tool.defaultLabel}
                  </h3>
                  <p className="text-sm text-[#F5F0E8]/50 leading-relaxed">
                    {t(tool.descKey) || tool.defaultDesc}
                  </p>
                </div>

                <div className="mt-5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C4A97D] group-hover:gap-3 transition-all duration-300">
                    {t("solutions.seeMore") || "Ver más"} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );

            return tool.external ? (
              <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link key={tool.href} to={tool.href}>
                {content}
              </Link>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HomeBentoGrid;
