"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";

import { Dialog } from "@/components/Dialog/Dialog";
import { getChapterIdForPeriod } from "@/utils/historyMapLinks";

import { usePendingMapFilters } from "./hooks/usePendingMapFilters";
import STYLES from "./MapControls.module.scss";
import { RelatedChapterCard } from "./RelatedChapterCard/RelatedChapterCard";
import { TypeFilter } from "../TypeFilter/TypeFilter";
import { formatPeriodRange } from "../utils/mapParams";
import { MAP_PERIODS } from "../utils/periods";
import { WorksSlider } from "../WorksSlider/WorksSlider";

type Props = {
  visibleCount: number;
  locale: string;
  types: string[];
  selectedTypes: Set<string>;
  typeColors: Record<string, string>;
  dateRange: [number, number];
  onDateRangeChange: (_value: [number, number]) => void;
  onDateRangeComplete: () => void;
  minMonth: number;
  maxMonth: number;
  initialPeriodKey: string | null;
  currentPeriodKey: string | null;
  onApplyFilters: (
    _periodKey: string | null,
    _periodStart: string | null,
    _periodEnd: string | null,
    _types: Set<string>,
  ) => void;
  computeAvailableTypes: (_start: number, _end: number) => Set<string>;
  computeVisibleCount: (
    _start: number,
    _end: number,
    _types: Set<string>,
  ) => number;
  currentZoom: number | null;
  onZoom: (_dir: 1 | -1) => void;
  totalWorks: number;
  periodBounds: [number, number] | null;
  clampBounds: [number, number] | null;
};

export function MapControls({
  visibleCount,
  locale,
  types,
  selectedTypes,
  typeColors,
  dateRange,
  onDateRangeChange,
  onDateRangeComplete,
  minMonth,
  maxMonth,
  initialPeriodKey,
  currentPeriodKey,
  onApplyFilters,
  computeAvailableTypes,
  computeVisibleCount,
  currentZoom,
  onZoom,
  totalWorks,
  periodBounds,
  clampBounds,
}: Props) {
  const t = useTranslations("maps");
  const localePrefix = locale === "fr" ? "/fr" : "";

  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 32rem)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 32rem)");
    const handle = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const {
    isFiltersOpen,
    pendingPeriod,
    pendingTypes,
    openFiltersDialog,
    handleDialogClose,
    handlePeriodClick,
    handleTypeToggle,
    pendingAvailableTypes,
    pendingVisibleCount,
    availablePeriods,
    hasActiveFilters,
    handleResetFilters,
  } = usePendingMapFilters({
    initialPeriodKey,
    selectedTypes,
    minMonth,
    maxMonth,
    onApplyFilters,
    computeAvailableTypes,
    computeVisibleCount,
  });

  const activeAvailableTypes = useMemo(() => {
    const start = periodBounds?.[0] ?? minMonth;
    const end = periodBounds?.[1] ?? maxMonth;
    return computeAvailableTypes(start, end);
  }, [computeAvailableTypes, periodBounds, minMonth, maxMonth]);

  const activeSelectedTypeCount = Array.from(selectedTypes).filter((type) =>
    activeAvailableTypes.has(type),
  ).length;
  const activeFilterCount =
    (initialPeriodKey ? 1 : 0) + activeSelectedTypeCount;
  const workCountLabel =
    visibleCount === 0 || visibleCount === 1 ? t("work") : t("works");

  const relatedChapterId = getChapterIdForPeriod(currentPeriodKey);

  const relatedChapterCard = relatedChapterId ? (
    <RelatedChapterCard
      key={currentPeriodKey}
      chapterId={relatedChapterId}
      localePrefix={localePrefix}
    />
  ) : null;

  const filtersToggleButton = (
    <button
      className={`${STYLES["period-toggle"]} ${activeFilterCount > 0 ? STYLES["period-toggle--active"] : ""}`.trim()}
      onClick={() =>
        isFiltersOpen ? handleDialogClose() : openFiltersDialog()
      }
      aria-label={t("toggleFilters")}
    >
      {t("filters")}
      {activeFilterCount > 0 && (
        <span className={STYLES["filter-badge"]}>{activeFilterCount}</span>
      )}
    </button>
  );

  const zoomInButton = (
    <button
      onClick={() => onZoom(1)}
      aria-label={t("zoomIn")}
      className={STYLES["zoom-btn"]}
      disabled={currentZoom !== null && currentZoom >= 16}
    >
      +
    </button>
  );

  const zoomOutButton = (
    <button
      onClick={() => onZoom(-1)}
      aria-label={t("zoomOut")}
      className={STYLES["zoom-btn"]}
      disabled={currentZoom !== null && currentZoom <= 6}
    >
      −
    </button>
  );

  const filtersDialog = (
    <Dialog
      id="map-filters"
      isOpen={isFiltersOpen}
      onClose={handleDialogClose}
      title={t("filters")}
      isFooterEnabled={true}
      hasActiveFilters={hasActiveFilters}
      handleResetFilters={handleResetFilters}
      totalFiltered={pendingVisibleCount}
      total={totalWorks}
    >
      <div className={STYLES["dialog-section"]}>
        <h3 className={STYLES["dialog-section-title"]}>{t("timePeriods")}</h3>
        <div className={STYLES["dialog-period-grid"]}>
          {MAP_PERIODS.map(({ key, start, end, labelKey }) => (
            <button
              key={key}
              className={`${STYLES["period-button"]} ${pendingPeriod === key ? STYLES["period-button--active"] : ""}`}
              disabled={!availablePeriods.has(key)}
              onClick={() => handlePeriodClick(key)}
            >
              <span className={STYLES["period-button-dates"]}>
                {formatPeriodRange(locale, start, end)}
              </span>
              <span className={STYLES["period-button-title"]}>
                {t(`periods.${labelKey}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={STYLES["dialog-section"]}>
        <h3 className={STYLES["dialog-section-title"]}>{t("workTypes")}</h3>
        <div className={STYLES["dialog-chips"]}>
          <TypeFilter
            types={types}
            selectedTypes={pendingTypes}
            availableTypes={pendingAvailableTypes}
            onToggle={handleTypeToggle}
            colors={typeColors}
          />
        </div>
      </div>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        {filtersDialog}
        <div className={STYLES["controls-stack"]}>
          {relatedChapterCard}
          <div className={STYLES["mobile-top"]}>
            <div className={STYLES["slider-count"]}>
              {visibleCount} {workCountLabel}
            </div>
            {filtersToggleButton}
            {zoomInButton}
            {zoomOutButton}
          </div>
          <WorksSlider
            dateRange={dateRange}
            onChange={onDateRangeChange}
            onChangeComplete={onDateRangeComplete}
            minMonth={minMonth}
            maxMonth={maxMonth}
            clampMin={clampBounds?.[0]}
            clampMax={clampBounds?.[1]}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {filtersDialog}
      <div className={STYLES["controls-stack"]}>
        {relatedChapterCard}
        <div className={STYLES["controls-grid"]}>
          {filtersToggleButton}
          <div className={STYLES["slider-wrapper"]}>
            <WorksSlider
              dateRange={dateRange}
              onChange={onDateRangeChange}
              onChangeComplete={onDateRangeComplete}
              minMonth={minMonth}
              maxMonth={maxMonth}
              clampMin={clampBounds?.[0]}
              clampMax={clampBounds?.[1]}
            />
          </div>
          <button
            onClick={() => onZoom(1)}
            aria-label={t("zoomIn")}
            className={`${STYLES["zoom-btn"]} ${STYLES["zoom-in"]}`}
            disabled={currentZoom !== null && currentZoom >= 16}
          >
            +
          </button>
          <div className={STYLES["slider-count"]}>
            {visibleCount} {workCountLabel}
          </div>
          <button
            onClick={() => onZoom(-1)}
            aria-label={t("zoomOut")}
            className={`${STYLES["zoom-btn"]} ${STYLES["zoom-out"]}`}
            disabled={currentZoom !== null && currentZoom <= 6}
          >
            −
          </button>
        </div>
      </div>
    </>
  );
}
