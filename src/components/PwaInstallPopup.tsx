import { useState, useEffect } from "react";
import { Download, X, Smartphone, Zap, WifiOff } from "lucide-react";
import { usePwa } from "@/context/PwaContext";
import { useLogoUrl } from "@/lib/useLogo";

export function PwaInstallPopup() {
  const { isInstallable, isInstalled, showPopup, install, dismissPopup } = usePwa();
  const logoUrl = useLogoUrl();
  const [installing, setInstalling] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(false);

  useEffect(() => {
    if (showPopup && isInstallable && !isInstalled) {
      // Small tick for CSS animation trigger
      const t = setTimeout(() => setAnimatingIn(true), 50);
      return () => clearTimeout(t);
    } else {
      setAnimatingIn(false);
    }
  }, [showPopup, isInstallable, isInstalled]);

  if (!showPopup || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md transition-all duration-300 ease-out sm:bottom-6 sm:left-auto sm:right-6 ${
        animatingIn
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl transition-all">
        {/* Subtle accent glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={dismissPopup}
          className="absolute right-3.5 top-3.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral transition-colors hover:bg-bg2 hover:text-foreground"
          aria-label="Dismiss installation prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5">
          {/* Brand App Icon */}
          <div className="relative shrink-0">
            <img
              src={logoUrl}
              alt="Android 966 Web App Icon"
              className="a9-logo-img h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-border"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-sm ring-2 ring-card">
              <Smartphone className="h-3 w-3" />
            </span>
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5">
              <h3 id="pwa-install-title" className="text-sm font-semibold tracking-tight text-foreground">
                Install Android 966 App
              </h3>
              <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand">
                Official
              </span>
            </div>

            <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-text2">
              Install our store app for a faster and offline-friendly shopping experience.
            </p>

            {/* Feature Pills */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-neutral">
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" /> Instant Access
              </span>
              <span className="inline-flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-emerald-500" /> Offline Mode
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-2.5 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={dismissPopup}
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral transition-colors hover:bg-bg2 hover:text-foreground"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 hover:shadow active:scale-95 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {installing ? "Installing…" : "Install Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
