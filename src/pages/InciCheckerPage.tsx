import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import InciChecker from "@/components/InciChecker";
import InciExpertVerdict from "@/components/InciExpertVerdict";

export default function InciCheckerPage() {
  const { lang } = useLanguage();

  const title = lang === "es"
    ? "INCI-Check Profesional — Escáner de Ingredientes"
    : "Professional INCI-Check — Ingredient Scanner";

  const desc = lang === "es"
    ? "Analiza la seguridad de ingredientes cosméticos: PPD, sulfatos, parabenos, siliconas y más. Datos de SCCS, CIR, ECHA y FDA actualizados 2024–2026."
    : "Analyze the safety of cosmetic ingredients: PPD, sulfates, parabens, silicones and more. Updated 2024–2026 data from SCCS, CIR, ECHA and FDA.";

  return (
    <>
      <Helmet>
        <title>{title} | GuiaDelSalon.com</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href="https://guiadelsalon.com/inci-check" />
      </Helmet>

      <div style={{ background: "#1a1008" }}>
        {/* Hero */}
        <div className="relative overflow-hidden py-16 md:py-24">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 60%, #C4A97D 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #C4A97D 0%, transparent 55%)",
            }}
          />

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                style={{ background: "rgba(196,169,125,0.08)", border: "1px solid rgba(196,169,125,0.20)" }}
              >
                <span className="text-[#C4A97D] text-[10px] font-bold uppercase tracking-[0.2em]">
                  {lang === "es" ? "Herramienta Profesional · Seguridad de Ingredientes" : "Professional Tool · Ingredient Safety"}
                </span>
              </div>

              <h1
                className="font-display font-bold text-[#F5F0E8] mb-4 leading-tight"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
              >
                {lang === "es" ? (
                  <>INCI-Check <span className="text-[#C4A97D]">Profesional</span></>
                ) : (
                  <>Professional <span className="text-[#C4A97D]">INCI-Check</span></>
                )}
              </h1>

              <p className="text-[#F5F0E8]/60 text-base md:text-lg leading-relaxed mb-2">
                {lang === "es"
                  ? "Escáner de seguridad de ingredientes cosméticos con datos verificados de SCCS, CIR, ECHA y FDA (2022–2026)."
                  : "Cosmetic ingredient safety scanner with verified data from SCCS, CIR, ECHA and FDA (2022–2026)."}
              </p>
              <p className="text-[#F5F0E8]/35 text-sm">
                {lang === "es"
                  ? "Busca ingredientes individualmente o pega una lista INCI completa para analizar un producto de un vistazo."
                  : "Search ingredients individually or paste a full INCI list to analyze a product at a glance."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main content */}
        <div
          className="py-10 md:py-14"
          style={{ background: "linear-gradient(180deg, #1a1008 0%, #F5F0E8 120px)" }}
        >
          <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-10">
            {/* Checker tool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <InciChecker />
            </motion.div>

            {/* Risk legend */}
            <div className="flex flex-wrap gap-4 text-xs text-[#2D2218]/65">
              <span className="font-semibold text-[#2D2218]/40 uppercase tracking-wider text-[10px]">Leyenda:</span>
              {[
                ["🔴", "Evitar — riesgo documentado"],
                ["🟡", "Precaución — condición específica"],
                ["🟢", "Sin restricción especial"],
              ].map(([emoji, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span>{emoji}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>

            {/* Expert verdict */}
            <InciExpertVerdict />

            {/* Disclaimer */}
            <p className="text-xs text-[#2D2218]/40 leading-relaxed pb-4">
              <strong>Aviso:</strong> Esta herramienta es de carácter informativo y educativo. No sustituye el consejo
              de un dermatólogo, toxicólogo o especialista en seguridad cosmética. Los datos se basan en las
              opiniones científicas más recientes de los organismos reguladores citados. Para evaluaciones de
              seguridad en formulación o asesoramiento clínico, consulta a un profesional cualificado.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
