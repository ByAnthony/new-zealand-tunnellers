"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import STYLES from "./OfflineBookToggle.module.scss";

const CACHE_NAME_PREFIX = "nzt-offline-book-v1-";

type Props = {
  locale: string;
  pagePaths: string[];
};

type Phase =
  | "checking"
  | "pages"
  | "assets"
  | "removing"
  | "ready"
  | "error"
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

export function OfflineBookToggle({ locale, pagePaths }: Props) {
  const t = useTranslations("books");
  const [phase, setPhase] = useState<Phase>("checking");
  const [isSaved, setIsSaved] = useState(false);
  const [completedPages, setCompletedPages] = useState(0);
  const pathsKey = pagePaths.join("\n");
  const cacheName = `${CACHE_NAME_PREFIX}${locale}`;

  useEffect(() => {
    let isCurrent = true;

    const checkOfflineCopy = async () => {
      if (!("serviceWorker" in navigator) || !("caches" in window)) {
        if (isCurrent) setPhase("unsupported");
        return;
      }

      try {
        await navigator.serviceWorker.register("/service-worker.js");
        await navigator.serviceWorker.ready;
        const cache = await caches.open(cacheName);
        const savedUrls = await readSavedUrls(cache, locale);
        if (isCurrent) {
          setIsSaved(Boolean(savedUrls));
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
  }, [cacheName, locale]);

  const saveBook = async () => {
    const pageUrls = pathsKey
      .split("\n")
      .map((path) => new URL(path, window.location.origin));
    const cachedUrls = new Set<string>();
    const assets = new Map<string, URL>();

    setPhase("pages");
    setCompletedPages(0);

    try {
      await navigator.serviceWorker.register("/service-worker.js");
      await navigator.serviceWorker.ready;
      await caches.delete(cacheName);
      const cache = await caches.open(cacheName);

      for (const pageUrl of pageUrls) {
        const response = await fetch(pageUrl, { cache: "reload" });
        if (!response.ok) throw new Error("Unable to download a book page");

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

        setCompletedPages((completed) => completed + 1);
      }

      setPhase("assets");
      const pendingAssets = [...assets.values()];
      while (pendingAssets.length > 0) {
        const assetUrl = pendingAssets.shift()!;
        if (cachedUrls.has(assetUrl.href)) continue;

        const response = await fetch(assetUrl, { cache: "reload" });
        if (!response.ok) throw new Error("Unable to download a book asset");
        await cache.put(assetUrl, response.clone());
        cachedUrls.add(assetUrl.href);

        if (response.headers.get("content-type")?.includes("text/css")) {
          const css = await response.text();
          const cssUrls = css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g);
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
      }

      const manifest = manifestUrl(locale);
      await cache.put(
        manifest,
        new Response(JSON.stringify([...cachedUrls]), {
          headers: { "Content-Type": "application/json" },
        }),
      );
      setIsSaved(true);
      setPhase("ready");
    } catch {
      await caches.delete(cacheName);
      setIsSaved(false);
      setPhase("error");
    }
  };

  const removeBook = async () => {
    setPhase("removing");
    try {
      await caches.delete(cacheName);
      setIsSaved(false);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  };

  const handleChange = (checked: boolean) => {
    if (phase !== "ready" && phase !== "error") return;
    if (checked) {
      void saveBook();
    } else {
      void removeBook();
    }
  };

  const status =
    phase === "pages"
      ? t("offlineSavingPages", {
          current: completedPages,
          total: pagePaths.length,
        })
      : phase === "assets"
        ? t("offlineSavingAssets")
        : phase === "removing"
          ? t("offlineRemoving")
          : phase === "unsupported"
            ? t("offlineUnavailable")
            : phase === "error"
              ? t("offlineDownloadFailed")
              : "";

  const isDownloading = phase === "pages" || phase === "assets";
  const isDisabled = phase !== "ready" && phase !== "error";
  const showStatusInLabel = isDownloading;
  const secondaryStatus = showStatusInLabel ? "" : status;

  return (
    <div className={STYLES.container}>
      <label className={STYLES.toggle}>
        <input
          className={STYLES.input}
          type="checkbox"
          checked={isSaved || isDownloading}
          disabled={isDisabled}
          onChange={(event) => handleChange(event.currentTarget.checked)}
          aria-label={t("offlineReading")}
          aria-describedby={secondaryStatus ? "offline-book-status" : undefined}
        />
        <span
          className={STYLES.label}
          role={showStatusInLabel ? "status" : undefined}
          aria-live={showStatusInLabel ? "polite" : undefined}
        >
          {showStatusInLabel ? status : t("offlineReading")}
        </span>
        <span className={STYLES.switch} aria-hidden="true" />
      </label>
      {secondaryStatus && (
        <span
          className={STYLES.status}
          id="offline-book-status"
          role="status"
          aria-live="polite"
        >
          {secondaryStatus}
        </span>
      )}
    </div>
  );
}
