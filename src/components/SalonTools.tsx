import { motion } from "framer-motion";
import { GitCompare, HelpCircle, Calculator, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: GitCompare,
    title: "Comparador",
    description: "Compara dos productos lado a lado: especificaciones, precio y valoración.",
    cta: "Comparar",
    href: "/comparar",
    isLink: true,
  },
  {
    icon: HelpCircle,
    title: "Quiz del Producto Ideal",
    description: "Responde 4 preguntas y te recomendamos la herramienta perfecta para ti.",
    cta: "Empezar quiz",
    href: "/quiz",
    isLink: true,
  },
  {
    icon: Calculator,
    title: "Calculadora ROI",
    description: "Calcula cuánto tardarás en amortizar tu próxima inversión en equipo.",
    cta: "Usar ahora",
    href: "/calculadora-roi",
    isLink: true,
  },
  {
    icon: Store,
    title: "Gestionar mi local",
    description: "Ranking de software de gestión: agenda, facturación VeriFactu y más.",
    cta: "Ver ranking",
    href: "/gestionar-mi-local",
    isLink: true,
    hidden: true,
  },
];

const SalonTools = () => (
  <section className="bg-accent/50 py-16 md:py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Herramientas del Salón
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Recursos diseñados para que tomes mejores decisiones de compra
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {tools.filter(t => !t.hidden).map((tool, i) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <div className="group h-full flex flex-col p-5 rounded-lg border border-border bg-card/60 backdrop-blur-sm hover:border-secondary/50 hover:shadow-gold transition-all duration-300 relative overflow-hidden glass-border-hover">
              <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary w-fit mb-4">
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {tool.description}
              </p>
              {tool.isLink ? (
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link to={tool.href!}>{tool.cta}</Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <a href={tool.href}>{tool.cta}</a>
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SalonTools;
