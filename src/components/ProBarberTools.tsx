import { motion } from "framer-motion";
import { GitCompare, HelpCircle, Calculator, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: GitCompare,
    title: "Comparador",
    description: "Compara dos productos lado a lado: especificaciones, precio y valoración.",
    cta: "Próximamente",
    disabled: true,
  },
  {
    icon: HelpCircle,
    title: "Quiz del Producto Ideal",
    description: "Responde 4 preguntas y te recomendamos la herramienta perfecta para ti.",
    cta: "Próximamente",
    disabled: true,
  },
  {
    icon: Calculator,
    title: "Calculadora ROI",
    description: "Calcula cuánto tardarás en amortizar tu próxima inversión en equipo.",
    cta: "Usar ahora",
    disabled: false,
    href: "#roi",
  },
  {
    icon: Store,
    title: "Gestionar mi local",
    description: "Herramientas para organizar agenda, inventario y clientes de tu barbería.",
    cta: "Próximamente",
    disabled: true,
    hidden: true,
  },
];

const ProBarberTools = () => (
  <section className="bg-accent/50 py-16 md:py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Herramientas ProBarber
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
            <Card className="h-full flex flex-col p-5 border-border hover:border-secondary/30 hover:shadow-card-hover transition-all duration-200">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {tool.description}
              </p>
              {tool.disabled ? (
                <Button variant="outline" size="sm" disabled className="w-full">
                  {tool.cta}
                </Button>
              ) : (
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <a href={tool.href}>{tool.cta}</a>
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProBarberTools;
