import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import { menGroups, womenGroups, mixedCategories, type CategoryGroup, type CategoryItem } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo-compact.png"
              alt="Guía del Salón"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <GroupedDropdown
              label="Hombre"
              groups={menGroups}
              isOpen={openDropdown === "hombre"}
              onToggle={() => setOpenDropdown(openDropdown === "hombre" ? null : "hombre")}
              onClose={() => setOpenDropdown(null)}
            />
            <GroupedDropdown
              label="Mujer"
              groups={womenGroups}
              isOpen={openDropdown === "mujer"}
              onToggle={() => setOpenDropdown(openDropdown === "mujer" ? null : "mujer")}
              onClose={() => setOpenDropdown(null)}
            />
            <FlatDropdown
              label="Mixto"
              items={mixedCategories}
              isOpen={openDropdown === "mixto"}
              onToggle={() => setOpenDropdown(openDropdown === "mixto" ? null : "mixto")}
              onClose={() => setOpenDropdown(null)}
            />
            <Link to="/gestionar-mi-local" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Gestionar mi local
            </Link>
          </div>

          {/* Search + Mobile toggle */}
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </Link>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <MobileGroupedSection label="Hombre" groups={menGroups} onClose={() => setMobileOpen(false)} />
              <MobileGroupedSection label="Mujer" groups={womenGroups} onClose={() => setMobileOpen(false)} />
              <MobileFlatSection label="Mixto" items={mixedCategories} onClose={() => setMobileOpen(false)} />
              <Link to="/gestionar-mi-local" onClick={() => setMobileOpen(false)} className="block px-2 py-2 font-display font-semibold text-foreground">
                Gestionar mi local
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ── Desktop: Grouped dropdown (Hombre / Mujer) ─── */
function GroupedDropdown({
  label,
  groups,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  groups: CategoryGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onClose}>
      <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 w-80 bg-card rounded-lg shadow-card-hover border border-border p-3 max-h-[70vh] overflow-y-auto"
          >
            {groups.map((group) => (
              <div key={group.section} className="mb-3 last:mb-0">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group.section}
                </h4>
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/categorias/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
                  >
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
function FlatDropdown({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: CategoryItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onToggle} onMouseLeave={onClose}>
      <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 w-72 bg-card rounded-lg shadow-card-hover border border-border p-2"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                to={`/categorias/${item.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
              >
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
function MobileGroupedSection({
  label,
  groups,
  onClose,
}: {
  label: string;
  groups: CategoryGroup[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const allItems = groups.flatMap((g) => g.items);
  const preview = allItems.slice(0, 6);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">{label}</h3>
      {expanded ? (
        groups.map((group) => (
          <div key={group.section} className="mb-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              {group.section}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/categorias/${item.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors"
                >
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
            <Link
              key={item.slug}
              to={`/categorias/${item.slug}`}
              onClick={onClose}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors"
            >
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
function MobileFlatSection({
  label,
  items,
  onClose,
}: {
  label: string;
  items: CategoryItem[];
  onClose: () => void;
}) {
  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => (
          <Link
            key={item.slug}
            to={`/categorias/${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors"
          >
            <span>{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Navbar;
