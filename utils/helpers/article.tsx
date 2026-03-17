import Link from "next/link";

import { ArticleReferenceData } from "@/types/article";

export const renderSuperscript = (text: string) => {
  const parts = text.split(/(\^\w+)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith("^") ? <sup key={i}>{part.slice(1)}</sup> : part,
  );
};

export const getNextChapter = (
  chapter: number,
  articles: ArticleReferenceData[],
) => {
  const index = articles.findIndex(
    (article: ArticleReferenceData) => article.chapter === chapter,
  );

  if (index !== -1 && index + 1 < articles.length) {
    const nextArticle = articles[index + 1];
    return {
      url: nextArticle.id,
      chapter: nextArticle.chapter,
      title: nextArticle.title,
    };
  }

  return null;
};

export const formatText = (text: string) => {
  const paragraphs = text.split("\\n\\n");

  let segmentKey: number = 0;

  return paragraphs.map((paragraph) => {
    const segments = paragraph
      .replace(/--/g, "\u00A0")
      .split(/(\*.+?\*)|(\[.+?\))|(\^\w+)/g);

    const formattedSegments = segments
      .filter((segment) => segment)
      .map((segment) => {
        segmentKey += 1;

        if (segment && segment.startsWith("*") && segment.endsWith("*")) {
          const italicText = segment.slice(1, -1);
          return <em key={segmentKey}>{italicText}</em>;
        }

        if (segment && segment.startsWith("^")) {
          return <sup key={segmentKey}>{segment.slice(1)}</sup>;
        }

        if (segment && segment.startsWith("[") && segment.endsWith(")")) {
          const linkText = segment.slice(1, -1);

          const [label, url] = linkText.split("](");

          if (url.includes("footnote")) {
            return (
              <a
                key={segmentKey}
                href={url}
                id={`reference_${label}`}
                className="anchor-link"
                aria-label={`Jump to reference ${label} for the source of information`}
              >
                {`[${label}]`}
              </a>
            );
          }
          if (url.includes("reference")) {
            return (
              <a
                key={segmentKey}
                href={url}
                id={`footnote_${label.slice(0, -1)}`}
                className="anchor-link"
                aria-label={`Jump back to the footnote ${label.slice(0, -1)}`}
              >
                {label}
              </a>
            );
          }
          return (
            <Link
              key={segmentKey}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </Link>
          );
        }

        return <span key={segmentKey}>{segment}</span>;
      });

    return <p key={paragraphs.indexOf(paragraph)}>{formattedSegments}</p>;
  });
};
