// Android 966 Progressive Web App Service Worker
const CACHE_NAME = "a9-pwa-v2";

const STATIC_PRECACHE = [
  "/",
  "/manifest.json",
  "/android966-logo.png",
  "/android966-default-logo.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
];

// Install: Precache core assets & activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_PRECACHE))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Precache failed (non-blocking):", err);
        return self.skipWaiting();
      })
  );
});

// Activate: Clean up any old caches & take control of clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't intercept analytics, third-party auth, or external APIs
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes("fonts.googleapis.com") &&
    !url.hostname.includes("fonts.gstatic.com")
  ) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Offline — Android 966</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                .card { max-width: 400px; padding: 32px; border-radius: 20px; background: #1e293b; border: 1px solid #334155; }
                h1 { font-size: 20px; margin-bottom: 8px; color: #fff; }
                p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
                button { background: #2563eb; color: #fff; border: 0; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <img src="/android966-logo.png" alt="Android 966" width="64" height="64" style="margin-bottom: 16px; border-radius: 14px; object-fit: contain;">
                <h1>You're currently offline</h1>
                <p>Please check your internet connection to continue browsing products, videos, and services on Android 966.</p>
                <button onclick="window.location.reload()">Retry Connection</button>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // Static assets (CSS, JS, Images, Fonts): Stale-while-revalidate / Cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
