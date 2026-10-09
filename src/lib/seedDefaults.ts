import { sb } from "@/lib/adminApi";
import { products as mockProducts } from "@/data/products";
import { blogPosts as mockBlogPosts } from "@/data/blogPosts";
import { services as mockServices } from "@/data/services";
import { mockVideos } from "@/data/videos";
import { getDefaultBanners } from "@/lib/syncStore";

export type SeedResult = {
  products: number;
  blog: number;
  services: number;
  videos: number;
  banners: number;
  errors: string[];
};

export async function seedDefaults(): Promise<SeedResult> {
  const errors: string[] = [];

  // Products
  const productRows = mockProducts.map((p) => ({
    slug: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    original_price: p.originalPrice,
    rating: p.rating,
    reviews: p.reviews,
    badge: p.badge ?? null,
    image: p.image,
    description: p.description,
    in_stock: p.inStock,
    sku: p.sku,
    variants: p.variants
      ? p.variants.map((v) => ({
          size: v.size,
          price: v.price,
          original_price: v.originalPrice ?? null,
          sku: v.sku ?? null,
          in_stock: v.inStock ?? true,
        }))
      : [],
    specs: p.specs ?? {},
    tags: p.tags ?? [],
  }));
  const pRes = await sb.from("products").upsert(productRows, { onConflict: "slug" });
  if (pRes?.error) errors.push(`products: ${pRes.error.message}`);

  // Blog
  const blogRows = mockBlogPosts.map((b) => ({
    slug: b.id,
    title: b.title,
    excerpt: b.intro,
    category: b.tag,
    image: b.image,
    content: b.body.map((s) => `## ${s.heading}\n\n${s.paragraphs.join("\n\n")}`).join("\n\n"),
    published: true,
  }));
  const bRes = await sb.from("blog_posts").upsert(blogRows, { onConflict: "slug" });
  if (bRes?.error) errors.push(`blog: ${bRes.error.message}`);

  // Services
  const svcRows = mockServices.map((s, i) => ({
    slug: s.slug,
    name: s.name,
    short_name: s.shortName,
    tagline: s.tagline,
    icon: s.icon,
    hero: s.hero,
    hero_image: s.heroImage,
    intro: s.intro,
    description: s.description,
    features: s.features,
    process: s.process,
    benefits: s.benefits,
    faqs: s.faqs,
    sort_order: i,
    published: true,
  }));
  const sRes = await sb.from("services").upsert(svcRows, { onConflict: "slug" });
  if (sRes?.error) errors.push(`services: ${sRes.error.message}`);

  // Videos
  const vRes = await sb.from("videos").upsert(mockVideos, { onConflict: "id" });
  if (vRes?.error) errors.push(`videos: ${vRes.error.message}`);

  // Banners
  const defaultBanners = getDefaultBanners();
  const banRes = await sb.from("promo_banners").upsert(defaultBanners, { onConflict: "id" });
  if (banRes?.error) errors.push(`banners: ${banRes.error.message}`);

  return {
    products: productRows.length,
    blog: blogRows.length,
    services: svcRows.length,
    videos: mockVideos.length,
    banners: defaultBanners.length,
    errors,
  };
}
