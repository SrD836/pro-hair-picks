import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import { menCategories, womenCategories } from "@/data/categories";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💈</span>
            <span className="font-display text-xl font-bold text-foreground">
              ProBarber<span className="text-primary">.es</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavDropdown
              label="Hombre"
              items={menCategories}
              gender="hombre"
              isOpen={openDropdown === "hombre"}
              onToggle={() => setOpenDropdown(openDropdown === "hombre" ? null : "hombre")}
              onClose={() => setOpenDropdown(null)}
            />
            <NavDropdown
              label="Mujer"
              items={womenCategories}
              gender="mujer"
              isOpen={openDropdown === "mujer"}
              onToggle={() => setOpenDropdown(openDropdown === "mujer" ? null : "mujer")}
              onClose={() => setOpenDropdown(null)}
            />
            <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
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
            <div className="p-4 space-y-4">
              <MobileSection label="Hombre" items={menCategories} gender="hombre" onClose={() => setMobileOpen(false)} />
              <MobileSection label="Mujer" items={womenCategories} gender="mujer" onClose={() => setMobileOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

function NavDropdown({
  label,
  items,
  gender,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: { name: string; slug: string; icon: string }[];
  gender: string;
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
            className="absolute top-full left-0 w-72 bg-card rounded-lg shadow-card-hover border border-border p-2 max-h-96 overflow-y-auto"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                to={`/${gender}/${item.slug}`}
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

function MobileSection({
  label,
  items,
  gender,
  onClose,
}: {
  label: string;
  items: { name: string; slug: string; icon: string }[];
  gender: string;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 6);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-1">
        {shown.map((item) => (
          <Link
            key={item.slug}
            to={`/${gender}/${item.slug}`}
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-foreground hover:bg-accent transition-colors"
          >
            <span>{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
      {items.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-sm text-primary font-medium"
        >
          {expanded ? "Ver menos" : `Ver las ${items.length} categorías`}
        </button>
      )}
    </div>
  );
}

export default Navbar;
