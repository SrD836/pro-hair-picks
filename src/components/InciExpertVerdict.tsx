import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";

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

        {/* 3 authority paragraphs */}
        <div className="space-y-6 text-[#F5F0E8]/75 text-sm md:text-base leading-relaxed max-w-3xl">
          <p>
            El nomenclátor INCI (International Nomenclature of Cosmetic Ingredients) es el idioma común que une a
            reguladores, formuladores y profesionales del sector. En 2026, con el Reglamento (CE) 1223/2009
            plenamente consolidado y nuevas restricciones activas —como la prohibición de ciclosiloxanos D4/D5/D6
            a partir de junio de 2026, o el nuevo umbral de etiquetado para liberadores de formaldehído— la
            actualización del conocimiento deja de ser opcional. Un profesional que conoce lo que contiene
            cada producto que aplica puede tomar decisiones informadas: qué usar en una cliente embarazada,
            qué evitar en un cuero cabelludo con dermatitis atópica activa, o cómo detectar un conservante
            prohibido en un producto importado.
          </p>

          <p>
            La sensibilización de contacto tipo IV al PPD —la alergia al tinte más frecuente y grave en
            dermatología profesional— es acumulativa e irreversible. Una vez que una persona desarrolla alergia
            al PPD, cualquier exposición posterior puede desencadenar una reacción que va desde el eccema hasta
            el angioedema o la anafilaxia. Los datos del SCCS y del CIR son inequívocos: no existe un umbral de
            exposición absolutamente seguro para individuos ya sensibilizados. La prevención empieza antes de
            aplicar el primer tinte, con una anamnesis correcta y una prueba de tolerancia, y continúa con
            la lectura sistemática de las etiquetas en cada nuevo producto utilizado.
          </p>

          <p>
            El principio de precaución en cosméticos no significa prohibir todo ingrediente con un perfil de
            riesgo documentado —muchos son insustituibles técnicamente y seguros en las condiciones de uso
            reglamentadas—, sino aplicar las restricciones vigentes con rigor, comprender los perfiles de
            riesgo de cada cliente, y actualizar constantemente el conocimiento cuando emergen nuevas evidencias.
            Las opiniones del SCCS, las restricciones REACH de la ECHA y los estudios peer-reviewed en
            PubMed son las únicas fuentes fiables para fundamentar ese conocimiento. Todo lo demás es
            marketing, no ciencia.
          </p>
        </div>

        {/* Cizura CTA */}
        <div
          className="mt-10 rounded-2xl p-6 md:p-8"
          style={{ background: "rgba(196,169,125,0.10)", border: "1px solid rgba(196,169,125,0.25)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4A97D] mb-3">
            Historial químico de cliente · Cizura
          </p>
          <p className="text-[#F5F0E8]/85 text-sm md:text-base leading-relaxed">
            Conocer los ingredientes que aplicas es solo la mitad del trabajo.{" "}
            <span className="text-[#F5F0E8] font-semibold">
              Cizura registra automáticamente qué tratamientos y productos has usado en cada cliente,
              para que tengas su historial químico completo en cada visita
            </span>{" "}
            — sin depender de tu memoria ni de una libreta.
          </p>
        </div>

        {/* Bibliography */}
        <div className="mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C4A97D] mb-4">
            Bibliografía (APA 7ª edición)
          </p>
          <ol className="space-y-2.5">
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
        </div>
      </div>

      {/* Bottom gold line */}
      <div
        className="h-0.5 w-full"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D 30%, #C4A97D 70%, transparent)" }}
      />
    </motion.section>
  );
}
