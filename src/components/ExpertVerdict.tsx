import { motion } from "framer-motion";
import { Quote, ExternalLink } from "lucide-react";

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

        {/* Body paragraphs */}
        <div className="space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl">
          <p>
            La fibra capilar humana es uno de los biomateriales más complejos del
            organismo: una arquitectura de queratina en hélice-alfa mantenida por
            puentes disulfuro, interacciones electrostáticas y una capa hidrófoba
            exterior de ácido 18-metileicosanoico (18-MEA) que actúa como barrera
            química. Esta estructura, fruto de millones de años de evolución, puede
            ser comprometida de forma irreversible en literalmente minutos por la
            combinación equivocada de agentes químicos.
          </p>

          <p>
            La evidencia científica acumulada entre 2018 y 2026 ha demostrado con
            metodología cuantitativa lo que los profesionales experimentados
            siempre intuyeron: los tratamientos capilares no son módulos
            independientes que se pueden combinar libremente. La decoloración con
            H₂O₂ al 6–12% convierte los puentes disulfuro en ácido cisteico de
            forma irreversible; el hidróxido sódico forma lantionina permanente;
            el ácido glioxílico crea adductos en los mismos sitios nucleófilos que
            los relajantes necesitan. Cada uno de estos procesos modifica la
            arquitectura molecular del pelo de una forma que determina cómo
            responderá ante el siguiente tratamiento.
          </p>

          <p>
            La interacción más documentada y potencialmente más peligrosa en el
            entorno de un salón es la de los tintes metálicos (sales de cobre,
            plomo o plata de la henna compuesta) con cualquier fuente de H₂O₂.
            Los iones Cu²⁺ depositados en la corteza capilar actúan como
            catalizadores Fenton: descomponen el peróxido de hidrógeno en una
            cascada de radicales hidroxilo altamente exotérmica que literalmente
            disuelve la proteína capilar en cuestión de minutos, generando calor,
            vapores de H₂S y, en casos graves, quemaduras en el cuero cabelludo
            del cliente. La prevención requiere un simple test diagnóstico de
            mechón —observable a simple vista— que ningún profesional debería
            omitir antes de un servicio oxidativo sobre un cliente desconocido.
          </p>

          <p>
            La incompatibilidad NaOH–tioglicolato merece mención especial por su
            carácter de ley química absoluta: la lantionina formada por el
            hidróxido es un tioéter estructuralmente irreducible por el
            tioglicolato. No existe intervalo de tiempo que haga compatible esta
            combinación en el mismo cabello. Toda la formación profesional de
            cosmetología (Milady, SCS, SCCS) la categoriza unánimemente como
            prohibición sin excepciones. Y sin embargo, según estudios de práctica
            clínica, continúa siendo una de las causas más frecuentes de rotura
            capilar por error profesional en entornos europeos.
          </p>

          {/* Pull quote */}
          <div className="relative my-8 pl-6 border-l-2 border-[#C4A97D]">
            <Quote className="w-5 h-5 text-[#C4A97D]/40 absolute -left-2.5 -top-1" />
            <p className="text-[#F5F0E8]/90 text-base md:text-lg font-display italic leading-relaxed">
              La compatibilidad química no es una recomendación cosmética; es
              bioquímica aplicada. Conocer las restricciones moleculares de los
              tratamientos que ofreces es tan fundamental como la técnica de
              aplicación.
            </p>
          </div>

          <p>
            El conocimiento de estas interacciones no es patrimonio exclusivo de
            los laboratorios de investigación. Pertenece a la consulta de cada
            profesional, a la formación de cada estilista y, en última instancia,
            a la protección de cada cliente que confía su cabello a manos expertas.
            Un profesional que domina la química de su trabajo no solo evita
            errores costosos: aporta el rigor que convierte un servicio en una
            experiencia segura, predecible y de calidad certificada.
          </p>
        </div>

        {/* Cizura cross-promo — subtle, premium tone */}
        <div className="mt-10 rounded-xl border border-[#C4A97D]/20 bg-[rgba(196,169,125,0.05)] p-6">
          <p className="text-sm text-[#F5F0E8]/70 leading-relaxed">
            Un profesional que conoce la química de su trabajo también merece
            herramientas de gestión a su altura.{" "}
            <a
              href="https://cizura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A97D] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Cizura <ExternalLink className="w-3 h-3" />
            </a>{" "}
            registra el historial completo de tratamientos de cada cliente —
            decoloración, relajantes, henna, queratina — para que nunca tengas
            que adivinar qué se aplicó la última vez. Porque la compatibilidad
            química empieza por saber exactamente qué tiene ese cabello antes de
            aplicar nada nuevo.
          </p>
        </div>

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
