import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Monitor, Microscope, GitCompare, Calculator, Package, GraduationCap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Laboratorio section — list with chevron links ────────────────────── */
const labTools = [
  { labelKey: "bento.analysisTools", defaultLabel: "Análisis de Herramientas", href: "/quiz" },
  { labelKey: "bento.diagnosticoTitle", defaultLabel: "Diagnóstico Capilar", href: "/diagnostico-capilar" },
  { labelKey: "bento.comparator", defaultLabel: "Comparador de Productos", href: "/comparar" },
  { labelKey: "bento.roiCalc", defaultLabel: "Calculadora de ROI", href: "/calculadora-roi" },
];

function LabRow({ label, href, index }: { label: string; href: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <Link
        to={href}
        className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        style={{
          background: "#F5F0E8",
          color: "#2D2218",
          border: "1px solid rgba(45,34,24,0.12)",
        }}
      >
        <span>{label}</span>
        <ChevronRight className="w-4 h-4 opacity-40 flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

/* ── Soluciones section — accordion ──────────────────────────────────── */
const solutions = [
  {
    icon: Monitor,
    labelKey: "solutions.software",
    defaultLabel: "Integración de Software",
    descKey: "solutions.softwareDesc",
    defaultDesc: "Conecta tu flujo de trabajo con herramientas digitales optimizadas para el sector.",
    href: "https://cizura.com",
  },
  {
    icon: Package,
    labelKey: "solutions.equipment",
    defaultLabel: "Equipamiento Profesional",
    descKey: "solutions.equipmentDesc",
    defaultDesc: "Selección de mobiliario y equipos verificados por profesionales del sector.",
    href: "/categorias",
  },
  {
    icon: GitCompare,
    labelKey: "solutions.inventory",
    defaultLabel: "Gestión de Inventario",
    descKey: "solutions.inventoryDesc",
    defaultDesc: "Controla tu stock y costes con herramientas diseñadas para salones.",
    href: "/calculadora-roi",
  },
  {
    icon: GraduationCap,
    labelKey: "solutions.training",
    defaultLabel: "Formación y Cursos",
    descKey: "solutions.trainingDesc",
    defaultDesc: "Accede a contenido formativo para crecer como profesional.",
    href: "/blog",
  },
];

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  seeMoreLabel,
}: {
  item: typeof solutions[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  seeMoreLabel: string;
}) {
  const { t } = useLanguage();
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      style={{ borderBottom: "1px solid rgba(45,34,24,0.1)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left transition-colors"
        style={{ color: "#2D2218" }}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#C4A97D" }} />
          <span className="font-semibold text-sm md:text-base">
            {t(item.labelKey) || item.defaultLabel}
          </span>
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{
            opacity: 0.4,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-7">
              <p className="text-sm mb-3" style={{ color: "#2D2218", opacity: 0.6 }}>
                {t(item.descKey) || item.defaultDesc}
              </p>
              <Link
                to={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: "#F5F0E8",
                  color: "#2D2218",
                  border: "1px solid rgba(45,34,24,0.2)",
                }}
              >
                {seeMoreLabel}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
const HomeBentoGrid = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const seeMoreLabel = t("solutions.seeMore") || "Ver Más";

  return (
    <>
      {/* ── Laboratorio ── */}
      <section className="py-12 md:py-16 px-4 md:px-8" style={{ background: "#F5F0E8" }}>
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-center mb-6"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#2D2218" }}
          >
            {t("bento.labTitle") || "Laboratorio"}
          </motion.h2>

          <div className="flex flex-col gap-2.5">
            {labTools.map((tool, i) => (
              <LabRow
                key={tool.href}
                label={t(tool.labelKey) || tool.defaultLabel}
                href={tool.href}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Soluciones ── */}
      <section className="py-12 md:py-16 px-4 md:px-8" style={{ background: "#F5F0E8" }}>
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-center mb-6"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#2D2218" }}
          >
            {t("solutions.title") || "Soluciones"}
          </motion.h2>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(45,34,24,0.12)", background: "#F5F0E8" }}
          >
            <div className="px-4">
              {solutions.map((item, i) => (
                <AccordionItem
                  key={item.labelKey}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                  seeMoreLabel={seeMoreLabel}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeBentoGrid;
