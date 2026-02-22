import Link from "next/link";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import { basePath } from "@/utils/helpers/books/basePathUtil";
import { extractText } from "@/utils/helpers/books/titleUtil";

import STYLES from "./Contents.module.scss";

type Props = {
  locale: string;
  content: string;
};

const parseChapterHeading = (
  title: string,
  locale: string,
): { number: number; text: string } | null => {
  const chapterKeyword = locale === "fr" ? "chapitre" : "chapter";
  const regex = new RegExp(
    `^\\s*${chapterKeyword}\\s+(\\d+)\\s*[:\\-–—]?\\s*(.*)$`,
    "i",
  );
  const m = title.match(regex);
  if (!m) return null;
  return { number: parseInt(m[1], 10), text: (m[2] ?? "").trim() };
};

const slugifyTitle = (title: string): string => {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘']/g, "-")
    .replace(/œ/g, "oe")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const SommaireItem: React.FC<{
  locale: string;
  children: ReactNode;
}> = ({ locale, children }) => {
  const title = extractText(children).trim();
  const slug = slugifyTitle(title);
  const chap = parseChapterHeading(title, locale);

  if (!chap) {
    return (
      <li className={STYLES.titre}>
        <Link href={`${basePath(locale)}/${slug}`}>{title}</Link>
      </li>
    );
  }

  return (
    <li>
      <Link href={`${basePath(locale)}/${slug}`}>
        <div className={STYLES["titre-container"]}>
          <div className={STYLES.chapitre}>
            {locale === "fr" ? "Chapitre" : "Chapter"} {chap.number}
          </div>
          {chap.text && (
            <div className={STYLES["chapitre-titre"]}>{chap.text}</div>
          )}
        </div>
      </Link>
    </li>
  );
};

export const Contents: React.FC<Props> = ({ locale, content }) => {
  return (
    <div className={STYLES.container}>
      <div className={STYLES["sommaire-content"]}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkRemoveComments]}
          components={{
            ul: ({ children }) => <ul>{children}</ul>,
            li: ({ children }) => (
              <SommaireItem locale={locale}>{children}</SommaireItem>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
