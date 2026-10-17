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
        const response = await (
          await caches.open(cacheName)
        ).match(request, {
          ignoreVary: true,
        });
        if (response) return response;
      }

      return Response.error();
    }),
  );
});
