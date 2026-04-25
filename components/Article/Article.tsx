"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import { ArticleNextChapterButton } from "@/components/Article/ArticleNextChapterButton/ArticleNextChapterButton";
import { ArticleNotes } from "@/components/Article/ArticleNotes/ArticleNotes";
import { ArticleRelatedMapCard } from "@/components/Article/ArticleRelatedMapCard/ArticleRelatedMapCard";
import { Content } from "@/components/Article/Content/Content";
import { TopImage } from "@/components/Article/TopImage/TopImage";
import { HowToCite } from "@/components/HowToCite/HowToCite";
import { Title } from "@/components/Title/Title";
import { Chapter } from "@/types/article";
import { getMapPeriodsForChapter } from "@/utils/historyMapLinks";

import STYLES from "./Article.module.scss";

type Props = {
  article: Chapter;
};

export function Article({ article }: Props) {
  const t = useTranslations("article");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const shouldShowMapCard = getMapPeriodsForChapter(article.id).length > 0;

  useEffect(() => {
    localStorage.removeItem("filters");
    localStorage.removeItem("page");
    localStorage.removeItem("roll:scrollY");
  }, []);

  return (
    <div className={STYLES.container}>
      <div className={STYLES.header}>
        <div className={STYLES.link}>
          <Link href={`${localePrefix}/#history`}>{t("history")}</Link>
        </div>
        <Title title={article.title} subTitle={article.chapter} />
      </div>
      <TopImage image={article.image[0]} />
      <Content
        imageList={article.image.slice(1)}
        sectionList={article.section}
      />
      <ArticleRelatedMapCard
        articleId={article.id}
        hasNextChapter={article.next !== null}
        locale={locale}
        localePrefix={localePrefix}
      />
      <ArticleNextChapterButton
        chapter={article.next}
        compactSpacing={shouldShowMapCard}
      />
      <ArticleNotes notes={article.notes} />
      <HowToCite title={article.title} slug={article.id} />
    </div>
  );
}
