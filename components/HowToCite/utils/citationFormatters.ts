import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import type { Summary } from "@/types/tunneller";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { displayBiographyDates } from "@/utils/helpers/roll";

type CitationTitleParams = {
  summary?: Summary;
  title?: string;
  chapterTitle?: string;
  timeline?: boolean;
  pathname?: string;
  locale: string;
};

type CitationUrlParams = {
  tunnellerSlug?: string;
  title?: string;
  slug?: string;
  timeline?: boolean;
  pathname?: string;
  locale?: string;
};

const citationMessages = {
  en: enMessages.howToCite,
  fr: frMessages.howToCite,
} as const;

export function sentenceCase(str: string): string {
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function formatBookSubpath(pathname: string, locale: string): string {
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

export function buildCitationTitle({
  summary,
  title,
  chapterTitle,
  timeline,
  pathname,
  locale,
}: CitationTitleParams): string {
  const openQuote = locale === "en" ? "\u201C" : "«\u00A0";
  const closeQuote = locale === "en" ? "\u201D" : "\u00A0»";

  if (pathname) {
    const displayTitle = chapterTitle ?? formatBookSubpath(pathname, locale);
    return `${openQuote}${displayTitle}${closeQuote}, in ${bookTitle(locale)}`;
  }

  if (summary && !timeline) {
    return `${openQuote}${summary.name.forename} ${summary.name.surname} (${displayBiographyDates(summary.birth, summary.death)})${closeQuote}`;
  }

  if (summary && timeline) {
    const timelineOf =
      locale === "en"
        ? "World War I Timeline of"
        : "Chronologie de la guerre de";
    return `${openQuote}${timelineOf} ${summary.name.forename} ${summary.name.surname}${closeQuote}`;
  }

  const articleTitle = title?.replace(/\\/g, " ") ?? "";
  return `${openQuote}${articleTitle}${closeQuote}`;
}

export function buildCitationUrl({
  tunnellerSlug,
  title,
  slug,
  timeline,
  pathname,
  locale = "en",
}: CitationUrlParams): string {
  if (pathname) {
    return `www.nztunnellers.com${pathname.replace(/\/+$/, "")}`;
  }

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const historySlug =
    slug ??
    title
      ?.replace(/\s+|\\/g, "-")
      .replace(/&/g, "and")
      .toLowerCase();

  if (tunnellerSlug && timeline) {
    return `www.nztunnellers.com${localePrefix}/tunnellers/${tunnellerSlug}/wwi-timeline`;
  }

  if (tunnellerSlug) {
    return `www.nztunnellers.com${localePrefix}/tunnellers/${tunnellerSlug}`;
  }

  if (historySlug) {
    return `www.nztunnellers.com${localePrefix}/history/${historySlug}`;
  }

  return localePrefix
    ? `www.nztunnellers.com${localePrefix}`
    : "www.nztunnellers.com/";
}

export function getCitationAvailableAtLabel(locale: string): string {
  const messages =
    citationMessages[locale as keyof typeof citationMessages] ??
    citationMessages.en;

  return messages.availableAt;
}

export function formatCitationDate(
  now: Date,
  locale: string,
  timeZone: string,
) {
  const parts = new Intl.DateTimeFormat(locale === "en" ? "en-NZ" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).formatToParts(now);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  return [day, month].filter(Boolean).join("\u00A0") + (year ? ` ${year}` : "");
}

export function formatCitationYear(
  now: Date,
  locale: string,
  timeZone: string,
) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-NZ" : "fr-FR", {
    year: "numeric",
    timeZone,
  }).format(now);
}
