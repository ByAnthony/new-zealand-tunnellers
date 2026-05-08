"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo, useSyncExternalStore } from "react";

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

const subscribeToCitationAccessDate = () => () => {};
const getServerCitationAccessDate = () => null;

function formatCitationAccessDate(locale: string, accessedLabel: string) {
  const now = new Date();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentDate = formatCitationDate(now, locale, userTimeZone);

  return ` (${accessedLabel}${currentDate}).`;
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
        {fullUrl}
      </span>
    );
  }

  return (
    <span>
      {availableAtLabel}
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
  const accessedLabel = locale === "en" ? "Accessed: " : "Consulté le\u00A0: ";
  const accessDate = useSyncExternalStore(
    subscribeToCitationAccessDate,
    () => formatCitationAccessDate(locale, accessedLabel),
    getServerCitationAccessDate,
  );
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
  const citationTextTitle = useMemo(() => {
    if (!citationChapterTitle) return citationTitle;

    return `${locale === "en" ? "\u201C" : "«\u00A0"}${citationChapterTitle}${locale === "en" ? "\u201D" : "\u00A0»"}, in ${bookTitle(locale)}`;
  }, [citationChapterTitle, citationTitle, locale]);
  const citationUrl = useMemo(
    () =>
      buildCitationUrl({
        tunnellerSlug,
        title,
        slug,
        timeline,
        pathname,
        locale,
      }),
    [tunnellerSlug, title, slug, timeline, pathname, locale],
  );

  const handleCopy = () => {
    const now = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDate = formatCitationDate(now, locale, userTimeZone);
    const availableAtLabel = getCitationAvailableAtLabel(locale);
    const citationText = `${citationAuthorPrefix}${citationTextTitle}, New Zealand Tunnellers Website (2009). ${availableAtLabel}${citationUrl} (${accessedLabel}${currentDate}).`;

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
      <p>
        {citationAuthorPrefix}
        {citationChapterTitle ? (
          <>
            {locale === "en" ? "\u201C" : "«\u00A0"}
            {citationChapterTitle}
            {locale === "en" ? "\u201D" : "\u00A0»"}, in{" "}
            <em>{bookTitle(locale)}</em>
          </>
        ) : (
          <em>{citationTitle}</em>
        )}
        , New Zealand Tunnellers Website
        {" (2009). "}
        <HowToCiteUrl
          tunnellerSlug={tunnellerSlug}
          title={title}
          slug={slug}
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
        {accessDate}
      </p>
    </div>
  );
}
