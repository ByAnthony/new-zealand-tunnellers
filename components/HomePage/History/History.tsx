"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { HistoryChapter } from "@/types/homepage";

import STYLES from "./History.module.scss";

type Props = {
  articles: HistoryChapter[];
};

export function History({ articles }: Props) {
  const t = useTranslations("homepage");
  const tArticle = useTranslations("article");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollClick = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: index * (containerRef.current.clientWidth / 3),
      });
    }
  };

  const handleScrollLeft = () => {
    if (containerRef.current) {
      const previousIndex = currentIndex - 1;
      scrollClick(previousIndex);
      setCurrentIndex(previousIndex);
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      const nextIndex = currentIndex + 1;
      scrollClick(nextIndex);
      setCurrentIndex(nextIndex);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const cardWidth = clientWidth / 3;
      const nextIndex = Math.round(scrollLeft / cardWidth);
      if (currentIndex !== nextIndex) {
        setCurrentIndex(nextIndex);
      }
    }
  };

  const isLastCard = currentIndex === articles.length - 3;
  const isFirstCard = currentIndex === 0;

  const buttonDisabledStyle = {
    color: "rgb(44, 46, 47)",
    borderColor: "rgb(44, 46, 47)",
    backgroundColor: "rgb(24, 26, 27)",
    cursor: "not-allowed",
  };
  const buttonFirstCard = isFirstCard ? buttonDisabledStyle : {};
  const buttonLastCard = isLastCard ? buttonDisabledStyle : {};

  return (
    <div className={STYLES["history-chapter"]}>
      <div id="history" className={STYLES["chapter-cards-wrapper"]}>
        <div className={STYLES["chapter-cards-menu"]}>
          <h2>{t("historyOfTheCompany")}</h2>
          <div className={STYLES["chapter-cards-nav"]}>
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={isFirstCard}
              style={buttonFirstCard}
              aria-label={t("seePreviousChapters")}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={isLastCard}
              style={buttonLastCard}
              aria-label={t("seeNextChapters")}
            >
              &rarr;
            </button>
          </div>
        </div>
        <div
          className={STYLES["chapter-cards"]}
          ref={containerRef}
          onScroll={handleScroll}
          data-testid="chapters-scroll"
        >
          {articles.map((article) => {
            const divStyle = {
              backgroundImage: `url(/images/history/${article.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            };
            const splitTitle = (string: string) => {
              const split = string.split("\\");
              return split;
            };

            return (
              <div
                className={STYLES["chapter-card"]}
                key={articles.indexOf(article)}
                style={divStyle}
              >
                <Link
                  href={`${localePrefix}/history/${article.id}`}
                  className={STYLES["link-button"]}
                  aria-label={tArticle("goToChapter", {
                    chapter: article.chapter,
                    title: article.title.replace(/\\/g, " "),
                  })}
                >
                  <div className={STYLES["chapter-card-dimmer"]}>
                    <div className={STYLES["chapter-card-content"]}>
                      <div>
                        <span className={STYLES["title-line-1"]}>
                          {splitTitle(article.title)[0]}
                        </span>
                        <span className={STYLES["title-line-2"]}>
                          {splitTitle(article.title)[1]}
                        </span>
                        <span className={STYLES["title-line-3"]}>
                          {tArticle("chapter", { chapter: article.chapter })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
