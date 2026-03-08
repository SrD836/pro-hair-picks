import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Microscope, ChevronDown } from "lucide-react";

// ─── Sources (APA 7th ed.) ────────────────────────────────────────────────────

interface Source {
  id: number;
  authors: string;
  year: string;
  title: string;
  journal: string;
  doi: string;
}

const SOURCES: Source[] = [
  {
    id: 1,
    authors: "Cornacchione, S., et al.",
    year: "2023",
    title:
      "Alterations promoted by acid straightening and/or bleaching in hair microstructures.",
    journal: "IUCr Journal, 10(3).",
    doi: "10.1107/S2052252523004050",
  },
  {
    id: 2,
    authors: "Rodrigues, L. M., et al.",
    year: "2022",
    title:
      "Impact of Acid and Alkaline Straightening on Hair Fiber Characteristics.",
    journal: "International Journal of Trichology, 14(5), 176–182.",
    doi: "10.4103/ijt.ijt_116_21",
  },
  {
    id: 3,
    authors: "Boga, C., et al.",
    year: "2022",
    title: "Effects of chemical straighteners on the hair shaft and scalp.",
    journal: "International Journal of Dermatology, 61(4), 421–427.",
    doi: "10.1111/ijd.15919",
  },
  {
    id: 4,
    authors: "Gavazzoni Dias, M. F. R., et al.",
    year: "2021",
    title:
      "Straight to the point: What do we know on hair straightening?",
    journal:
      "Journal of the European Academy of Dermatology and Venereology, 35(7), 1516–1523.",
    doi: "10.1111/jdv.17220",
  },
  {
    id: 5,
    authors: "Malinauskyte, E., et al.",
    year: "2021",
    title:
      "Penetration of different molecular weight hydrolysed keratins into hair fibres.",
    journal: "International Journal of Cosmetic Science, 43(1), 26–33.",
    doi: "10.1111/ics.12663",
  },
  {
    id: 6,
    authors: "Barba, C., et al.",
    year: "2023",
    title:
      "Effect of chemical and mechanical damage on hair fiber internal structure.",
    journal: "Journal of Applied Crystallography, 56(5).",
    doi: "10.1107/S1600576723005599",
  },
];

function SourceItem({ s }: { s: Source }) {
  return (
    <li className="flex gap-3">
      <span className="text-[#C4A97D]/50 text-xs font-bold shrink-0 mt-0.5">
        {s.id}.
      </span>
      <p className="text-xs text-[#F5F0E8]/40 leading-relaxed">
        {s.authors} ({s.year}). {s.title}{" "}
        <em className="not-italic text-[#F5F0E8]/50">{s.journal}</em>
        {" "}
        <a
          href={`https://doi.org/${s.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C4A97D]/50 hover:text-[#C4A97D] transition-colors inline-flex items-center gap-0.5"
        >
          https://doi.org/{s.doi}
          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
        </a>
      </p>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecoveryExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#2D2218" }}
      aria-label="Fundamento científico de la recuperación capilar"
    >
      {/* Gold top accent line */}
      <div className="h-1 w-full" style={{ background: "#C4A97D" }} />

      <div className="p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Microscope className="w-4 h-4 text-[#C4A97D]" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D]">
              Fundamento científico
            </p>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F5F0E8] leading-tight">
            Por qué los tiempos importan
          </h3>
        </div>

        {/* Body — collapsible */}
        <details className="group/body">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90 transition-colors list-none [&::-webkit-details-marker]:hidden rounded-lg border border-[#C4A97D]/15 px-4 py-3 hover:border-[#C4A97D]/30">
            <Microscope className="w-4 h-4 text-[#C4A97D]/60" />
            Leer análisis científico completo
            <ChevronDown className="w-4 h-4 ml-auto text-[#C4A97D]/40 transition-transform duration-300 group-open/body:rotate-180" />
          </summary>
          <div className="mt-6 space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl animate-fade-in">
            <p>
              Todo proceso alcalino eleva el pH capilar por encima de 9, forzando
              la apertura cuticular y disolviendo el cemento lipídico (CMC). La
              normalización del pH requiere 48-72 horas. Iniciar reconstrucción
              antes es contraproducente.
            </p>
            <p>
              Los aceites de bajo peso molecular penetran en la corteza en 20-40
              minutos; los de alto peso molecular actúan como barrera superficial.
              La sobreproteinización genera rigidez y rotura seca indistinguible
              del daño por calor.
            </p>
            <p>
              Las tecnologías Plex restauran el 60-80% de los enlaces disulfuro
              rotos, pero requieren 72 horas mínimo antes de nuevo estrés. Un
              calendario bien diseñado refleja estas ventanas biológicas reales.
            </p>
          </div>
        </details>

        {/* Bibliography — collapsible */}
        <details className="mt-10 pt-8 border-t border-[#C4A97D]/15 group">
          <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60 hover:text-[#C4A97D]/80 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <BookOpen className="w-3.5 h-3.5" />
            Referencias bibliográficas (APA 7.ª ed.) — {SOURCES.length} fuentes
            <ChevronDown className="w-3.5 h-3.5 ml-auto transition-transform group-open:rotate-180" />
          </summary>
          <ol className="space-y-3 list-none p-0 mt-5">
            {SOURCES.map((s) => (
              <SourceItem key={s.id} s={s} />
            ))}
          </ol>
        </details>
      </div>
    </motion.section>
  );
}
