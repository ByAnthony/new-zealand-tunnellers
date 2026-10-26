"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Fragment, useMemo, useRef, useSyncExternalStore } from "react";

import type { Summary } from "@/types/tunneller";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";

import STYLES from "./HowToCite.module.scss";
import {
  buildCitationTitle,
  buildCitationUrl,
  formatCitationDate,
  formatBookSubpath,
  getCitationAvailableAtLabel,
} from "./utils/citationFormatters";

type Props = {
  tunnellerSlug?: string;
  summary?: Summary;
  title?: string;
  slug?: string;
  chapterTitle?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

type HowToCiteUrlProps = {
  tunnellerSlug?: string;
  title?: string;
  slug?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

const SITE_CITATION_YEAR = "2009";
const BOOK_CITATION_YEAR = "2017";
const URL_BREAK_POINTS = /^(www\.|nztunnellers\.|\/|-)$/;

const subscribeToNothing = () => () => {};

// Static pages are prerendered at build time, so the reader's access date is
// only known in the browser. The server snapshot keeps hydration consistent.
function useIsClient() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function BreakableCitationUrl({ url }: { url: string }) {
  let key = 0;
  return url
    .split(/(www\.|nztunnellers\.|\/|-)/g)
    .filter(Boolean)
    .map((part) => (
      <Fragment key={key++}>
        {part}
        {URL_BREAK_POINTS.test(part) ? <wbr /> : null}
      </Fragment>
    ));
}

export function HowToCiteUrl({
  tunnellerSlug,
  title,
  slug,
  timeline,
  pathname,
  locale = "en",
}: HowToCiteUrlProps) {
  const fullUrl = buildCitationUrl({
    tunnellerSlug,
    title,
    slug,
    timeline,
    pathname,
    locale,
  });
  const availableAtLabel = getCitationAvailableAtLabel(locale);

  if (pathname) {
    return (
      <span>
        {availableAtLabel}
        <wbr />
        <BreakableCitationUrl url={fullUrl} />
      </span>
    );
  }

  return (
    <span>
      {availableAtLabel}
      <wbr />
      <BreakableCitationUrl url={fullUrl} />
    </span>
  );
}

export function HowToCite({
  tunnellerSlug,
  summary,
  title,
  slug,
  chapterTitle,
  timeline,
  pathname,
  locale: localeProp,
}: Props) {
  const localeFromContext = useLocale();
  const locale = localeProp ?? localeFromContext;
  const citationRef = useRef<HTMLParagraphElement>(null);

  const isClient = useIsClient();
  const currentDate = useMemo(
    () =>
      isClient
        ? formatCitationDate(
            new Date(),
            locale,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          )
        : null,
    [isClient, locale],
  );
  const accessedLabel = locale === "en" ? "Accessed: " : "Consulté le\u00A0: ";
  const citationAuthorPrefix = summary ? "" : "Anthony Byledbal, ";
  const citationTitle = useMemo(
    () =>
      buildCitationTitle({
        summary,
        title,
        chapterTitle,
        timeline,
        pathname,
        locale,
      }),
    [summary, title, chapterTitle, timeline, pathname, locale],
  );
  const citationChapterTitle = useMemo(
    () =>
      pathname ? (chapterTitle ?? formatBookSubpath(pathname, locale)) : null,
    [chapterTitle, pathname, locale],
  );
  const citationYear = citationChapterTitle
    ? BOOK_CITATION_YEAR
    : SITE_CITATION_YEAR;

  const handleCopy = () => {
    if (citationRef.current) {
      const citationText = citationRef.current.textContent ?? "";
      navigator.clipboard
        .writeText(citationText)
        .then(() => {
          alert(
            locale === "en"
              ? "How to cite has been copied to clipboard"
              : "Comment citer a été copié dans le presse-papiers",
          );
        })
        .catch((err) => {
          alert(
            locale === "en"
              ? "Failed to copy to clipboard. Please try selecting and copying the text manually."
              : "Échec de la copie dans le presse-papiers. Veuillez essayer de sélectionner et de copier le texte manuellement.",
          );
          // Only log errors in development
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to copy: ", err);
          }
        });
    }
  };

  return (
    <div className={STYLES.howtocite}>
      <h3>
        {locale === "en" ? "How to cite this page" : "Comment citer cette page"}
        <button className={STYLES["copy-paste"]} onClick={handleCopy}>
          <Image
            src={`/copy.png`}
            alt={
              locale === "en"
                ? "Copy to clipboard"
                : "Copier dans le presse-papiers"
            }
            width={13}
            height={16}
            placeholder="empty"
          />
        </button>
      </h3>
      <p ref={citationRef}>
        {citationAuthorPrefix}
        {citationChapterTitle ? (
          <>
            {locale === "en" ? "\u201C" : "«\u00A0"}
            {citationChapterTitle}
            {locale === "en" ? "\u201D" : "\u00A0»"}, in{" "}
            <em>{bookTitle(locale)}</em>
          </>
        ) : (
          citationTitle
        )}
        ,{" "}
        {citationChapterTitle ? (
          "New Zealand Tunnellers"
        ) : (
          <em>New Zealand Tunnellers</em>
        )}
        {`, ${citationYear}. `}
        <HowToCiteUrl
          tunnellerSlug={tunnellerSlug}
          title={title}
          slug={slug}
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
        {currentDate && (
          <>
            {` (${accessedLabel}`}
            {currentDate}
            {")"}
          </>
        )}
      </p>
    </div>
  );
}
