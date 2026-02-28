import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Microscope, Palette, Calculator, FlaskConical, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const tools = [
  {
    icon: Microscope,
    labelKey: "bento.diagnosticoTitle",
    defaultLabel: "Diagnóstico Capilar",
    descKey: "bento.diagnosticoDesc",
    defaultDesc: "Test científico de 12 preguntas. Evalúa cutícula, porosidad, elasticidad y cuero cabelludo.",
    href: "/diagnostico-capilar",
    accentColor: "#C4A97D",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(196,169,125,0.12) 0%, transparent 60%)",
    tag: "Científico",
    external: false,
  },
  {
    icon: Palette,
    labelKey: "colorMatch.navLabel",
    defaultLabel: "Asesor de Color",
    descKey: "bento.colorDesc",
    defaultDesc: "Encuentra el tono exacto para cada cliente según su tono de piel y cabello base.",
    href: "/asesor-color",
    accentColor: "#D4956A",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(212,149,106,0.10) 0%, transparent 60%)",
    tag: "IA",
    external: false,
  },
  {
    icon: Calculator,
    labelKey: "bento.roiCalc",
    defaultLabel: "Calculadora de ROI",
    descKey: "bento.roiDesc",
    defaultDesc: "Calcula cuánto tardarás en amortizar tu próxima inversión en equipo.",
    href: "/calculadora-roi",
    accentColor: "#8BAF7C",
    bgPattern: "radial-gradient(circle at 80% 80%, rgba(139,175,124,0.08) 0%, transparent 60%)",
    tag: "Gratis",
    external: false,
  },
  {
    icon: FlaskConical,
    labelKey: "bento.chemCompat",
    defaultLabel: "Compatibilidad Química",
    descKey: "bento.chemCompatDesc",
    defaultDesc: "Verifica la compatibilidad química entre tratamientos. Evita daños y reacciones.",
    href: "/inci-check",
    accentColor: "#7B9EC7",
    bgPattern: "radial-gradient(circle at 20% 20%, rgba(123,158,199,0.08) 0%, transparent 60%)",
    tag: "Técnico",
    external: false,
  },
];

const HomeBentoGrid = () => {
  const { t } = useLanguage();

  return (
    <section
      className="py-20 md:py-28 px-4 md:px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f0a06 0%, #1a1008 40%, #221508 100%)" }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, rgba(196,169,125,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(196,169,125,0.05) 0%, transparent 40%)",
        }}
      />
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,169,125,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,169,125,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(196,169,125,0.1)", border: "1px solid rgba(196,169,125,0.2)" }}
          >
            <Sparkles className="w-3 h-3 text-[#C4A97D]" />
            <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
              {t("bento.labTitle")}
            </span>
          </div>
          <h2
            className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "#F5F0E8" }}
          >
            {t("bento.labTitle")}
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "#F5F0E8", opacity: 0.45 }}>
            {t("bento.labSubtitle")}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(196,169,125,0.08)", transition: { duration: 0.2 } }}
              >
                <Link to={tool.href} className="block h-full">
                  <div
                    className="relative rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[220px] cursor-pointer group h-full"
                    style={{
                      background: `${tool.bgPattern}, linear-gradient(145deg, #3a2a1a 0%, #2d2015 60%, #241a0e 100%)`,
                      border: "1px solid rgba(196,169,125,0.15)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(196,169,125,0.06)",
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{
                        border: "1px solid rgba(196,169,125,0.25)",
                        boxShadow: "inset 0 0 60px rgba(196,169,125,0.08)",
                      }}
                    />

                    {/* Tag pill */}
                    <div className="absolute top-4 right-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          background: `${tool.accentColor}18`,
                          color: tool.accentColor,
                          border: `1px solid ${tool.accentColor}30`,
                        }}
                      >
                        {tool.tag}
                      </span>
                    </div>

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `${tool.accentColor}15`,
                        border: `1px solid ${tool.accentColor}25`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tool.accentColor }} />
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg md:text-xl text-[#F5F0E8] mb-2">
                        {t(tool.labelKey) || tool.defaultLabel}
                      </h3>
                      <p className="text-sm text-[#F5F0E8]/50 leading-relaxed line-clamp-2">
                        {t(tool.descKey) || tool.defaultDesc}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center gap-1.5">
                      <span className="text-sm font-semibold" style={{ color: tool.accentColor }}>
                        Ver más
                      </span>
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300"
                        style={{ color: tool.accentColor }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeBentoGrid;
