import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";

const BIBLIOGRAPHY = [
  {
    apa: "SCCS. (2024, febrero). SCCS/1652/23 — Opinion on Methylparaben (Corrigendum February 2024). European Commission Health.",
    url: "https://health.ec.europa.eu/system/files/2023-12/sccs_o_276_final.pdf",
  },
  {
    apa: "SCCS. (2023). SCCS/1651/23 — Opinion on Propylparaben. European Commission Health.",
    url: "https://health.ec.europa.eu/system/files/2023-11/sccs_o_275.pdf",
  },
  {
    apa: "SCCS. (2022a). SCCS/1619/20 — Opinion on Resorcinol. European Commission Health.",
    url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_241.pdf",
  },
  {
    apa: "SCCS. (2022b). SCCS/1623/20 — Opinion on Parabens. European Commission Health.",
    url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_243.pdf",
  },
  {
    apa: "SCCS. (2022c). SCCS/1632/21 — Scientific Advice on Formaldehyde Releasers. European Commission Health.",
    url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_254.pdf",
  },
  {
    apa: "ECHA. (2024). Cyclosiloxanes — Restriction adopted May 2024. European Chemicals Agency.",
    url: "https://echa.europa.eu/hot-topics/cyclosiloxanes",
  },
  {
    apa: "EUR-Lex. (2022). Commission Regulation (EU) 2022/1181 of 8 July 2022 — Formaldehyde labeling threshold. Official Journal of the European Union.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32022R1181",
  },
  {
    apa: "EUR-Lex. (2022). Commission Regulation (EU) 2022/2195 — Resorcinol restriction. Official Journal of the European Union.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32022R2195",
  },
  {
    apa: "CIR Expert Panel. (2022). Amended safety assessment of Dimethicone, Methicone and substituted methicones as used in cosmetics. Cosmetic Ingredient Review.",
    url: "https://www.cir-safety.org/sites/default/files/FAR_Methicones_032022.pdf",
  },
  {
    apa: "CIR Expert Panel. (2023, diciembre). Safety assessment of p-Phenylenediamine — Technical Assessment Report. Cosmetic Ingredient Review.",
    url: "https://www.cir-safety.org/sites/default/files/TAR_Phenylenediamine_122023.pdf",
  },
  {
    apa: "Bondi, C. A. M., Marks, J. L., Wroblewski, L. B., Raatikainen, H. S., Shreeve, S. R., & Weller, K. E. (2015). Human and environmental toxicity of sodium lauryl sulfate (SLS): Evidence for safe use in household cleaning products. Environmental Health Insights, 9, 27–32.",
    url: "https://pubmed.ncbi.nlm.nih.gov/26617461/",
  },
  {
    apa: "Mukherjee, N., Maqbool, M., Alam, M. S., & Chopra, H. (2022). Hair dye ingredients and potential health risks from exposure to hair dyeing. Cosmetics, 9(3), 60.",
    url: "https://pubmed.ncbi.nlm.nih.gov/35666914/",
  },
];

export default function InciExpertVerdict() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl overflow-hidden"
      style={{ background: "#2D2218" }}
    >
      {/* Gold accent line */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D 30%, #C4A97D 70%, transparent)" }}
      />

      <div className="px-6 md:px-10 py-10 md:py-14">
        {/* Label */}
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-4 h-4 text-[#C4A97D]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4A97D]">
            Veredicto del experto · INCI 2026
          </span>
        </div>

        <h2
          className="font-display font-bold text-[#F5F0E8] mb-8 leading-tight"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)" }}
        >
          Leer una etiqueta INCI no es solo saber pronunciar los nombres.
          <span className="text-[#C4A97D]"> Es entender qué aplicas sobre tus clientes.</span>
        </h2>

        {/* Body — collapsible */}
        <details className="group/body">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90 transition-colors list-none [&::-webkit-details-marker]:hidden rounded-lg border border-[#C4A97D]/15 px-4 py-3 hover:border-[#C4A97D]/30">
            <BookOpen className="w-4 h-4 text-[#C4A97D]/60" />
            Leer análisis científico completo
            <ChevronDown className="w-4 h-4 ml-auto text-[#C4A97D]/40 transition-transform duration-300 group-open/body:rotate-180" />
          </summary>
          <div className="mt-6 space-y-6 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl animate-fade-in">
            <p>
              El nomenclátor INCI es el idioma común que une a reguladores,
              formuladores y profesionales. En 2026, con nuevas restricciones
              activas —ciclosiloxanos D4/D5/D6 y nuevos umbrales para
              liberadores de formaldehído— la actualización del conocimiento
              deja de ser opcional.
            </p>
            <p>
              La sensibilización de contacto tipo IV al PPD es acumulativa e
              irreversible. Una vez desarrollada, cualquier exposición puede
              desencadenar desde eccema hasta anafilaxia. La prevención empieza
              con anamnesis correcta y lectura sistemática de etiquetas.
            </p>
            <p>
              El principio de precaución no significa prohibir todo ingrediente,
              sino aplicar las restricciones vigentes con rigor y actualizar
              constantemente el conocimiento. Las opiniones del SCCS y estudios
              peer-reviewed son las únicas fuentes fiables.
            </p>
          </div>
          <div className="mt-10 rounded-2xl p-6 md:p-8 animate-fade-in"
            style={{ background: "rgba(196,169,125,0.10)", border: "1px solid rgba(196,169,125,0.25)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4A97D] mb-3">
              Historial químico de cliente · Cizura
            </p>
            <p className="text-[#F5F0E8]/85 text-sm md:text-base leading-relaxed">
              Conocer los ingredientes que aplicas es solo la mitad.{" "}
              <span className="text-[#F5F0E8] font-semibold">
                Cizura registra qué tratamientos y productos has usado en cada cliente.
              </span>
            </p>
          </div>
        </details>

        {/* Bibliography — collapsible */}
        <details className="mt-10 group">
          <summary className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4A97D] hover:text-[#C4A97D]/80 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <BookOpen className="w-3.5 h-3.5" />
            Bibliografía (APA 7ª edición) — {BIBLIOGRAPHY.length} fuentes
            <ChevronDown className="w-3.5 h-3.5 ml-auto transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <ol className="space-y-2.5 mt-4 animate-fade-in">
            {BIBLIOGRAPHY.map((ref, i) => (
              <li key={i} className="flex gap-3 text-xs text-[#F5F0E8]/45 leading-relaxed">
                <span className="shrink-0 text-[#C4A97D]/60 font-semibold w-5 text-right">{i + 1}.</span>
                <span>
                  {ref.apa}{" "}
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[#C4A97D]/70 hover:text-[#C4A97D] transition-colors underline underline-offset-2"
                    >
                      Acceder
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </details>
      </div>

      {/* Bottom gold line */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D 30%, #C4A97D 70%, transparent)" }}
      />
    </motion.section>
  );
}
