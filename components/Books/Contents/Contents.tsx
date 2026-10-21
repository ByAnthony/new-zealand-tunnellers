import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("books");
  const slug = href.replace(/^\.\//, "").replace(/\.md$/, "");
  const title = extractText(children).trim();
  const chap = parseChapterHeading(title, locale);
  const fullPath = `${basePath(locale)}${slug}/`;

  if (!chap) {
    return (
      <Link
        href={fullPath}
        className={STYLES["button-chapter"]}
        aria-label={t("read", { title })}
      >
        <span className={STYLES["entry-title"]}>{title}</span>
        <ChapterProgressRing pathname={fullPath} />
      </Link>
    );
  }

  return (
    <Link
      href={fullPath}
      className={STYLES["button-chapter"]}
      aria-label={t("goToChapter", { chapter: chap.number, title: chap.text })}
    >
      <span className={STYLES.chapter} aria-hidden="true">
        {chap.number}
      </span>
      <span className={STYLES["entry-title"]}>
        {chap.text || `${t("chapter")} ${chap.number}`}
      </span>
      <ChapterProgressRing pathname={fullPath} />
    </Link>
  );
};

const MainTitle: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const t = useTranslations("books");

  return (
    <div className={STYLES.header}>
      <div className={STYLES.link}></div>
      <h1>{children}</h1>
      <div className={STYLES.author}>
        <div>
          <span className={STYLES.by}>{t("by")}</span> Anthony Byledbal
        </div>
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
          h1: ({ children }) => <MainTitle>{children}</MainTitle>,
          ul: ({ children }) => (
            <div className={STYLES["contents-layout"]}>
              <div className={STYLES.artwork}>
                <Image
                  src="/images/books/artwork.jpg"
                  alt=""
                  width={325}
                  height={250}
                  sizes="(min-width: 896px) 360px, 280px"
                />
              </div>
              <ul>{children}</ul>
            </div>
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
