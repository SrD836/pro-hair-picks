import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Guía del Salón — Equipamiento Profesional de Peluquería";
const DEFAULT_DESC  = "Rankings honestos, precios reales y herramientas para profesionales del salón.";

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

  // Priority: explicit prop → snapshot entry → default
  const snapshotEntry = snapshotIndex?.[cleanPath];
  const finalTitle       = title       ?? snapshotEntry?.title       ?? DEFAULT_TITLE;
  const finalDescription = description ?? snapshotEntry?.description ?? DEFAULT_DESC;

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
