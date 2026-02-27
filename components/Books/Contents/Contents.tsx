import Link from "next/link";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import { basePath } from "@/utils/helpers/books/basePathUtil";
import {
  extractText,
  parseChapterHeading,
} from "@/utils/helpers/books/titleUtil";

import STYLES from "./Contents.module.scss";

type Props = {
  locale: string;
  content: string;
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
      <li>
        <Link
          href={`${basePath(locale)}/${slug}`}
          className={STYLES["button-chapter"]}
          aria-label={locale === "fr" ? `Lire : ${title}` : `Read: ${title}`}
        >
          <div>
            <span className={STYLES["titre-container"]}>{title}</span>
          </div>
          <div className={STYLES.arrow}>&rarr;</div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`${basePath(locale)}/${slug}`}
        className={STYLES["button-chapter"]}
        aria-label={
          locale === "fr"
            ? `Aller au chapitre ${chap.number} : ${chap.text}`
            : `Go to chapter ${chap.number}: ${chap.text}`
        }
      >
        <div>
          <p className={STYLES.chapter}>
            {locale === "fr" ? "Chapitre" : "Chapter"} {chap.number}
          </p>
          {chap.text && <span>{chap.text}</span>}
        </div>
        <div className={STYLES.arrow}>&rarr;</div>
      </Link>
    </li>
  );
};

const MainTitle: React.FC<{
  locale: string;
  children: ReactNode;
}> = ({ locale, children }) => {
  return (
    <div className={STYLES.header}>
      <div className={STYLES.link}>
        <Link
          href="/#resources"
          aria-label={
            locale === "fr"
              ? "Aller à la section Ressources"
              : "Go to the Resources section"
          }
        >
          Resources
        </Link>
      </div>
      <h1>{children}</h1>
      <div className={STYLES.author}>
        {locale === "fr"
          ? "Un livre d'Anthony Byledbal"
          : "A book by Anthony Byledbal"}
      </div>
    </div>
  );
};

export const Contents: React.FC<Props> = ({ locale, content }) => {
  return (
    <div className={STYLES.container}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkRemoveComments]}
        components={{
          h1: ({ children }) => (
            <MainTitle locale={locale}>{children}</MainTitle>
          ),
          li: ({ children }) => (
            <SommaireItem locale={locale}>{children}</SommaireItem>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
