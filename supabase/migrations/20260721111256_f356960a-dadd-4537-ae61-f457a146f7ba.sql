
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id, data) VALUES (
  'main',
  '{
    "hero_tag": "Content Creator · Entrepreneur · Tech Enthusiast",
    "hero_title": "Android 966 —",
    "hero_title_highlight": "Create. Inspire. Build.",
    "hero_subtitle": "Content creator, entrepreneur, and tech enthusiast sharing knowledge, reviews, and products that matter. Pakistan''s trusted voice in tech and lifestyle.",
    "stat_1_value": "100K+",
    "stat_1_label": "Community Members",
    "stat_2_value": "200+",
    "stat_2_label": "Videos",
    "stat_3_value": "50+",
    "stat_3_label": "Products",
    "youtube_url": "https://www.youtube.com/@Android966",
    "facebook_url": "https://www.facebook.com/Android966/",
    "whatsapp_number": "923091726858",
    "about_heading": "About Android 966",
    "about_body": "Pakistan''s trusted tech voice — sharing honest reviews, tutorials, and curated products that make everyday tech simpler."
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;
