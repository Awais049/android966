import { useQuery } from "@tanstack/react-query";
import { sb, type ProductRow, type BlogRow, type ServiceRow, type ProductVariantRow } from "@/lib/adminApi";
import { products as mockProducts, type Product, type ProductVariant } from "@/data/products";
import { blogPosts as mockBlogPosts, type BlogPost } from "@/data/blogPosts";
import { services as mockServices, type Service } from "@/data/services";
import { applyBestBannerDiscount, usePromoBanners } from "@/lib/banners";


// -------- Products --------

const DEFAULT_BG = "#EEF3FF";

export function rowToProduct(row: ProductRow): Product {
  const category: Product["category"] = row.category === "perfume" ? "perfume" : "tech";
  const variants: ProductVariant[] | undefined = Array.isArray(row.variants) && row.variants.length
    ? row.variants.map((v: ProductVariantRow) => ({
        size: v.size,
        price: Number(v.price),
        originalPrice: v.original_price != null ? Number(v.original_price) : undefined,
        sku: v.sku ?? undefined,
        inStock: v.in_stock ?? true,
      }))
    : undefined;
  return {
    id: row.slug,
    name: row.name,
    category,
    subcategory: row.subcategory ?? "",
    price: Number(row.price),
    originalPrice: Number(row.original_price ?? row.price),
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    badge: (row.badge as Product["badge"]) || undefined,
    emoji: "🛍️",
    image:
      row.image ||
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    bgColor: DEFAULT_BG,
    inStock: row.in_stock,
    sku: row.sku ?? "",
    description: row.description ?? "",
    specs: (row.specs as Record<string, string>) ?? {},
    tags: row.tags ?? [],
    variants,
  };
}


export function useMergedProducts() {
  const banners = usePromoBanners();
  const { data: dbRows = [], isLoading } = useQuery({
    queryKey: ["public", "products"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as ProductRow[];
      } catch (err) {
        console.warn("[Products] Supabase connection unavailable, using local mock data:", err);
        return [];
      }
    },
    retry: false,
  });
  const dbProducts = dbRows.map(rowToProduct);
  const combined = dbProducts.length > 0 ? dbProducts : mockProducts;
  const merged = combined.map((p) => {
    const d = applyBestBannerDiscount(p.id, p.price, banners);
    if (d.discountPercent === 0) return p;
    return {
      ...p,
      price: d.price,
      originalPrice: d.originalPrice,
      badge: p.badge ?? ("Sale" as Product["badge"]),
    };
  });
  return { products: merged, isLoading };
}

export function useProductBySlug(slug: string) {
  const { products, isLoading } = useMergedProducts();
  const product = products.find((p) => p.id === slug);
  return { product, isLoading };
}

// -------- Blog --------

export function rowToBlogPost(row: BlogRow): BlogPost {
  return {
    id: row.slug,
    title: row.title,
    tag: row.category ?? "Article",
    date: new Date(row.created_at).toLocaleDateString(),
    readTime: `${Math.max(1, Math.ceil((row.content?.length ?? 0) / 900))} min`,
    emoji: "📝",
    image:
      row.image ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    bgColor: DEFAULT_BG,
    featured: false,
    intro: row.excerpt ?? "",
    quote: "",
    body: [{ heading: "Article", paragraphs: [row.content ?? ""] }],
    pros: [],
    cons: [],
    tags: [],
  };
}

export function useMergedBlogPosts() {
  const { data: dbRows = [], isLoading } = useQuery({
    queryKey: ["public", "blog"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as BlogRow[];
      } catch (err) {
        console.warn("[Blog] Supabase connection unavailable, using local mock data:", err);
        return [];
      }
    },
    retry: false,
  });
  const dbPosts = dbRows.map(rowToBlogPost);
  const dbSlugs = new Set(dbPosts.map((p) => p.id));
  const fallbackUnique = mockBlogPosts.filter((m) => !dbSlugs.has(m.id));
  const merged = [...dbPosts, ...fallbackUnique];
  return { posts: merged, isLoading };
}

export function useBlogPostBySlug(slug: string) {
  const { posts, isLoading } = useMergedBlogPosts();
  const post = posts.find((p) => p.id === slug);
  return { post, isLoading };
}

// -------- Services --------

export function rowToService(row: ServiceRow): Service {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    tagline: row.tagline,
    icon: row.icon || "✨",
    hero: row.hero,
    heroImage: row.hero_image,
    intro: row.intro,
    description: row.description,
    features: row.features ?? [],
    process: row.process ?? [],
    benefits: row.benefits ?? [],
    faqs: row.faqs ?? [],
  };
}

export function useMergedServices() {
  const { data: dbRows = [], isLoading } = useQuery({
    queryKey: ["public", "services"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("services")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        return (data ?? []) as ServiceRow[];
      } catch (err) {
        console.warn("[Services] Supabase connection unavailable, using local mock data:", err);
        return [];
      }
    },
    retry: false,
  });
  const dbServices = dbRows.map(rowToService);
  const merged = dbServices.length > 0 ? dbServices : mockServices;
  return { services: merged, isLoading };
}

export function useServiceBySlug(slug: string) {
  const { services, isLoading } = useMergedServices();
  const service = services.find((s) => s.slug === slug);
  return { service, isLoading };
}
