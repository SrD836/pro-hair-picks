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
    authors: "Nishimura, E. K., et al.",
    year: "2005",
    title:
      "Mechanisms of hair graying: Incomplete melanocyte stem cell maintenance in the niche.",
    journal: "Science, 307(5710), 720–724.",
    doi: "10.1126/science.1099593",
  },
  {
    id: 2,
    authors: "Zhang, B., et al.",
    year: "2020",
    title:
      "Hyperactivation of sympathetic nerves drives depletion of melanocyte stem cells.",
    journal: "Nature, 577(7792), 676–681.",
    doi: "10.1038/s41586-020-1935-3",
  },
  {
    id: 3,
    authors: "Wood, J. M., et al.",
    year: "2009",
    title:
      "Senile hair graying: H₂O₂-mediated oxidative stress affects human hair color by blunting methionine sulfoxide repair.",
    journal: "FASEB Journal, 23(7), 2065–2075.",
    doi: "10.1096/fj.08-125435",
  },
  {
    id: 4,
    authors: "Trüeb, R. M.",
    year: "2009",
    title: "Oxidative stress in ageing of hair.",
    journal: "International Journal of Trichology, 1(1), 6–14.",
    doi: "10.4103/0974-7753.51923",
  },
  {
    id: 5,
    authors: "Shin, H., et al.",
    year: "2015",
    title:
      "IRF4 is a critical regulator of melanocyte stem cells and contributes to graying.",
    journal: "Genes & Development, 29(18), 1849–1854.",
    doi: "10.1101/gad.263749.115",
  },
  {
    id: 6,
    authors: "Schallreuter, K. U., et al.",
    year: "2009",
    title:
      "Defective antioxidant defenses promote accumulation of hydrogen peroxide in vitiligo and canities.",
    journal: "Annals of the New York Academy of Sciences, 1173, 626–634.",
    doi: "10.1111/j.1749-6632.2009.04618.x",
  },
  {
    id: 7,
    authors: "Kumar, A. B., et al.",
    year: "2018",
    title: "Premature canities: A review.",
    journal: "International Journal of Trichology, 10(5), 198–203.",
    doi: "10.4103/ijt.ijt_50_18",
  },
  {
    id: 8,
    authors: "Fortes, C., et al.",
    year: "2008",
    title: "The relationship between smoking and premature hair graying.",
    journal: "Journal of the American Academy of Dermatology, 58(3), 392–398.",
    doi: "10.1016/j.jaad.2007.10.002",
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

export default function CanicieExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#2D2218" }}
      aria-label="Fundamento científico del analizador de canicie"
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
            Lo que el mercado cosmético no te dice sobre la canicie
          </h3>
        </div>

        {/* Body paragraphs */}
        <div className="space-y-5 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl">
          <p>
            La canicie es, en su mayor parte, una consecuencia irreversible del
            agotamiento progresivo de las células madre melanocíticas (McSCs) del
            folículo piloso. Cuando estas células madre se agotan —ya sea por
            senescencia genéticamente programada, por la acumulación de H₂O₂
            intracelular asociada al déficit de catalasa, o por la liberación de
            norepinefrina derivada del estrés crónico que las expulsa prematuramente
            de su nicho— el folículo pierde permanentemente su capacidad de
            pigmentar el nuevo tallo capilar. Este mecanismo no es cosmético: es
            celular e irreversible salvo en los escasos casos donde la causa es
            puramente nutricional (déficit de B12 o de cobre, cuya corrección puede
            restaurar la melanogénesis si el pool de McSCs aún está presente). La
            industria cosmética comercializa activos «anti-canicie» aprovechando
            esta ventana de incertidumbre, pero ninguno de ellos ha demostrado en
            ensayos clínicos controlados la capacidad de repigmentar folículos
            despigmentados con etiología genética. Las moléculas de interés real
            —inhibidores de Wnt, análogos de SCF, moduladores de BCL2— están en
            fases experimentales, sin aplicación clínica disponible en 2025.
          </p>

          <p>
            El estrés crónico merece una mención específica, porque es el factor
            modificable más infradiagnosticado y a la vez el mejor estudiado
            mecanisticamente. Zhang et al. (2020) demostraron en modelo murino que
            la hiperactivación del sistema nervioso simpático bajo estrés libera
            norepinefrina que activa receptores adrenérgicos en las McSCs,
            provocando su proliferación no controlada y su diferenciación prematura
            fuera del nicho: se «gastan» antes de tiempo. El resultado es un
            agotamiento del reservorio de células madre melanocíticas que se
            comporta biológicamente como un envejecimiento acelerado del folículo.
            Este mecanismo explica la observación clínica de brotes de canicie
            acelerada en periodos de estrés agudo intenso —un fenómeno que la
            medicina popular atribuía erróneamente a un «blanqueamiento del pelo ya
            formado», que es físicamente imposible en el tallo queratinizado. Las
            técnicas de manejo del estrés (ejercicio aeróbico, técnicas
            cognitivo-conductuales, calidad del sueño) tienen una base mecanística
            sólida para preservar el pool de McSCs residual, aunque no
            recuperarán el color de los cabellos ya despigmentados.
          </p>

          <p>
            El pelo canoso, en ausencia de melanina, presenta una estructura
            distinta al pelo pigmentado: carece de la protección fotooxidativa que
            la eumelanina ejerce sobre la corteza, y sus lípidos de superficie
            —incluyendo el ácido 18-MEA (18-metileicosanoico), responsable de la
            hidrofobicidad natural y el tacto liso del pelo sano— se oxidan con
            mayor facilidad ante la radiación UV sin el paraguas que la melanina
            proporcionaría. Esto no es un argumento de venta cosmética: es la razón
            objetiva por la que el pelo canoso requiere protección UV activa y
            reposición lipídica regular, mientras que el pelo pigmentado puede
            prescindir de ellas durante más tiempo. Un diagnóstico honesto de la
            canicie distingue entre lo que es modificable (nutrición, estrés,
            tabaquismo), lo que es inevitable (agotamiento genético de McSCs), y lo
            que puede mejorar la calidad del pelo ya existente (cuidado estructural)
            —sin confundir ninguna de estas tres categorías con «tratamiento» de
            la canicie establecida.
          </p>
        </div>

        {/* Cizura CTA box */}
        <div className="mt-10 rounded-xl border border-[#C4A97D]/20 bg-[rgba(196,169,125,0.05)] p-6">
          <p className="text-sm text-[#F5F0E8]/70 leading-relaxed">
            Conocer el perfil de canicie de un cliente —su historial de estrés,
            los tratamientos químicos recibidos, sus déficits nutricionales
            conocidos— es tan clínico como saber el grado de daño de su fibra.{" "}
            <a
              href="https://cizura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A97D] font-semibold hover:underline inline-flex items-center gap-1"
            >
              Cizura <ExternalLink className="w-3 h-3" />
            </a>{" "}
            permite registrar y consultar este historial en cada visita, para que
            tus recomendaciones de color, cuidado y suplementación estén respaldadas
            por datos longitudinales del cliente, no por suposiciones de la primera
            consulta.
          </p>
        </div>

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
