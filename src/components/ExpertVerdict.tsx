import { motion } from "framer-motion";
import { Quote, ExternalLink, BookOpen, ChevronDown } from "lucide-react";

// ─── Sources (APA 7th ed.) — static trusted content ──────────────────────────

interface Source {
  id: number;
  authors: string;
  year: string;
  title: string;
  journal: string;
  doi?: string;
  pmid?: string;
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
    pmid: "PMC10405601",
  },
  {
    id: 2,
    authors: "Rodrigues, L. M., et al.",
    year: "2022",
    title:
      "Impact of Acid and Alkaline Straightening on Hair Fiber Characteristics.",
    journal: "International Journal of Trichology, 14(5), 176–182.",
    doi: "10.4103/ijt.ijt_116_21",
    pmid: "PMC10075350",
  },
  {
    id: 3,
    authors: "Boga, C., et al.",
    year: "2022",
    title:
      "Effects of chemical straighteners on the hair shaft and scalp.",
    journal: "International Journal of Dermatology, 61(4), 421–427.",
    doi: "10.1111/ijd.15919",
    pmid: "PMC9073307",
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
    pmid: "PMC8280444",
  },
  {
    id: 5,
    authors: "Barbosa, A. F., et al.",
    year: "2015",
    title:
      "Protein loss in human hair from combination straightening and coloring treatments.",
    journal: "Journal of Cosmetic Science, 66(6).",
    pmid: "PubMed 26177865",
  },
  {
    id: 6,
    authors: "Osman, A. M., et al.",
    year: "2003",
    title:
      "Evidence for redox cycling of lawsone in the presence of biological reductants and its significance in the context of mutagenicity.",
    journal: "Journal of Applied Toxicology, 23(6), 375–381.",
    doi: "10.1002/jat.908",
  },
  {
    id: 7,
    authors: "Becker, L. C., et al.",
    year: "2024",
    title:
      "Safety Assessment of Hydrogen Peroxide as Used in Cosmetics.",
    journal:
      "International Journal of Toxicology, 43(1_suppl), 5S–32S.",
    doi: "10.1177/10915818241237790",
    pmid: "PubMed 38469819",
  },
  {
    id: 8,
    authors: "StatPearls.",
    year: "2024",
    title: "Paraphenylenediamine Toxicity.",
    journal: "StatPearls. National Institutes of Health.",
    pmid: "NBK606092",
  },
  {
    id: 9,
    authors:
      "ANSES — Agence nationale de sécurité sanitaire.",
    year: "2022",
    title:
      "Alert confirmed for glyoxylic acid in hair-straightening products.",
    journal: "anses.fr",
  },
  {
    id: 10,
    authors: "Milady.",
    year: "2022",
    title: "Chapter 20: Chemical Hair Relaxers.",
    journal:
      "In Milady Standard Cosmetology (14th ed.). Cengage Learning.",
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
        {s.doi && (
          <span className="text-[#C4A97D]/40">
            {" "}https://doi.org/{s.doi}
          </span>
        )}
        {s.pmid && (
          <span className="text-[#C4A97D]/30"> [{s.pmid}]</span>
        )}
      </p>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#2D2218" }}
      aria-label="Veredicto del Experto"
    >
      {/* Gold top accent line */}
      <div className="h-1 w-full" style={{ background: "#C4A97D" }} />

      <div className="p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C4A97D] mb-3">
            Análisis científico
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F5F0E8] leading-tight">
            Veredicto del Experto
          </h3>
        </div>

        {/* Body — collapsible */}
        <details className="group/body">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90 transition-colors list-none [&::-webkit-details-marker]:hidden rounded-lg border border-[#C4A97D]/15 px-4 py-3 hover:border-[#C4A97D]/30">
            <Quote className="w-4 h-4 text-[#C4A97D]/60" />
            Leer análisis científico completo
            <ChevronDown className="w-4 h-4 ml-auto text-[#C4A97D]/40 transition-transform duration-300 group-open/body:rotate-180" />
          </summary>
          <div className="mt-6 space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl animate-fade-in">
            <p>
              La fibra capilar humana es uno de los biomateriales más complejos:
              una arquitectura de queratina mantenida por puentes disulfuro que
              puede ser comprometida de forma irreversible en minutos por la
              combinación equivocada de agentes químicos.
            </p>
            <p>
              La decoloración con H₂O₂ convierte los puentes disulfuro en ácido
              cisteico irreversiblemente; el hidróxido sódico forma lantionina
              permanente. Cada proceso modifica la arquitectura molecular del pelo
              determinando cómo responderá ante el siguiente tratamiento.
            </p>
            <p>
              La interacción más peligrosa es la de tintes metálicos con H₂O₂.
              Los iones Cu²⁺ actúan como catalizadores Fenton que disuelven la
              proteína capilar. La prevención requiere un simple test de mechón.
            </p>
            <div className="relative my-8 pl-6 border-l-2 border-[#C4A97D]">
              <Quote className="w-5 h-5 text-[#C4A97D]/40 absolute -left-2.5 -top-1" />
              <p className="text-[#F5F0E8]/90 text-base md:text-lg font-display italic leading-relaxed">
                La compatibilidad química no es una recomendación cosmética; es
                bioquímica aplicada.
              </p>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-[#C4A97D]/20 bg-[rgba(196,169,125,0.05)] p-6 animate-fade-in">
            <p className="text-sm text-[#F5F0E8]/70 leading-relaxed">
              Un profesional que conoce la química merece herramientas a su altura.{" "}
              <a href="https://cizura.com" target="_blank" rel="noopener noreferrer"
                className="text-[#C4A97D] font-semibold hover:underline inline-flex items-center gap-1">
                Cizura <ExternalLink className="w-3 h-3" />
              </a>{" "}
              registra el historial completo de tratamientos de cada cliente.
            </p>
          </div>
        </details>

        {/* References — collapsible */}
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
