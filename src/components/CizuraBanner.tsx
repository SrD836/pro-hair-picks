import { Sparkles } from "lucide-react";

const CizuraBanner = () => (
  <div className="relative overflow-hidden rounded-xl bg-foreground text-background p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4">
    <div className="flex-1">
      <p className="text-sm font-bold uppercase tracking-wider text-secondary mb-2 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4" /> Recomendado
      </p>
      <p className="text-lg sm:text-xl font-display font-bold leading-snug">
        Cada corte que das con esta máquina son 5 minutos. <span className="text-secondary">Cizura</span> llena tu agenda automáticamente — pruébalo gratis.
      </p>
    </div>
    <a
      href="https://cizura.com"
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
    >
      Probar gratis
    </a>
  </div>
);

export default CizuraBanner;
