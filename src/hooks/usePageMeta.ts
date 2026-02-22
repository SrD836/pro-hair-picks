import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://guiadelsalon.com";

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "GuiaDelSalon.com — Los Mejores Productos de Peluquería Profesional",
    description: "Rankings y comparativas de los mejores productos profesionales para peluquería y barbería en España. Seleccionado por profesionales.",
  },
  "/blog": {
    title: "Blog | Guía del Salón",
    description: "Consejos, tendencias y guías para profesionales del salón. Artículos sobre técnicas, productos y negocio.",
  },
  "/comparar": {
    title: "Comparar Productos | Guía del Salón",
    description: "Compara productos profesionales de peluquería y barbería lado a lado. Precios, características y especificaciones técnicas.",
  },
  "/quiz": {
    title: "Recomendador de Productos | Guía del Salón",
    description: "Encuentra el producto perfecto para tu salón con nuestro quiz personalizado. Responde 4 preguntas y obtén recomendaciones.",
  },
  "/calculadora-roi": {
    title: "Calculadora ROI | Guía del Salón",
    description: "Calcula el retorno de inversión de tus herramientas de peluquería. Descubre cuánto puedes ahorrar con el equipo adecuado.",
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
  "/calculadora-precio": {
    title: "Calculadora de Precios para Barberos — GuiaDelSalon.com",
    description: "Calcula el precio ideal de tus servicios de barbería. Herramienta gratuita para barberos profesionales.",
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

    // Canonical tag
    const canonical = SITE_ORIGIN + pathname;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
  }, [pathname]);
}
