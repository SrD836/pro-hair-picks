import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Microscope } from "lucide-react";

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

        {/* Body paragraphs */}
        <div className="space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl">
          <p>
            La ventana terapéutica más eficaz en la alopecia androgénica (AGA)
            se sitúa en los estadios tempranos —Hamilton I-III en hombres,
            Ludwig I-II en mujeres—, porque una vez que la miniaturización
            folicular alcanza un punto de no retorno, caracterizado por una
            densidad de folículos terminales inferior al 20 % en la zona
            afectada, ningún tratamiento disponible en 2026 puede restaurar
            esos folículos. La miniaturización progresiva convierte los
            folículos terminales en vellos, y cuando la fibrosis periburilar
            sustituye definitivamente el tejido folicular activo, la
            capacidad regenerativa del cuero cabelludo queda abolida de forma
            irreversible. El profesional que conoce este umbral puede orientar
            al paciente hacia una intervención basada en evidencia antes de
            cruzar esa línea, lo que supone la diferencia entre preservar el
            cabello existente y lamentar una oportunidad perdida. Detectar
            señales tempranas de AGA —retroceso frontotemporal, ensanchamiento
            de la raya o mayor visibilidad del cuero cabelludo en zona
            parietal— y derivar al dermatólogo en ese momento es uno de los
            actos clínicamente más valiosos que un profesional de la peluquería
            puede realizar.
          </p>

          <p>
            En 2026, los tratamientos con mayor nivel de evidencia para la AGA
            son la combinación de finasteride (inhibidor de la 5-alfa-reductasa
            tipo II) y minoxidil (vasodilatador y activador de canales de
            potasio), que en conjunto pueden mantener entre el 70 y el 85 % del
            cabello existente en estadios leve-moderados, e incluso lograr
            reversión parcial de la miniaturización en algunos casos. Los
            inhibidores de JAK —baricitinib, ritlecitinib— han mostrado
            resultados prometedores en alopecia areata (una enfermedad
            autoinmune distinta de la AGA), pero en 2026 no están aprobados
            para la alopecia androgénica, y extrapolar su uso sería
            clínicamente incorrecto. La terapia génica para la AGA permanece
            en fase preclínica: los estudios sobre modulación de la vía
            androgénica a nivel genómico son relevantes para el futuro, pero
            no tienen aplicación clínica disponible hoy. El mensaje más honesto
            que un profesional puede transmitir a un paciente es que la ciencia
            puede frenar la progresión y, en fases tempranas, revertir
            parcialmente la miniaturización; pero no puede, en 2026, restaurar
            un cuero cabelludo calvicie establecida a su densidad original.
            Gestionar esta expectativa con precisión es parte del diagnóstico.
          </p>

          <p>
            España presenta una de las tasas más elevadas de alopecia
            androgénica de Europa: aproximadamente el 50 % de los hombres
            mayores de 50 años y el 30 % de las mujeres mayores de 60
            presentan AGA clínicamente significativa, según datos de la
            Asociación Española de Dermatología y Venereología (AEDV, 2023).
            El Sistema Nacional de Salud no financia los tratamientos
            cosméticos para la AGA, lo que incluye el minoxidil y el
            finasteride cuando se prescriben por pérdida de cabello —aunque
            el finasteride sí está financiado para la hiperplasia benigna de
            próstata—. Los tiempos de espera para una consulta de dermatología
            por el SNS oscilan entre 3 y 6 meses de media; en la sanidad
            privada, el coste de la primera visita se sitúa entre 150 y 300 €.
            El plasma rico en plaquetas (PRP) tiene un coste de entre 250 y
            400 € por sesión en clínicas privadas, y el trasplante capilar
            mediante técnica FUE oscila entre 3.000 y 8.000 € —un rango que
            posiciona a España entre los mercados más competitivos de Europa
            para esta cirugía—. Esta realidad económica hace que el peluquero
            profesional que detecta una AGA incipiente y deriva al paciente de
            forma temprana no solo preserve su cabello: le ahorra meses de
            progresión silenciosa y, potencialmente, miles de euros en
            intervenciones más complejas.
          </p>
        </div>

        {/* Cizura CTA box */}
        <div className="mt-10 rounded-xl border border-[#C4A97D]/20 bg-[rgba(196,169,125,0.05)] p-6">
          <p className="text-sm text-[#F5F0E8]/70 leading-relaxed">
            Un profesional que conoce la ciencia detrás de la alopecia puede
            ofrecer a su cliente un diagnóstico honesto y un protocolo de
            cuidado real.{" "}
            <a
              href="https://cizura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A97D] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Cizura <ExternalLink className="w-3 h-3" />
            </a>{" "}
            registra el historial completo de cada servicio y tratamiento para
            que ese seguimiento sea preciso desde la primera visita hasta la
            última.
          </p>
        </div>

        {/* Bibliography */}
        <div className="mt-10 pt-8 border-t border-[#C4A97D]/15">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-3.5 h-3.5 text-[#C4A97D]/60" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4A97D]/60">
              Referencias bibliográficas (APA 7.ª ed.)
            </p>
          </div>
          <ol className="space-y-3 list-none p-0">
            {SOURCES.map((s) => (
              <SourceItem key={s.id} s={s} />
            ))}
          </ol>
        </div>
      </div>
    </motion.section>
  );
}
