"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo, useRef } from "react";

import type { Summary } from "@/types/tunneller";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./HowToCite.module.scss";

type Props = {
  id?: number;
  summary?: Summary;
  title?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

type HowToCiteUrlProps = {
  id?: number;
  title?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

type HowToCiteTitleProps = {
  tunneller?: Summary;
  title?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

export function HowToCiteUrl({
  id,
  title,
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
        {localePrefix}
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
      {id && !timeline && (
        <>
          tunnellers/
          <wbr />
          {id}
        </>
      )}
      {id && timeline && (
        <>
          tunnellers/
          <wbr />
          {id}
          /
          <wbr />
          wwi-
          <wbr />
          timeline
        </>
      )}
      {!id && title && (
        <>
          history/
          <wbr />
          {title
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

  if (chapterMatch) {
    const chapterNumber = chapterMatch[1];
    const rest = chapterMatch[2];

    if (!rest) {
      return `${chapterWord} ${chapterNumber}:`;
    }

    const formattedTitle = sentenceCase(rest.replace(/-/g, " "));
    return `${chapterWord} ${chapterNumber}: ${formattedTitle}`;
  }

  return sentenceCase(lastSegment.replace(/-/g, " "));
}

function HowToCiteTitle({
  tunneller,
  title,
  timeline,
  pathname,
  locale,
}: HowToCiteTitleProps) {
  const openQuote = locale === "en" ? "\u201C" : "«\u00A0";
  const closeQuote = locale === "en" ? "\u201D" : "\u00A0»";

  if (pathname && locale) {
    return (
      <span>
        {openQuote}
        {formatBookSubpath(pathname, locale)}
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
    return (
      <>
        {openQuote}World War I Timeline of
        {` ${tunneller.name.forename} ${tunneller.name.surname}`}
        {closeQuote}
      </>
    );
  }

  const articleTitle = title?.replace(/\\/g, " ");
  return <span>&ldquo;{articleTitle}&rdquo;</span>;
}

export function HowToCite({
  id,
  summary,
  title,
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
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
        , New Zealand Tunnellers Website
        {`, ${currentYear} (2009), ${locale === "en" ? "Accessed" : "Consulté le"}: `}
        {currentDate}
        {". "}
        <HowToCiteUrl
          id={id}
          title={title}
          timeline={timeline}
          pathname={pathname}
          locale={locale}
        />
      </p>
    </div>
  );
}
