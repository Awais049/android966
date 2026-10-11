-- ====================================================================
-- ANDROID 966 PRODUCTION SUPABASE DATABASE SCHEMA
-- Project URL: https://tztgtdyyrgxmbzkomlkh.supabase.co
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tztgtdyyrgxmbzkomlkh/sql/new
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. ENUMS & HELPER FUNCTIONS
-- ----------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------
-- 2. USER ROLES & PROFILES
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address text,
  city text,
  province text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 3. PRODUCTS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  rating numeric DEFAULT 5,
  reviews integer DEFAULT 0,
  badge text,
  image text,
  images text[] NOT NULL DEFAULT '{}'::text[],
  image2 text,
  image3 text,
  image4 text,
  description text,
  in_stock boolean NOT NULL DEFAULT true,
  sku text,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Safe migration helper for existing databases:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image2 text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image3 text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image4 text;

-- ----------------------------------------------------
-- 4. SERVICES
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '✨',
  hero text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  process jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 5. BLOG POSTS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  category text,
  image text,
  content text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 6. VIDEOS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.videos (
  id text PRIMARY KEY,
  title text NOT NULL,
  youtube_id text NOT NULL,
  thumbnail text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 7. PROMO BANNERS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.promo_banners (
  id text PRIMARY KEY,
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
  product_slugs text[] DEFAULT '{}'::text[],
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 8. ORDERS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text,
  email text,
  address text,
  city text,
  province text,
  postal_code text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 9. FOUNDER CONTENT
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.founder_content (
  id text PRIMARY KEY DEFAULT 'main',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- 10. SITE SETTINGS
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Grant permissions to standard Supabase roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.products, public.services, public.blog_posts, public.videos, public.promo_banners, public.founder_content, public.site_settings TO authenticated;

-- Policies for Products
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins or service write products" ON public.products;
CREATE POLICY "Admins or service write products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Policies for Services
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write services" ON public.services;
CREATE POLICY "Admins write services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Policies for Blog Posts
DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write blog_posts" ON public.blog_posts;
CREATE POLICY "Admins write blog_posts" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);

-- Policies for Videos
DROP POLICY IF EXISTS "Public read videos" ON public.videos;
CREATE POLICY "Public read videos" ON public.videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write videos" ON public.videos;
CREATE POLICY "Admins write videos" ON public.videos FOR ALL USING (true) WITH CHECK (true);

-- Policies for Promo Banners
DROP POLICY IF EXISTS "Public read promo_banners" ON public.promo_banners;
CREATE POLICY "Public read promo_banners" ON public.promo_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write promo_banners" ON public.promo_banners;
CREATE POLICY "Admins write promo_banners" ON public.promo_banners FOR ALL USING (true) WITH CHECK (true);

-- Policies for Orders
DROP POLICY IF EXISTS "Anyone place order" ON public.orders;
CREATE POLICY "Anyone place order" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Read orders" ON public.orders;
CREATE POLICY "Read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Update orders" ON public.orders;
CREATE POLICY "Update orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Policies for Founder Content
DROP POLICY IF EXISTS "Public read founder_content" ON public.founder_content;
CREATE POLICY "Public read founder_content" ON public.founder_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write founder_content" ON public.founder_content;
CREATE POLICY "Admins write founder_content" ON public.founder_content FOR ALL USING (true) WITH CHECK (true);

-- Policies for Site Settings
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write site_settings" ON public.site_settings;
CREATE POLICY "Admins write site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- Policies for Profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------

DROP TRIGGER IF EXISTS products_updated ON public.products;
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS services_updated ON public.services;
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated ON public.blog_posts;
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS videos_updated ON public.videos;
CREATE TRIGGER videos_updated BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS promo_banners_updated ON public.promo_banners;
CREATE TRIGGER promo_banners_updated BEFORE UPDATE ON public.promo_banners FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS orders_updated ON public.orders;
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS founder_content_updated ON public.founder_content;
CREATE TRIGGER founder_content_updated BEFORE UPDATE ON public.founder_content FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS site_settings_updated ON public.site_settings;
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
