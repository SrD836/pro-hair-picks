import { Info } from "lucide-react";

export function DisclaimerAI() {
  return (
    <div className="flex items-start gap-3 rounded-r-lg border-l-4 border-amber-500 bg-amber-50/50 px-4 py-3 mt-4">
      <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-stone-600 leading-relaxed">
        <span className="font-medium text-stone-700">Nota editorial:</span> En Guía del Salón
        utilizamos IA para estructurar especificaciones técnicas, pero cada recomendación es
        revisada minuciosamente por nuestro equipo de expertos para garantizar su precisión.
      </p>
    </div>
  );
}
