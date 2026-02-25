import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[hsl(26,33%,5%)] border-t border-secondary/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8 pt-10">
          <Link to="/">
            <picture>
              <source srcSet="/logo-compact-80.webp 1x, /logo-compact-160.webp 2x" type="image/webp" />
              <img
                src="/logo-compact-80.webp"
                alt="Guía del Salón"
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-20 w-auto brightness-0 invert opacity-90"
              />
            </picture>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer.men")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categorias/clippers" className="hover:text-foreground transition-colors">Clippers</Link></li>
              <li><Link to="/categorias/trimmers" className="hover:text-foreground transition-colors">Trimmers</Link></li>
              <li><Link to="/categorias/tijeras-profesionales" className="hover:text-foreground transition-colors">Tijeras</Link></li>
              <li><Link to="/categorias/productos-para-la-barba" className="hover:text-foreground transition-colors">Barba</Link></li>
              <li><Link to="/categorias/sillones-de-barbero-hidraulico" className="hover:text-foreground transition-colors">Sillones</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer.women")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categorias/secadores-profesionales" className="hover:text-foreground transition-colors">Secadores</Link></li>
              <li><Link to="/categorias/planchas-de-pelo" className="hover:text-foreground transition-colors">Planchas</Link></li>
              <li><Link to="/categorias/tintes" className="hover:text-foreground transition-colors">Tintes</Link></li>
              <li><Link to="/categorias/tratamientos-capilares-profundos" className="hover:text-foreground transition-colors">Tratamientos</Link></li>
              <li><Link to="/categorias/herramientas-ondas-y-rizos" className="hover:text-foreground transition-colors">Rizos y ondas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer.mixed")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/categorias/capas-y-delantales" className="hover:text-foreground transition-colors">Capas y delantales</Link></li>
              <li><Link to="/categorias/maniquies-de-practica" className="hover:text-foreground transition-colors">Maniquíes</Link></li>
              <li><Link to="/categorias/productos-para-el-cabello" className="hover:text-foreground transition-colors">Productos cabello</Link></li>
              <li><Link to="/categorias/vaporizadores-faciales" className="hover:text-foreground transition-colors">Vaporizadores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/sobre-nosotros" className="hover:text-foreground transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/contacto" className="hover:text-foreground transition-colors">{t("footer.contact")}</Link></li>
              <li><Link to="/asesor-color" className="hover:text-secondary transition-colors font-medium">🎨 {t("colorMatch.navLabel")}</Link></li>
              <li className="hidden"><Link to="/gestionar-mi-local" className="hover:text-foreground transition-colors">{t("nav.manageMyShop")}</Link></li>
              <li><Link to="/politica-privacidad" className="hover:text-foreground transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/politica-cookies" className="hover:text-foreground transition-colors">{t("footer.cookies")}</Link></li>
              <li><Link to="/terminos" className="hover:text-foreground transition-colors">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary/20 mt-10 pt-6 text-center text-xs text-muted-foreground">
          <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
