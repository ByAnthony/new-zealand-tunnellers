"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { getMapPeriodsForChapter } from "@/utils/historyMapLinks";

import STYLES from "./ArticleRelatedMapCard.module.scss";
import { formatPeriodRange } from "../../WorksMap/utils/mapParams";

type Props = {
  articleId: string;
  hasNextChapter: boolean;
  locale: string;
  localePrefix: string;
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

export function ArticleRelatedMapCard({
  articleId,
  hasNextChapter,
  locale,
  localePrefix,
}: Props) {
  const t = useTranslations("maps");
  const relatedMapPeriods = getMapPeriodsForChapter(articleId);

  if (relatedMapPeriods.length === 0) return null;

  const hasMultipleMapPeriods = relatedMapPeriods.length > 1;
  const isTerminalMapCard = !hasNextChapter;
  const isFrench = locale === "fr";

  return (
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
                    {t("relatedMapLabel")}
                  </span>
                </span>
                <div
                  className={`${STYLES["context-map-links"]} ${hasMultipleMapPeriods ? STYLES["context-map-links--multiple"] : ""} ${isFrench ? STYLES["context-map-links--fr"] : ""}`.trim()}
                >
                  {relatedMapPeriods.map((period, index) => {
                    const positionClass = hasMultipleMapPeriods
                      ? index === 0
                        ? STYLES["context-map-link--first"]
                        : index === relatedMapPeriods.length - 1
                          ? STYLES["context-map-link--last"]
                          : STYLES["context-map-link--middle"]
                      : "";

                    return (
                      <Link
                        key={period.key}
                        href={`${localePrefix}/maps/tunnellers-works?period=true&frontlines=true&from=${period.start}&to=${period.end}`}
                        aria-label={t("relatedMapLinkAria", {
                          period: t(`periods.${period.labelKey}`),
                          dates: formatPeriodRange(
                            locale,
                            period.start,
                            period.end,
                          ),
                        })}
                        className={`${STYLES["context-map-link"]} ${hasMultipleMapPeriods ? STYLES["context-map-link--multiple"] : ""} ${positionClass}`.trim()}
                      >
                        <span className={STYLES["context-map-link-title"]}>
                          {t(`periods.${period.labelKey}`)}
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
                    );
                  })}
                </div>
              </span>
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
