import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar, ThumbsUp, ThumbsDown, Link2, Share2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ScissorsSpinner from "@/components/ScissorsSpinner";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerAI } from "@/components/DisclaimerAI";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800";

/* Session ID for anonymous reactions */
function getSessionId() {
  const key = "blog_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const isEN = lang === "en";
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);

  /* Fetch post */
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, title_en, excerpt_en, content_en")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  /* Check existing reaction */
  useEffect(() => {
    if (!post) return;
    supabase
      .from("blog_reactions")
      .select("reaction")
      .eq("post_id", post.id)
      .eq("session_id", sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.reaction) setVoted(data.reaction as "like" | "dislike");
      });
  }, [post, sessionId]);

  /* Related posts */
  const { data: related = [] } = useQuery({
    queryKey: ["blog-related", post?.category, post?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, cover_image_url, read_time_minutes, published_at")
        .eq("is_published", true)
        .eq("category", post!.category!)
        .neq("id", post!.id)
        .limit(3);
      return data ?? [];
    },
    enabled: !!post?.category,
  });

  /* Vote mutation */
  const voteMutation = useMutation({
    mutationFn: async (reaction: "like" | "dislike") => {
      // Insert reaction
      await supabase.from("blog_reactions").insert({
        post_id: post!.id,
        session_id: sessionId,
        reaction,
      });
      // Update counter on blog_posts
      const field = reaction === "like" ? "likes" : "dislikes";
      const current = post![field] ?? 0;
      await supabase
        .from("blog_posts")
        .update({ [field]: current + 1 })
        .eq("id", post!.id);
    },
    onSuccess: (_, reaction) => {
      setVoted(reaction);
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
      toast({ title: "¡Gracias por tu voto!" });
    },
  });

  const handleVote = useCallback(
    (reaction: "like" | "dislike") => {
      if (voted) return;
      voteMutation.mutate(reaction);
    },
    [voted, voteMutation]
  );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Enlace copiado" });
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title ?? "")}`, "_blank");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(post?.title + " " + window.location.href)}`, "_blank");
  };

  if (isLoading) return <div className="container mx-auto px-4 py-20"><ScissorsSpinner /></div>;
   if (!post) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Post no encontrado</div>;

   const localTitle = (isEN && post.title_en) || post.title;
   const localExcerpt = (isEN && post.excerpt_en) || post.excerpt;
   const localContent = (isEN && post.content_en) || post.content;

  return (
    <article className="min-h-screen bg-background">
      <Helmet>
        <title>{localTitle} | Blog Guía del Salón</title>
        <meta name="description" content={localExcerpt || localTitle} />
        <meta property="og:title" content={localTitle} />
        <meta property="og:image" content={post.cover_image_url || FALLBACK_IMAGE} />
        {post.published_at && <meta property="article:published_time" content={post.published_at} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: localTitle,
          description: localExcerpt || localTitle,
          image: post.cover_image_url || FALLBACK_IMAGE,
          datePublished: post.published_at || post.id,
          author: { "@type": "Organization", name: "Guía del Salón" },
          publisher: {
            "@type": "Organization",
            name: "Guía del Salón",
            logo: { "@type": "ImageObject", url: "https://guiadelsalon.com/logo-full.png" },
          },
        })}</script>
      </Helmet>
      {/* Hero */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={post.cover_image_url || FALLBACK_IMAGE} alt={post.title} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto">
            {post.category && <Badge variant="secondary" className="mb-3">{post.category}</Badge>}
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight">{localTitle}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              {post.read_time_minutes && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.read_time_minutes} min lectura</span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {post.author && <span>Por {post.author}</span>}
            </div>
          </div>
        </div>

      {/* Content + sidebar */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 max-w-[720px] mx-auto lg:mx-0">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-secondary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al blog
            </Link>


            {/* Article body */}
            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: localContent ?? "" }}
            />

            {/* E-E-A-T: Author & AI disclaimer */}
            <AuthorBox />
            <DisclaimerAI />

            {/* Share buttons */}
            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border">
              <span className="text-sm text-muted-foreground mr-2">Compartir:</span>
              <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                <Link2 className="w-4 h-4" /> Copiar link
              </Button>
              <Button variant="outline" size="sm" onClick={shareTwitter} className="gap-1.5">
                𝕏
              </Button>
              <Button variant="outline" size="sm" onClick={shareWhatsApp} className="gap-1.5">
                WhatsApp
              </Button>
            </div>

            {/* Likes/Dislikes */}
            <div className="mt-8 p-6 bg-card rounded-xl border border-border text-center">
              <p className="text-foreground font-display text-lg mb-4">¿Te ha sido útil este artículo?</p>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={() => handleVote("like")}
                  disabled={!!voted}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    voted === "like"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-accent text-foreground hover:bg-secondary/20"
                  } ${voted && voted !== "like" ? "opacity-40" : ""}`}
                >
                  <ThumbsUp className="w-5 h-5" /> {post.likes ?? 0}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={() => handleVote("dislike")}
                  disabled={!!voted}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    voted === "dislike"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-accent text-foreground hover:bg-destructive/20"
                  } ${voted && voted !== "dislike" ? "opacity-40" : ""}`}
                >
                  <ThumbsDown className="w-5 h-5" /> {post.dislikes ?? 0}
                </motion.button>
              </div>
            </div>

            {/* Related (mobile) */}
            {related.length > 0 && (
              <div className="mt-12 lg:hidden">
                <h3 className="font-display text-xl text-foreground mb-4">Artículos relacionados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <RelatedCard key={r.id} post={r} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (desktop) */}
          {related.length > 0 && (
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <h3 className="font-display text-lg text-foreground mb-4">Relacionados</h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <RelatedCard key={r.id} post={r} />
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </article>
  );
};

function RelatedCard({ post }: { post: any }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block bg-card border border-border rounded-lg overflow-hidden hover:border-secondary/40 transition-colors"
    >
      <img src={post.cover_image_url || FALLBACK_IMAGE} alt={post.title} className="w-full h-32 object-cover" loading="lazy" />
      <div className="p-3">
        <h4 className="font-display text-sm text-foreground line-clamp-2">{post.title}</h4>
        {post.read_time_minutes && (
          <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {post.read_time_minutes} min
          </span>
        )}
      </div>
    </Link>
  );
}

export default BlogPostPage;
