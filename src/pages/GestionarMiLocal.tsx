import { Link } from "react-router-dom";
import { ChevronRight, Star, Check, X, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Software {
  position: number;
  name: string;
  description: string;
  price: string;
  pros: string[];
  cons: string[];
  url: string;
  badge?: string;
  rating: number;
}

const softwares: Software[] = [
  {
    position: 1,
    name: "Cizura",
    description: "Software de gestión integral para barberías y peluquerías en España. Agenda, facturación con VeriFactu, TPV, gestión de clientes y marketing automatizado.",
    price: "Desde 29€/mes (prueba gratis 30 días)",
    pros: [
      "Compatible con VeriFactu (obligatorio en España 2026)",
      "TPV integrado con datáfono",
      "Agenda online con recordatorios automáticos",
      "Marketing por WhatsApp y SMS incluido",
      "Soporte en español 24/7",
    ],
    cons: [
      "Menos conocido internacionalmente",
      "Sin marketplace de clientes propio",
    ],
    url: "https://cizura.com",
    badge: "🇪🇸 Mejor para España",
    rating: 4.8,
  },
  {
    position: 2,
    name: "Treatwell",
    description: "Plataforma europea de reservas con marketplace integrado. Ideal para atraer nuevos clientes a través de su red de usuarios.",
    price: "Comisión por reserva (variable) + suscripción desde 49€/mes",
    pros: [
      "Marketplace con millones de usuarios",
      "Widget de reservas para tu web",
      "App para clientes muy conocida en España",
    ],
    cons: [
      "Comisión por cada reserva del marketplace",
      "TPV y facturación limitados",
      "No cumple VeriFactu nativo",
    ],
    url: "https://treatwell.es",
    rating: 4.3,
  },
  {
    position: 3,
    name: "Booksy",
    description: "App de reservas popular en barberías con buena presencia en redes sociales. Fuerte en la comunidad barber.",
    price: "Desde 39€/mes",
    pros: [
      "App muy popular entre barberías",
      "Buena integración con Instagram",
      "Gestión de reseñas integrada",
    ],
    cons: [
      "Facturación española limitada",
      "No compatible con VeriFactu",
      "Soporte en español mejorable",
    ],
    url: "https://booksy.com",
    rating: 4.2,
  },
  {
    position: 4,
    name: "Fresha",
    description: "Software gratuito de gestión con funcionalidades premium opcionales. Sin cuota mensual base, cobra por procesamiento de pagos.",
    price: "Gratis (comisión 2.19% + 0.20€ por pago online)",
    pros: [
      "Sin cuota mensual base",
      "Agenda y gestión de clientes gratis",
      "Disponible en muchos países",
    ],
    cons: [
      "Comisión en cada pago online",
      "Facturación española no adaptada",
      "No cumple VeriFactu",
      "Soporte en inglés principalmente",
    ],
    url: "https://fresha.com",
    rating: 4.1,
  },
  {
    position: 5,
    name: "Acuity Scheduling",
    description: "Herramienta de programación de citas de Squarespace. Potente para gestión de agenda pero requiere integraciones adicionales para gestión completa.",
    price: "Desde 16$/mes (~15€)",
    pros: [
      "Muy personalizable",
      "Integración con Zoom y Google Meet",
      "Flujos de reserva avanzados",
    ],
    cons: [
      "No es específico para peluquerías",
      "Sin TPV ni facturación",
      "No cumple VeriFactu",
      "Sin gestión de inventario",
    ],
    url: "https://acuityscheduling.com",
    rating: 3.9,
  },
];

const GestionarMiLocal = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    {/* Breadcrumbs */}
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">Gestionar mi local</span>
    </nav>

    {/* Header */}
    <header className="mb-10">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
        5 Mejores Software de Gestión para Peluquerías y Barberías
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Comparativa actualizada de las mejores herramientas para gestionar tu salón: agenda, facturación, clientes y marketing.
      </p>
      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
        <span>📅 Actualizado: febrero 2026</span>
        <span>🇪🇸 Enfoque España</span>
        <span>⚡ VeriFactu obligatorio desde 2026</span>
      </div>
    </header>

    {/* Info banner */}
    <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 mb-8">
      <p className="text-sm text-foreground">
        <strong>⚠️ Importante:</strong> Desde 2026, la normativa VeriFactu obliga a los negocios en España a utilizar software de facturación certificado. 
        Asegúrate de que tu herramienta de gestión cumple con esta normativa.
      </p>
    </div>

    {/* Software list */}
    <div className="space-y-6">
      {softwares.map((sw, i) => (
        <motion.div
          key={sw.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
        >
          <Card className={`overflow-hidden border-border ${i === 0 ? "ring-2 ring-secondary/50" : ""}`}>
            {/* Header */}
            <div className="flex items-start gap-4 p-5 pb-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-lg shrink-0">
                {sw.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-xl font-bold text-foreground">{sw.name}</h2>
                  {sw.badge && (
                    <Badge className="bg-secondary text-secondary-foreground text-xs">
                      {sw.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{sw.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="font-bold text-foreground text-sm">{sw.rating}</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5">
              <p className="text-sm font-medium text-foreground mb-3">
                💰 {sw.price}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ventajas</p>
                  <ul className="space-y-1.5">
                    {sw.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-badge-top shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Desventajas</p>
                  <ul className="space-y-1.5">
                    {sw.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Button asChild variant={i === 0 ? "secondary" : "outline"} size="sm">
                  <a href={sw.url} target="_blank" rel="noopener noreferrer">
                    {i === 0 ? "Probar gratis 30 días" : "Visitar web"}
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default GestionarMiLocal;
