import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ExternalLink, Microscope } from "lucide-react";

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
    authors: "Heilmann-Heimbach, S., et al.",
    year: "2017",
    title:
      "Meta-analysis identifies novel risk loci and yields systematic insights into the biology of male-pattern baldness.",
    journal: "Nature Genetics, 49(8), 1121–1127.",
    doi: "10.1038/ng.3726",
  },
  {
    id: 2,
    authors: "Kaufman, K. D., et al.",
    year: "1998",
    title:
      "Finasteride in the treatment of men with androgenetic alopecia.",
    journal:
      "Journal of the American Academy of Dermatology, 39(4), 578–589.",
    doi: "10.1016/s0190-9622(98)70007-6",
  },
  {
    id: 3,
    authors: "Blumeyer, A., et al.",
    year: "2011",
    title:
      "Evidence-based (S3) guideline for the treatment of androgenetic alopecia in women and in men.",
    journal:
      "Journal of the German Society of Dermatology, 9(S6), S1–S57.",
    doi: "10.1111/j.1610-0387.2011.07779.x",
  },
  {
    id: 4,
    authors: "Almohanna, H. M., et al.",
    year: "2019",
    title: "The role of vitamins and minerals in hair loss: A review.",
    journal: "Dermatology and Therapy, 9(1), 51–70.",
    doi: "10.1007/s13555-018-0278-6",
  },
  {
    id: 5,
    authors: "Randolph, M., & Tosti, A.",
    year: "2021",
    title:
      "Oral minoxidil treatment for hair loss: A review of efficacy and safety.",
    journal:
      "Journal of the American Academy of Dermatology, 84(3), 737–746.",
    doi: "10.1016/j.jaad.2020.06.1014",
  },
  {
    id: 6,
    authors: "Vujovic, A., & Del Marmol, V.",
    year: "2014",
    title:
      "The female pattern hair loss: Review of etiopathogenesis and diagnosis.",
    journal: "BioMed Research International, 2014, Article 767628.",
    doi: "10.1155/2014/767628",
  },
  {
    id: 7,
    authors: "Asociación Española de Dermatología y Venereología.",
    year: "2023",
    title: "Guía de práctica clínica en alopecia.",
    journal: "AEDV.",
    doi: "",
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
        <em className="not-italic text-[#F5F0E8]/50">{s.journal}</em>{" "}
        {s.doi && (
          <a
            href={`https://doi.org/${s.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C4A97D]/50 hover:text-[#C4A97D] transition-colors inline-flex items-center gap-0.5"
          >
            https://doi.org/{s.doi}
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        )}
      </p>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AlopeciaExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#2D2218" }}
      aria-label="Fundamento científico del analizador de alopecia"
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
            Lo que todo profesional del cabello debe saber sobre la alopecia
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
              La ventana terapéutica más eficaz en la alopecia androgénica (AGA)
              se sitúa en los estadios tempranos —Hamilton I-III en hombres,
              Ludwig I-II en mujeres—. Detectar señales tempranas y derivar al
              dermatólogo es uno de los actos clínicamente más valiosos que un
              profesional puede realizar.
            </p>
            <p>
              En 2026, los tratamientos con mayor evidencia son finasteride y
              minoxidil, que pueden mantener entre el 70-85% del cabello en
              estadios leve-moderados. La ciencia puede frenar la progresión,
              pero no restaurar una calvicie establecida.
            </p>
            <p>
              España presenta una de las tasas más elevadas de AGA de Europa.
              El profesional que detecta una AGA incipiente y deriva tempranamente
              le ahorra al paciente meses de progresión silenciosa y miles de euros.
            </p>
          </div>
        </details>

        {/* Bibliography — collapsible */}
        <details className="mt-10 pt-8 border-t border-[#C4A97D]/15 group">
          <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60 hover:text-[#C4A97D]/80 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <BookOpen className="w-3.5 h-3.5" />
            Referencias bibliográficas (APA 7.ª ed.) — {SOURCES.length} fuentes
            <ChevronDown className="w-3.5 h-3.5 ml-auto transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <ol className="space-y-3 list-none p-0 mt-5 animate-fade-in">
            {SOURCES.map((s) => (
              <SourceItem key={s.id} s={s} />
            ))}
          </ol>
        </details>
      </div>
    </motion.section>
  );
}
