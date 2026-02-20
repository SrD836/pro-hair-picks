import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💈</span>
            <span className="font-display text-lg font-bold text-foreground">
              GuiaDelSalon<span className="text-secondary">.com</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Seleccionado por profesionales. Probado en salones reales.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Hombre</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/categorias/clippers" className="hover:text-foreground transition-colors">Clippers</Link></li>
            <li><Link to="/categorias/trimmers" className="hover:text-foreground transition-colors">Trimmers</Link></li>
            <li><Link to="/categorias/tijeras-profesionales" className="hover:text-foreground transition-colors">Tijeras</Link></li>
            <li><Link to="/categorias/productos-para-la-barba" className="hover:text-foreground transition-colors">Barba</Link></li>
            <li><Link to="/categorias/sillones-de-barbero-hidraulico" className="hover:text-foreground transition-colors">Sillones</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Mujer</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/categorias/secadores-profesionales" className="hover:text-foreground transition-colors">Secadores</Link></li>
            <li><Link to="/categorias/planchas-de-pelo" className="hover:text-foreground transition-colors">Planchas</Link></li>
            <li><Link to="/categorias/tintes" className="hover:text-foreground transition-colors">Tintes</Link></li>
            <li><Link to="/categorias/tratamientos-capilares-profundos" className="hover:text-foreground transition-colors">Tratamientos</Link></li>
            <li><Link to="/categorias/herramientas-ondas-y-rizos" className="hover:text-foreground transition-colors">Rizos y ondas</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Mixto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/categorias/capas-y-delantales" className="hover:text-foreground transition-colors">Capas y delantales</Link></li>
            <li><Link to="/categorias/maniquies-de-practica" className="hover:text-foreground transition-colors">Maniquíes</Link></li>
            <li><Link to="/categorias/productos-para-el-cabello" className="hover:text-foreground transition-colors">Productos cabello</Link></li>
            <li><Link to="/categorias/vaporizadores-faciales" className="hover:text-foreground transition-colors">Vaporizadores</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Empresa</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/sobre-nosotros" className="hover:text-foreground transition-colors">Sobre Nosotros</Link></li>
            <li><Link to="/contacto" className="hover:text-foreground transition-colors">Contacto</Link></li>
            <li><Link to="/gestionar-mi-local" className="hover:text-foreground transition-colors">Gestionar mi local</Link></li>
            <li><Link to="/politica-privacidad" className="hover:text-foreground transition-colors">Privacidad</Link></li>
            <li><Link to="/politica-cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
            <li><Link to="/terminos" className="hover:text-foreground transition-colors">Términos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
        <p>© 2025 GuiaDelSalon.com — Como asociado de Amazon, ganamos con las compras que cumplan los requisitos.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
