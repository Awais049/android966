export const LOGO_CACHE_KEY = "a9_active_logo_url";
export const FALLBACK_LOGO = "/android966-logo.png";
export const DUMMY_UNSPLASH_SUBSTRING = "photo-1618005182384";

export function isCustomLogo(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim();
  if (!clean) return false;
  if (clean.includes(DUMMY_UNSPLASH_SUBSTRING)) return false;
  if (
    clean === FALLBACK_LOGO ||
    clean === "/android966-default-logo.svg" ||
    clean === "/android966-logo.png"
  )
    return false;
  return true;
}
