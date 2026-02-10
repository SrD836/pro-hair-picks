import { Link } from "react-router-dom";
import { Mail, Target, Shield, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const SobreNosotros = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <nav className="text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Sobre Nosotros
    </nav>

    <h1 className="font-display text-3xl font-bold text-foreground mb-6">Sobre Nosotros</h1>

    <div className="space-y-8 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Nuestra misión
        </h2>
        <p>En <strong>ProBarber.es</strong> nuestra misión es ayudar a profesionales de la peluquería y barbería a tomar las mejores decisiones de compra. Analizamos, comparamos y clasificamos los productos más relevantes del mercado para que puedas invertir con confianza en las herramientas que harán crecer tu negocio.</p>
        <p className="mt-2">Sabemos que elegir el equipo adecuado puede marcar la diferencia entre un buen corte y un corte excepcional. Por eso, dedicamos horas de investigación a cada categoría de productos.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Nuestro compromiso
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4 border-border">
            <h3 className="font-bold text-foreground mb-1">✍️ Contenido original</h3>
            <p className="text-sm text-muted-foreground">Todas nuestras comparativas y análisis son creados por nuestro equipo. No copiamos contenido de otros sitios.</p>
          </Card>
          <Card className="p-4 border-border">
            <h3 className="font-bold text-foreground mb-1">⚖️ Reviews honestas</h3>
            <p className="text-sm text-muted-foreground">Nuestras recomendaciones se basan en características técnicas reales, opiniones verificadas y análisis objetivos.</p>
          </Card>
          <Card className="p-4 border-border">
            <h3 className="font-bold text-foreground mb-1">💰 Precios actualizados</h3>
            <p className="text-sm text-muted-foreground">Verificamos los precios diariamente para ofrecerte siempre la información más actualizada del mercado.</p>
          </Card>
          <Card className="p-4 border-border">
            <h3 className="font-bold text-foreground mb-1">🔒 Transparencia total</h3>
            <p className="text-sm text-muted-foreground">Utilizamos enlaces de afiliados de Amazon. Esto no afecta a nuestras recomendaciones ni al precio que pagas.</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" /> Quién está detrás
        </h2>
        <p>ProBarber.es está gestionado por <strong>David [Apellido]</strong>, apasionado del sector de la peluquería profesional y el marketing digital. Nuestro objetivo es convertirnos en la referencia en España para comparativas de productos de peluquería y barbería.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Contacto
        </h2>
        <p>¿Tienes alguna pregunta, sugerencia o propuesta de colaboración? Nos encantaría saber de ti.</p>
        <ul className="mt-2 space-y-1">
          <li>📧 Email: <a href="mailto:contacto@probarber.es" className="text-primary hover:underline">contacto@probarber.es</a></li>
          <li>📬 También puedes usar nuestro <Link to="/contacto" className="text-primary hover:underline">formulario de contacto</Link></li>
        </ul>
      </section>
    </div>
  </div>
);

export default SobreNosotros;
