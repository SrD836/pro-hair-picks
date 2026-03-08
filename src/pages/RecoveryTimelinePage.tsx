import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Droplets, Calendar, Shield, Leaf } from "lucide-react";
import RecoveryTimeline from "@/components/RecoveryTimeline";
import RecoveryExpertVerdict from "@/components/RecoveryExpertVerdict";
import { ToolHeader } from "@/components/mi-pelo/shared/ToolHeader";
import { BibliographyDrawer, type BibReference } from "@/components/mi-pelo/shared/BibliographyDrawer";
import { useState } from "react";

const REFERENCES: BibReference[] = [
  { id: 1, text: "Bolduc, C. & Shapiro, J. (2022). Hair care products and recovery protocols. Surgical & Cosmetic Dermatology." },
  { id: 2, text: "Robbins, C.R. (2023). Chemical and Physical Behavior of Human Hair. Springer, 6th ed." },
  { id: 3, text: "Gavazzoni Dias, M.F.R. (2015). Hair Cosmetics: An Overview. Int. J. Trichology, 7(1), 2–15." },
];

export default function RecoveryTimelinePage() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <SEOHead
        title="Calculadora de Recuperación Capilar — GuiaDelSalon"
        description="Genera tu calendario personalizado de recuperación capilar. Basado en nivel de daño, porosidad y último tratamiento."
      />

      <div className="min-h-screen bg-espresso">
        {!started ? (
          <>
            <ToolHeader
              badge="CIENTÍFICO"
              title={<>Calculadora de <span className="text-gold">Recuperación Capilar</span></>}
              subtitle="Basada en nivel de daño real, no en estimaciones. Tu cabello tiene un reloj biológico — este calendario lo respeta."
              microTrust="~4 min · Sin registro · Basado en datos de SCCS y CIR"
              onStart={() => setStarted(true)}
              startLabel="Generar mi calendario →"
            />

            {/* Module preview */}
            <div className="max-w-4xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Droplets, title: "Hidratación", desc: "Recupera la humedad perdida" },
                  { icon: Shield, title: "Reconstrucción", desc: "Repara la estructura interna" },
                  { icon: Leaf, title: "Sellado", desc: "Cierra la cutícula dañada" },
                  { icon: Calendar, title: "Mantenimiento", desc: "Protocolo a largo plazo" },
                ].map((m) => (
                  <div key={m.title} className="flex items-center gap-4 p-5 rounded-xl border border-gold/20 bg-espresso/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold shrink-0">
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-cream text-sm">{m.title}</p>
                      <p className="text-cream/50 text-xs mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <BibliographyDrawer references={REFERENCES} />
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
            <RecoveryTimeline />
            <RecoveryExpertVerdict />
            <BibliographyDrawer references={REFERENCES} />
          </div>
        )}
      </div>
    </>
  );
}
