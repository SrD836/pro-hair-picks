import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, GitCompare, HelpCircle, Calculator, Microscope } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Tool card ─────────────────────────────────── */
function ToolCard({
  icon: Icon, title, description, cta, href, index,
}: {
  icon: React.ElementType; title: string; description: string;
  cta: string; href: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(196,169,125,0.18)", transition: { duration: 0.2 } }}
      className="rounded-2xl border border-secondary/15 bg-card p-6 flex flex-col gap-4"
    >
      <div className="p-3 rounded-xl bg-secondary/10 w-fit">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <Link
        to={href}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/90 transition-colors group w-fit"
      >
        {cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}

/* ── Main Bento Grid ───────────────────────────── */
const HomeBentoGrid = () => {
  const { t } = useLanguage();

  const tools = [
    { icon: GitCompare, title: t("bento.comparator"),       description: t("bento.comparatorDesc"), cta: t("bento.compare"),        href: "/comparar" },
    { icon: HelpCircle, title: t("bento.quiz"),             description: t("bento.quizDesc"),        cta: t("bento.startQuiz"),      href: "/quiz" },
    { icon: Calculator,  title: t("bento.roiCalc"),          description: t("bento.roiDesc"),         cta: t("bento.useNow"),         href: "/calculadora-roi" },
    { icon: Microscope,  title: t("bento.diagnosticoTitle"), description: t("bento.diagnosticoDesc"), cta: t("bento.diagnosticoCta"), href: "/diagnostico-capilar" },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("bento.salonTools")}
        </h2>
        <p className="text-muted-foreground max-w-lg">
          {t("bento.toolsSubtitle")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <ToolCard key={tool.href} {...tool} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HomeBentoGrid;
