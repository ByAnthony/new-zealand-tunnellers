const OFFLINE_CACHE_PREFIX = "nzt-offline-book-v1-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cacheNames = (await caches.keys()).filter((name) =>
        name.startsWith(OFFLINE_CACHE_PREFIX),
      );

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const locale = cacheName
          .slice(OFFLINE_CACHE_PREFIX.length)
          .split("-")[0];
        const manifest = await cache.match(
          `/__offline-book-cache__/manifest-${locale}`,
        );
        if (!manifest) continue;

        const response = await cache.match(request, {
          ignoreVary: true,
        });
        if (response) return response;
      }

      return Response.error();
    }),
  );
});
