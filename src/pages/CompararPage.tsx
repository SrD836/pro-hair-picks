import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { Button } from "@/components/ui/button";

/** Detect if a string looks numeric (e.g. "120 min", "4.5", "1800 RPM") and extract the number */
function extractNumber(val: string): number | null {
  const m = val.match(/[\d]+([.,]\d+)?/);
  if (!m) return null;
  return parseFloat(m[0].replace(",", "."));
}

/** For a row of values, return the index of the "best" one.
 *  lowerIsBetter → smallest wins; otherwise largest wins. */
function bestIndex(values: (string | null)[], lowerIsBetter: boolean): number | null {
  let bestIdx: number | null = null;
  let bestNum: number | null = null;
  values.forEach((v, i) => {
    if (!v) return;
    const n = extractNumber(v);
    if (n == null) return;
    if (bestNum == null || (lowerIsBetter ? n < bestNum : n > bestNum)) {
      bestNum = n;
      bestIdx = i;
    }
  });
  // Only highlight if there are at least 2 numeric values
  const numericCount = values.filter((v) => v && extractNumber(v) != null).length;
  return numericCount >= 2 ? bestIdx : null;
}

const LOWER_IS_BETTER_KEYS = ["precio", "price", "peso", "weight", "ruido", "noise"];

const CompararPage = () => {
  const { items, remove, clear } = useCompare();

  if (items.length < 2) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Comparador de productos</h1>
        <p className="text-muted-foreground mb-6">Selecciona al menos 2 productos para compararlos.</p>
        <Button asChild variant="secondary">
          <Link to="/">Volver al inicio</Link>
        </Button>
        <section className="sr-only">
          <p>El comparador de productos profesionales de peluquería y barbería permite analizar en paralelo hasta tres modelos de la misma categoría. Compara especificaciones técnicas, precio actualizado y valoraciones reales de Amazon para marcas como Wahl, BaByliss, Dyson y Andis.</p>
          <p>Las diferencias técnicas entre modelos —potencia del motor, peso, ciclos por minuto o tipo de hoja— determinan el rendimiento en servicios de alta demanda. Conocer estas variables ayuda a elegir el equipamiento más adecuado según el tipo de salón, el volumen de clientes y los servicios principales que se ofrecen.</p>
          <p>La relación calidad-precio varía según la gama: las marcas profesionales ofrecen mayor durabilidad y garantías de servicio técnico en España. Este comparador facilita la decisión de compra con datos objetivos y actualizados para barberos y peluqueros profesionales.</p>
        </section>
      </div>
    );
  }

  // Collect all tech_spec keys across products
  const allSpecKeys = Array.from(
    new Set(items.flatMap((p) => {
      const specs = (p as any).tech_specs;
      return specs && typeof specs === "object" ? Object.keys(specs) : [];
    }))
  );

  // Build rows: label + values per product
  type Row = { label: string; values: (string | null)[]; lowerIsBetter: boolean };
  const rows: Row[] = [
    {
      label: "Precio",
      values: items.map((p) => (p.current_price != null ? `${p.current_price.toFixed(2)}€` : null)),
      lowerIsBetter: true,
    },
    {
      label: "Rating",
      values: items.map((p) => (p.amazon_rating != null ? `${p.amazon_rating}` : null)),
      lowerIsBetter: false,
    },
    {
      label: "Reviews",
      values: items.map((p) => (p.amazon_reviews != null ? `${p.amazon_reviews.toLocaleString("es-ES")}` : null)),
      lowerIsBetter: false,
    },
    ...allSpecKeys.map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      values: items.map((p) => {
        const specs = (p as any).tech_specs;
        const val = specs?.[key];
        return val != null ? String(val) : null;
      }),
      lowerIsBetter: LOWER_IS_BETTER_KEYS.some((k) => key.toLowerCase().includes(k)),
    })),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Comparar</span>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Comparativa de productos</h1>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 className="w-4 h-4 mr-1" /> Limpiar
        </Button>
      </div>

      <section className="max-w-2xl mt-4 mb-8 text-sm text-muted-foreground leading-relaxed">
        <p>
          Compara especificaciones técnicas, precio y valoraciones de los principales
          productos profesionales del mercado. Datos actualizados desde
          Amazon España y fabricantes. Selecciona hasta 3 modelos para comparar en paralelo.
        </p>
      </section>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          {/* Header: images + names */}
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="p-4 text-left text-muted-foreground font-medium w-36 sticky left-0 bg-muted/30">Producto</th>
              {items.map((p) => (
                <th key={p.id} className="p-4 text-center min-w-[180px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-lg border border-border bg-muted/50 overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-3xl opacity-20">✂️</span>
                      )}
                    </div>
                    <span className="font-display font-bold text-foreground text-sm leading-tight">{p.name}</span>
                    {p.brand && <span className="text-xs text-muted-foreground">{p.brand}</span>}
                    <button onClick={() => remove(p.id)} className="text-xs text-destructive hover:underline">
                      Quitar
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const best = bestIndex(row.values, row.lowerIsBetter);
              return (
                <tr key={row.label} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium text-muted-foreground sticky left-0 bg-card">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      className={`p-4 text-center font-semibold ${
                        best === i ? "text-green-600 dark:text-green-400" : "text-foreground"
                      }`}
                    >
                      {val ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* CTA row */}
            <tr className="bg-muted/20">
              <td className="p-4 sticky left-0 bg-muted/20" />
              {items.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <Button asChild variant="secondary" size="sm">
                    <a href={p.amazon_url || "#"} target="_blank" rel="noopener noreferrer nofollow">
                      Ver en Amazon <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <section className="sr-only">
        <p>El comparador de productos profesionales de peluquería y barbería permite analizar en paralelo hasta tres modelos de la misma categoría. Compara especificaciones técnicas, precio actualizado y valoraciones reales de Amazon para marcas como Wahl, BaByliss, Dyson y Andis.</p>
        <p>Las diferencias técnicas entre modelos —potencia del motor, peso, ciclos por minuto o tipo de hoja— determinan el rendimiento en servicios de alta demanda. Conocer estas variables ayuda a elegir el equipamiento más adecuado según el tipo de salón, el volumen de clientes y los servicios principales que se ofrecen.</p>
        <p>La relación calidad-precio varía según la gama: las marcas profesionales ofrecen mayor durabilidad y garantías de servicio técnico en España. Este comparador facilita la decisión de compra con datos objetivos y actualizados para barberos y peluqueros profesionales.</p>
      </section>
    </div>
  );
};

export default CompararPage;
