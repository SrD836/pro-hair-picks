import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { FooterBlogPreview } from "@/components/FooterBlogPreview";
import { CoursesPreviewSection } from "@/components/CoursesPreview";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden">
      <FooterBlogPreview />
      <CoursesPreviewSection />

      {/* ── Mega Footer ── */}
      <div style={{ background: "linear-gradient(180deg, #1a1410 0%, #0f0c08 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-14">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center mb-10 text-center">
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
                <li><Link to="/asesor-color" className="hover:text-[#F5F0E8] transition-colors">Asesor de Color</Link></li>
                <li><Link to="/inci-check" className="hover:text-[#F5F0E8] transition-colors">Compatibilidad Química</Link></li>
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
                <li><Link to="/politica-ia" className="hover:text-[#F5F0E8] transition-colors">{t("footer.aiPolicy")}</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 pt-6">
            <p className="text-[#F5F0E8]/30 text-xs text-center">{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
