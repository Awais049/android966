import { useQuery } from "@tanstack/react-query";
import { sb } from "@/lib/adminApi";

export type BannerPlacement =
  | "home_top"
  | "home_middle"
  | "store_top"
  | "global_top"
  | "product_detail"
  | "checkout_top";

export type BannerTheme =
  | "brand"
  | "dark"
  | "amber"
  | "emerald"
  | "rose"
  | "gradient-brand"
  | "gradient-sunset";

export type BannerStyle =
  | "strip"
  | "card"
  | "hero"
  | "marquee"
  | "ticker"
  | "pill"
  | "spotlight"
  | "neon"
  | "split"
  | "stacked"
  | "tape"
  | "wave"
  | "countdown"
  | "ribbon"
  | "minimal";
export type BannerType = "promo" | "discount";

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image: string | null;
  theme: BannerTheme;
  style: BannerStyle;
  placement: BannerPlacement;
  banner_type: BannerType;
  discount_percent: number;
  product_slugs: string[];
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const PLACEMENTS: { value: BannerPlacement; label: string }[] = [
  { value: "global_top", label: "Global — Top of every page" },
  { value: "home_top", label: "Home — Top (below hero)" },
  { value: "home_middle", label: "Home — Middle (before featured)" },
  { value: "store_top", label: "Store — Top" },
  { value: "product_detail", label: "Product Detail Page" },
  { value: "checkout_top", label: "Checkout — Top" },
];

export const THEMES: { value: BannerTheme; label: string }[] = [
  { value: "brand", label: "Brand (blue)" },
  { value: "dark", label: "Dark" },
  { value: "amber", label: "Amber" },
  { value: "emerald", label: "Emerald" },
  { value: "rose", label: "Rose" },
  { value: "gradient-brand", label: "Gradient — Brand" },
  { value: "gradient-sunset", label: "Gradient — Sunset" },
];

export const STYLES: { value: BannerStyle; label: string }[] = [
  { value: "strip", label: "Strip (thin bar)" },
  { value: "minimal", label: "Minimal (borderless line)" },
  { value: "marquee", label: "Marquee (scrolling right → left)" },
  { value: "ticker", label: "Ticker (fast news-style)" },
  { value: "pill", label: "Pill (rounded chip, centered)" },
  { value: "card", label: "Card" },
  { value: "split", label: "Split (two-tone panels)" },
  { value: "stacked", label: "Stacked (giant % + copy)" },
  { value: "ribbon", label: "Ribbon (corner flag)" },
  { value: "tape", label: "Tape (rotated sticker)" },
  { value: "neon", label: "Neon (glowing outline)" },
  { value: "wave", label: "Wave (curved bottom)" },
  { value: "countdown", label: "Countdown (live timer)" },
  { value: "spotlight", label: "Spotlight (glow + shine)" },
  { value: "hero", label: "Hero (large)" },
];

export function usePromoBanners() {
  const { data = [] } = useQuery({
    queryKey: ["public", "banners"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("promo_banners")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true });
        if (error) throw error;
        return (data ?? []) as PromoBanner[];
      } catch (err) {
        console.warn("[Banners] Supabase connection unavailable, skipping remote banners:", err);
        return [];
      }
    },
    staleTime: 5000,
    refetchOnMount: true,
    retry: false,
  });

  const now = Date.now();
  return data.filter((b) => {
    if (b.starts_at && new Date(b.starts_at).getTime() > now) return false;
    if (b.ends_at && new Date(b.ends_at).getTime() < now) return false;
    return true;
  });
}

export function useBannersByPlacement(placement: BannerPlacement) {
  return usePromoBanners().filter((b) => b.placement === placement);
}

/**
 * Given a product slug and price, returns { price, originalPrice, discountPercent }
 * after applying any active discount banner that targets this product.
 */
export function applyBestBannerDiscount(
  slug: string,
  price: number,
  banners: PromoBanner[],
): { price: number; originalPrice: number; discountPercent: number } {
  const matches = banners.filter(
    (b) =>
      b.banner_type === "discount" &&
      (b.discount_percent ?? 0) > 0 &&
      Array.isArray(b.product_slugs) &&
      b.product_slugs.includes(slug),
  );
  if (matches.length === 0) {
    return { price, originalPrice: price, discountPercent: 0 };
  }
  const best = matches.reduce((a, b) =>
    (a.discount_percent ?? 0) >= (b.discount_percent ?? 0) ? a : b,
  );
  const pct = Number(best.discount_percent) || 0;
  const newPrice = Math.round(price * (1 - pct / 100));
  return { price: newPrice, originalPrice: price, discountPercent: pct };
}
