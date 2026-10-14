ALTER TABLE public.dt_products
ADD COLUMN IF NOT EXISTS color_images jsonb NOT NULL DEFAULT '{}'::jsonb;
GRANT SELECT, UPDATE (color_images) ON public.dt_products TO dragontail_app;
