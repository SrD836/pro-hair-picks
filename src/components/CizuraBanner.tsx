import { Sparkles } from "lucide-react";

const CizuraBanner = () => (
  <section className="container mx-auto px-4 py-12">
    <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-bold uppercase tracking-wider text-secondary mb-3 flex items-center gap-1.5 justify-center sm:justify-start">
          <Sparkles className="w-4 h-4" /> Recomendado
        </p>
        <p className="text-xl sm:text-2xl font-display font-bold text-primary-foreground leading-snug mb-2">
          Gestiona tu barbería como un empresario.
        </p>
        <p className="text-primary-foreground/60 text-sm">
          Prueba <span className="text-secondary font-semibold">Cizura</span> gratis 30 días — agenda, clientes y facturación en un solo lugar.
        </p>
      </div>
      <a
        href="https://cizura.com"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
      >
        Probar gratis
      </a>
    </div>
  </section>
);

export default CizuraBanner;
