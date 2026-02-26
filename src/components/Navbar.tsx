import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, Menu, X, Scissors, Sparkles } from "lucide-react";
import { menGroups, womenGroups, mixedCategories, type CategoryGroup, type CategoryItem } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <picture>
              <source srcSet="/logo-compact-40.webp 40w, /logo-compact-80.webp 80w" type="image/webp" sizes="40px" />
              <img
                src="/logo-compact-40.webp"
                alt="Guía del Salón"
                width={40}
                height={40}
                className={`w-auto brightness-0 invert transition-all duration-300 group-hover:rotate-[5deg] ${scrolled ? "h-7" : "h-10"}`}
              />
            </picture>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <GroupedDropdown label={t("nav.men")} groups={menGroups} isOpen={openDropdown === "hombre"} onToggle={() => setOpenDropdown(openDropdown === "hombre" ? null : "hombre")} onClose={() => setOpenDropdown(null)} />
            <GroupedDropdown label={t("nav.women")} groups={womenGroups} isOpen={openDropdown === "mujer"} onToggle={() => setOpenDropdown(openDropdown === "mujer" ? null : "mujer")} onClose={() => setOpenDropdown(null)} />
            <FlatDropdown label={t("nav.mixed")} items={mixedCategories} isOpen={openDropdown === "mixto"} onToggle={() => setOpenDropdown(openDropdown === "mixto" ? null : "mixto")} onClose={() => setOpenDropdown(null)} />
            <Link to="/blog" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
              {t("nav.blog")}
            </Link>
            <Link to="/calculadora-precio" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
              {t("nav.priceCalculator")}
            </Link>
            <HairToolsDropdown
              isOpen={openDropdown === "mipelo"}
              onToggle={() => setOpenDropdown(openDropdown === "mipelo" ? null : "mipelo")}
              onClose={() => setOpenDropdown(null)}
            />
            <Link to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
              <Scissors className="w-3.5 h-3.5" />
              {t("nav.courses")}
            </Link>
            <Link to="/gestionar-mi-local" className="hidden px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.manageMyShop")}
            </Link>
          </div>

          {/* Search + Mobile toggle */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link to="/" aria-label="Ir a la página de inicio" className="p-2 rounded-lg hover:bg-muted transition-colors md:block">
              <Search className="w-5 h-5 text-muted-foreground" />
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={mobileOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border bg-background">
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <MobileGroupedSection label={t("nav.men")} groups={menGroups} onClose={() => setMobileOpen(false)} />
              <MobileGroupedSection label={t("nav.women")} groups={womenGroups} onClose={() => setMobileOpen(false)} />
              <MobileFlatSection label={t("nav.mixed")} items={mixedCategories} onClose={() => setMobileOpen(false)} />
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="block px-2 py-2 font-display font-semibold text-foreground hover:text-secondary transition-colors">
                {t("nav.blog")}
              </Link>
              <Link to="/calculadora-precio" onClick={() => setMobileOpen(false)} className="block px-2 py-2 font-display font-semibold text-foreground hover:text-secondary transition-colors">
                {t("nav.priceCalculator")}
              </Link>
              <MobileHairToolsSection onClose={() => setMobileOpen(false)} />
              <Link to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-2 font-display font-semibold text-foreground hover:text-secondary transition-colors">
                <Scissors className="w-4 h-4" />
                {t("nav.courses")}
              </Link>
              <Link to="/gestionar-mi-local" onClick={() => setMobileOpen(false)} className="hidden px-2 py-2 font-display font-semibold text-foreground">
                {t("nav.manageMyShop")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ── Desktop: Mi Pelo dropdown ─── */
function HairToolsDropdown({ isOpen, onToggle, onClose }: { isOpen: boolean; onToggle: () => void; onClose: () => void }) {
  const { t } = useLanguage();
  const tools = [
    { emoji: "🎨", to: "/asesor-color",          label: t("nav.colorAdvisorLabel"),   desc: t("nav.colorAdvisorDesc") },
    { emoji: "🔬", to: "/diagnostico-capilar",   label: t("nav.diagnosticLabel"),     desc: t("nav.diagnosticDesc") },
    { emoji: "⚗️", to: "/compatibilidad-quimica", label: t("nav.compatibilityLabel"), desc: t("nav.compatibilityDesc") },
  ];
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onClose}>
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-secondary-foreground bg-secondary hover:bg-secondary/90 rounded-md transition-colors">
        <Sparkles className="w-3.5 h-3.5" />
        {t("nav.myHair")}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 w-72 bg-card rounded-xl shadow-card-hover border border-border p-2 mt-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-1 pb-2">
              {t("nav.myHairSub")}
            </p>
            {tools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                onClick={onClose}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <span className="text-xl mt-0.5">{tool.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-secondary transition-colors">
                    {tool.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile: Mi Pelo section ─── */
function MobileHairToolsSection({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const tools = [
    { emoji: "🎨", to: "/asesor-color",          label: t("nav.colorAdvisorLabel") },
    { emoji: "🔬", to: "/diagnostico-capilar",   label: t("nav.diagnosticLabel") },
    { emoji: "⚗️", to: "/compatibilidad-quimica", label: t("nav.compatibilityLabel") },
  ];
  return (
    <div>
      <h3 className="font-display font-semibold text-secondary flex items-center gap-1.5 mb-2">
        <Sparkles className="w-4 h-4" />
        {t("nav.myHair")}
      </h3>
      <div className="space-y-1 pl-1">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-2 rounded text-sm font-medium text-foreground hover:bg-accent hover:text-secondary transition-colors"
          >
            <span>{tool.emoji}</span>
            {tool.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Desktop: Grouped dropdown (Hombre / Mujer) ─── */
function GroupedDropdown({ label, groups, isOpen, onToggle, onClose }: { label: string; groups: CategoryGroup[]; isOpen: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onClose}>
      <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 w-80 bg-card rounded-lg shadow-card-hover border border-border p-3 max-h-[70vh] overflow-y-auto">
            {groups.map((group) => (
              <div key={group.section} className="mb-3 last:mb-0">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.section}</h4>
                {group.items.map((item) => (
                  <Link key={item.slug} to={`/categorias/${item.slug}`} onClick={onClose} className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Desktop: Flat dropdown (Mixto) ─── */
function FlatDropdown({ label, items, isOpen, onToggle, onClose }: { label: string; items: CategoryItem[]; isOpen: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onClose}>
      <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 w-72 bg-card rounded-lg shadow-card-hover border border-border p-2">
            {items.map((item) => (
              <Link key={item.slug} to={`/categorias/${item.slug}`} onClick={onClose} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent transition-colors">
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile: Grouped section ─── */
function MobileGroupedSection({ label, groups, onClose }: { label: string; groups: CategoryGroup[]; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const allItems = groups.flatMap((g) => g.items);
  const preview = allItems.slice(0, 6);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">{label}</h3>
      {expanded ? (
        groups.map((group) => (
          <div key={group.section} className="mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.section}</p>
            <div className="grid grid-cols-2 gap-1">
              {group.items.map((item) => (
                <Link key={item.slug} to={`/categorias/${item.slug}`} onClick={onClose} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {preview.map((item) => (
            <Link key={item.slug} to={`/categorias/${item.slug}`} onClick={onClose} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors">
              <span>{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      )}
      {allItems.length > 6 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-1 text-sm text-secondary font-medium">
          {expanded ? "Ver menos" : `Ver las ${allItems.length} categorías`}
        </button>
      )}
    </div>
  );
}

/* ── Mobile: Flat section (Mixto) ─── */
function MobileFlatSection({ label, items, onClose }: { label: string; items: CategoryItem[]; onClose: () => void }) {
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => (
          <Link key={item.slug} to={`/categorias/${item.slug}`} onClick={onClose} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors">
            <span>{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
