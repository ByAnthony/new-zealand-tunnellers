"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { HistoryChapter } from "@/types/homepage";

import STYLES from "./History.module.scss";

type Props = {
  articles: HistoryChapter[];
};

function getChapterCardStep(container: HTMLDivElement): number {
  const firstCard = container.firstElementChild;
  if (!(firstCard instanceof HTMLElement)) return 0;

  const gap = Number.parseFloat(window.getComputedStyle(container).gap) || 0;
  return firstCard.offsetWidth + gap;
}

function getLastChapterCardIndex(
  container: HTMLDivElement,
  totalCards: number,
): number {
  const cardStep = getChapterCardStep(container);
  if (cardStep === 0) return Math.max(0, totalCards - 3);

  const computedStyle = window.getComputedStyle(container);
  const horizontalPadding =
    (Number.parseFloat(computedStyle.paddingLeft) || 0) +
    (Number.parseFloat(computedStyle.paddingRight) || 0);
  const visibleWidth = container.clientWidth - horizontalPadding;
  if (visibleWidth <= 0) return Math.max(0, totalCards - 3);

  const visibleCards = Math.max(1, Math.floor(visibleWidth / cardStep));
  return Math.max(0, totalCards - visibleCards);
}

function getCurrentChapterCardIndex(
  scrollLeft: number,
  cardStep: number,
  lastCardIndex: number,
): number {
  const nextIndex = Math.round(scrollLeft / cardStep);
  return Math.max(0, Math.min(nextIndex, lastCardIndex));
}

export function History({ articles }: Props) {
  const t = useTranslations("homepage");
  const tArticle = useTranslations("article");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastCardIndex, setLastCardIndex] = useState(() =>
    Math.max(0, articles.length - 3),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLastCardIndex = () => {
      if (!containerRef.current) return;
      setLastCardIndex(
        getLastChapterCardIndex(containerRef.current, articles.length),
      );
    };

    updateLastCardIndex();
    window.addEventListener("resize", updateLastCardIndex);
    return () => window.removeEventListener("resize", updateLastCardIndex);
  }, [articles.length]);

  const scrollClick = (index: number) => {
    if (containerRef.current) {
      const cardStep = getChapterCardStep(containerRef.current);
      const nextIndex = Math.max(0, Math.min(index, lastCardIndex));

      containerRef.current.scrollTo({
        left: nextIndex * cardStep,
      });
    }
  };

  const handleScrollLeft = () => {
    if (containerRef.current) {
      const previousIndex = Math.max(0, currentIndex - 1);
      scrollClick(previousIndex);
      setCurrentIndex(previousIndex);
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      const nextIndex = Math.min(lastCardIndex, currentIndex + 1);
      scrollClick(nextIndex);
      setCurrentIndex(nextIndex);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { clientWidth, scrollLeft, scrollWidth } = containerRef.current;
      const cardStep = getChapterCardStep(containerRef.current);
      if (cardStep === 0) return;

      const maxScrollLeft = scrollWidth - clientWidth;
      const nextIndex =
        maxScrollLeft > 0 && scrollLeft >= maxScrollLeft - 1
          ? lastCardIndex
          : getCurrentChapterCardIndex(scrollLeft, cardStep, lastCardIndex);
      if (currentIndex !== nextIndex) {
        setCurrentIndex(nextIndex);
      }
    }
  };

  const isLastCard = currentIndex >= lastCardIndex;
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
    <div id="history" className={STYLES["history-chapter"]}>
      <div className={STYLES["chapter-cards-wrapper"]}>
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
                  href={`${localePrefix}/history/${article.id}/`}
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
