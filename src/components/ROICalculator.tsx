import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, Calendar, Euro } from "lucide-react";

export function ROICalculator() {
  const [equipPrice, setEquipPrice] = useState(200);
  const [servicesPerWeek, setServicesPerWeek] = useState(3);
  const [pricePerService, setPricePerService] = useState(25);
  const [weeksPerYear, setWeeksPerYear] = useState(48);

  const weeklyRevenue = servicesPerWeek * pricePerService;
  const annualRevenue = weeklyRevenue * weeksPerYear;
  const monthsToPayoff = weeklyRevenue > 0 ? equipPrice / weeklyRevenue / 4.3 : 0;
  const roiPercent = equipPrice > 0 ? ((annualRevenue - equipPrice) / equipPrice) * 100 : 0;
  const roiPositive = roiPercent >= 0;

  const sliderRow = (
    label: string,
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number,
    step: number,
    suffix = ""
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!isNaN(n)) setValue(Math.max(min, Math.min(max, n)));
            }}
            className="w-20 h-8 text-right text-sm font-bold px-2"
          />
          {suffix && <span className="text-muted-foreground text-sm">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => setValue(v[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );

  return (
    <Card className="overflow-hidden border-border" id="roi">
      <div className="bg-primary p-5">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-primary-foreground" />
          <h3 className="font-display text-lg font-bold text-primary-foreground">
            Calculadora de Retorno de Inversión
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sliderRow("Precio del equipo", equipPrice, setEquipPrice, 10, 2000, 10, "€")}
          {sliderRow("Servicios extra por semana", servicesPerWeek, setServicesPerWeek, 1, 30, 1)}
          {sliderRow("Precio medio por servicio", pricePerService, setPricePerService, 5, 100, 1, "€")}
          {sliderRow("Semanas de trabajo al año", weeksPerYear, setWeeksPerYear, 20, 52, 1)}
        </div>

        {/* Hero result */}
        <div className={`rounded-xl p-6 text-center ${roiPositive ? "bg-green-500/10" : "bg-destructive/10"}`}>
          <Calendar className={`w-7 h-7 mx-auto mb-2 ${roiPositive ? "text-green-600" : "text-destructive"}`} />
          <p className={`text-4xl font-bold ${roiPositive ? "text-green-600" : "text-destructive"}`}>
            {monthsToPayoff.toFixed(1)} meses
          </p>
          <p className="text-sm text-muted-foreground mt-1">para amortizar tu inversión</p>
        </div>

        {/* Secondary results */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-accent rounded-xl p-4 text-center">
            <Euro className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{weeklyRevenue}€</p>
            <p className="text-xs text-muted-foreground">ingresos extra / semana</p>
          </div>
          <div className="bg-accent rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{annualRevenue.toLocaleString()}€</p>
            <p className="text-xs text-muted-foreground">ingresos extra / año</p>
          </div>
          <div className="bg-accent rounded-xl p-4 text-center">
            <TrendingUp className={`w-5 h-5 mx-auto mb-1 ${roiPositive ? "text-green-600" : "text-destructive"}`} />
            <p className={`text-xl font-bold ${roiPositive ? "text-green-600" : "text-destructive"}`}>
              {roiPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">ROI primer año</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
