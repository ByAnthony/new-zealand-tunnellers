"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Next } from "@/types/article";

import STYLES from "./ArticleNextChapterButton.module.scss";

type Props = {
  chapter: Next | null;
};

export function ArticleNextChapterButton({ chapter }: Props) {
  const t = useTranslations("article");

  if (chapter) {
    return (
      <div className={STYLES["button-chapter-container"]}>
        <Link
          href={`/history/${chapter.url}`}
          className={STYLES["button-chapter"]}
          aria-label={t("goToChapter", {
            chapter: chapter.chapter,
            title: chapter.title.replace(/\\/g, " "),
          })}
        >
          <div>
            <p className={STYLES.chapter}>
              {t("chapter", { chapter: chapter.chapter })}
            </p>
            <span>{chapter.title.replace(/\\/g, " ")}</span>
          </div>
          <div className={STYLES.arrow}>&rarr;</div>
        </Link>
      </div>
    );
  }
  return null;
}
