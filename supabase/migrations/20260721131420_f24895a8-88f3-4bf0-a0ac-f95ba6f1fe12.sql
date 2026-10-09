
CREATE TABLE public.founder_content (
  id text PRIMARY KEY DEFAULT 'main',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.founder_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_content TO authenticated;
GRANT ALL ON public.founder_content TO service_role;

ALTER TABLE public.founder_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read founder"
  ON public.founder_content FOR SELECT
  USING (true);

CREATE POLICY "admins write founder"
  ON public.founder_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER founder_content_set_updated_at
  BEFORE UPDATE ON public.founder_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.founder_content (id, data) VALUES ('main', '{}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
