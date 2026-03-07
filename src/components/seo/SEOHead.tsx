import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

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

interface SnapshotEntry { title: string; description: string; }
interface Snapshot {
  blog: Record<string, SnapshotEntry>;
  categorias: Record<string, SnapshotEntry>;
  productos: Record<string, SnapshotEntry>;
}

// Module-level singleton — fetched once, shared across all instances
let snapshotIndex: Record<string, SnapshotEntry> | null = null;
let snapshotLoading = false;

function loadSnapshot() {
  if (snapshotIndex !== null || snapshotLoading) return;
  snapshotLoading = true;
  fetch("/_meta_snapshot.json")
    .then(r => (r.ok ? r.json() : null))
    .then((data: Snapshot | null) => {
      if (!data) { snapshotIndex = {}; return; }
      const idx: Record<string, SnapshotEntry> = {};
      for (const [slug, meta] of Object.entries(data.blog ?? {}))       idx[`/blog/${slug}`] = meta;
      for (const [slug, meta] of Object.entries(data.categorias ?? {})) idx[`/categorias/${slug}`] = meta;
      for (const [slug, meta] of Object.entries(data.productos ?? {}))  idx[`/productos/${slug}`] = meta;
      snapshotIndex = idx;
    })
    .catch(() => { snapshotIndex = {}; });
}

// Kick off load immediately when module is imported
loadSnapshot();

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  ogImage = "https://guiadelsalon.com/og-default.jpg",
  noIndex = false,
}: SEOHeadProps) => {
  const { pathname } = useLocation();

  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const canonical = `https://guiadelsalon.com${cleanPath}`;

  // Priority: explicit prop → static route → snapshot entry → default
  const staticEntry   = STATIC_ROUTE_META[cleanPath];
  const snapshotEntry = snapshotIndex?.[cleanPath];
  const finalTitle       = title       ?? staticEntry?.title       ?? snapshotEntry?.title       ?? DEFAULT_TITLE;
  const finalDescription = description ?? staticEntry?.description ?? snapshotEntry?.description ?? DEFAULT_DESC;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};
