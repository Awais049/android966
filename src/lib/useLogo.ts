import { useState, useEffect } from "react";
import { useSiteSettings, getStoredSettingsSync } from "@/lib/siteSettings";
import persistedSettingsData from "@/data/persisted-settings.json";
import {
  LOGO_CACHE_KEY,
  FALLBACK_LOGO,
  DUMMY_UNSPLASH_SUBSTRING,
  isCustomLogo,
} from "./logoConstants";

export { LOGO_CACHE_KEY, FALLBACK_LOGO, DUMMY_UNSPLASH_SUBSTRING, isCustomLogo };

export function getSynchronousLogoUrl(): string {
  if (typeof window === "undefined") {
    return isCustomLogo((persistedSettingsData as any)?.logo_url)
      ? (persistedSettingsData as any).logo_url
      : FALLBACK_LOGO;
  }
  try {
    // 0. Check pre-paint global set by early head script
    const globalLogo = (window as any).__A9_CUSTOM_LOGO__;
    if (isCustomLogo(globalLogo)) {
      return String(globalLogo).trim();
    }

    // 1. Check direct immediate localStorage cache
    const direct = localStorage.getItem(LOGO_CACHE_KEY);
    if (isCustomLogo(direct)) {
      (window as any).__A9_CUSTOM_LOGO__ = direct!.trim();
      return direct!.trim();
    }

    // 2. Check site settings stored in local db
    const raw = localStorage.getItem("a9_db_site_settings");
    if (raw) {
      try {
        const list = JSON.parse(raw);
        const main = Array.isArray(list) ? list.find((it: any) => it.id === "main") : null;
        if (main?.data?.logo_url && isCustomLogo(main.data.logo_url)) {
          const clean = String(main.data.logo_url).trim();
          localStorage.setItem(LOGO_CACHE_KEY, clean);
          (window as any).__A9_CUSTOM_LOGO__ = clean;
          return clean;
        }
      } catch {}
    }

    // 3. Check React Query persist cache
    const qc = localStorage.getItem("a9-query-cache");
    if (qc) {
      try {
        const qd = JSON.parse(qc);
        const queries = qd?.clientState?.queries;
        if (Array.isArray(queries)) {
          for (const item of queries) {
            const val = item?.state?.data?.logo_url;
            if (isCustomLogo(val)) {
              const clean = String(val).trim();
              localStorage.setItem(LOGO_CACHE_KEY, clean);
              (window as any).__A9_CUSTOM_LOGO__ = clean;
              return clean;
            }
          }
        }
      } catch {}
    }

    // 4. Check synchronous settings
    const settings = getStoredSettingsSync();
    if (isCustomLogo(settings.logo_url)) {
      const clean = settings.logo_url.trim();
      localStorage.setItem(LOGO_CACHE_KEY, clean);
      (window as any).__A9_CUSTOM_LOGO__ = clean;
      return clean;
    }

    return FALLBACK_LOGO;
  } catch {
    return FALLBACK_LOGO;
  }
}

export function setSynchronousLogoUrl(url: string): void {
  if (typeof window === "undefined") return;
  const clean = (url || "").trim();

  if (isCustomLogo(clean)) {
    localStorage.setItem(LOGO_CACHE_KEY, clean);
    (window as any).__A9_CUSTOM_LOGO__ = clean;
  } else if (!clean) {
    localStorage.removeItem(LOGO_CACHE_KEY);
    delete (window as any).__A9_CUSTOM_LOGO__;
  }

  window.dispatchEvent(new CustomEvent("a9_logo_change", { detail: clean }));
}

export function useLogoUrl(): string {
  const [currentLogo, setCurrentLogo] = useState<string>(() => getSynchronousLogoUrl());
  const settings = useSiteSettings();

  useEffect(() => {
    // Sync immediately if settings has a valid custom logo
    if (isCustomLogo(settings.logo_url)) {
      const clean = settings.logo_url.trim();
      setCurrentLogo(clean);
      setSynchronousLogoUrl(clean);
    }

    const onLogoChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (isCustomLogo(detail)) {
        setCurrentLogo(detail.trim());
      } else {
        setCurrentLogo(getSynchronousLogoUrl());
      }
    };

    window.addEventListener("a9_logo_change", onLogoChange);
    window.addEventListener("storage", () => setCurrentLogo(getSynchronousLogoUrl()));

    return () => {
      window.removeEventListener("a9_logo_change", onLogoChange);
    };
  }, [settings.logo_url]);

  // Priority 1: Valid custom uploaded logo from settings
  if (isCustomLogo(settings.logo_url)) {
    return settings.logo_url.trim();
  }

  // Priority 2: Valid custom uploaded logo from immediate cache
  if (isCustomLogo(currentLogo)) {
    return currentLogo;
  }

  const sync = getSynchronousLogoUrl();
  if (isCustomLogo(sync)) {
    return sync;
  }

  return FALLBACK_LOGO;
}
