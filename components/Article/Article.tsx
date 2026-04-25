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
import { getMapPeriodsForChapter } from "@/utils/historyMapLinks";

import STYLES from "./Article.module.scss";
import { formatPeriodRange } from "../WorksMap/utils/mapParams";

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
  const relatedMapPeriods = getMapPeriodsForChapter(article.id);
  const shouldShowMapCard = relatedMapPeriods.length > 0;
  const isTerminalMapCard = shouldShowMapCard && article.next === null;
  const relatedMapLabel =
    locale === "fr" ? "Explorer sur la carte" : "Explore On The Map";

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
        <div
          className={`${STYLES["context-map-block"]} ${isTerminalMapCard ? STYLES["context-map-block--terminal"] : ""}`.trim()}
        >
          <ul className={STYLES["context-link-list"]}>
            <li>
              <div className={STYLES["context-link-card"]}>
                <span className={STYLES["context-link-main"]}>
                  <span className={STYLES["context-link-panel"]}>
                    <span className={STYLES["context-link-header"]}>
                      <MapPinBadge />
                      <span className={STYLES["context-link-label"]}>
                        {relatedMapLabel}
                      </span>
                    </span>
                    {relatedMapPeriods.map((period) => (
                      <Link
                        key={period.key}
                        href={`${localePrefix}/maps/tunnellers-works?period=true&frontlines=true&from=${period.start}&to=${period.end}`}
                        className={STYLES["context-map-link"]}
                      >
                        <span className={STYLES["context-map-link-title"]}>
                          {locale === "fr" ? period.fr : period.en}
                        </span>
                        <span className={STYLES["context-map-link-meta"]}>
                          <span className={STYLES["context-link-period"]}>
                            {formatPeriodRange(
                              locale,
                              period.start,
                              period.end,
                            )}
                          </span>
                        </span>
                        <span
                          className={STYLES["context-map-link-arrow"]}
                          aria-hidden="true"
                        >
                          &rarr;
                        </span>
                      </Link>
                    ))}
                  </span>
                </span>
              </div>
            </li>
          </ul>
        </div>
      )}
      <ArticleNextChapterButton
        chapter={article.next}
        compactSpacing={shouldShowMapCard}
      />
      <ArticleNotes notes={article.notes} />
      <HowToCite title={article.title} slug={article.id} />
    </div>
  );
}
