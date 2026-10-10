import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  showPopup: boolean;
  install: () => Promise<boolean>;
  dismissPopup: () => void;
  openInstallPrompt: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

const DISMISSED_SESSION_KEY = "a9_pwa_popup_dismissed_session";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Check if running in standalone display mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Register service worker (production only)
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.endsWith(".local"));

      if (isLocalhost) {
        // In local development, ensure any previous service workers and caches are purged
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) reg.unregister();
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) caches.delete(key);
          });
        }
      } else {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("[PWA] Service Worker registered with scope:", reg.scope);
            })
            .catch((err) => {
              console.warn("[PWA] Service Worker registration failed:", err);
            });
        });
      }
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Check if user dismissed popup during this session
      const dismissed = sessionStorage.getItem(DISMISSED_SESSION_KEY);
      if (!dismissed) {
        // Show with a smooth 1.8s delay after load
        const timer = setTimeout(() => {
          setShowPopup(true);
        }, 1800);
        return () => clearTimeout(timer);
      }
    };

    // Capture appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowPopup(false);
      sessionStorage.setItem(DISMISSED_SESSION_KEY, "true");
      console.log("[PWA] App successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissPopup = useCallback(() => {
    setShowPopup(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, "true");
    }
  }, []);

  const openInstallPrompt = useCallback(() => {
    setShowPopup(true);
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // If browser doesn't support beforeinstallprompt or already handled (e.g. iOS Safari)
      // We can guide the user
      alert("To install this app on your device:\n\n• On iOS/Safari: Tap the Share button, then 'Add to Home Screen'.\n• On Chrome/Edge: Look for the Install icon in your browser's address bar.");
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setShowPopup(false);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(DISMISSED_SESSION_KEY, "true");
        }
        return true;
      } else {
        dismissPopup();
        return false;
      }
    } catch (err) {
      console.warn("[PWA] Error triggering install prompt:", err);
      dismissPopup();
      return false;
    }
  }, [deferredPrompt, dismissPopup]);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        showPopup,
        install,
        dismissPopup,
        openInstallPrompt,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
}
