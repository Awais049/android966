import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { WishlistProvider } from "@/context/WishlistContext";
import { BannerSlot } from "@/components/PromoBanner";
import { useSiteSettings } from "@/lib/siteSettings";
import { applyTheme } from "@/lib/themes";
import { PwaProvider } from "@/context/PwaContext";
import { PwaInstallPopup } from "@/components/PwaInstallPopup";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Android 966 — Tech Reviews & Online Store" },
      {
        name: "description",
        content:
          "Pakistan ka No.1 tech content creator. Latest smartphone reviews, unboxings, tech tips, aur official Android 966 store for tech products and perfumes.",
      },
      { name: "author", content: "Android 966" },
      { property: "og:title", content: "Android 966 — Tech Reviews & Online Store" },
      {
        property: "og:description",
        content:
          "Pakistan ka No.1 tech content creator. Latest smartphone reviews, unboxings, tech tips, aur official Android 966 store for tech products and perfumes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Android966" },
      { name: "twitter:title", content: "Android 966 — Tech Reviews & Online Store" },
      {
        name: "twitter:description",
        content:
          "Pakistan ka No.1 tech content creator. Latest smartphone reviews, unboxings, tech tips, aur official Android 966 store for tech products and perfumes.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/463b04b7-74b8-42c0-9943-d0794fb7fd29",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/463b04b7-74b8-42c0-9943-d0794fb7fd29",
      },
      { name: "theme-color", content: "#2563eb" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Android 966" },
    ],
    links: [
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/icon-192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/icon-512.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "192x192",
        href: "/icon-192.png",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Space+Grotesk:wght@500;600;700&family=Fraunces:ital,wght@0,600;0,700;1,600&family=Archivo+Black&family=Manrope:wght@500;600;700;800&family=DM+Serif+Display&family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(getOrganizationSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(getWebSiteSchema()),
      },
      {
        src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
        async: true,
        defer: true,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var isDef=function(u){return !u||u==="/android966-default-logo.svg"||u==="/android966-logo.png"||u.indexOf("photo-1618005182384")!==-1;};var c=localStorage.getItem("a9_active_logo_url");if(isDef(c)){var s=localStorage.getItem("a9_db_site_settings");if(s){var l=JSON.parse(s);var m=Array.isArray(l)?l.find(function(i){return i.id==='main'}):null;if(m&&m.data&&m.data.logo_url)c=m.data.logo_url;}}if(isDef(c)){var q=localStorage.getItem("a9-query-cache");if(q){var d=JSON.parse(q);var qs=d&&d.clientState&&d.clientState.queries;if(Array.isArray(qs)){for(var i=0;i<qs.length;i++){var it=qs[i];if(it&&it.state&&it.state.data&&it.state.data.logo_url){var u=it.state.data.logo_url;if(!isDef(u)){c=u;break;}}}}}}if(!isDef(c)){window.__A9_CUSTOM_LOGO__=c;localStorage.setItem("a9_active_logo_url",c);try{var st=document.createElement("style");st.id="a9-instant-logo";st.textContent=".a9-logo-img{content:url(\\""+c.replace(/"/g,'\\\\"')+"\\") !important;}";document.head.appendChild(st);}catch(_){}var fix=function(){var imgs=document.querySelectorAll('img.a9-logo-img, img[alt*="Android 966 logo"], img[alt*="Site logo"], img[alt="Android 966"]');for(var j=0;j<imgs.length;j++){if(imgs[j].src!==c){imgs[j].src=c;}}};fix();var mo=new MutationObserver(fix);mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(function(){mo.disconnect()},3500);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function QueryProviders({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: ReactNode;
}) {
  // Persist the query cache to localStorage on the browser so admin-uploaded
  // images (and other DB data) show instantly on refresh instead of flashing
  // the older fallback for a few seconds.
  const persister = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: "a9-query-cache",
      throttleTime: 1000,
    });
  }, []);

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24, buster: "v1" }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

function ThemeApplier() {
  const settings = useSiteSettings();
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isBareAuth = location.pathname === "/signin";

  return (
    <QueryProviders queryClient={queryClient}>
      <PwaProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <ThemeApplier />
              {isAdmin || isBareAuth ? (
                <Outlet />
              ) : (
                <div className="flex min-h-screen flex-col">
                  <BannerSlot placement="global_top" />
                  <Header />
                  <main className="flex-1">
                    <Outlet />
                  </main>
                  <Footer />
                  <WhatsAppFab />
                  <PwaInstallPopup />
                </div>
              )}
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </PwaProvider>
    </QueryProviders>
  );
}
