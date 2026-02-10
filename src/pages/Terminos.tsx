import { Link } from "react-router-dom";

const Terminos = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <nav className="text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Términos y Condiciones
    </nav>

    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Términos y Condiciones</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero 2026</p>

    <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">1. Información general</h2>
        <p>El presente sitio web, <strong>ProBarber.es</strong>, es propiedad de David [Apellido], con domicilio en España. El acceso y uso de este sitio web implica la aceptación de los presentes Términos y Condiciones.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">2. Uso del sitio web</h2>
        <p>El usuario se compromete a utilizar el sitio web de forma diligente, correcta y lícita. Queda prohibido:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Utilizar el contenido con fines comerciales sin autorización.</li>
          <li>Modificar, copiar o distribuir el contenido sin consentimiento previo.</li>
          <li>Intentar acceder de forma no autorizada a los sistemas del sitio.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">3. Enlaces de afiliados</h2>
        <p>ProBarber.es participa en el <strong>Programa de Afiliados de Amazon EU</strong> (Amazon Associates), un programa de publicidad diseñado para proporcionar un medio para que los sitios web ganen comisiones por publicidad mediante enlaces a Amazon.es.</p>
        <p>Cuando hace clic en un enlace de producto y realiza una compra en Amazon.es, podemos recibir una pequeña comisión sin coste adicional para usted. Esta comisión nos ayuda a mantener el sitio web y a seguir creando contenido de calidad.</p>
        <p>Los precios mostrados se actualizan periódicamente pero pueden variar. El precio final siempre será el que aparezca en Amazon.es en el momento de la compra.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">4. Disclaimer profesional</h2>
        <p className="bg-accent p-4 rounded-lg border border-border"><strong>Importante:</strong> El contenido publicado en ProBarber.es tiene carácter meramente informativo y orientativo. No somos profesionales médicos, dermatólogos ni especialistas sanitarios. Nuestras recomendaciones se basan en análisis de características técnicas, opiniones de usuarios y pruebas de productos, pero no sustituyen el asesoramiento profesional.</p>
        <p>Si tiene alguna condición médica o dermatológica, consulte con un profesional cualificado antes de utilizar cualquier producto recomendado en este sitio.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">5. Propiedad intelectual</h2>
        <p>Todo el contenido de este sitio web, incluyendo pero no limitado a textos, gráficos, logotipos, iconos, imágenes, compilaciones de datos y software, es propiedad de ProBarber.es o de sus respectivos propietarios y está protegido por las leyes de propiedad intelectual españolas e internacionales.</p>
        <p>Las marcas comerciales, nombres de productos y logotipos mencionados (Amazon, Wahl, BaByliss, etc.) pertenecen a sus respectivos propietarios y se utilizan únicamente con fines informativos.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">6. Limitación de responsabilidad</h2>
        <p>ProBarber.es no se responsabiliza de:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Posibles inexactitudes en los precios, características o disponibilidad de los productos mostrados.</li>
          <li>Decisiones de compra tomadas basándose en nuestro contenido.</li>
          <li>Problemas con productos adquiridos a través de enlaces de afiliados (la responsabilidad recae en el vendedor).</li>
          <li>El contenido o las prácticas de privacidad de sitios web de terceros enlazados.</li>
          <li>Interrupciones del servicio o errores técnicos.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">7. Legislación aplicable</h2>
        <p>Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia, ambas partes se someten a los juzgados y tribunales de la ciudad de domicilio del titular del sitio web.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">8. Contacto</h2>
        <p>Para cualquier consulta sobre estos términos, puede contactar con nosotros en <a href="mailto:contacto@probarber.es" className="text-primary hover:underline">contacto@probarber.es</a> o a través de nuestro <Link to="/contacto" className="text-primary hover:underline">formulario de contacto</Link>.</p>
      </section>
    </div>
  </div>
);

export default Terminos;
