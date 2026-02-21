const blogImageKeywords: Record<string, string> = {
  tendencias: "haircut,hairstyle,barbershop",
  tecnicas: "barber,hair,salon",
  cuidado: "haircare,beauty,hair",
  negocio: "barbershop,salon,professional",
  reviews: "hairtool,hairdryer,scissors",
};

export function getBlogImage(post: { id: string; category?: string | null }) {
  const kw = blogImageKeywords[post.category ?? ""] ?? "barbershop";
  return `https://source.unsplash.com/800x450/?${kw}&sig=${post.id}`;
}
