import snapshot from '../../public/_meta_snapshot.json';

interface SnapshotEntry { title: string; description: string; }

const index: Record<string, SnapshotEntry> = {};

for (const [slug, meta] of Object.entries(snapshot.blog ?? {})) {
  index[`/blog/${slug}`] = meta as SnapshotEntry;
}
for (const [slug, meta] of Object.entries(snapshot.categorias ?? {})) {
  index[`/categorias/${slug}`] = meta as SnapshotEntry;
}
for (const [slug, meta] of Object.entries(snapshot.productos ?? {})) {
  index[`/productos/${slug}`] = meta as SnapshotEntry;
}

export function getSnapshotMeta(pathname: string): SnapshotEntry | undefined {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return index[clean];
}
