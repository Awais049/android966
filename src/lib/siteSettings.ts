import { useQuery } from "@tanstack/react-query";
import { sb } from "@/lib/adminApi";
import { isCustomLogo, FALLBACK_LOGO } from "@/lib/logoConstants";
import persistedSettingsData from "@/data/persisted-settings.json";

export interface SiteSettings {
  hero_tag: string;
  hero_title: string;
  hero_title_highlight: string;
  hero_subtitle: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  youtube_url: string;
  facebook_url: string;
  whatsapp_number: string;
  about_heading: string;
  about_body: string;
  founder_pin: string;
  theme: string;
  logo_url: string;
}

const DEFAULT_FALLBACK_LOGO = "/android966-logo.png";

export const DEFAULT_SETTINGS: SiteSettings = {
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
  logo_url: isCustomLogo((persistedSettingsData as any)?.logo_url)
    ? (persistedSettingsData as any).logo_url
    : (FALLBACK_LOGO || DEFAULT_FALLBACK_LOGO),
};

export function getStoredSettingsSync(): SiteSettings {
  if (typeof window === "undefined") {
    const serverLogo = isCustomLogo((persistedSettingsData as any)?.logo_url)
      ? (persistedSettingsData as any).logo_url
      : FALLBACK_LOGO;
    return { ...DEFAULT_SETTINGS, ...persistedSettingsData, logo_url: serverLogo };
  }
  try {
    const raw = localStorage.getItem("a9_db_site_settings");
    let storedData: Partial<SiteSettings> = {};
    if (raw) {
      try {
        const list = JSON.parse(raw);
        const main = Array.isArray(list) ? list.find((it: any) => it.id === "main") : null;
        if (main?.data) storedData = { ...main.data };
      } catch {}
    }

    // Also check query cache if storedData lacks values
    const qc = localStorage.getItem("a9-query-cache");
    if (qc) {
      try {
        const qd = JSON.parse(qc);
        const queries = qd?.clientState?.queries;
        if (Array.isArray(queries)) {
          const sq = queries.find((q: any) => q.queryKey?.[0] === "site" && q.queryKey?.[1] === "settings");
          if (sq?.state?.data) {
            storedData = { ...sq.state.data, ...storedData };
          }
        }
      } catch {}
    }

    // Logo resolution: ALWAYS prefer a valid custom logo over any default
    const globalLogo = (window as any).__A9_CUSTOM_LOGO__;
    const cachedLogo = (isCustomLogo(globalLogo) ? globalLogo : null) || localStorage.getItem("a9_active_logo_url");

    if (isCustomLogo(cachedLogo)) {
      storedData.logo_url = cachedLogo!.trim();
    } else if (isCustomLogo(storedData.logo_url)) {
      storedData.logo_url = storedData.logo_url!.trim();
    } else {
      storedData.logo_url = DEFAULT_SETTINGS.logo_url;
    }

    return { ...DEFAULT_SETTINGS, ...storedData };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSiteSettings(): SiteSettings {
  const sync = getStoredSettingsSync();
  const { data } = useQuery({
    queryKey: ["site", "settings"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("site_settings")
          .select("data")
          .eq("id", "main")
          .maybeSingle();
        if (error) throw error;
        return (data?.data ?? {}) as Partial<SiteSettings>;
      } catch (err) {
        console.warn("[SiteSettings] Using local settings:", err);
        return sync;
      }
    },
    placeholderData: () => sync,
    staleTime: 5000,
    refetchOnMount: true,
    retry: false,
  });

  const merged = { ...DEFAULT_SETTINGS, ...sync, ...(data ?? {}) };

  // Always enforce custom logo if present in memory or storage
  const activeLogo = (typeof window !== "undefined" ? (window as any).__A9_CUSTOM_LOGO__ : null)
    || (typeof window !== "undefined" ? localStorage.getItem("a9_active_logo_url") : null)
    || sync.logo_url;

  if (isCustomLogo(activeLogo)) {
    merged.logo_url = activeLogo!.trim();
  } else if (!isCustomLogo(merged.logo_url)) {
    merged.logo_url = DEFAULT_SETTINGS.logo_url;
  }

  return merged;
}
