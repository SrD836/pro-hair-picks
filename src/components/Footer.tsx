import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💈</span>
            <span className="font-display text-lg font-bold text-foreground">
              ProBarber<span className="text-primary">.es</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Comparativas y rankings de productos profesionales para peluquería y barbería. Precios actualizados diariamente.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Hombre</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/hombre/clippers-profesionales" className="hover:text-foreground transition-colors">Clippers</Link></li>
            <li><Link to="/hombre/trimmers-perfiladores" className="hover:text-foreground transition-colors">Trimmers</Link></li>
            <li><Link to="/hombre/tijeras-profesionales" className="hover:text-foreground transition-colors">Tijeras</Link></li>
            <li><Link to="/hombre/productos-barba" className="hover:text-foreground transition-colors">Barba</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Mujer</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/mujer/secadores-profesionales" className="hover:text-foreground transition-colors">Secadores</Link></li>
            <li><Link to="/mujer/planchas-pelo" className="hover:text-foreground transition-colors">Planchas</Link></li>
            <li><Link to="/mujer/tintes-coloracion" className="hover:text-foreground transition-colors">Tintes</Link></li>
            <li><Link to="/mujer/extensiones" className="hover:text-foreground transition-colors">Extensiones</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Aviso Legal</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Afiliación Amazon</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
        <p>© 2025 ProBarber.es — Como asociado de Amazon, ganamos con las compras que cumplan los requisitos.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
