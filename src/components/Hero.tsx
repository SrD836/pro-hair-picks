import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
      
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Encuentra los Mejores Productos Profesionales para{" "}
            <span className="text-secondary">Peluquería</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Rankings actualizados, comparativas detalladas y los mejores precios verificados diariamente en Amazon y AliExpress.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="flex bg-card rounded-xl shadow-hero overflow-hidden">
              <div className="flex-1 flex items-center px-5">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar productos, marcas o categorías..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-3 py-4 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                />
              </div>
              <button className="px-6 py-4 bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity text-sm">
                Buscar
              </button>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-primary-foreground/70 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              +2.000 productos analizados
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Precios actualizados diariamente
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              49 categorías profesionales
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
