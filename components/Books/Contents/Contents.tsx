import Link from "next/link";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import { ChapterProgressRing } from "@/components/Books/ChapterProgressRing/ChapterProgressRing";
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

const SommaireItem: React.FC<{
  locale: string;
  href: string;
  children: ReactNode;
}> = ({ locale, href, children }) => {
  const slug = href.replace(/^\.\//, "").replace(/\.md$/, "");
  const title = extractText(children).trim();
  const chap = parseChapterHeading(title, locale);
  const fullPath = `${basePath(locale)}/${slug}`;

  if (!chap) {
    return (
      <Link
        href={fullPath}
        className={STYLES["button-chapter"]}
        aria-label={locale === "fr" ? `Lire : ${title}` : `Read: ${title}`}
      >
        <div>
          <span className={STYLES["titre-container"]}>{title}</span>
        </div>
        <ChapterProgressRing pathname={fullPath} />
      </Link>
    );
  }

  return (
    <Link
      href={fullPath}
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
      <ChapterProgressRing pathname={fullPath} />
    </Link>
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
          href={`${locale === "en" ? "" : `/${locale}`}/#resources`}
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
          a: ({ href, children }) => (
            <SommaireItem locale={locale} href={href ?? ""}>
              {children}
            </SommaireItem>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
