import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getSnapshotMeta } from "@/data/metaSnapshot";

const DEFAULT_TITLE = "Guía del Salón — Equipamiento Profesional de Peluquería";
const DEFAULT_DESC  = "Rankings honestos, precios reales y herramientas para profesionales del salón.";

const STATIC_ROUTE_META: Record<string, { title: string; description: string }> = {
  "/blog": {
    title: "Blog | Guía del Salón",
    description: "Consejos, tendencias y guías para profesionales del salón.",
  },
  "/comparar": {
    title: "Comparar Productos | Guía del Salón",
    description: "Compara productos profesionales de peluquería y barbería lado a lado.",
  },
  "/calculadora-roi": {
    title: "Calculadora ROI | Guía del Salón",
    description: "Calcula el retorno de inversión de tus herramientas de peluquería.",
  },
  "/calculadora-precio": {
    title: "Calculadora de Precios para Barberos — GuiaDelSalon.com",
    description: "Calcula el precio ideal de tus servicios de barbería.",
  },
  "/gestionar-mi-local": {
    title: "Gestionar mi Local — GuiaDelSalon.com",
    description: "Ranking de los mejores softwares de gestión para peluquerías.",
  },
  "/politica-privacidad": {
    title: "Política de Privacidad — GuiaDelSalon.com",
    description: "Información sobre cómo tratamos tus datos personales y tus derechos RGPD.",
  },
  "/politica-cookies": {
    title: "Política de Cookies — GuiaDelSalon.com",
    description: "Información sobre las cookies que utilizamos.",
  },
  "/terminos": {
    title: "Términos y Condiciones — GuiaDelSalon.com",
    description: "Términos de uso del sitio web e información sobre enlaces de afiliados.",
  },
  "/sobre-nosotros": {
    title: "Sobre Nosotros — GuiaDelSalon.com",
    description: "Conoce nuestra misión: ayudar a profesionales de peluquería a elegir los mejores productos.",
  },
  "/contacto": {
    title: "Contacto — GuiaDelSalon.com",
    description: "Contacta con nosotros para consultas, sugerencias o colaboraciones.",
  },
  "/quiz": {
    title: "Recomendador de Productos | Guía del Salón",
    description: "Encuentra el producto perfecto para tu salón con nuestro quiz personalizado.",
  },
};

const MAX_TITLE = 60;

/** Clamps any title to MAX_TITLE chars, truncating at word boundary before " | ". */
function clampTitle(t: string): string {
  if (t.length <= MAX_TITLE) return t;
  const sep = t.lastIndexOf(" | ");
  if (sep === -1) return t.slice(0, MAX_TITLE - 1) + "…";
  const brand = t.slice(sep);                          // " | Guía del Salón"
  const maxRaw = MAX_TITLE - brand.length - 1;         // room for "…"
  const raw = t.slice(0, sep);
  const truncated = raw.slice(0, maxRaw + 1).replace(/\s+\S*$/, "") || raw.slice(0, maxRaw);
  return `${truncated}…${brand}`;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonical?: string;
  hreflang?: string;
}

export const SEOHead = ({
  title,
  description,
  ogImage = "https://guiadelsalon.com/og-default.jpg",
  noIndex = false,
  canonical: canonicalProp,
  hreflang,
}: SEOHeadProps) => {
  const { pathname } = useLocation();

  const cleanPath    = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const canonicalUrl = canonicalProp ?? `https://guiadelsalon.com${cleanPath}`;

  // Priority: explicit prop → static route → snapshot (bundled, synchronous) → default
  const staticEntry   = STATIC_ROUTE_META[cleanPath];
  const snapshotEntry = getSnapshotMeta(cleanPath);
  const rawTitle         = title       ?? staticEntry?.title       ?? snapshotEntry?.title       ?? DEFAULT_TITLE;
  const finalTitle       = clampTitle(rawTitle);
  const finalDescription = description ?? staticEntry?.description ?? snapshotEntry?.description ?? DEFAULT_DESC;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      {hreflang && <link rel="alternate" hreflang={hreflang} href={canonicalUrl} />}
      {hreflang && <link rel="alternate" hreflang="x-default" href={canonicalUrl} />}
    </Helmet>
  );
};
