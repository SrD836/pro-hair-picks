import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Search, Menu, X, Scissors, LogOut, User } from "lucide-react";
import { menGroups, womenGroups, mixedCategories, type CategoryGroup, type CategoryItem } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";

/* ── Desktop: Grouped dropdown (Hombre / Mujer) ─────────────────────────── */
function GroupedDropdown({ label, groups, isOpen, onToggle, onClose }: {
  label: string;
  groups: CategoryGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen ? "bg-[#C4A97D]/15 text-[#C4A97D]" : "text-foreground/80 hover:text-foreground hover:bg-white/5"
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
            className="absolute top-full left-0 pt-2 w-72 z-[70]"
          >
            <div className="bg-[#2D2218] border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="p-3 space-y-3">
                {groups.map((group) => (
                  <div key={group.sectionKey}>
                    <p className="text-[10px] font-bold text-[#C4A97D]/60 uppercase tracking-[0.15em] px-2 mb-1.5">
                      {t(`catSection.${group.sectionKey}`)}
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
                          <span className="truncate text-xs">{t(`cat.${item.slug}`)}</span>
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
  const { t } = useLanguage();
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen ? "bg-[#C4A97D]/15 text-[#C4A97D]" : "text-foreground/80 hover:text-foreground hover:bg-white/5"
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
            className="absolute top-full left-0 pt-2 w-64 z-[70]"
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
                    <span className="truncate text-xs">{t(`cat.${item.slug}`)}</span>
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
  const { t, lang } = useLanguage();

  const tools: Array<{ label: string; to?: string; href?: string; badge?: string }> = [
    { label: `✨ ${t("nav.fullDiagnosticLabel")}`, to: "/mi-pelo/diagnostico-completo", badge: t("nav.newBadge") },
    { label: `🎨 ${t("nav.colorAdvisorLabel")}`, href: "https://guiadelsalon.com/asesor-color" },
    { label: `🔬 ${t("nav.diagnosticLabel")}`, to: "/diagnostico-capilar" },
    { label: `🧪 ${t("nav.compatibilityLabel")}`, to: "/inci-check" },
    { label: `🌿 ${t("nav.recoveryLabel")}`, to: "/recuperacion-capilar" },
    { label: `🦳 ${t("nav.canicieLabel")}`, to: "/analizador-canicie" },
    { label: `💈 ${t("nav.alopeciaLabel")}`, to: "/analizador-alopecia" },
    { label: "separator" },
    { label: `👤 ${t("nav.myAccountLabel")}`, to: "/mi-pelo/mis-resultados" },
  ];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isOpen ? "bg-[#C4A97D]/15 text-[#C4A97D]" : "text-foreground/80 hover:text-foreground hover:bg-white/5"
        }`}
      >
        {t("nav.myHair")}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 pt-2 w-56 z-[70]"
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
  const { t } = useLanguage();

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
            <div key={group.sectionKey} className="mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {t(`catSection.${group.sectionKey}`)}
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
                    <span className="truncate text-xs">{t(`cat.${item.slug}`)}</span>
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
  const { t } = useLanguage();

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
              <span className="truncate text-xs">{t(`cat.${item.slug}`)}</span>
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = useCallback((key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  }, []);

  const close = useCallback(() => setOpenDropdown(null), []);

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
        scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.3)]" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
          {/* Logo */}
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
              onToggle={() => toggle("hombre")}
              onClose={close}
            />
            <GroupedDropdown
              label={t("nav.women")}
              groups={womenGroups}
              isOpen={openDropdown === "mujer"}
              onToggle={() => toggle("mujer")}
              onClose={close}
            />
            <FlatDropdown
              label={t("nav.mixed")}
              items={mixedCategories}
              isOpen={openDropdown === "mixto"}
              onToggle={() => toggle("mixto")}
              onClose={close}
            />
            <Link
              to="/blog"
              className="px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              {t("nav.blog")}
            </Link>
            <HairToolsDropdown
              isOpen={openDropdown === "tools"}
              onToggle={() => toggle("tools")}
              onClose={close}
            />
            <Link
              to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              <Scissors className="w-3.5 h-3.5" />
              {t("nav.courses")}
            </Link>
          </div>

          {/* Right: Auth + Lang + Search + Hamburger */}
          <div className="flex items-center gap-1.5">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown((prev) => prev === "user" ? null : "user")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/8 transition-colors"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#C4A97D] text-[#2D2218] text-xs font-bold uppercase">
                      {user.email?.[0] ?? <User className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openDropdown === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full right-0 pt-2 w-52 z-[70]"
                      >
                        <div className="bg-[#2D2218] border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                          <div className="p-3">
                            <p className="text-xs text-white/40 px-2 py-1 truncate">{user.email}</p>
                            <div className="my-1 border-t border-white/8" />
                            <Link
                              to="/mi-pelo/mis-resultados"
                              onClick={close}
                              className="flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Mis diagnósticos
                            </Link>
                            <button
                              onClick={() => { supabase.auth.signOut(); setOpenDropdown(null); }}
                              className="w-full flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Cerrar sesión
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#C4A97D] text-[#2D2218] hover:bg-[#C4A97D]/90 transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
            </div>

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

              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2.5 text-sm font-semibold text-foreground hover:text-[#C4A97D] transition-colors"
              >
                {t("nav.blog")}
              </Link>

              <div className="border-t border-border/40 pt-3">
                <p className="text-[10px] font-bold text-[#C4A97D]/60 uppercase tracking-[0.15em] px-2 mb-2">
                  {t("nav.toolsSectionLabel")}
                </p>
                <div className="space-y-0.5">
                  {[
                    { label: `✨ ${t("nav.fullDiagnosticLabel")}`, to: "/mi-pelo/diagnostico-completo" },
                    { label: `🎨 ${t("nav.colorAdvisorLabel")}`, to: lang === "es" ? "/asesor-color" : "/color-match" },
                    { label: `🔬 ${t("nav.diagnosticLabel")}`, to: "/diagnostico-capilar" },
                    { label: `🧪 ${t("nav.compatibilityLabel")}`, to: "/inci-check" },
                    { label: `🌿 ${t("nav.recoveryLabel")}`, to: "/recuperacion-capilar" },
                    { label: `🦳 ${t("nav.canicieLabel")}`, to: "/analizador-canicie" },
                    { label: `💈 ${t("nav.alopeciaLabel")}`, to: "/analizador-alopecia" },
                    { label: `👤 ${t("nav.myAccountLabel")}`, to: "/mi-pelo/mis-resultados" },
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

              <Link
                to={lang === "es" ? "/cursos-peluqueria" : "/hairdressing-courses"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-foreground hover:text-[#C4A97D] transition-colors"
              >
                <Scissors className="w-4 h-4" />
                {t("nav.courses")}
              </Link>

              {/* Mobile auth */}
              <div className="border-t border-border/40 pt-3">
                {user ? (
                  <div className="space-y-1">
                    <p className="text-xs text-white/40 px-2 py-1 truncate">{user.email}</p>
                    <Link
                      to="/mi-pelo/mis-resultados"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mis diagnósticos
                    </Link>
                    <button
                      onClick={() => { supabase.auth.signOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); setAuthModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-sm font-medium bg-[#C4A97D] text-[#2D2218] hover:bg-[#C4A97D]/90 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
