import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden">
      {/* ── Pre-footer CTA zone ── */}
      <section className="relative py-20 md:py-28 px-4">
        {/* Background image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/images/hero-barbershop.webp" type="image/webp" />
            <img
              src="/images/hero-barbershop.jpg"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-[#2D2218]/90 backdrop-blur-sm" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2
            className="font-display font-bold mb-4"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", color: "#F5F0E8" }}
          >
            {t("footer.ctaTitle") || "¿Listo para elevar tu salón?"}
          </h2>
          <p className="text-[#F5F0E8]/50 text-sm md:text-base mb-8 max-w-md mx-auto">
            {t("footer.ctaSubtitle") || "Explora herramientas, productos y recursos pensados para profesionales como tú."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
              style={{ background: "#C4A97D", color: "#2D2218" }}
            >
              {t("footer.ctaButton") || "Explorar Catálogo"} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/diagnostico-capilar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium border border-[#F5F0E8]/15 text-[#F5F0E8]/80 hover:text-[#F5F0E8] hover:border-[#F5F0E8]/30 hover:bg-white/5 transition-all"
            >
              🔬 {t("bento.diagnosticoTitle") || "Diagnóstico Capilar"}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Mega Footer ── */}
      <div style={{ background: "linear-gradient(180deg, #1a1410 0%, #0f0c08 100%)" }}>
        <div className="container mx-auto px-4 py-14">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link to="/">
              <picture>
                <source srcSet="/logo-compact-80.webp 1x, /logo-compact-160.webp 2x" type="image/webp" />
                <img
                  src="/logo-compact-80.webp"
                  alt="Guía del Salón"
                  width={60}
                  height={60}
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-auto brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                />
              </picture>
            </Link>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-display font-semibold text-[#C4A97D] text-sm mb-4">{t("footer.men")}</h4>
              <ul className="space-y-2.5 text-sm text-[#F5F0E8]/40">
                <li><Link to="/categorias/clippers" className="hover:text-[#F5F0E8] transition-colors">Clippers</Link></li>
                <li><Link to="/categorias/trimmers" className="hover:text-[#F5F0E8] transition-colors">Trimmers</Link></li>
                <li><Link to="/categorias/tijeras-profesionales" className="hover:text-[#F5F0E8] transition-colors">Tijeras</Link></li>
                <li><Link to="/categorias/productos-para-la-barba" className="hover:text-[#F5F0E8] transition-colors">Barba</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-[#C4A97D] text-sm mb-4">{t("footer.women")}</h4>
              <ul className="space-y-2.5 text-sm text-[#F5F0E8]/40">
                <li><Link to="/categorias/secadores-profesionales" className="hover:text-[#F5F0E8] transition-colors">Secadores</Link></li>
                <li><Link to="/categorias/planchas-de-pelo" className="hover:text-[#F5F0E8] transition-colors">Planchas</Link></li>
                <li><Link to="/categorias/tintes" className="hover:text-[#F5F0E8] transition-colors">Tintes</Link></li>
                <li><Link to="/categorias/tratamientos-capilares-profundos" className="hover:text-[#F5F0E8] transition-colors">Tratamientos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-[#C4A97D] text-sm mb-4">{t("footer.tools") || "Herramientas"}</h4>
              <ul className="space-y-2.5 text-sm text-[#F5F0E8]/40">
                <li><Link to="/diagnostico-capilar" className="hover:text-[#F5F0E8] transition-colors">Diagnóstico Capilar</Link></li>
                <li><a href="https://guiadelsalon.com/asesor-color" className="hover:text-[#F5F0E8] transition-colors">Asesor de Color</a></li>
                <li><Link to="/inci-check" className="hover:text-[#F5F0E8] transition-colors">INCI Check</Link></li>
                <li><Link to="/calculadora-roi" className="hover:text-[#F5F0E8] transition-colors">Calculadora ROI</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-[#C4A97D] text-sm mb-4">{t("footer.company")}</h4>
              <ul className="space-y-2.5 text-sm text-[#F5F0E8]/40">
                <li><Link to="/sobre-nosotros" className="hover:text-[#F5F0E8] transition-colors">{t("footer.aboutUs")}</Link></li>
                <li><Link to="/blog" className="hover:text-[#F5F0E8] transition-colors">Blog</Link></li>
                <li><Link to="/contacto" className="hover:text-[#F5F0E8] transition-colors">{t("footer.contact")}</Link></li>
                <li><Link to="/politica-privacidad" className="hover:text-[#F5F0E8] transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link to="/terminos" className="hover:text-[#F5F0E8] transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 mt-12 pt-6 text-center text-xs text-[#F5F0E8]/25">
            <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
