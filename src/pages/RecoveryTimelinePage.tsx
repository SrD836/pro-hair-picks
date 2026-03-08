import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Droplets, Calendar, Shield, Leaf } from "lucide-react";
import RecoveryTimeline from "@/components/RecoveryTimeline";
import RecoveryExpertVerdict from "@/components/RecoveryExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useWizardReturn } from "@/hooks/useWizardReturn";
import { useState } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "Bolduc, C. & Shapiro, J. (2022). Hair care products and recovery protocols. Surgical & Cosmetic Dermatology." },
  { id: 2, text: "Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair. Springer, 6th ed." },
  { id: 3, text: "Gavazzoni Dias, M.F.R. (2015). Hair Cosmetics: An Overview. Int. J. Trichology, 7(1), 2–15." },
];

const MODULES = [
  { icon: Droplets, title: "Hidratación", desc: "Recupera la humedad perdida" },
  { icon: Shield, title: "Reconstrucción", desc: "Repara la estructura interna" },
  { icon: Leaf, title: "Sellado", desc: "Cierra la cutícula dañada" },
  { icon: Calendar, title: "Mantenimiento", desc: "Protocolo a largo plazo" },
];

export default function RecoveryTimelinePage() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <SEOHead
        title="Calculadora de Recuperación Capilar — GuiaDelSalon"
        description="Genera tu calendario personalizado de recuperación capilar."
      />

      <div className="min-h-screen bg-background-light">
        {!started ? (
          <>
            <ToolHeader
              badge="CIENTÍFICO"
              title={<>Calculadora de <span className="text-accent-orange">Recuperación Capilar</span></>}
              subtitle="Basada en nivel de daño real, no en estimaciones. Tu cabello tiene un reloj biológico — este calendario lo respeta."
              microTrust="~4 min · Sin registro · Basado en datos de SCCS y CIR"
              onStart={() => setStarted(true)}
              startLabel="Generar mi calendario →"
            />

            <div className="max-w-3xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-espresso/8 bg-white hover:shadow-bento transition-all duration-300"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-orange/10">
                      <m.icon className="w-7 h-7 text-accent-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-espresso text-base mb-1">{m.title}</p>
                      <p className="text-espresso/40 text-sm">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </>
        ) : (
          <div className="bg-background-light min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStarted(false)}
                className="text-espresso/40 hover:text-espresso text-sm transition-colors"
              >
                ← Volver
              </motion.button>
              <RecoveryTimeline />
              <RecoveryExpertVerdict />
              <BibliographyDrawer references={REFERENCES} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
