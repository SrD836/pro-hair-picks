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

        {/* Body paragraphs */}
        <div className="space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl">
          <p>
            Todo proceso alcalino —decoloración, alisado químico, permanente—
            eleva el pH capilar por encima de 9, forzando la apertura de las
            escamas cuticulares y disolviendo el cemento lipídico intercelular
            conocido como CMC (Complex Membrane Complex). Este cemento actúa
            como sellante estructural entre las capas de la corteza; su
            disolución no es cosmética sino bioquímica: implica la pérdida de
            ceramidas, ácidos grasos libres y colesterol que forman la barrera
            que mantiene la hidratación de la fibra. La normalización del pH al
            rango fisiológico de 4,5–5,5 requiere entre 48 y 72 horas sin
            intervención adicional. Iniciar protocolos de reconstrucción
            proteica antes de que el pH se haya reestablecido es
            contraproducente: las proteínas hidrolizadas no penetran
            eficientemente en una cutícula abierta y se pierden con el
            primer aclarado, mientras que el ambiente alcalino sostenido
            continúa degradando los puentes disulfuro restantes.
          </p>

          <p>
            La reposición lipídica y la reconstrucción proteica obedecen a
            cinéticas distintas según el peso molecular de los activos
            empleados. Los aceites de bajo peso molecular —argán, jojoba,
            escualeno— penetran en la corteza capilar en un margen de 20 a 40
            minutos, actuando directamente sobre los espacios intercorticales
            empobrecidos en lípidos. Los de alto peso molecular —ricino,
            coco sin fraccionar— no atraviesan la cutícula con eficiencia y
            ejercen su acción principalmente como barrera superficial que limita
            la pérdida de agua por evaporación. Respetar esta distinción es
            relevante en la secuenciación de tratamientos: aplicar un aceite de
            alto peso molecular antes de un tratamiento proteico reduce la
            penetración de este último. Por otra parte, la sobreproteinización
            —exceso acumulativo de proteínas hidrolizadas en pocas semanas—
            genera un síndrome documentado de rigidez, pérdida de elasticidad y
            rotura seca, indistinguible a simple vista del daño por calor o
            por química agresiva, lo que complica el diagnóstico posterior si
            no se dispone del historial completo del cliente.
          </p>

          <p>
            Las tecnologías Plex basadas en reticuladores de maleimida
            restauran entre el 60 y el 80 % de los enlaces disulfuro rotos
            por aplicación, creando nuevos puentes covalentes C–C que refuerzan
            la corteza sin depender del azufre oxidado que los procesos químicos
            han eliminado. Sin embargo, los enlaces reconstituidos por estas
            tecnologías requieren un mínimo de 72 horas antes de ser sometidos
            a nuevo estrés químico o térmico: el calor por encima de 180 °C
            rompe los enlaces más débiles antes de que hayan completado su
            consolidación estructural, y cualquier proceso oxidativo o reductor
            en ese intervalo compite directamente con la red recién formada.
            Un calendario de recuperación bien diseñado no es un protocolo
            arbitrario de marketing: es el reflejo de estas ventanas biológicas
            reales, cuyo respeto determina si el tratamiento acumula beneficio o
            simplemente agrava el daño de partida.
          </p>
        </div>

        {/* Cizura CTA box */}
        <div className="mt-10 rounded-xl border border-[#C4A97D]/20 bg-[rgba(196,169,125,0.05)] p-6">
          <p className="text-sm text-[#F5F0E8]/70 leading-relaxed">
            Un calendario de recuperación vale de poco si no sabes qué
            tratamiento recibió ese cliente hace 3 meses.{" "}
            <a
              href="https://cizura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A97D] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Cizura <ExternalLink className="w-3 h-3" />
            </a>{" "}
            mantiene el historial completo de cada servicio para que puedas
            tomar decisiones técnicas con datos reales, no con suposiciones.
          </p>
        </div>

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
