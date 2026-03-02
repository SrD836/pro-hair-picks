import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const SEOHead = ({
  title = "Guía del Salón — Equipamiento Profesional de Peluquería",
  description = "Rankings honestos, precios reales y herramientas para profesionales del salón.",
  ogImage = "https://guiadelsalon.com/og-default.jpg",
  noIndex = false,
}: SEOHeadProps) => {
  const { pathname } = useLocation();
  const canonical = `https://guiadelsalon.com${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};
