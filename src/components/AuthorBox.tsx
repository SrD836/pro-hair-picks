import { BadgeCheck } from "lucide-react";

export function AuthorBox() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-stone-200 bg-stone-50 p-5 mt-10">
      {/* Avatar */}
      <img
        src="https://ui-avatars.com/api/?name=David+G&background=b45309&color=fff&size=80&bold=true&rounded=true"
        alt="David G."
        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-semibold text-stone-800 text-base">David G.</span>
          <BadgeCheck className="h-4 w-4 text-amber-600 flex-shrink-0" aria-label="Experto verificado" />
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          David es especialista en equipamiento de salones y ayuda a barberos a optimizar
          la rentabilidad de sus negocios.
        </p>
      </div>
    </div>
  );
}
