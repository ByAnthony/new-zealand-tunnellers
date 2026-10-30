"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { offlineBookSavedKey } from "@/utils/helpers/books/offlineBookSavedKey";

import STYLES from "./OfflineBookToggle.module.scss";

// Keep in sync with service-worker.js
const CACHE_NAME_PREFIX = "nzt-offline-book-v1-";
const CACHE_LOCK_PREFIX = "nzt-offline-book-lock-v1-";

const getSavedMarker = (locale: string): boolean => {
  try {
    return window.localStorage.getItem(offlineBookSavedKey(locale)) === "true";
  } catch {
    return false;
  }
};

const setSavedMarker = (locale: string, isSaved: boolean): void => {
  const key = offlineBookSavedKey(locale);

  try {
    if (isSaved) {
      window.localStorage.setItem(key, "true");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Continue with the cookie when local storage is unavailable.
  }

  try {
    const maxAge = isSaved ? 60 * 60 * 24 * 365 : 0;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${key}=${isSaved ? "true" : ""}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Cache Storage is still verified directly on page load.
  }
};

type Props = {
  locale: string;
  pagePaths: string[];
  initiallySaved?: boolean;
};

type Phase =
  | "checking"
  | "pages"
  | "assets"
  | "removing"
  | "ready"
  | "download-error"
  | "removal-error"
  | "unsupported";

const manifestUrl = (locale: string) =>
  new URL(`/__offline-book-cache__/manifest-${locale}`, window.location.origin);

const sameOriginUrl = (url: string, baseUrl: string): URL | undefined => {
  try {
    const resolved = new URL(url, baseUrl);
    return resolved.origin === window.location.origin ? resolved : undefined;
  } catch {
    return undefined;
  }
};

const readSavedUrls = async (cache: Cache, locale: string) => {
  const manifest = await cache.match(manifestUrl(locale));
  if (!manifest) return undefined;

  const savedUrls = (await manifest.json()) as string[];
  const allPresent = await Promise.all(
    savedUrls.map(async (url) => Boolean(await cache.match(url))),
  );
  return allPresent.every(Boolean) ? savedUrls : undefined;
};

const getLocaleCacheNames = async (locale: string) => {
  const legacyCacheName = `${CACHE_NAME_PREFIX}${locale}`;
  return (await caches.keys()).filter(
    (name) =>
      name === legacyCacheName || name.startsWith(`${legacyCacheName}-`),
  );
};

const findSavedCache = async (locale: string) => {
  for (const cacheName of await getLocaleCacheNames(locale)) {
    const cache = await caches.open(cacheName);
    const savedUrls = await readSavedUrls(cache, locale);
    if (savedUrls) return { cacheName, savedUrls };
  }
  return undefined;
};

export function OfflineBookToggle({
  locale,
  pagePaths,
  initiallySaved = false,
}: Props) {
  const t = useTranslations("books");
  const [phase, setPhase] = useState<Phase>("checking");
  const [isSaved, setIsSaved] = useState(() => {
    if (initiallySaved) return true;
    return getSavedMarker(locale);
  });
  const [completedPages, setCompletedPages] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const checkOfflineCopy = async () => {
      if (
        !("serviceWorker" in navigator) ||
        !("caches" in window) ||
        !("locks" in navigator)
      ) {
        if (isCurrent) setPhase("unsupported");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await navigator.serviceWorker.ready;
        const savedCopy = await findSavedCache(locale);
        if (isCurrent) {
          setIsSaved(Boolean(savedCopy));
          setSavedMarker(locale, Boolean(savedCopy));
          setPhase("ready");
        }
      } catch {
        if (isCurrent) setPhase("unsupported");
      }
    };

    void checkOfflineCopy();
    return () => {
      isCurrent = false;
    };
  }, [locale]);

  const saveBook = async () => {
    const pageUrls = pagePaths.map(
      (path) => new URL(path, window.location.origin),
    );

    setPhase("pages");
    setCompletedPages(0);
    setProgressPercent(0);

    try {
      await navigator.locks.request(
        `${CACHE_LOCK_PREFIX}${locale}`,
        async () => {
          for (const previousCacheName of await getLocaleCacheNames(locale)) {
            const previousCache = await caches.open(previousCacheName);
            if (!(await previousCache.match(manifestUrl(locale)))) {
              await caches.delete(previousCacheName);
            }
          }
          const cacheName = `${CACHE_NAME_PREFIX}${locale}-${crypto.randomUUID()}`;
          const cachedUrls = new Set<string>();
          const assets = new Map<string, URL>();
          let completedPageCount = 0;
          let completedAssetCount = 0;

          try {
            await navigator.serviceWorker.register("/service-worker.js");
            await navigator.serviceWorker.ready;
            const cache = await caches.open(cacheName);

            for (const pageUrl of pageUrls) {
              const response = await fetch(pageUrl, { cache: "reload" });
              if (!response.ok) {
                throw new Error("Unable to download a book page");
              }

              await cache.put(pageUrl, response.clone());
              cachedUrls.add(pageUrl.href);

              const document = new DOMParser().parseFromString(
                await response.text(),
                "text/html",
              );
              const pageResources = document.querySelectorAll(
                "img[src], img[srcset], source[src], source[srcset], script[src], link[rel~='stylesheet'][href], link[rel~='preload'][href], video[poster]",
              );

              pageResources.forEach((element) => {
                const candidates = [
                  element.getAttribute("src"),
                  element.getAttribute("href"),
                  element.getAttribute("poster"),
                  ...(element.getAttribute("srcset") ?? "")
                    .split(",")
                    .map((candidate) => candidate.trim().split(/\s+/, 1)[0]),
                ];

                for (const candidate of candidates) {
                  if (!candidate) continue;
                  const resourceUrl = sameOriginUrl(candidate, pageUrl.href);
                  if (resourceUrl && !cachedUrls.has(resourceUrl.href)) {
                    assets.set(resourceUrl.href, resourceUrl);
                  }
                }
              });

              completedPageCount += 1;
              setCompletedPages(completedPageCount);
              const pageProgress = pageUrls.length
                ? (completedPageCount / pageUrls.length) * 50
                : 50;
              setProgressPercent((current) => Math.max(current, pageProgress));
            }

            setPhase("assets");
            const pendingAssets = [...assets.values()];
            if (pendingAssets.length === 0) setProgressPercent(99);
            while (pendingAssets.length > 0) {
              const assetUrl = pendingAssets.shift()!;
              if (cachedUrls.has(assetUrl.href)) continue;

              const response = await fetch(assetUrl, { cache: "reload" });
              if (!response.ok) {
                throw new Error("Unable to download a book asset");
              }
              await cache.put(assetUrl, response.clone());
              cachedUrls.add(assetUrl.href);

              if (response.headers.get("content-type")?.includes("text/css")) {
                const css = await response.text();
                const cssUrls = css.matchAll(
                  /url\((?:"|')?([^"')]+)(?:"|')?\)/g,
                );
                for (const [, cssUrl] of cssUrls) {
                  const resourceUrl = sameOriginUrl(cssUrl, assetUrl.href);
                  if (
                    resourceUrl &&
                    !cachedUrls.has(resourceUrl.href) &&
                    !assets.has(resourceUrl.href)
                  ) {
                    assets.set(resourceUrl.href, resourceUrl);
                    pendingAssets.push(resourceUrl);
                  }
                }
              }

              completedAssetCount += 1;
              const assetProgress =
                50 + (completedAssetCount / Math.max(assets.size, 1)) * 49;
              setProgressPercent((current) =>
                Math.max(current, Math.min(assetProgress, 99)),
              );
            }

            const manifest = manifestUrl(locale);
            await cache.put(
              manifest,
              new Response(JSON.stringify([...cachedUrls]), {
                headers: { "Content-Type": "application/json" },
              }),
            );

            try {
              for (const previousCacheName of await getLocaleCacheNames(
                locale,
              )) {
                if (previousCacheName === cacheName) continue;
                try {
                  await caches.delete(previousCacheName);
                } catch (cleanupError) {
                  console.error(
                    "Failed to clear a previous offline book cache",
                    cleanupError,
                  );
                }
              }
            } catch (cleanupError) {
              console.error(
                "Failed to list previous offline book caches",
                cleanupError,
              );
            }

            setSavedMarker(locale, true);
            setProgressPercent(100);
            setIsSaved(true);
            setPhase("ready");
          } catch {
            try {
              await caches.delete(cacheName);
            } catch (cleanupError) {
              console.error(
                "Failed to clear an incomplete offline book cache",
                cleanupError,
              );
            }

            try {
              const previousCopy = await findSavedCache(locale);
              setSavedMarker(locale, Boolean(previousCopy));
              setIsSaved(Boolean(previousCopy));
            } catch (lookupError) {
              console.error(
                "Failed to verify the existing offline book cache",
                lookupError,
              );
            }
            setPhase("download-error");
          }
        },
      );
    } catch (lockError) {
      console.error(
        "Failed to coordinate the offline book download",
        lockError,
      );
      setPhase("download-error");
    }
  };

  const removeBook = async () => {
    setPhase("removing");

    try {
      await navigator.locks.request(
        `${CACHE_LOCK_PREFIX}${locale}`,
        async () => {
          for (const cacheName of await getLocaleCacheNames(locale)) {
            await caches.delete(cacheName);
          }
        },
      );
      setSavedMarker(locale, false);
      setIsSaved(false);
      setPhase("ready");
    } catch {
      setPhase("removal-error");
    }
  };

  const handleChange = (checked: boolean) => {
    if (phase !== "ready") return;
    setHasInteracted(true);
    if (checked) {
      void saveBook();
    } else {
      void removeBook();
    }
  };

  let status = "";
  switch (phase) {
    case "pages":
      status = t("offlineSavingPages", {
        current: completedPages,
        total: pagePaths.length,
      });
      break;
    case "assets":
      status = t("offlineSavingAssets");
      break;
    case "download-error":
      status = t("offlineDownloadFailed");
      break;
    case "removal-error":
      status = t("offlineRemovalFailed");
      break;
  }

  const isDownloading = phase === "pages" || phase === "assets";
  const isError = phase === "download-error" || phase === "removal-error";
  const retryLabel =
    phase === "download-error"
      ? t("offlineRetryDownload")
      : t("offlineRetryRemoval");
  const isDisabled = phase !== "ready";

  if (phase === "unsupported") return null;

  return (
    <div
      className={`${STYLES.container} ${
        phase === "checking" ? STYLES.checking : ""
      } ${hasInteracted ? STYLES.interactive : ""}`}
      aria-busy={phase === "checking"}
    >
      {isError ? (
        <div className={`${STYLES.toggle} ${STYLES.error}`}>
          <span className={STYLES.errorMessage} role="alert">
            {status}
          </span>
          <button
            className={STYLES.retry}
            type="button"
            aria-label={retryLabel}
            onClick={() =>
              phase === "download-error" ? void saveBook() : void removeBook()
            }
          >
            <Image
              className={STYLES.retryIcon}
              src="/images/books/retry.png"
              alt=""
              width={759}
              height={759}
            />
          </button>
        </div>
      ) : (
        <label className={STYLES.toggle}>
          <input
            className={STYLES.input}
            type="checkbox"
            checked={(isSaved || isDownloading) && phase !== "removing"}
            disabled={isDisabled}
            onChange={(event) => handleChange(event.currentTarget.checked)}
            aria-label={t("offlineReading")}
          />
          <span
            className={`${STYLES.downloadIndicator} ${
              isDownloading ? STYLES.downloading : ""
            }`}
            style={
              isDownloading
                ? ({
                    "--download-progress": `${progressPercent}%`,
                  } as CSSProperties)
                : undefined
            }
            role={isDownloading ? "progressbar" : undefined}
            aria-label={isDownloading ? t("offlineReading") : undefined}
            aria-valuemin={isDownloading ? 0 : undefined}
            aria-valuemax={isDownloading ? 100 : undefined}
            aria-valuenow={
              isDownloading ? Math.round(progressPercent) : undefined
            }
            aria-valuetext={isDownloading ? status : undefined}
          >
            <span
              className={`${STYLES.downloadArrow} ${
                isSaved ? STYLES.downloadComplete : ""
              }`}
              aria-hidden="true"
            >
              {isSaved ? "✓" : "↓"}
            </span>
          </span>
          <span
            className={`${STYLES.label} ${
              !isSaved || phase === "removing" ? STYLES.accentLabel : ""
            }`}
          >
            {t("offlineReading")}
          </span>
          <span className={STYLES.switch} aria-hidden="true" />
        </label>
      )}
      {isDownloading && (
        <span
          className={STYLES.visuallyHidden}
          role="status"
          aria-live="polite"
        >
          {status}
        </span>
      )}
    </div>
  );
}
