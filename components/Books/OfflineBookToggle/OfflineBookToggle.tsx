"use client";

import Image from "next/image";
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

export function OfflineBookToggle({ locale, pagePaths }: Props) {
  const t = useTranslations("books");
  const [phase, setPhase] = useState<Phase>("checking");
  const [isSaved, setIsSaved] = useState(false);
  const [completedPages, setCompletedPages] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
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
    let completedPageCount = 0;
    let completedAssetCount = 0;

    setPhase("pages");
    setCompletedPages(0);
    setProgressPercent(0);

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

        completedPageCount += 1;
        setCompletedPages(completedPageCount);
        const pageProgress =
          pageUrls.length > 0
            ? (completedPageCount / pageUrls.length) * 50
            : 50;
        setProgressPercent((current) => Math.max(current, pageProgress));
      }

      setPhase("assets");
      setProgressPercent(assets.size > 0 ? 50 : 100);
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

        completedAssetCount += 1;
        const assetProgress = 50 + (completedAssetCount / assets.size) * 50;
        setProgressPercent((current) => Math.max(current, assetProgress));
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
      setPhase("download-error");
    }
  };

  const removeBook = async () => {
    setPhase("removing");
    setProgressPercent(100);

    try {
      const [deleteResult] = await Promise.allSettled([
        caches.delete(cacheName),
        new Promise<void>((resolve) => {
          const duration = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
          ).matches
            ? 0
            : 900;
          window.setTimeout(() => {
            setProgressPercent(0);
            window.setTimeout(resolve, duration);
          }, 0);
        }),
      ]);
      if (deleteResult.status === "rejected") throw deleteResult.reason;
      setIsSaved(false);
      setPhase("ready");
    } catch {
      setPhase("removal-error");
    }
  };

  const handleChange = (checked: boolean) => {
    if (phase !== "ready") return;
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
  const isShowingProgress = isDownloading || phase === "removing";
  const isError = phase === "download-error" || phase === "removal-error";
  const retryLabel =
    phase === "download-error"
      ? t("offlineRetryDownload")
      : t("offlineRetryRemoval");
  const isDisabled = phase !== "ready";

  if (phase === "unsupported") return null;

  return (
    <div className={STYLES.container}>
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
        <label
          className={`${STYLES.toggle} ${
            isSaved && phase !== "removing" ? STYLES.saved : ""
          }`.trim()}
        >
          <input
            className={STYLES.input}
            type="checkbox"
            checked={isSaved && phase !== "removing"}
            disabled={isDisabled}
            onChange={(event) => handleChange(event.currentTarget.checked)}
            aria-label={t("offlineReading")}
          />
          {isShowingProgress && (
            <span
              className={STYLES.progressTrack}
              role="progressbar"
              aria-label={t("offlineReading")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              aria-valuetext={status}
            >
              <span
                className={STYLES.progressFill}
                style={{ width: `${progressPercent}%` }}
                aria-hidden="true"
              >
                <span className={STYLES.progressLabel}>
                  {t("offlineReading")}
                </span>
              </span>
            </span>
          )}
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
