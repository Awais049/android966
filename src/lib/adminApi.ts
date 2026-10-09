import { supabase } from "@/integrations/supabase/client";

export type ProductVariantRow = {
  size: string;
  price: number;
  original_price?: number | null;
  sku?: string | null;
  in_stock?: boolean;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  original_price: number | null;
  rating: number | null;
  reviews: number | null;
  badge: string | null;
  image: string | null;
  description: string | null;
  in_stock: boolean;
  sku: string | null;
  variants: ProductVariantRow[] | null;
  specs: Record<string, string> | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  image: string | null;
  content: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type VideoRow = {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceFeatureRow = { title: string; description: string };
export type ServiceProcessRow = { step: string; title: string; description: string };
export type ServiceFaqRow = { q: string; a: string };

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  tagline: string;
  icon: string;
  hero: string;
  hero_image: string;
  intro: string;
  description: string;
  features: ServiceFeatureRow[];
  process: ServiceProcessRow[];
  benefits: string[];
  faqs: ServiceFaqRow[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = { name: string; price: number; quantity: number };

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

import { syncClient } from "@/lib/syncStore";

export const sb = syncClient as unknown as {
  from: (table: string) => any;
  resetDefaults: () => void;
};
export { syncClient };


