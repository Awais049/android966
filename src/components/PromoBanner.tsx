import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { BannerPlacement, BannerTheme, PromoBanner } from "@/lib/banners";
import { useBannersByPlacement } from "@/lib/banners";

const THEME_STYLES: Record<BannerTheme, string> = {
  brand: "bg-brand text-white",
  dark: "bg-slate-900 text-white",
  amber: "bg-amber-500 text-slate-900",
  emerald: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white",
  "gradient-brand": "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
  "gradient-sunset": "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 text-white",
};

function themeClass(theme: BannerTheme) {
  return THEME_STYLES[theme] ?? THEME_STYLES.brand;
}

export function BannerSlot({ placement }: { placement: BannerPlacement }) {
  const banners = useBannersByPlacement(placement);
  if (!banners.length) return null;
  return (
    <div className="space-y-3">
      {banners.map((b) => (
        <BannerItem key={b.id} banner={b} />
      ))}
    </div>
  );
}

function BannerItem({ banner }: { banner: PromoBanner }) {
  const inner = <BannerContent banner={banner} />;
  if (banner.cta_link) {
    const external = /^https?:\/\//.test(banner.cta_link);
    if (external) {
      return (
        <a href={banner.cta_link} target="_blank" rel="noopener noreferrer" className="block">
          {inner}
        </a>
      );
    }
    return (
      <Link to={banner.cta_link} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function BannerContent({ banner }: { banner: PromoBanner }) {
  const base = themeClass(banner.theme);
  const isDiscount = banner.banner_type === "discount" && (banner.discount_percent ?? 0) > 0;
  const badge = isDiscount ? `${Math.round(banner.discount_percent)}% OFF` : null;

  if (banner.style === "strip") {
    return (
      <div className={`${base} px-4 py-2.5 text-center text-sm font-medium`}>
        <div className="a9-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {badge}
            </span>
          )}
          <span>{banner.title}</span>
          {banner.subtitle && <span className="opacity-90">— {banner.subtitle}</span>}
          {banner.cta_text && (
            <span className="ml-1 underline underline-offset-2">{banner.cta_text} →</span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "marquee" || banner.style === "ticker") {
    const fast = banner.style === "ticker";
    const item = (
      <span className="mx-8 inline-flex items-center gap-3 text-sm font-medium">
        {badge && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
            {badge}
          </span>
        )}
        <span>{banner.title}</span>
        {banner.subtitle && <span className="opacity-90">— {banner.subtitle}</span>}
        {banner.cta_text && (
          <span className="underline underline-offset-2">{banner.cta_text} →</span>
        )}
        <span aria-hidden className="opacity-60">•</span>
      </span>
    );
    // Duplicate the content so the -50% translate loops seamlessly
    const loop = Array.from({ length: 8 }).map((_, i) => (
      <span key={i} aria-hidden={i > 0 ? true : undefined}>
        {item}
      </span>
    ));
    return (
      <div className={`${base} a9-marquee-mask overflow-hidden py-2.5`}>
        {fast && (
          <span className="sr-only">Live updates</span>
        )}
        <div className={`a9-marquee ${fast ? "a9-marquee-fast" : ""}`}>
          {loop}
          {loop}
        </div>
      </div>
    );
  }

  if (banner.style === "pill") {
    return (
      <div className="flex justify-center px-4">
        <div className={`${base} inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-white/10`}>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white/90">
            <span className="a9-live-dot absolute inset-0 rounded-full bg-white/90" />
          </span>
          {badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {badge}
            </span>
          )}
          <span className="truncate">{banner.title}</span>
          {banner.subtitle && (
            <span className="hidden truncate opacity-90 sm:inline">— {banner.subtitle}</span>
          )}
          {banner.cta_text && (
            <span className="ml-1 shrink-0 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "spotlight") {
    return (
      <div
        className={`${base} a9-shine relative overflow-hidden rounded-2xl px-6 py-6 shadow-lg ring-1 ring-white/10 sm:px-8 sm:py-7`}
      >
        {banner.image && (
          <img
            src={banner.image}
            alt={banner.title || "Promotional offer"}
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {badge && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide">
                  {badge}
                </span>
              )}
              <p className="text-lg font-semibold sm:text-xl">{banner.title}</p>
            </div>
            {banner.subtitle && (
              <p className="mt-1 text-sm opacity-90">{banner.subtitle}</p>
            )}
          </div>
          {banner.cta_text && (
            <span className="shrink-0 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "hero") {
    return (
      <div
        className={`${base} relative overflow-hidden rounded-2xl px-6 py-10 sm:px-10 sm:py-14`}
      >
        {banner.image && (
          <img
            src={banner.image}
            alt={banner.title || "Featured campaign"}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="relative">
          {badge && (
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {badge}
            </span>
          )}
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{banner.title}</h3>
          {banner.subtitle && (
            <p className="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <span className="mt-5 inline-block rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "minimal") {
    return (
      <div className="a9-container flex flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-sm">
        {badge && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
            {badge}
          </span>
        )}
        <span className="font-medium text-text">{banner.title}</span>
        {banner.subtitle && <span className="text-text2">— {banner.subtitle}</span>}
        {banner.cta_text && (
          <span className="font-semibold text-brand underline underline-offset-2">
            {banner.cta_text} →
          </span>
        )}
      </div>
    );
  }

  if (banner.style === "split") {
    return (
      <div className={`${base} flex flex-col overflow-hidden rounded-xl shadow-sm sm:flex-row`}>
        <div className="flex-1 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                {badge}
              </span>
            )}
            <p className="text-base font-semibold">{banner.title}</p>
          </div>
          {banner.subtitle && (
            <p className="mt-1 text-sm opacity-90">{banner.subtitle}</p>
          )}
        </div>
        {banner.cta_text && (
          <div className="flex items-center justify-center bg-white/95 px-6 py-3 text-sm font-semibold text-slate-900 sm:min-w-[160px]">
            {banner.cta_text} →
          </div>
        )}
      </div>
    );
  }

  if (banner.style === "stacked") {
    const bigNumber = isDiscount
      ? `${Math.round(banner.discount_percent)}%`
      : banner.subtitle?.match(/\d+/)?.[0] ?? "★";
    return (
      <div className={`${base} flex items-stretch gap-4 overflow-hidden rounded-2xl px-4 py-5 shadow-md sm:px-6`}>
        <div className="flex shrink-0 items-center justify-center rounded-xl bg-white/15 px-4 text-3xl font-black leading-none tracking-tight sm:text-5xl">
          {bigNumber}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-lg font-bold leading-tight sm:text-xl">{banner.title}</p>
          {banner.subtitle && (
            <p className="mt-1 text-sm opacity-90">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <span className="mt-2 inline-block w-fit rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "ribbon") {
    return (
      <div className={`${base} relative overflow-hidden rounded-xl px-5 py-5 pl-6 shadow-md`}>
        {badge && (
          <div className="absolute -left-8 top-3 w-32 rotate-[-35deg] bg-white/95 py-0.5 text-center text-[11px] font-bold text-slate-900 shadow">
            {badge}
          </div>
        )}
        <div className="ml-16">
          <p className="text-base font-semibold sm:text-lg">{banner.title}</p>
          {banner.subtitle && (
            <p className="mt-0.5 text-sm opacity-90">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <span className="mt-2 inline-block rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "tape") {
    return (
      <div className="flex justify-center px-4 py-2">
        <div className={`${base} a9-tape inline-flex max-w-full items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-lg`}>
          {badge && (
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold">
              {badge}
            </span>
          )}
          <span className="truncate">{banner.title}</span>
          {banner.subtitle && (
            <span className="hidden opacity-90 sm:inline">— {banner.subtitle}</span>
          )}
          {banner.cta_text && (
            <span className="ml-1 rounded bg-white/95 px-2 py-0.5 text-xs font-bold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "neon") {
    return (
      <div className="flex justify-center px-4">
        <div className={`${base} a9-neon relative flex max-w-full items-center gap-3 rounded-xl border-2 border-white/80 px-5 py-3 text-sm font-semibold`}>
          {badge && (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold text-slate-900">
              {badge}
            </span>
          )}
          <span className="truncate">{banner.title}</span>
          {banner.subtitle && (
            <span className="hidden opacity-90 sm:inline">— {banner.subtitle}</span>
          )}
          {banner.cta_text && (
            <span className="ml-1 underline underline-offset-4">{banner.cta_text} →</span>
          )}
        </div>
      </div>
    );
  }

  if (banner.style === "wave") {
    return (
      <div className={`${base} relative overflow-hidden rounded-2xl px-6 pb-14 pt-8 sm:px-10 sm:pb-16 sm:pt-10`}>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            {badge && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                {badge}
              </span>
            )}
            <h3 className="text-xl font-semibold sm:text-2xl">{banner.title}</h3>
          </div>
          {banner.subtitle && (
            <p className="mt-2 max-w-2xl text-sm opacity-90">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <span className="mt-4 inline-block rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900">
              {banner.cta_text} →
            </span>
          )}
        </div>
        <svg
          className="absolute inset-x-0 bottom-0 h-10 w-full text-white/20"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,30 C300,80 600,-10 900,30 C1050,50 1150,40 1200,25 L1200,60 L0,60 Z"
          />
        </svg>
      </div>
    );
  }

  if (banner.style === "countdown") {
    return <CountdownBanner banner={banner} base={base} badge={badge} />;
  }

  // card
  return (
    <div className={`${base} flex items-center gap-4 rounded-xl px-5 py-4`}>

      {banner.image && (
        <img
          src={banner.image}
          alt={banner.title || "Special promotion"}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {badge}
            </span>
          )}
          <p className="text-sm font-semibold sm:text-base">{banner.title}</p>
        </div>
        {banner.subtitle && (
          <p className="mt-0.5 text-xs opacity-90 sm:text-sm">{banner.subtitle}</p>
        )}
      </div>
      {banner.cta_text && (
        <span className="shrink-0 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900">
          {banner.cta_text} →
        </span>
      )}
    </div>
  );
}

function CountdownBanner({
  banner,
  base,
  badge,
}: {
  banner: PromoBanner;
  base: string;
  badge: string | null;
}) {
  const target = banner.ends_at ? new Date(banner.ends_at).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  const remaining = target ? Math.max(0, target - now) : 0;
  const d = Math.floor(remaining / 86_400_000);
  const h = Math.floor((remaining % 86_400_000) / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  const cell = (v: number, label: string) => (
    <div className="flex min-w-[52px] flex-col items-center rounded-lg bg-white/15 px-2 py-1.5">
      <span className="text-lg font-bold tabular-nums leading-none sm:text-2xl">
        {String(v).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">{label}</span>
    </div>
  );

  return (
    <div className={`${base} flex flex-col items-start gap-4 rounded-2xl px-5 py-5 shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-7`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              {badge}
            </span>
          )}
          <p className="text-base font-semibold sm:text-lg">{banner.title}</p>
        </div>
        {banner.subtitle && (
          <p className="mt-1 text-sm opacity-90">{banner.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {target ? (
          <div className="flex items-center gap-2">
            {cell(d, "Days")}
            {cell(h, "Hrs")}
            {cell(m, "Min")}
            {cell(s, "Sec")}
          </div>
        ) : (
          <span className="text-xs opacity-80">Set an end date in admin</span>
        )}
        {banner.cta_text && (
          <span className="hidden shrink-0 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 sm:inline-block">
            {banner.cta_text} →
          </span>
        )}
      </div>
    </div>
  );
}
