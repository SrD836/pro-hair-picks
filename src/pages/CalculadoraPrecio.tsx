import { useState } from "react";
import { Calculator } from "lucide-react";

function calcularPrecio(gastos: number, servicios: number, margen: number): number | null {
  if (!servicios || servicios <= 0) return null;
  if (margen >= 100 || margen < 0) return null;
  return gastos / servicios / (1 - margen / 100);
}

export default function CalculadoraPrecio() {
  const [gastos, setGastos] = useState<string>("");
  const [servicios, setServicios] = useState<string>("");
  const [margen, setMargen] = useState<string>("30");

  const gastosNum = parseFloat(gastos) || 0;
  const serviciosNum = parseInt(servicios) || 0;
  const margenNum = parseFloat(margen) || 0;

  const precio = calcularPrecio(gastosNum, serviciosNum, margenNum);
  const costePorServicio = serviciosNum > 0 ? gastosNum / serviciosNum : null;
  const puntoEquilibrio = precio !== null && serviciosNum > 0
    ? gastosNum / precio
    : null;

  const isValid = gastosNum > 0 && serviciosNum > 0 && margenNum >= 0 && margenNum < 100;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-7 w-7 text-amber-600" />
          <h1 className="text-2xl font-bold text-stone-800">Calculadora de Precio por Servicio</h1>
        </div>
        <p className="text-stone-500 text-sm mb-8">
          Calcula el precio mínimo que debes cobrar por cada servicio para cubrir tus costes y alcanzar tu margen de beneficio.
        </p>

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
          {/* Gastos fijos */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Gastos fijos mensuales (€)
            </label>
            <p className="text-xs text-stone-400 mb-2">Alquiler, suministros, productos, seguros, etc.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium">€</span>
              <input
                type="number"
                min="0"
                step="10"
                value={gastos}
                onChange={(e) => setGastos(e.target.value)}
                placeholder="2500"
                className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-stone-200 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Servicios al mes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Número de servicios al mes
            </label>
            <p className="text-xs text-stone-400 mb-2">Cortes + afeitados + otros servicios estimados.</p>
            <input
              type="number"
              min="1"
              step="1"
              value={servicios}
              onChange={(e) => setServicios(e.target.value)}
              placeholder="200"
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
            />
          </div>

          {/* Margen de beneficio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-stone-700">
                Margen de beneficio deseado
              </label>
              <span className="text-sm font-semibold text-amber-600">{margen || 0}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="1"
              value={margen}
              onChange={(e) => setMargen(e.target.value)}
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>20%</span>
              <span>40%</span>
              <span>60%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {isValid && precio !== null ? (
          <div className="mt-6 space-y-4">
            {/* Precio recomendado — highlighted */}
            <div className="bg-amber-600 rounded-2xl p-6 text-center shadow-md">
              <p className="text-amber-100 text-sm font-medium uppercase tracking-wider mb-1">
                Precio mínimo por servicio
              </p>
              <p className="text-5xl font-bold text-white">
                {precio.toFixed(2)} €
              </p>
              <p className="text-amber-200 text-xs mt-2">
                Con {margenNum}% de margen de beneficio
              </p>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Coste por servicio</p>
                <p className="text-2xl font-bold text-stone-700">
                  {costePorServicio !== null ? `${costePorServicio.toFixed(2)} €` : "—"}
                </p>
                <p className="text-xs text-stone-400 mt-1">Sin margen</p>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Punto de equilibrio</p>
                <p className="text-2xl font-bold text-stone-700">
                  {puntoEquilibrio !== null ? `${Math.ceil(puntoEquilibrio)} serv.` : "—"}
                </p>
                <p className="text-xs text-stone-400 mt-1">Al precio calculado</p>
              </div>
            </div>

            <p className="text-xs text-stone-400 text-center px-4">
              Fórmula: precio = (gastos ÷ servicios) ÷ (1 − margen). Esta calculadora es orientativa.
            </p>
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center">
            <Calculator className="h-10 w-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">
              Completa los campos de arriba para ver el precio recomendado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
