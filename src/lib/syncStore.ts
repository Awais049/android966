import { products as mockProducts } from "@/data/products";
import { services as mockServices } from "@/data/services";
import { blogPosts as mockBlogPosts } from "@/data/blogPosts";
import { mockVideos } from "@/data/videos";
import { supabase as realSupabase } from "@/integrations/supabase/client";
import type {
  ProductRow,
  ProductVariantRow,
  ServiceRow,
  BlogRow,
  VideoRow,
  OrderRow,
  OrderStatus,
} from "@/lib/adminApi";
import type { PromoBanner } from "@/lib/banners";

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------

export function getDefaultProducts(): ProductRow[] {
  return mockProducts.map((p) => {
    const variants: ProductVariantRow[] = p.variants
      ? p.variants.map((v) => ({
          size: v.size,
          price: v.price,
          original_price: v.originalPrice ?? null,
          sku: v.sku ?? null,
          in_stock: v.inStock ?? true,
        }))
      : [];

    return {
      id: p.id,
      slug: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || null,
      price: p.price,
      original_price: p.originalPrice || p.price,
      rating: p.rating ?? 5,
      reviews: p.reviews ?? 0,
      badge: p.badge || null,
      image: p.image,
      description: p.description || null,
      in_stock: p.inStock !== false,
      sku: p.sku || "",
      variants,
      specs: p.specs ?? {},
      tags: p.tags ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

export function getDefaultServices(): ServiceRow[] {
  return mockServices.map((s, idx) => ({
    id: s.slug,
    slug: s.slug,
    name: s.name,
    short_name: s.shortName,
    tagline: s.tagline,
    icon: s.icon || "✨",
    hero: s.hero,
    hero_image: s.heroImage,
    intro: s.intro,
    description: s.description,
    features: s.features || [],
    process: s.process || [],
    benefits: s.benefits || [],
    faqs: s.faqs || [],
    sort_order: idx,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function getDefaultBlogPosts(): BlogRow[] {
  return mockBlogPosts.map((b) => ({
    id: b.id,
    slug: b.id,
    title: b.title,
    excerpt: b.intro || "",
    category: b.tag || "Technology",
    image: b.image || null,
    content: b.body.map((s) => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`).join("\n\n"),
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function getDefaultVideos(): VideoRow[] {
  return [...mockVideos];
}

export function getDefaultBanners(): PromoBanner[] {
  return [
    {
      id: "banner-ramadan-spring",
      title: "Spring Tech & Fragrance Showcase — Up to 20% OFF",
      subtitle:
        "Exclusive launch deals on premium wireless audio, smart gadgets, and designer perfumes.",
      cta_text: "Shop Collection",
      cta_link: "/store",
      image: null,
      theme: "brand",
      style: "strip",
      placement: "home_top",
      banner_type: "promo",
      discount_percent: 0,
      product_slugs: [],
      active: true,
      starts_at: null,
      ends_at: null,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "banner-earbuds-deal",
      title: "🔥 Special Deal: Wireless Earbuds Pro Max (15% OFF)",
      subtitle: "Active Noise Cancellation, 30hr battery life, Android 966 recommended pick.",
      cta_text: "Get Deal",
      cta_link: "/store/wireless-earbuds-pro-max",
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      theme: "gradient-brand",
      style: "card",
      placement: "store_top",
      banner_type: "discount",
      discount_percent: 15,
      product_slugs: ["wireless-earbuds-pro-max"],
      active: true,
      starts_at: null,
      ends_at: null,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "banner-global-shipping",
      title: "Official Android 966 Store — Fast Delivery Nationwide Across Pakistan",
      subtitle: "Free delivery on orders above Rs. 3,000",
      cta_text: "View Services",
      cta_link: "/services",
      image: null,
      theme: "dark",
      style: "marquee",
      placement: "global_top",
      banner_type: "promo",
      discount_percent: 0,
      product_slugs: [],
      active: true,
      starts_at: null,
      ends_at: null,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function getDefaultOrders(): OrderRow[] {
  return [
    {
      id: "ord-1001",
      order_number: "A9-847291",
      customer_name: "Hamza Tariq",
      phone: "03001234567",
      email: "hamza.tariq@gmail.com",
      address: "House 14, Street 3, F-7/2",
      city: "Islamabad",
      province: "Federal",
      postal_code: "44000",
      items: [
        { name: "Wireless Earbuds Pro Max", price: 2499, quantity: 1 },
        { name: "Oud Royale Parfum Extract (50ml)", price: 4200, quantity: 1 },
      ],
      subtotal: 6699,
      shipping: 200,
      total: 6899,
      status: "processing" as OrderStatus,
      notes: "Please call before delivery",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "ord-1002",
      order_number: "A9-918234",
      customer_name: "Zubair Khan",
      phone: "03219876543",
      email: "zubair.k@yahoo.com",
      address: "Flat 4B, Gulberg Heights",
      city: "Lahore",
      province: "Punjab",
      postal_code: "54000",
      items: [{ name: "65W GaN Fast Charger", price: 1850, quantity: 2 }],
      subtotal: 3700,
      shipping: 200,
      total: 3900,
      status: "delivered" as OrderStatus,
      notes: null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
}

export const DEFAULT_FOUNDER_DATA = {
  image:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  name: "Awais Ahmed",
  role_tag: "Founder & CEO",
  role_line: "Software Engineer · Digital Marketer · Content Creator",
  bio: "I'm a Software Engineering graduate passionate about digital innovation and technology. Along with web development skills, I actively explore digital marketing and AI tools. As a part-time YouTuber behind Android 966, I love sharing tech insights and creative ideas. My goal is to combine technical expertise with creativity to deliver meaningful impact in the tech industry.",
  linkedin_url: "https://www.linkedin.com/in/real-awais",
  email: "awaissh81@gmail.com",
  phone: "+92 312 6069613",
  youtube_url: "https://www.youtube.com/@Android966",
  location: "Gujrat, Punjab, Pakistan",
  whatsapp_number: "923091726858",
  stats: [
    { value: "BS", label: "Software Engineering" },
    { value: "3.42", label: "CGPA / 4.00" },
    { value: "10+", label: "Projects Delivered" },
    { value: "4", label: "Certifications" },
  ],
  experience: [
    {
      role: "Web Developer (WordPress)",
      company: "Admin to Us",
      period: "May 2025 — Present",
      points: ["Building responsive WordPress sites", "Custom themes & plugin integrations"],
    },
    {
      role: "Business Sales Executive",
      company: "HBL",
      period: "Feb 2025 — May 2025",
      points: ["Client acquisition and relationship management"],
    },
    {
      role: "Digital Marketing Intern (SEO)",
      company: "Technogic Systems",
      period: "Oct 2024 — Jan 2025",
      points: [
        "Keyword research (Semrush, Ubersuggest, Moz)",
        "SEO-friendly article writing",
        "WordPress blog posting with internal/external linking",
        "Backlink building (image, PDF, blog, bookmarks)",
      ],
    },
  ],
  education: [
    {
      school: "University of Gujrat",
      degree: "BS Software Engineering",
      period: "2020 — 2024",
      detail: "CGPA: 3.42 / 4.00",
    },
    {
      school: "Punjab Group of Colleges",
      degree: "Intermediate in Computer Science",
      period: "2018 — 2020",
      detail: "926 / 1100",
    },
    {
      school: "Websters International High School",
      degree: "Matriculation in Computer Science",
      period: "2016 — 2018",
      detail: "966 / 1100",
    },
  ],
  skills: [
    "Project Management",
    "HubSpot",
    "HTML / CSS / JavaScript",
    "C++, Java, Dart, Flutter",
    "Firebase, MongoDB, MS SQL",
    "Figma, Katalon, Draw.io",
    "Git & GitHub",
    "SEO Tools (Semrush, Moz)",
    "WordPress Development",
    "Social Media & Digital Marketing",
    "Video Editing",
    "YouTube Channel Management",
    "Canva & AI Design",
  ],
  projects: [
    "GYM Website (WordPress)",
    "Responsive Resume (HTML, CSS, JS)",
    "Basic Lottery App (Flutter)",
    "Warmplus Site (WordPress)",
    "Food App — FYP (Flutter)",
    "University M-S (C++, OOP)",
    "Inventory System (C++)",
    "SearchNum (Java, DSA)",
    "AGP (USA Company Site)",
    "NM Furniture (SEO)",
  ],
  certificates: [
    "Digital Marketing — Digiskills.pk",
    "Affiliate Marketing — Digiskills.pk",
    "Freelancing — Digiskills.pk",
    "SEO — Digiskills.pk",
  ],
  languages: [
    { name: "Urdu", percent: 100 },
    { name: "English", percent: 75 },
    { name: "Punjabi", percent: 70 },
  ],
  cta_heading: "Work with Awais",
  cta_body: "Available for web development, SEO, and digital marketing projects.",
};

export const DEFAULT_SITE_SETTINGS_DATA = {
  hero_tag: "Content Creator · Entrepreneur · Tech Enthusiast",
  hero_title: "Android 966 —",
  hero_title_highlight: "Create. Inspire. Build.",
  hero_subtitle:
    "Content creator, entrepreneur, and tech enthusiast sharing knowledge, reviews, and products that matter. Pakistan's trusted voice in tech and lifestyle.",
  stat_1_value: "100K+",
  stat_1_label: "Community Members",
  stat_2_value: "200+",
  stat_2_label: "Videos",
  stat_3_value: "50+",
  stat_3_label: "Products",
  youtube_url: "https://www.youtube.com/@Android966",
  facebook_url: "https://www.facebook.com/Android966/",
  whatsapp_number: "923091726858",
  about_heading: "About Android 966",
  about_body:
    "Pakistan's trusted tech voice — sharing honest reviews, tutorials, and curated products that make everyday tech simpler.",
  founder_pin: "9660",
  theme: "brand-blue",
  logo_url: "/android966-logo.png",
};

// ----------------------------------------------------
// STORAGE & SYNCHRONIZATION ENGINE
// ----------------------------------------------------

const STORAGE_PREFIX = "a9_db_";

const inMemoryStore: Record<string, any[]> = {};

function getInitialData(table: string): any[] {
  switch (table) {
    case "products":
      return getDefaultProducts();
    case "services":
      return getDefaultServices();
    case "blog_posts":
      return getDefaultBlogPosts();
    case "videos":
      return getDefaultVideos();
    case "promo_banners":
      return getDefaultBanners();
    case "orders":
      return getDefaultOrders();
    case "founder_content":
      return [{ id: "main", data: DEFAULT_FOUNDER_DATA, updated_at: new Date().toISOString() }];
    case "site_settings":
      return [
        { id: "main", data: DEFAULT_SITE_SETTINGS_DATA, updated_at: new Date().toISOString() },
      ];
    case "profiles":
      return [];
    default:
      return [];
  }
}

export function getStoredTable<T = any>(table: string): T[] {
  if (typeof window === "undefined") {
    if (!inMemoryStore[table]) {
      inMemoryStore[table] = getInitialData(table);
    }
    return (inMemoryStore[table] as T[]) || [];
  }

  const key = STORAGE_PREFIX + table;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = getInitialData(table);
      localStorage.setItem(key, JSON.stringify(initial));
      inMemoryStore[table] = initial;
      return initial as T[];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      // If table is an essential seed table and somehow got emptied, restore defaults
      if (
        [
          "products",
          "services",
          "blog_posts",
          "videos",
          "promo_banners",
          "founder_content",
          "site_settings",
        ].includes(table)
      ) {
        const initial = getInitialData(table);
        localStorage.setItem(key, JSON.stringify(initial));
        inMemoryStore[table] = initial;
        return initial as T[];
      }
    }
    if (
      table === "videos" &&
      Array.isArray(parsed) &&
      (parsed.some((v: Record<string, unknown>) => v.youtube_id === "LXb3EKWsInQ") ||
        parsed.length < 8)
    ) {
      const initial = getInitialData(table);
      localStorage.setItem(key, JSON.stringify(initial));
      inMemoryStore[table] = initial;
      return initial as T[];
    }
    inMemoryStore[table] = parsed;
    return parsed as T[];
  } catch (err) {
    console.warn(`[SyncStore] Error loading ${table}:`, err);
    const initial = getInitialData(table);
    inMemoryStore[table] = initial;
    return initial as T[];
  }
}

export function updateLocalTableCache<T = any>(table: string, items: T[]): void {
  inMemoryStore[table] = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_PREFIX + table, JSON.stringify(items));
      if (table === "site_settings") {
        const settingsData = (items as any[])?.[0]?.data;
        const logo = settingsData?.logo_url;
        if (
          logo &&
          !logo.includes("photo-1618005182384") &&
          logo !== "/android966-default-logo.svg" &&
          logo !== "/android966-logo.png"
        ) {
          localStorage.setItem("a9_active_logo_url", logo);
          (window as any).__A9_CUSTOM_LOGO__ = logo;
          window.dispatchEvent(new CustomEvent("a9_logo_change", { detail: logo }));
        }
      }
    } catch (err) {
      console.warn(`[SyncStore] Error writing cache for ${table}:`, err);
    }
  }
}

export function setStoredTable<T = any>(table: string, items: T[]): void {
  updateLocalTableCache(table, items);
  if (typeof window !== "undefined") {
    notifyDataChanged(table);
  }
}

export const TABLE_QUERY_KEYS: Record<string, string[][]> = {
  products: [["admin", "products"], ["public", "products"], ["products"], ["admin", "dashboard"]],
  blog_posts: [["admin", "blog"], ["public", "blog"], ["admin", "dashboard"]],
  services: [["admin", "services"], ["public", "services"]],
  videos: [["admin", "videos"], ["public", "videos"], ["admin", "dashboard"]],
  promo_banners: [["admin", "banners"], ["public", "banners"]],
  orders: [["admin", "orders"], ["orders"], ["admin", "dashboard"]],
  founder_content: [["admin", "founder"], ["site", "founder"]],
  site_settings: [["admin", "settings"], ["site", "settings"]],
};

export function invalidateQueriesForTable(qc: any, table: string): void {
  if (!qc || typeof qc.invalidateQueries !== "function") return;
  if (table === "all") {
    qc.invalidateQueries();
    return;
  }
  const keys = TABLE_QUERY_KEYS[table] || [[table]];
  for (const key of keys) {
    try {
      qc.invalidateQueries({ queryKey: key });
    } catch {}
  }
}

let syncBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    syncBroadcastChannel = new BroadcastChannel("a9_db_channel");
    syncBroadcastChannel.onmessage = (event) => {
      if (event.data?.type === "db_change" && event.data?.table) {
        const globalQc = (window as any).__A9_QUERY_CLIENT__;
        if (globalQc) {
          invalidateQueriesForTable(globalQc, event.data.table);
        }
        window.dispatchEvent(
          new CustomEvent("a9_db_change", { detail: { table: event.data.table, remote: true } }),
        );
      }
    };
  } catch {}
}

export function notifyRemoteTabsChanged(table: string): void {
  if (typeof window === "undefined") return;

  // Cross-tab broadcast
  if (syncBroadcastChannel) {
    try {
      syncBroadcastChannel.postMessage({ type: "db_change", table, timestamp: Date.now() });
    } catch {}
  }

  // Cross-tab localStorage fallback (fires in other browser tabs)
  try {
    localStorage.setItem("a9_last_mutation", JSON.stringify({ table, timestamp: Date.now() }));
  } catch {}
}

export function notifyDataChanged(table: string): void {
  if (typeof window === "undefined") return;

  notifyRemoteTabsChanged(table);

  // Local window event for listeners explicitly handling local changes
  try {
    window.dispatchEvent(new CustomEvent("a9_db_change", { detail: { table, remote: false } }));
  } catch {}
}

export async function resetAllDefaults(): Promise<void> {
  const tables = [
    "products",
    "services",
    "blog_posts",
    "videos",
    "promo_banners",
    "orders",
    "founder_content",
    "site_settings",
  ];
  for (const table of tables) {
    const initial = getInitialData(table);
    setStoredTable(table, initial);
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table, action: "reset" }),
        });
      } catch {}
    }
  }
  notifyDataChanged("all");
}

// ----------------------------------------------------
// QUERY BUILDER COMPATIBLE WITH SUPABASE & BACKEND DATABASE
// ----------------------------------------------------

export class SyncQueryBuilder<T = any> {
  private table: string;
  private selectCols: string = "*";
  private selectOptions?: { count?: "exact" | "planned" | "estimated"; head?: boolean };
  private filters: Array<(item: any) => boolean> = [];
  private rawFilters: Array<{ column: string; op: "eq" | "neq"; value: any }> = [];
  private orderField?: string;
  private orderAsc: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  // Mutation operations
  private mutationType?: "insert" | "update" | "delete" | "upsert";
  private mutationPayload?: any;
  private upsertOptions?: { onConflict?: string };

  constructor(table: string) {
    this.table = table;
  }

  select(
    cols: string = "*",
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ) {
    this.selectCols = cols;
    this.selectOptions = options;
    return this;
  }

  eq(column: string, value: any) {
    this.rawFilters.push({ column, op: "eq", value });
    this.filters.push((item) => {
      if (item == null) return false;
      const v = item[column];
      if (column === "id" || column === "slug") {
        const valStr = String(value).trim();
        return String(item.id ?? "").trim() === valStr || String(item.slug ?? "").trim() === valStr;
      }
      return String(v) === String(value);
    });
    return this;
  }

  neq(column: string, value: any) {
    this.rawFilters.push({ column, op: "neq", value });
    this.filters.push((item) => {
      if (item == null) return true;
      const v = item[column];
      if (v === undefined && column === "id" && item.slug !== undefined) {
        return String(item.slug) !== String(value);
      }
      return String(v) !== String(value);
    });
    return this;
  }

  or(filterExpr: string) {
    const clauses = filterExpr.split(",").map((s) => s.trim());
    this.filters.push((item) => {
      if (item == null) return false;
      return clauses.some((clause) => {
        const parts = clause.split(".");
        if (parts.length >= 3 && parts[1] === "eq") {
          const col = parts[0];
          const val = parts.slice(2).join(".");
          return String(item[col]) === String(val);
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(payload: any | any[]) {
    this.mutationType = "insert";
    this.mutationPayload = payload;
    return this;
  }

  update(payload: any) {
    this.mutationType = "update";
    this.mutationPayload = payload;
    return this;
  }

  delete() {
    this.mutationType = "delete";
    return this;
  }

  upsert(payload: any | any[], options?: { onConflict?: string }) {
    this.mutationType = "upsert";
    this.mutationPayload = payload;
    this.upsertOptions = options;
    return this;
  }

  private executeMutation(): { data: any; error: null } {
    let items = getStoredTable(this.table);

    // Try background sync to Supabase (fire and forget)
    try {
      const client = realSupabase as any;
      if (this.mutationType === "insert" && client?.from) {
        Promise.resolve(client.from(this.table).insert(this.mutationPayload)).catch(() => {});
      } else if (this.mutationType === "upsert" && client?.from) {
        Promise.resolve(
          client.from(this.table).upsert(this.mutationPayload, this.upsertOptions),
        ).catch(() => {});
      }
    } catch {
      // Ignore background errors
    }

    if (this.mutationType === "insert") {
      const records = Array.isArray(this.mutationPayload)
        ? this.mutationPayload
        : [this.mutationPayload];
      const inserted = records.map((r) => {
        const id =
          r.id || r.slug || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          ...r,
          id,
          created_at: r.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      items = [...inserted, ...items];
      updateLocalTableCache(this.table, items);
      return { data: Array.isArray(this.mutationPayload) ? inserted : inserted[0], error: null };
    }

    if (this.mutationType === "update") {
      const payload = JSON.parse(JSON.stringify(this.mutationPayload || {}));
      const idFilter = this.rawFilters.find((f) => f.column === "id" || f.column === "slug");
      const targetId =
        idFilter != null && idFilter.value != null ? String(idFilter.value).trim() : null;

      const clonedItems: any[] = JSON.parse(JSON.stringify(items || []));
      const updated: any[] = [];

      if (targetId) {
        const targetIndex = clonedItems.findIndex((it: any) => {
          if (!it) return false;
          const itemId = String(it.id ?? "").trim();
          const itemSlug = String(it.slug ?? "").trim();
          return itemId === targetId || itemSlug === targetId;
        });

        if (targetIndex !== -1) {
          const existing = clonedItems[targetIndex];
          const next = {
            ...existing,
            ...payload,
            id:
              payload.id !== undefined && payload.id !== ""
                ? payload.id
                : existing.id || targetId,
            slug:
              payload.slug !== undefined && payload.slug !== ""
                ? payload.slug
                : existing.slug || targetId,
            updated_at: new Date().toISOString(),
          };
          clonedItems[targetIndex] = next;
          updated.push(next);
        }
      } else if (this.filters.length > 0) {
        for (let i = 0; i < clonedItems.length; i++) {
          if (clonedItems[i] && this.filters.every((f) => f(clonedItems[i]))) {
            const next = { ...clonedItems[i], ...payload, updated_at: new Date().toISOString() };
            clonedItems[i] = next;
            updated.push(next);
          }
        }
      }

      updateLocalTableCache(this.table, clonedItems);
      return { data: updated, error: null };
    }

    if (this.mutationType === "delete") {
      items = items.filter((item) => !this.filters.every((f) => f(item)));
      updateLocalTableCache(this.table, items);
      return { data: null, error: null };
    }

    if (this.mutationType === "upsert") {
      const records = Array.isArray(this.mutationPayload)
        ? this.mutationPayload
        : [this.mutationPayload];
      const conflictKey = this.upsertOptions?.onConflict || "id";
      for (const rec of records) {
        const matchVal = rec[conflictKey] || rec.id || rec.slug;
        const idx = items.findIndex((it) => (it[conflictKey] || it.id || it.slug) === matchVal);
        const itemToSave = {
          ...rec,
          id: rec.id || (idx >= 0 ? items[idx].id : rec.slug || `rec_${Date.now()}`),
          updated_at: new Date().toISOString(),
          created_at: idx >= 0 ? items[idx].created_at : rec.created_at || new Date().toISOString(),
        };
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...itemToSave };
        } else {
          items.push(itemToSave);
        }
      }
      updateLocalTableCache(this.table, items);
      return { data: this.mutationPayload, error: null };
    }

    return { data: null, error: null };
  }

  private async executeMutationAsync(): Promise<{ data: any; error: any }> {
    // 1. Perform optimistic local update so client UI is immediately responsive
    const localResult = this.executeMutation();

    // 2. Persist directly to central backend server database (/api/data)
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: this.table,
            action: this.mutationType,
            payload: this.mutationPayload,
            filters: this.rawFilters,
            upsertOptions: this.upsertOptions,
          }),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.error == null) {
            // Merge mutation result directly into local cache without a premature full-table re-fetch
            if (this.mutationType === "insert" && json.data) {
              const current = getStoredTable(this.table);
              const inserted = Array.isArray(json.data) ? json.data : [json.data];
              const merged = [
                ...inserted,
                ...current.filter(
                  (c: any) =>
                    !inserted.some(
                      (ins: any) =>
                        (ins.id && ins.id === c.id) || (ins.slug && ins.slug === c.slug),
                    ),
                ),
              ];
              updateLocalTableCache(this.table, merged);
            } else if (this.mutationType === "update" && json.data) {
              const current = getStoredTable(this.table);
              const updatedList = Array.isArray(json.data) ? json.data : [json.data];
              const updatedMap = new Map(
                updatedList.map((u: any) => [String(u.id ?? u.slug), u]),
              );
              const merged = current.map((item: any) => {
                const key = String(item.id ?? item.slug);
                return updatedMap.has(key) ? { ...item, ...updatedMap.get(key) } : item;
              });
              updateLocalTableCache(this.table, merged);
            }

            // Broadcast change only to other open tabs/windows
            notifyRemoteTabsChanged(this.table);
            return { data: json.data !== undefined ? json.data : localResult.data, error: null };
          } else {
            console.warn(`[SyncStore] Server mutation error on ${this.table}:`, json?.error);
          }
        }
      } catch (networkErr) {
        console.warn(`[SyncStore] Network error during mutation on ${this.table}:`, networkErr);
      }
    }

    return localResult;
  }

  private executeQuery(): { data: any; count?: number; error: null } {
    let items = [...getStoredTable(this.table)];

    // Apply all equality and other filters
    if (this.filters.length > 0) {
      items = items.filter((item) => this.filters.every((f) => f(item)));
    }

    const totalCount = items.length;

    // Handle count and head queries (e.g. dashboard statistics)
    if (this.selectOptions?.head) {
      return { data: null, count: totalCount, error: null };
    }

    // Apply ordering
    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAsc ? 1 : -1;
      items.sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * asc;
        if (field === "created_at" || field === "updated_at") {
          const diff = (new Date(va).getTime() - new Date(vb).getTime()) * asc;
          if (diff !== 0) return diff;
          return String(a.id || a.slug || "").localeCompare(String(b.id || b.slug || ""));
        }
        return String(va).localeCompare(String(vb)) * asc;
      });
    }

    // Apply limit
    if (this.limitCount != null) {
      items = items.slice(0, this.limitCount);
    }

    // Project columns if requested specifically (e.g. select("data") or select("slug,name"))
    if (this.selectCols && this.selectCols !== "*") {
      const cols = this.selectCols.split(",").map((c) => c.trim());
      if (cols.length === 1 && cols[0] === "data") {
        items = items.map((it) => ({ data: it.data ?? it }));
      } else {
        items = items.map((it) => {
          const res: Record<string, any> = {};
          for (const c of cols) res[c] = it[c];
          return res;
        });
      }
    }

    if (this.isSingle || this.isMaybeSingle) {
      const single = items[0] ?? null;
      return { data: single, count: totalCount, error: null };
    }

    return { data: items, count: totalCount, error: null };
  }

  private async executeQueryAsync(): Promise<{ data: any; count?: number; error: any }> {
    if (typeof window !== "undefined") {
      try {
        const url = new URL("/api/data", window.location.origin);
        url.searchParams.set("table", this.table);
        if (this.selectCols) url.searchParams.set("select", this.selectCols);
        if (this.orderField) {
          url.searchParams.set("order", this.orderField);
          url.searchParams.set("ascending", String(this.orderAsc));
        }
        if (this.limitCount != null) url.searchParams.set("limit", String(this.limitCount));
        if (this.isSingle) url.searchParams.set("single", "true");
        if (this.isMaybeSingle) url.searchParams.set("maybeSingle", "true");
        if (this.selectOptions?.head) url.searchParams.set("countOnly", "true");
        for (const rf of this.rawFilters) {
          url.searchParams.set(`${rf.op}_${rf.column}`, String(rf.value));
        }

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.error == null) {
            // Update local memory & storage cache with latest remote server data
            if (
              this.rawFilters.length === 0 &&
              !this.isSingle &&
              !this.isMaybeSingle &&
              (!this.selectCols || this.selectCols === "*") &&
              this.limitCount == null
            ) {
              if (Array.isArray(json.data)) {
                const current = getStoredTable(this.table);
                const currentMap = new Map<string, any>();
                for (const item of current) {
                  if (item) {
                    const key = String(item.id || item.slug || "").trim();
                    if (key) currentMap.set(key, item);
                  }
                }

                // Merge server items with local items: newer updated_at always wins
                const mergedList: any[] = [];
                const seenKeys = new Set<string>();

                for (const serverItem of json.data) {
                  if (!serverItem) continue;
                  const key = String(serverItem.id || serverItem.slug || "").trim();
                  seenKeys.add(key);
                  const localItem = currentMap.get(key);

                  if (localItem && localItem.updated_at && serverItem.updated_at) {
                    const localTime = new Date(localItem.updated_at).getTime();
                    const serverTime = new Date(serverItem.updated_at).getTime();
                    if (localTime > serverTime) {
                      // Local modification is more recent than server snapshot; preserve local!
                      mergedList.push(localItem);
                      continue;
                    }
                  }
                  mergedList.push(serverItem);
                }

                // Keep any newly added local records not yet present on server
                for (const [key, localItem] of currentMap.entries()) {
                  if (!seenKeys.has(key)) {
                    mergedList.push(localItem);
                  }
                }

                updateLocalTableCache(this.table, mergedList);
                return { data: mergedList, count: mergedList.length, error: null };
              }
            } else if (this.table === "site_settings" && json.data) {
              const sData = Array.isArray(json.data) ? json.data[0]?.data : json.data?.data ?? json.data;
              if (sData) {
                updateLocalTableCache("site_settings", [{ id: "main", data: sData, updated_at: new Date().toISOString() }]);
              }
            } else if (this.table === "founder_content" && json.data) {
              const fData = Array.isArray(json.data) ? json.data[0]?.data : json.data?.data ?? json.data;
              if (fData) {
                updateLocalTableCache("founder_content", [{ id: "main", data: fData, updated_at: new Date().toISOString() }]);
              }
            }

            return { data: json.data, count: json.count, error: null };
          }
        }
      } catch (err) {
        console.warn(`[SyncStore] Remote fetch failed for ${this.table}, falling back to local:`, err);
      }
    }

    return this.executeQuery();
  }

  // Thenable implementation to support async/await transparently with remote database
  async then(resolve?: (val: any) => any, reject?: (reason?: any) => any) {
    try {
      let result;
      if (this.mutationType) {
        result = await this.executeMutationAsync();
      } else {
        result = await this.executeQueryAsync();
      }
      return resolve ? resolve(result) : result;
    } catch (err) {
      if (reject) return reject(err);
      throw err;
    }
  }
}

// ----------------------------------------------------
// SYNCHRONIZED SUPABASE CLIENT PROXY
// ----------------------------------------------------

export const syncClient = {
  from: (table: string) => new SyncQueryBuilder(table),
  resetDefaults: resetAllDefaults,
  getTable: getStoredTable,
  setTable: setStoredTable,
};

