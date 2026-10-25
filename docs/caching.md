# Caching

This guide centralises the application's caching behaviour and the steps needed
to publish updates. It describes the repository configuration; hosting settings
can also affect the headers received by a browser.

The site does not require a CDN. Browser caching, Next.js server caching, and the
offline book cache are separate mechanisms. Clearing one does not clear the others.

## Overview

| Layer                                | What it stores                                                    | Lifetime                                                           | How to refresh                                               |
| ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| Browser HTTP cache: public images    | Images under `/images/` and selected root PNG icons               | One week fresh, then up to one extra day of stale-while-revalidate | Change the image URL, normally by renaming the file          |
| Browser HTTP cache: generated assets | Next.js hashed JavaScript, CSS, and other immutable static assets | Normally one year in production                                    | Rebuild; changed content receives new hashed URLs            |
| Next.js Data Cache                   | Tunnellers dataset used by the roll, map, and menu search         | No timed revalidation                                              | Bump `TUNNELLERS_CACHE_VERSION` and rebuild/deploy           |
| Next.js rendered pages               | Pages eligible for prerendering                                   | Build-dependent; no application-defined timed revalidation         | Rebuild/deploy changed content                               |
| Browser Cache Storage                | A downloaded offline book and its dependencies                    | No application-defined expiry                                      | Turn Read offline off, then on again while online            |
| Browser storage and cookies          | Reading progress, offline status hints, and navigation state      | Depends on storage type                                            | Use the relevant UI or clear the specific storage entry      |
| CI caches                            | npm downloads, Next.js build work, and Playwright browsers        | GitHub Actions cache keys and eviction                             | Change the relevant key or remove the relevant Actions cache |

## Browser image caching

Configured in [`next.config.mjs`](../next.config.mjs):

```text
Cache-Control: public, max-age=604800, stale-while-revalidate=86400
```

- `public`: browsers and shared caches are allowed to store the response. It does
  not enable or require a CDN.
- `max-age=604800`: a saved response is fresh for one week, accounting for any
  existing response age. The browser can reuse it without checking the server.
- `stale-while-revalidate=86400`: after freshness expires, a supporting cache may
  serve the old response for up to one additional day while revalidating it.
  This does not schedule a daily background download.

The rules cover:

- `/images/:path*`: all images in `public/images/`, not just book images.
- `/:file(nzt_logo|search|copy|apple-touch-icon.*)\.png`: the root logo, search and
  copy icons, and Apple touch icons. The JavaScript source doubles the backslash.
  New root image names outside this list are not automatically included.

Fonts under `/fonts/`, pages, and `/service-worker.js` are not covered by these
rules. They retain their framework/hosting behaviour; inspect their actual
response headers rather than assuming the image policy applies.

The [custom image loader](../utils/imageLoader.ts) produces same-origin URLs with
`w` and `q` query parameters. Those query strings are part of the cache identity;
different widths can have separate entries. The loader does not itself resize
images or add content hashes.

### Updating an image

Deployments do **not** invalidate an already-fresh browser response at an unchanged
URL. Restarting the server or changing its headers cannot force a browser to
contact it before that response becomes stale.

When replacing an image:

1. Give it a new filename, for example `artwork-v2.jpg`.
2. Update its references and deploy both the file and the reference changes.
3. Check the new URL and its cache headers.
4. If it is part of a saved offline book, readers must also download the book again
   to update their offline copy.

The week is a freshness policy, not guaranteed storage: browsers can evict entries,
users can clear them, and reload modes can bypass them. A full page load can still
paint an image after the text even when it is cached; caching does not guarantee
that all visual flashing disappears.

## Next.js server caching

### Tunnellers data

[`getCachedTunnellers`](../utils/database/getTunnellers.ts) wraps its database query
in `unstable_cache`. It groups the roll data used by the tunnellers page/map and
menu search. Its key includes `TUNNELLERS_CACHE_VERSION`; the locale argument also
distinguishes cached results. `revalidate: false` means no timed revalidation.

After database changes affecting this dataset:

1. Update `TUNNELLERS_CACHE_VERSION`, using `YYYY-MM-DD-reason`.
2. Rebuild and deploy against the updated database.
3. Check the roll, map, and menu search in both languages.

A browser refresh or server restart is not a reliable invalidation mechanism for
this persistent data cache. Do not assume every direct database query elsewhere
has this same cache: the wrapper is specific to the tunnellers dataset.

### Rendered pages and client navigation

Next.js can cache prerendered HTML and React Server Component output separately
from the data used to produce them. The repository declares `generateStaticParams`
for locales, book chapters, and history chapters. This is not proof that every
route is static: dynamic APIs and the rest of the render tree affect the result.
Use the production build's route summary to check actual prerendering.

For example, the book's [contents container](../components/Books/Contents/ContentsContainer.tsx)
reads a cookie to initialise the offline toggle, so the contents route uses
request-specific state. Book chapter content comes from
[`contents/`](../contents/); rebuild/deploy when changing prerendered content.
There are no explicit route-level timed revalidation settings in the application.

Next.js client navigation can also reuse prefetched or previously visited route
data in memory. Book navigation deliberately uses ordinary anchors for offline
support, causing full page loads instead. This client navigation cache is not
the browser HTTP image cache or the downloaded offline book.

Generated hashed assets under `/_next/static/` normally receive
`public, max-age=31536000, immutable` in production. Changed assets get new URLs
when rebuilt, unlike images served directly from `public/`.

## Offline book caching

Implemented by [OfflineBookToggle](../components/Books/OfflineBookToggle/OfflineBookToggle.tsx)
and [`public/service-worker.js`](../public/service-worker.js).

- Enabling Read offline downloads the supplied book pages, same-origin resources
  referenced in their HTML (including image `srcset` variants), and resources
  referenced through CSS `url(...)`, such as fonts.
- Downloads use `fetch(..., { cache: "reload" })` to bypass existing browser HTTP
  cache entries and obtain refreshed responses. Successful responses are copied
  into Cache Storage.
- Each language gets a cache named `nzt-offline-book-v1-{locale}-{uuid}`.
  A `/__offline-book-cache__/manifest-{locale}` entry lists the saved URLs.
  The manifest is written only after downloading completes.
- A completed download replaces previous copies for that language. A failed
  download removes its incomplete cache and attempts to preserve an existing copy.
- The toggle verifies the manifest and the presence of all listed responses.
- Turning the toggle off removes the language's offline caches, including while
  offline. It does not erase the separate browser HTTP cache or reading progress.

The service worker attempts `fetch(request)` first for same-origin GET requests.
That fetch can be satisfied by the browser HTTP cache; it does not necessarily
contact the server. If the fetch rejects, the worker looks for a saved response
in caches with completed manifests. HTTP errors such as 404 or 500 do not reject
`fetch`, so they do not trigger this fallback.

Successful online fetches do not automatically update the offline copy. There is
no one-week expiry for Cache Storage: it retains the snapshot until removed,
replaced, or evicted by the browser. A deployment, new service worker script, or
server restart does not automatically refresh that snapshot.

To refresh a saved book, go online, turn Read offline off, then turn it on and wait
for completion. Test the result offline. The worker is registered at the site root,
so it can control other pages on the origin too, although the downloader only
saves book pages and their dependencies. Removing a saved book does not unregister
the worker.

Offline caches and browser storage are separate for `www.nztunnellers.com` and
`nztunnellers.com`, and also for HTTP and HTTPS. Use the same origin when saving
and reading. A saved book on one hostname is not available on the other.

## Browser state, not content caches

- `nzt-offline-book-saved-v1-{locale}`: localStorage and a cookie are hints for
  initial toggle rendering, not proof of a complete download. Cache Storage is
  checked separately. The enabled cookie has a one-year maximum age.
- `book-reading-progress`: localStorage stores progress by chapter pathname.
- `tunnellers:return` and `roll:scrollY`: localStorage stores navigation state.
- `roll:view`: sessionStorage stores the selected roll view for the tab session.

localStorage has no application-defined expiry. Clearing all site data can remove
reading progress and offline downloads as well as cached images; prefer targeted
removal when troubleshooting.

## Build and deployment caches

The [CI workflow](../.github/workflows/nztunnellers.yml) caches npm downloads via
`setup-node`, `.next/cache` via `actions/cache`, and Playwright browser binaries.
The Next.js cache key uses the lockfile and JavaScript/TypeScript source hashes,
with a lockfile-based restore prefix. Restoring this cache can also restore
persistent Next.js data; this is another reason to version the tunnellers key.

Deployment sync excludes `.next/cache/**`. This does not clear an existing server
cache, and a restart is not a universal cache reset. Browser HTTP caches, saved
offline books, and localStorage live on readers' devices and are untouched by
server deployments.

## Checking production behaviour

Check actual headers after deployment, without needing a CDN:

```bash
curl -I "https://www.nztunnellers.com/images/books/vignette-6.png?w=256&q=75"
curl -I "https://www.nztunnellers.com/nzt_logo.png"
curl -I "https://www.nztunnellers.com/service-worker.js"
```

The first two should show the one-week image policy. The service worker should
not receive that policy. These commands inspect the server response, not an
existing browser cache entry.

In browser developer tools:

1. In **Network**, leave **Disable cache** unchecked when testing normal reuse.
   Inspect `Cache-Control`, status, and transfer information on repeated loads.
   A service worker label alone does not prove a network download occurred.
2. In **Application**, inspect Cache Storage for the offline book and its manifest,
   and Local Storage/Cookies for state markers.
3. Verify offline reading only after the download completes, using the same
   hostname and protocol, then enabling offline mode and navigating between chapters.

Keep this guide updated whenever cache headers, cache keys, service-worker
behaviour, or deployment cache handling changes.
