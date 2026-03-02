import { ROICalculator } from "@/components/ROICalculator";
import { SEOHead } from "@/components/seo/SEOHead";

const CalculadoraROI = () => (
  <>
    <SEOHead
      title="Calculadora ROI — Guía del Salón"
      description="Calcula el retorno de inversión de tus herramientas de peluquería. Descubre cuánto puedes ahorrar con el equipo adecuado."
    />
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <ROICalculator />
    </div>
  </>
);

export default CalculadoraROI;
