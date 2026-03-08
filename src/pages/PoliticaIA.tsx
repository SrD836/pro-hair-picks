import { Link } from "react-router-dom";

const PoliticaIA = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <nav className="text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Política de Inteligencia Artificial
    </nav>

    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Política de Inteligencia Artificial</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: marzo 2026</p>

    <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">1. ¿Cómo usamos la Inteligencia Artificial?</h2>
        <p>GuiaDelSalon.com utiliza modelos de inteligencia artificial avanzados —incluyendo <strong>Claude de Anthropic</strong> y <strong>Gemini e Imagen 3 de Google</strong>— en los siguientes contextos:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Generación y enriquecimiento de contenido editorial:</strong> los artículos del blog pueden ser redactados o mejorados con asistencia de IA, siempre bajo revisión humana.</li>
          <li><strong>Herramientas de diagnóstico capilar:</strong> el motor de análisis del Analizador de Canicie, el Diagnóstico de Alopecia y el Asesor de Color está desarrollado sobre modelos de lenguaje.</li>
          <li><strong>Generación de imágenes para redes sociales:</strong> las imágenes de los Pins de Pinterest se crean con Google Imagen 3 a partir de prompts basados en el contenido del sitio.</li>
          <li><strong>Optimización de metadatos SEO:</strong> los títulos y descripciones de página pueden generarse o mejorarse con asistencia de IA.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">2. Supervisión humana obligatoria</h2>
        <p>Todo el contenido generado con IA pasa por un proceso de <strong>revisión editorial humana</strong> antes de publicarse. Aplicamos los siguientes principios:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Las herramientas de diagnóstico capilar están supervisadas por criterios técnicos contrastados con fuentes especializadas en tricología y dermatología capilar.</li>
          <li>Ninguna decisión automatizada afecta a los usuarios sin intervención humana.</li>
          <li>Los resultados de las herramientas son <strong>meramente orientativos</strong> y no sustituyen el criterio de un profesional cualificado.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">3. Transparencia sobre el contenido generado con IA</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Los artículos del blog pueden haber sido redactados o enriquecidos con asistencia de IA.</li>
          <li>Las comparativas de productos combinan datos verificados de fabricantes con análisis asistido por IA.</li>
          <li>Nos comprometemos a no publicar información fabricada (<em>alucinaciones</em>) gracias a nuestro proceso de revisión editorial.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">4. Privacidad y datos en el uso de IA</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Las conversaciones con las herramientas de diagnóstico <strong>no se almacenan de forma identificable</strong> ni se envían a terceros con fines de entrenamiento.</li>
          <li>Los datos introducidos en los formularios de diagnóstico se procesan en tiempo real y no se retienen una vez cerrada la sesión.</li>
          <li>Para más información, consulte nuestra <Link to="/politica-privacidad" className="text-secondary hover:underline">Política de Privacidad</Link>.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">5. Modelos de IA utilizados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Proveedor</th>
                <th className="text-left py-2 pr-4 font-semibold">Modelo</th>
                <th className="text-left py-2 font-semibold">Uso en GuiaDelSalon.com</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-4">Anthropic</td>
                <td className="py-2 pr-4">Claude (Sonnet)</td>
                <td className="py-2">Generación de contenido editorial y blog</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Google</td>
                <td className="py-2 pr-4">Gemini / Imagen 3</td>
                <td className="py-2">Generación de imágenes para redes sociales</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Anthropic</td>
                <td className="py-2 pr-4">Claude (Sonnet)</td>
                <td className="py-2">Motor de las herramientas de diagnóstico capilar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">6. Compromiso ético</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No utilizamos IA para generar opiniones falsas de productos ni reseñas inventadas.</li>
          <li>No automatizamos interacciones con usuarios haciéndolas pasar por humanas.</li>
          <li>Cumplimos con el <strong>Reglamento Europeo de Inteligencia Artificial (AI Act)</strong> en su aplicación progresiva.</li>
          <li>Revisamos periódicamente nuestros procesos de IA para garantizar precisión y responsabilidad.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">7. Contacto</h2>
        <p>
          Para cualquier pregunta sobre el uso de la inteligencia artificial en esta web, puede contactarnos en{" "}
          <a href="mailto:contacto@guiadelsalon.com" className="text-secondary hover:underline">
            contacto@guiadelsalon.com
          </a>{" "}
          o a través de nuestro{" "}
          <Link to="/contacto" className="text-secondary hover:underline">
            formulario de contacto
          </Link>.
        </p>
      </section>

    </div>
  </div>
);

export default PoliticaIA;
