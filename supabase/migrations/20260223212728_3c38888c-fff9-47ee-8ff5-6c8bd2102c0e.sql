
-- Add amazon_url_us column for US affiliate links
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS amazon_url_us TEXT;
