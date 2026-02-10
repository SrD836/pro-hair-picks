import { Link } from "react-router-dom";

const PoliticaCookies = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <nav className="text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Política de Cookies
    </nav>

    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Política de Cookies</h1>
    <p className="text-sm text-muted-foreground mb-8">Última actualización: febrero 2026</p>

    <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">1. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet, smartphone) cuando visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un periodo de tiempo.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">2. Tipos de cookies que utilizamos</h2>

        <h3 className="font-display text-lg font-semibold text-foreground mt-4 mb-2">a) Cookies técnicas (necesarias)</h3>
        <p>Son esenciales para el funcionamiento del sitio web. Incluyen cookies de sesión y de consentimiento de cookies. No requieren consentimiento.</p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border border-border rounded-lg">
            <thead><tr className="bg-muted"><th className="p-2 text-left">Cookie</th><th className="p-2 text-left">Finalidad</th><th className="p-2 text-left">Duración</th></tr></thead>
            <tbody>
              <tr className="border-t border-border"><td className="p-2">cookie_consent</td><td className="p-2">Almacena preferencias de cookies</td><td className="p-2">1 año</td></tr>
              <tr className="border-t border-border"><td className="p-2">sb-*</td><td className="p-2">Sesión de autenticación (Supabase)</td><td className="p-2">Sesión</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-2">b) Cookies analíticas</h3>
        <p>Nos permiten analizar el comportamiento de los usuarios para mejorar el sitio. Utilizamos Google Analytics.</p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border border-border rounded-lg">
            <thead><tr className="bg-muted"><th className="p-2 text-left">Cookie</th><th className="p-2 text-left">Proveedor</th><th className="p-2 text-left">Duración</th></tr></thead>
            <tbody>
              <tr className="border-t border-border"><td className="p-2">_ga</td><td className="p-2">Google Analytics</td><td className="p-2">2 años</td></tr>
              <tr className="border-t border-border"><td className="p-2">_gid</td><td className="p-2">Google Analytics</td><td className="p-2">24 horas</td></tr>
              <tr className="border-t border-border"><td className="p-2">_gat</td><td className="p-2">Google Analytics</td><td className="p-2">1 minuto</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground mt-6 mb-2">c) Cookies publicitarias</h3>
        <p>Utilizadas por Google AdSense y redes publicitarias asociadas para mostrar anuncios relevantes basados en sus intereses.</p>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border border-border rounded-lg">
            <thead><tr className="bg-muted"><th className="p-2 text-left">Cookie</th><th className="p-2 text-left">Proveedor</th><th className="p-2 text-left">Duración</th></tr></thead>
            <tbody>
              <tr className="border-t border-border"><td className="p-2">DART</td><td className="p-2">Google AdSense</td><td className="p-2">13 meses</td></tr>
              <tr className="border-t border-border"><td className="p-2">IDE</td><td className="p-2">Google DoubleClick</td><td className="p-2">13 meses</td></tr>
              <tr className="border-t border-border"><td className="p-2">NID</td><td className="p-2">Google</td><td className="p-2">6 meses</td></tr>
              <tr className="border-t border-border"><td className="p-2">__gads</td><td className="p-2">Google AdSense</td><td className="p-2">13 meses</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">3. ¿Cómo desactivar las cookies?</h2>
        <p>Puede configurar su navegador para bloquear o eliminar cookies:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
          <li><strong>Mozilla Firefox:</strong> Opciones → Privacidad y Seguridad → Cookies y datos del sitio</li>
          <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</li>
          <li><strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio</li>
        </ul>
        <p className="mt-2">Para gestionar las cookies de Google específicamente, visite: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de anuncios de Google</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">4. Consentimiento</h2>
        <p>Al acceder a este sitio web por primera vez, se le mostrará un banner informativo sobre el uso de cookies. Puede aceptar todas las cookies, rechazarlas o configurar sus preferencias. Su consentimiento se almacenará durante 1 año, tras el cual se le solicitará nuevamente.</p>
        <p>Puede modificar sus preferencias en cualquier momento desde el enlace "Configurar cookies" disponible en el pie de página del sitio.</p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">5. Más información</h2>
        <p>Para más información sobre el uso de cookies y publicidad, consulte:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cómo utiliza Google las cookies en publicidad</a></li>
          <li><a href="https://www.aepd.es/guias/guia-uso-cookies.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Guía sobre el uso de cookies (AEPD)</a></li>
          <li>Nuestra <Link to="/politica-privacidad" className="text-primary hover:underline">Política de Privacidad</Link></li>
        </ul>
      </section>
    </div>
  </div>
);

export default PoliticaCookies;
