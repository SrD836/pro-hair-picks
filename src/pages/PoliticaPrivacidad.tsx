import { Link } from "react-router-dom";

const PoliticaPrivacidad = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <nav className="text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Política de Privacidad
    </nav>

    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Política de Privacidad</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero 2026</p>

    <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">1. Responsable del tratamiento</h2>
        <p>El responsable del tratamiento de los datos personales recogidos en este sitio web es <strong>David [Apellido]</strong>, con domicilio en España. Para cualquier consulta relacionada con la privacidad, puede contactar en: <a href="mailto:contacto@guiadelsalon.es" className="text-secondary hover:underline">contacto@guiadelsalon.es</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">2. Datos que recopilamos</h2>
        <p>En GuiaDelSalon.es recopilamos los siguientes tipos de información:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia y comportamiento de navegación.</li>
          <li><strong>Datos de contacto:</strong> nombre, correo electrónico y mensaje cuando utiliza nuestro formulario de contacto.</li>
          <li><strong>Cookies y tecnologías similares:</strong> tanto propias como de terceros (Google AdSense, Google Analytics). Consulte nuestra <Link to="/politica-cookies" className="text-secondary hover:underline">Política de Cookies</Link> para más detalles.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">3. Finalidad del tratamiento</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Gestionar las consultas enviadas a través del formulario de contacto.</li>
          <li>Analizar el uso del sitio web para mejorar nuestro contenido y experiencia de usuario.</li>
          <li>Mostrar anuncios personalizados a través de Google AdSense y redes publicitarias asociadas.</li>
          <li>Cumplir con obligaciones legales aplicables.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">4. Google AdSense y publicidad</h2>
        <p>Este sitio web utiliza Google AdSense, un servicio de publicidad proporcionado por Google LLC. Google AdSense utiliza cookies para mostrar anuncios relevantes basados en sus visitas a este sitio y a otros sitios de Internet.</p>
        <p>Google utiliza la cookie DART y otras tecnologías para personalizar los anuncios según las visitas previas del usuario a nuestro sitio y a otros sitios web. Puede obtener más información sobre cómo Google utiliza los datos en: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">https://policies.google.com/technologies/ads</a>.</p>
        <p><strong>Proveedores publicitarios de terceros:</strong> además de Google, otros proveedores de redes publicitarias pueden utilizar cookies, web beacons y tecnologías similares para medir la efectividad de los anuncios y personalizar su contenido.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">5. Derecho de opt-out (exclusión voluntaria)</h2>
        <p>Puede optar por no recibir anuncios personalizados visitando la <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">configuración de anuncios de Google</a> o la página de exclusión voluntaria de la <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Network Advertising Initiative</a>.</p>
        <p>También puede configurar su navegador para rechazar cookies o alertarle cuando se envían cookies. Sin embargo, algunas partes del sitio pueden no funcionar correctamente si desactiva las cookies.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">6. Base legal del tratamiento (RGPD)</h2>
        <p>De conformidad con el Reglamento General de Protección de Datos (UE) 2016/679 y la Ley Orgánica 3/2018, de Protección de Datos Personales (LOPDGDD), las bases legales para el tratamiento son:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Consentimiento:</strong> para el uso de cookies publicitarias y analíticas (Art. 6.1.a RGPD).</li>
          <li><strong>Interés legítimo:</strong> para el análisis estadístico y mejora del servicio (Art. 6.1.f RGPD).</li>
          <li><strong>Ejecución de contrato:</strong> para responder a sus consultas de contacto (Art. 6.1.b RGPD).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">7. Derechos del usuario</h2>
        <p>De acuerdo con la legislación vigente, usted tiene derecho a:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acceder a sus datos personales.</li>
          <li>Rectificar datos inexactos.</li>
          <li>Solicitar la supresión de sus datos.</li>
          <li>Oponerse al tratamiento de sus datos.</li>
          <li>Solicitar la limitación del tratamiento.</li>
          <li>Solicitar la portabilidad de sus datos.</li>
        </ul>
        <p className="mt-2">Para ejercer estos derechos, contacte con nosotros en <a href="mailto:contacto@guiadelsalon.es" className="text-secondary hover:underline">contacto@guiadelsalon.es</a>. También tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">www.aepd.es</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">8. Conservación de datos</h2>
        <p>Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados, y mientras no se solicite su supresión. Los datos de contacto se conservarán durante un máximo de 2 años desde la última interacción.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">9. Transferencias internacionales</h2>
        <p>Google LLC puede transferir datos a servidores ubicados en Estados Unidos. Google se adhiere al marco de privacidad UE-EE.UU. (Data Privacy Framework) para garantizar un nivel adecuado de protección de datos.</p>
      </section>
    </div>
  </div>
);

export default PoliticaPrivacidad;
