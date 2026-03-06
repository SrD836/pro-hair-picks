import { ROICalculator } from "@/components/ROICalculator";
import { SEOHead } from "@/components/seo/SEOHead";

const CalculadoraROI = () => (
  <>
    <SEOHead
      title="Calculadora ROI — Guía del Salón"
      description="Calcula el retorno de inversión de tus herramientas de peluquería. Descubre cuánto puedes ahorrar con el equipo adecuado."
    />
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <section className="max-w-2xl mb-6 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-base font-semibold text-[#2D2218] mb-2">
          ¿Cómo funciona el cálculo?
        </h2>
        <p>
          La calculadora estima el retorno de inversión de Cizura basándose en tu número
          de clientes activos, servicios medios por visita y tiempo de gestión actual.
          Los parámetros están calibrados con datos reales de salones españoles en 2024–2025.
        </p>
      </section>
      <ROICalculator />
    </div>
  </>
);

export default CalculadoraROI;
