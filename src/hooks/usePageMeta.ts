import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "GuiaDelSalon.com — Los Mejores Productos de Peluquería Profesional",
    description: "Rankings y comparativas de los mejores productos profesionales para peluquería y barbería en España. Seleccionado por profesionales.",
  },
  "/politica-privacidad": {
    title: "Política de Privacidad — GuiaDelSalon.com",
    description: "Información sobre cómo tratamos tus datos personales, cookies de Google AdSense y tus derechos RGPD.",
  },
  "/politica-cookies": {
    title: "Política de Cookies — GuiaDelSalon.com",
    description: "Información sobre las cookies que utilizamos: técnicas, analíticas y publicitarias de Google AdSense.",
  },
  "/terminos": {
    title: "Términos y Condiciones — GuiaDelSalon.com",
    description: "Términos de uso del sitio web, información sobre enlaces de afiliados de Amazon y limitación de responsabilidad.",
  },
  "/sobre-nosotros": {
    title: "Sobre Nosotros — GuiaDelSalon.com",
    description: "Conoce nuestra misión: ayudar a profesionales de peluquería y barbería a elegir los mejores productos.",
  },
  "/contacto": {
    title: "Contacto — GuiaDelSalon.com",
    description: "Contacta con nosotros para consultas, sugerencias o colaboraciones. Respondemos en 24-48 horas.",
  },
  "/gestionar-mi-local": {
    title: "Gestionar mi Local — GuiaDelSalon.com",
    description: "Ranking de los mejores softwares de gestión para peluquerías y barberías en España.",
  },
};

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[pathname];
    if (meta) {
      document.title = meta.title;
      const descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", meta.description);
    }
  }, [pathname]);
}
