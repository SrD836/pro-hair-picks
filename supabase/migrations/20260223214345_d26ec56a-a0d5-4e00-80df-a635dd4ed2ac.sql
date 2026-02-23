ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt_en text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_en text;