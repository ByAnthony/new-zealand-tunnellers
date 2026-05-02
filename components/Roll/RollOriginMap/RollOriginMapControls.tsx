"use client";

import { useTranslations } from "next-intl";

import STYLES from "./RollOriginMap.module.scss";

type Props = {
  activeFilterCount: number;
  currentZoom: number | null;
  mappedCount: number;
  missingOriginCount: number;
  onOpenFilters: () => void;
  onOpenMissingOrigin: () => void;
  onOpenRollList: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  visibleCount: number;
};

export function RollOriginMapControls({
  activeFilterCount,
  currentZoom,
  mappedCount,
  missingOriginCount,
  onOpenFilters,
  onOpenMissingOrigin,
  onOpenRollList,
  onZoomIn,
  onZoomOut,
  visibleCount,
}: Props) {
  const tRoll = useTranslations("roll");
  const tMaps = useTranslations("maps");

  return (
    <div className={STYLES["map-controls"]}>
      <div className={STYLES["controls-grid"]}>
        <div className={STYLES["controls-top-row"]}>
          <button
            type="button"
            className={STYLES["roll-button"]}
            onClick={onOpenRollList}
            aria-label={tRoll("openRollList")}
          >
            <svg
              className={STYLES["roll-button-icon"]}
              viewBox="0 0 24 24"
              focusable="false"
              aria-hidden="true"
            >
              <path
                d="M7 7h12M7 12h12M7 17h12M4 7h.01M4 12h.01M4 17h.01"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            {tRoll("rollList")}
          </button>
          <button
            type="button"
            className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`.trim()}
            onClick={onOpenFilters}
            aria-label={tMaps("toggleFilters")}
          >
            {tRoll("filters")}
            {activeFilterCount > 0 && (
              <span className={STYLES["filter-badge"]}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label={tMaps("zoomIn")}
            className={STYLES["zoom-button"]}
            disabled={currentZoom !== null && currentZoom >= 16}
          >
            +
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            aria-label={tMaps("zoomOut")}
            className={STYLES["zoom-button"]}
            disabled={currentZoom !== null && currentZoom <= 3}
          >
            −
          </button>
        </div>
        <div className={STYLES["stats-row"]}>
          <div className={STYLES["map-count"]}>
            <span className={STYLES["count-label"]}>
              {tMaps("originMappedLabel")}
            </span>
            <span className={STYLES["count-primary"]}>
              {mappedCount}
              <span className={STYLES["count-total"]}>/{visibleCount}</span>
            </span>
          </div>
          <button
            type="button"
            className={STYLES["missing-count"]}
            onClick={onOpenMissingOrigin}
            disabled={missingOriginCount === 0}
          >
            <span className={STYLES["count-label"]}>
              {tMaps("originMissingLabel")}
            </span>
            <span className={STYLES["count-primary"]}>
              {missingOriginCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
