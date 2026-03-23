"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo, useRef } from "react";

import type { Summary } from "@/types/tunneller";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./HowToCite.module.scss";

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

type HowToCiteTitleProps = {
  tunneller?: Summary;
  title?: string;
  chapterTitle?: string;
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
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  if (pathname) {
    return (
      <span>
        URL:
        <wbr />
        www.nztunnellers
        <wbr />
        .com
        <wbr />
        {pathname}
      </span>
    );
  }

  return (
    <span>
      URL: www.
      <wbr />
      nztunnellers
      <wbr />
      .com{localePrefix}/
      <wbr />
      {tunnellerSlug && !timeline && (
        <>
          tunnellers/
          <wbr />
          {tunnellerSlug}
        </>
      )}
      {tunnellerSlug && timeline && (
        <>
          tunnellers/
          <wbr />
          {tunnellerSlug}
          /
          <wbr />
          wwi-
          <wbr />
          timeline
        </>
      )}
      {!tunnellerSlug && (slug ?? title) && (
        <>
          history/
          <wbr />
          {slug ??
            title
              ?.replace(/\s+|\\/g, "-")
              .replace(/&/g, "and")
              .toLowerCase()}
        </>
      )}
    </span>
  );
}

function sentenceCase(str: string): string {
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatBookSubpath(pathname: string, locale: string): string {
  const cleanPath = pathname.replace(/\/$/, "");
  const segments = cleanPath.split("/");
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return "";

  const chapitreOrChapter = locale === "en" ? "chapter" : "chapitre";

  const chapterMatch = lastSegment.match(
    new RegExp(`^${chapitreOrChapter}-(\\d+)(?:-(.*))?$`, "i"),
  );

  const chapterWord = locale === "en" ? "Chapter" : "Chapitre";
  const colon = locale === "en" ? ":" : "\u00A0:";

  if (chapterMatch) {
    const chapterNumber = chapterMatch[1];
    const rest = chapterMatch[2];

    if (!rest) {
      return `${chapterWord} ${chapterNumber}${colon}`;
    }

    const formattedTitle = sentenceCase(rest.replace(/-/g, " "));
    return `${chapterWord} ${chapterNumber}${colon} ${formattedTitle}`;
  }

  return sentenceCase(lastSegment.replace(/-/g, " "));
}

function HowToCiteTitle({
  tunneller,
  title,
  chapterTitle,
  timeline,
  pathname,
  locale,
}: HowToCiteTitleProps) {
  const openQuote = locale === "en" ? "\u201C" : "«\u00A0";
  const closeQuote = locale === "en" ? "\u201D" : "\u00A0»";

  if (pathname && locale) {
    const rawTitle = chapterTitle ?? formatBookSubpath(pathname, locale);
    const displayTitle =
      locale === "fr" ? rawTitle.replace(/: /g, "\u00A0: ") : rawTitle;
    return (
      <span>
        {openQuote}
        {displayTitle}
        {closeQuote}, in <em>{bookTitle(locale)}</em>
      </span>
    );
  }

  if (tunneller && !timeline) {
    return (
      <>
        {openQuote}
        {`${tunneller.name.forename} ${tunneller.name.surname} `}
        {`(${displayBiographyDates(tunneller.birth, tunneller.death)})`}
        {closeQuote}
      </>
    );
  }

  if (tunneller && timeline) {
    const timelineOf =
      locale === "en"
        ? "World War I Timeline of"
        : "Chronologie de la guerre de";
    return (
      <>
        {openQuote}
        {timelineOf}
        {` ${tunneller.name.forename} ${tunneller.name.surname}`}
        {closeQuote}
      </>
    );
  }

  const articleTitle = title?.replace(/\\/g, " ");
  return (
    <span>
      {openQuote}
      {articleTitle}
      {closeQuote}
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
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: userTimeZone,
      }).format(now),
    [locale, now, userTimeZone],
  );
  const currentYear = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
        year: "numeric",
        timeZone: userTimeZone,
      }).format(now),
    [locale, now, userTimeZone],
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
        Anthony Byledbal,{" "}
        <HowToCiteTitle
          tunneller={summary}
          title={title}
          chapterTitle={chapterTitle}
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
        , New Zealand Tunnellers Website
        {`, ${currentYear} (2009), ${locale === "en" ? "Accessed" : "Consulté le"}: `}
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
