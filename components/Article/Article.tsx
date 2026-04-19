"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import { ArticleNextChapterButton } from "@/components/Article/ArticleNextChapterButton/ArticleNextChapterButton";
import { ArticleNotes } from "@/components/Article/ArticleNotes/ArticleNotes";
import { Content } from "@/components/Article/Content/Content";
import { TopImage } from "@/components/Article/TopImage/TopImage";
import { HowToCite } from "@/components/HowToCite/HowToCite";
import { Title } from "@/components/Title/Title";
import { Chapter } from "@/types/article";

import STYLES from "./Article.module.scss";

type Props = {
  article: Chapter;
};

function MapPinBadge() {
  return (
    <span className={STYLES["context-card-badge"]} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          d="M12 21s-5-5.6-5-10a5 5 0 1 1 10 0c0 4.4-5 10-5 10Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="1.8" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Article({ article }: Props) {
  const t = useTranslations("article");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const beneathArtoisMapHref = `${localePrefix}/maps/tunnellers-works?period=true&frontlines=true&from=1916-03-16&to=1916-11-15`;
  const shouldShowMapCard = article.id === "beneath-artois-fields";

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
      {shouldShowMapCard && (
        <div className={STYLES["context-map-block"]}>
          <div className={STYLES["context-map-header"]}>
            <MapPinBadge />
            <h2 className={STYLES["context-map-title"]}>
              {locale === "fr" ? "Carte" : "Map"}
            </h2>
          </div>
          <ul className={STYLES["context-link-list"]}>
            <li>
              <Link
                href={beneathArtoisMapHref}
                className={STYLES["context-link"]}
              >
                War Underground (16 March - 15 November 1916)
              </Link>
            </li>
          </ul>
        </div>
      )}
      <ArticleNextChapterButton chapter={article.next} />
      <ArticleNotes notes={article.notes} />
      <HowToCite title={article.title} slug={article.id} />
    </div>
  );
}
