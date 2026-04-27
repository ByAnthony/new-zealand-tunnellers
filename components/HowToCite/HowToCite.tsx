"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo, useRef } from "react";

import type { Summary } from "@/types/tunneller";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";

import STYLES from "./HowToCite.module.scss";
import {
  buildCitationTitle,
  buildCitationUrl,
  formatCitationDate,
  formatBookSubpath,
  formatCitationYear,
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
  const urlLabel = locale === "fr" ? "URL\u00A0: " : "URL: ";

  if (pathname) {
    return (
      <span>
        {urlLabel}
        <wbr />
        {fullUrl}
      </span>
    );
  }

  return (
    <span>
      {urlLabel}
      <wbr />
      {fullUrl}
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

  const now = useMemo(() => new Date(), []);
  const userTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const currentDate = useMemo(
    () => formatCitationDate(now, locale, userTimeZone),
    [locale, now, userTimeZone],
  );
  const currentYear = useMemo(
    () => formatCitationYear(now, locale, userTimeZone),
    [locale, now, userTimeZone],
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

  const handleCopy = () => {
    if (citationRef.current) {
      const citationText = citationRef.current.innerText;
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
          "New Zealand Tunnellers Website"
        ) : (
          <em>New Zealand Tunnellers Website</em>
        )}
        {`, ${currentYear} (2009), ${accessedLabel}`}
        {currentDate}
        {". "}
        <HowToCiteUrl
          tunnellerSlug={tunnellerSlug}
          title={title}
          slug={slug}
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
      </p>
    </div>
  );
}
