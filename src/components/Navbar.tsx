import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, Menu, X, Scissors } from "lucide-react";
import { menGroups, womenGroups, mixedCategories, type CategoryGroup, type CategoryItem } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

// ── Design tokens (2026 system) ──────────────────────────────────────────────
// bg: #2D2218 (espresso) | accent: #C4A97D (gold) | surface: #F5F0E8 (cream)
// card radius: rounded-2xl (1rem) | pill radius: rounded-full
// shadow: 0 4px 20px -2px rgba(45,34,24,0.12)

/* ── Desktop: Grouped dropdown (Hombre / Mujer) ─────────────────────────── */
function GroupedDropdown({ label, groups, isOpen, onToggle, onClose }: {
  label: string;
  groups: CategoryGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseLeave={onClose}>
      <button
        onMouseEnter={() => !isOpen && onToggle()}
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen
            ? "bg-[#C4A97D]/15 text-[#C4A97D]"
            : "text-foreground/80 hover:text-foreground hover:bg-white/5"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 pt-2 w-72 z-50"
          >
            <div className="bg-[#2D2218] border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="p-3 space-y-3">
                {groups.map((group) => (
                  <div key={group.section}>
                    <p className="text-[10px] font-bold text-[#C4A97D]/60 uppercase tracking-[0.15em] px-2 mb-1.5">
                      {group.section}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.slug}
                          to={`/categorias/${item.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="truncate text-xs">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Desktop: Flat dropdown (Mixto) ─────────────────────────────────────── */
function FlatDropdown({ label, items, isOpen, onToggle, onClose }: {
  label: string;
  items: CategoryItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseLeave={onClose}>
      <button
        onMouseEnter={() => !isOpen && onToggle()}
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen
            ? "bg-[#C4A97D]/15 text-[#C4A97D]"
            : "text-foreground/80 hover:text-foreground hover:bg-white/5"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 pt-2 w-64 z-50"
          >
            <div className="bg-[#2D2218] border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="p-3 grid grid-cols-2 gap-1">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/categorias/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate text-xs">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Desktop: Hair Tools dropdown ────────────────────────────────────────── */
function HairToolsDropdown({ isOpen, onToggle, onClose }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const tools: Array<{ label: string; to?: string; href?: string; badge?: string }> = [
    { label: "✨ Mi Diagnóstico Completo", to: "/mi-pelo/diagnostico-completo", badge: "NUEVO" },
    { label: "🎨 Asesor de Color", href: "https://guiadelsalon.com/asesor-color" },
    { label: "🔬 Diagnóstico Capilar", to: "/diagnostico-capilar" },
    { label: "🧪 Compatibilidad Química", to: "/inci-check" },
    { label: "🌿 Recuperación Capilar", to: "/recuperacion-capilar" },
    { label: "🦳 Analizador de Canicie", to: "/analizador-canicie" },
    { label: "💈 Analizador de Alopecia", to: "/analizador-alopecia" },
    { label: "separator" },
    { label: "👤 Mi cuenta", to: "/mi-pelo/mis-resultados" },
  ];

  return (
    <div className="relative" onMouseLeave={onClose}>
      <button
        onMouseEnter={() => !isOpen && onToggle()}
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen
            ? "bg-[#C4A97D]/15 text-[#C4A97D]"
            : "text-foreground/80 hover:text-foreground hover:bg-white/5"
        }`}
      >
        Mi pelo
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 pt-2 w-56 z-50"
          >
            <div className="bg-[#2D2218] border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="p-2">
                {tools.map((tool, idx) => {
                  if (tool.label === "separator") {
                    return <div key={idx} className="my-1.5 border-t border-white/8" />;
                  }
                  const cls = "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors";
                  const inner = (
                    <>
                      <span>{tool.label}</span>
                      {tool.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#C4A97D]/20 text-[#C4A97D]">
                          {tool.badge}
                        </span>
                      )}
                    </>
                  );
                  return tool.href ? (
                    <a key={tool.href} href={tool.href} onClick={onClose} className={cls}>{inner}</a>
                  ) : (
                    <Link key={tool.to} to={tool.to!} onClick={onClose} className={cls}>{inner}</Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile: Grouped section (collapsed by default) ─────────────────────── */
function MobileGroupedSection({ label, groups, onClose }: {
  label: string;
  groups: CategoryGroup[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2 py-3 text-sm font-semibold text-[#C4A97D] uppercase tracking-wider"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="pb-3">
          {groups.map((group) => (
            <div key={group.section} className="mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {group.section}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/categorias/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span className="truncate text-xs">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile: Flat section (Mixto, collapsed by default) ──────────────────── */
function MobileFlatSection({ label, items, onClose }: {
  label: string;
  items: CategoryItem[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2 py-3 text-sm font-semibold text-[#C4A97D] uppercase tracking-wider"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="pb-3 grid grid-cols-2 gap-1">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={`/categorias/${item.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors"
            >
              <span>{item.icon}</span>
              <span className="truncate text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────────────────── */
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
        scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.3)]" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
          {/* Logo — LEFT */}
          <Link to="/" className="flex items-center group shrink-0">
            <picture>
              <source srcSet="/logo-compact-40.webp 40w, /logo-compact-80.webp 80w" type="image/webp" sizes="40px" />
              <img
                src="/logo-compact-40.webp"
                alt="Guía del Salón"
                width={40}
                height={40}
                className={`w-auto brightness-0 invert transition-all duration-500 group-hover:brightness-110 group-hover:drop-shadow-[0_0_8px_rgba(196,169,125,0.4)] ${scrolled ? "h-7" : "h-9"}`}
              />
            </picture>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <GroupedDropdown
              label={t("nav.men")}
              groups={menGroups}
              isOpen={openDropdown === "hombre"}
              onToggle={() => setOpenDropdown(openDropdown === "hombre" ? null : "hombre")}
              onClose={() => setOpenDropdown(null)}
            />
            <GroupedDropdown
              label={t("nav.women")}
              groups={womenGroups}
              isOpen={openDropdown === "mujer"}
              onToggle={() => setOpenDropdown(openDropdown === "mujer" ? null : "mujer")}
              onClose={() => setOpenDropdown(null)}
            />
            <FlatDropdown
              label={t("nav.mixed")}
              items={mixedCategories}
              isOpen={openDropdown === "mixto"}
              onToggle={() => setOpenDropdown(openDropdown === "mixto" ? null : "mixto")}
              onClose={() => setOpenDropdown(null)}
            />
            <Link
              to="/blog"
              className="px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              {t("nav.blog")}
            </Link>
            <HairToolsDropdown
              isOpen={openDropdown === "tools"}
              onToggle={() => setOpenDropdown(openDropdown === "tools" ? null : "tools")}
              onClose={() => setOpenDropdown(null)}
            />
            <Link
              to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              <Scissors className="w-3.5 h-3.5" />
              {t("nav.courses")}
            </Link>
          </div>

          {/* Right: Lang + Search + Hamburger */}
          <div className="flex items-center gap-1.5">
            <LanguageSelector />
            <Link
              to="/"
              aria-label="Buscar"
              className="p-2 rounded-full hover:bg-white/8 transition-colors"
            >
              <Search className="w-4.5 h-4.5 text-foreground/70" />
            </Link>
            <button
              className="md:hidden p-2 rounded-full hover:bg-white/8 transition-colors"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border/40 bg-background"
          >
            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <MobileGroupedSection label={t("nav.men")} groups={menGroups} onClose={() => setMobileOpen(false)} />
              <MobileGroupedSection label={t("nav.women")} groups={womenGroups} onClose={() => setMobileOpen(false)} />
              <MobileFlatSection label={t("nav.mixed")} items={mixedCategories} onClose={() => setMobileOpen(false)} />

              {/* Blog */}
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2.5 text-sm font-semibold text-foreground hover:text-[#C4A97D] transition-colors"
              >
                {t("nav.blog")}
              </Link>

              {/* Tools section */}
              <div className="border-t border-border/40 pt-3">
                <p className="text-[10px] font-bold text-[#C4A97D]/60 uppercase tracking-[0.15em] px-2 mb-2">
                  {lang === "es" ? "Herramientas" : "Tools"}
                </p>
                <div className="space-y-0.5">
                  {[
                    {
                      label: lang === "es" ? "✨ Mi Diagnóstico Completo" : "✨ Full Diagnostic",
                      to: "/mi-pelo/diagnostico-completo",
                    },
                    {
                      label: lang === "es" ? "🎨 Asesor de Color" : "🎨 Color Advisor",
                      to: lang === "es" ? "/asesor-color" : "/color-match",
                    },
                    {
                      label: lang === "es" ? "🔬 Diagnóstico Capilar" : "🔬 Hair Diagnostic",
                      to: "/diagnostico-capilar",
                    },
                    {
                      label: lang === "es" ? "🧪 Compatibilidad Química" : "🧪 Chemical Compatibility",
                      to: "/inci-check",
                    },
                    {
                      label: lang === "es" ? "🌿 Recuperación Capilar" : "🌿 Hair Recovery",
                      to: "/recuperacion-capilar",
                    },
                    {
                      label: lang === "es" ? "🦳 Analizador de Canicie" : "🦳 Grey Hair Analyzer",
                      to: "/analizador-canicie",
                    },
                    {
                      label: lang === "es" ? "💈 Analizador de Alopecia" : "💈 Alopecia Analyzer",
                      to: "/analizador-alopecia",
                    },
                    {
                      label: lang === "es" ? "👤 Mi cuenta" : "👤 My account",
                      to: "/mi-pelo/mis-resultados",
                    },
                  ].map((tool) => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Courses */}
              <Link
                to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-foreground hover:text-[#C4A97D] transition-colors"
              >
                <Scissors className="w-4 h-4" />
                {t("nav.courses")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
