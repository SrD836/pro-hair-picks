import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GitCompare, HelpCircle, Calculator, Microscope } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

function ToolCard({
  icon: Icon,
  title,
  cta,
  href,
  index,
}: {
  icon: React.ElementType;
  title: string;
  cta: string;
  href: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-2xl border border-[#C4A97D]/15 bg-[#2D2218] p-5 flex flex-col items-center text-center gap-4 hover:border-[#C4A97D]/40 transition-colors"
    >
      <div className="w-12 h-12 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#C4A97D]" strokeWidth={1.25} />
      </div>
      <h3 className="font-display text-[0.92rem] font-bold text-[#F5F0E8] leading-snug">
        {title}
      </h3>
      <Link
        to={href}
        className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-[#C4A97D] text-[#2D2218] font-bold text-sm hover:bg-[#d4b98d] active:scale-95 transition-all mt-auto"
      >
        {cta}
      </Link>
    </motion.div>
  );
}

const HomeBentoGrid = () => {
  const { t } = useLanguage();

  const tools = [
    {
      icon: GitCompare,
      title: t("bento.comparator"),
      cta: t("bento.compare"),
      href: "/comparar",
    },
    {
      icon: HelpCircle,
      title: t("bento.quiz"),
      cta: t("bento.startQuiz"),
      href: "/quiz",
    },
    {
      icon: Calculator,
      title: t("bento.roiCalc"),
      cta: t("bento.useNow"),
      href: "/calculadora-roi",
    },
    {
      icon: Microscope,
      title: t("bento.diagnosticoTitle"),
      cta: t("bento.diagnosticoCta"),
      href: "/diagnostico-capilar",
    },
  ];

  return (
    <section className="px-4 md:px-8 pb-16 md:pb-20 max-w-screen-xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] text-center mb-8"
      >
        {t("bento.salonTools")}
      </motion.h2>

      {/* 2×2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {tools.map((tool, i) => (
          <ToolCard key={tool.href} {...tool} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HomeBentoGrid;
