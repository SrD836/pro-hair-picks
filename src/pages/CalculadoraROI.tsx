import { ROICalculator } from "@/components/ROICalculator";
import { SEOHead } from "@/components/seo/SEOHead";

const CalculadoraROI = () => (
  <>
    <SEOHead
      title="Calculadora ROI — Guía del Salón"
      description="Calcula el retorno de inversión de tus herramientas de peluquería. Descubre cuánto puedes ahorrar con el equipo adecuado."
    />
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="sr-only">Calculadora ROI para Peluquerías</h1>
      <section className="max-w-2xl mb-6 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-base font-semibold text-[#2D2218] mb-2">
          ¿Cómo funciona el cálculo?
        </h2>
        <p>
          La calculadora estima el retorno de inversión de tu equipamiento basándose en tu número
          de clientes activos, servicios medios por visita y tiempo de gestión actual.
          Los parámetros están calibrados con datos reales de salones españoles en 2024–2025.
        </p>
      </section>
      <ROICalculator />
      <section className="sr-only">
        <p>Calcular el ROI en peluquerías es clave para tomar decisiones de inversión fundamentadas. El retorno de inversión en equipamiento profesional depende del número de servicios realizados, el precio medio por servicio y la vida útil del equipo, factores que esta calculadora analiza con datos calibrados para el mercado español.</p>
        <p>La rentabilidad por servicio aumenta cuando el equipamiento reduce los tiempos de trabajo y mejora la calidad del resultado. Herramientas profesionales como secadores de alta potencia, planchas de temperatura controlada o maquinillas de precisión permiten atender más clientes por jornada, acelerando la amortización de la inversión.</p>
        <p>El ahorro de tiempo en peluquerías y barberías tiene un valor económico directo. Reducir diez minutos por servicio en un salón con cuarenta clientes semanales equivale a recuperar más de cien horas anuales de trabajo productivo. Esta calculadora cuantifica ese impacto para ayudarte a justificar cada inversión en equipamiento.</p>
      </section>
    </div>
  </>
);

export default CalculadoraROI;
