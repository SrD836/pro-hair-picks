import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Calendar } from "lucide-react";

interface ROICalculatorProps {
  productPrice: number;
  productName: string;
}

export function ROICalculator({ productPrice, productName }: ROICalculatorProps) {
  const [cutsPerDay, setCutsPerDay] = useState(8);
  const [pricePerCut, setPricePerCut] = useState(15);

  const dailyRevenue = cutsPerDay * pricePerCut;
  const breakEvenDays = dailyRevenue > 0 ? Math.ceil(productPrice / dailyRevenue) : 0;
  const monthlyProfit = (dailyRevenue * 22) - productPrice;
  const yearlyProfit = monthlyProfit * 12;

  return (
    <Card className="overflow-hidden border-border">
      {/* Header */}
      <div className="bg-primary p-5">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-primary-foreground" />
          <h3 className="font-display text-lg font-bold text-primary-foreground">
            ¿Cuánto ganarás con {productName}?
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cortes por día</span>
              <span className="font-bold text-foreground">{cutsPerDay}</span>
            </div>
            <Slider
              value={[cutsPerDay]}
              onValueChange={(v) => setCutsPerDay(v[0])}
              min={3}
              max={20}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio por corte</span>
              <span className="font-bold text-foreground">{pricePerCut}€</span>
            </div>
            <Slider
              value={[pricePerCut]}
              onValueChange={(v) => setPricePerCut(v[0])}
              min={10}
              max={50}
              step={1}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-accent rounded-xl p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{breakEvenDays}</p>
            <p className="text-xs text-muted-foreground">días para recuperar inversión</p>
          </div>

          <div className="bg-accent rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{monthlyProfit.toFixed(0)}€</p>
            <p className="text-xs text-muted-foreground">ganancia mensual</p>
          </div>

          <div className="bg-accent rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{yearlyProfit.toFixed(0)}€</p>
            <p className="text-xs text-muted-foreground">ganancia anual</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
