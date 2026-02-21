const blogImages: Record<string, string[]> = {
  tendencias: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  ],
  tecnicas: [
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
  ],
  cuidado: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
  ],
  negocio: [
    "https://images.unsplash.com/photo-1512864084360-7c0e4f2e5a6c?w=800",
    "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800",
  ],
  reviews: [
    "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800",
    "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=800",
    "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800",
  ],
};

export function getBlogImage(post: { id: string; category?: string | null }) {
  const list = blogImages[post.category ?? ""] ?? blogImages.tecnicas;
  const index = post.id.charCodeAt(0) % list.length;
  return list[index];
}
