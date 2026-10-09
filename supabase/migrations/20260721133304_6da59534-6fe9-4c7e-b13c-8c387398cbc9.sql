CREATE TABLE public.promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  cta_text text,
  cta_link text,
  image text,
  theme text NOT NULL DEFAULT 'brand',
  style text NOT NULL DEFAULT 'strip',
  placement text NOT NULL DEFAULT 'home_top',
  banner_type text NOT NULL DEFAULT 'promo',
  discount_percent numeric DEFAULT 0,
  product_slugs text[] DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_banners TO authenticated;
GRANT ALL ON public.promo_banners TO service_role;

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read banners" ON public.promo_banners FOR SELECT USING (true);
CREATE POLICY "Admins manage banners" ON public.promo_banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER promo_banners_updated_at BEFORE UPDATE ON public.promo_banners
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();