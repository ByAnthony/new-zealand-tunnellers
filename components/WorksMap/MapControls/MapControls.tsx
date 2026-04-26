"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";

import { Dialog } from "@/components/Dialog/Dialog";
import { getChapterIdForPeriod } from "@/utils/historyMapLinks";

import STYLES from "./MapControls.module.scss";
import { TypeFilter } from "../TypeFilter/TypeFilter";
import { dateToDay, formatPeriodRange } from "../utils/mapParams";
import { MAP_PERIODS } from "../utils/periods";
import { WorksSlider } from "../WorksSlider/WorksSlider";

function BookOpenBadge() {
  return (
    <span className={STYLES["related-chapter-badge"]} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          d="M12 7.5c-1.7-1.2-4.1-1.8-7-1.8v11.2c2.9 0 5.3.6 7 1.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.5c1.7-1.2 4.1-1.8 7-1.8v11.2c-2.9 0-5.3.6-7 1.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.5v11.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function RelatedChapterCard({
  chapterId,
  localePrefix,
}: {
  chapterId: string;
  localePrefix: string;
}) {
  const t = useTranslations("maps");
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className={STYLES["related-chapter-row"]}>
      <div className={STYLES["related-chapter-group"]}>
        <button
          type="button"
          className={STYLES["related-close-button"]}
          aria-label={t("closeRelatedChapterLink")}
          onClick={() => setIsDismissed(true)}
        >
          ×
        </button>
        <Link
          href={`${localePrefix}/history/${chapterId}`}
          aria-label={t("relatedChapterLabel")}
          className={STYLES["related-link"]}
        >
          <span className={STYLES["related-link-main"]}>
            <BookOpenBadge />
            <span className={STYLES["related-link-label"]}>
              {t("relatedChapterLabel")}
            </span>
          </span>
          <span className={STYLES["related-link-arrow"]} aria-hidden="true">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const localePrefix = locale === "fr" ? "/fr" : "";

  // Pending state: staged while dialog is open, committed on close
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(
    initialPeriodKey,
  );
  const [pendingTypes, setPendingTypes] = useState<Set<string>>(new Set());

  const openFiltersDialog = () => {
    setPendingPeriod(initialPeriodKey);
    setPendingTypes(new Set(selectedTypes));
    setIsFiltersOpen(true);
  };

  const commitPending = (period: string | null, types: Set<string>) => {
    const p = period ? MAP_PERIODS.find((x) => x.key === period) : null;
    onApplyFilters(period, p?.start ?? null, p?.end ?? null, types);
  };

  const handleDialogClose = () => {
    setIsFiltersOpen(false);
    commitPending(pendingPeriod, pendingTypes);
  };

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

  const handlePeriodClick = (key: string) => {
    setPendingPeriod((prev) => (prev === key ? null : key));
  };

  const handleTypeToggle = (type: string) => {
    setPendingTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const pendingAvailableTypes = useMemo(() => {
    const p = pendingPeriod
      ? MAP_PERIODS.find((x) => x.key === pendingPeriod)
      : null;
    return p
      ? computeAvailableTypes(dateToDay(p.start), dateToDay(p.end))
      : computeAvailableTypes(minMonth, maxMonth);
  }, [pendingPeriod, computeAvailableTypes, minMonth, maxMonth]);

  const pendingVisibleCount = useMemo(() => {
    const p = pendingPeriod
      ? MAP_PERIODS.find((x) => x.key === pendingPeriod)
      : null;
    const start = p ? dateToDay(p.start) : minMonth;
    const end = p ? dateToDay(p.end) : maxMonth;
    return computeVisibleCount(start, end, pendingTypes);
  }, [pendingPeriod, pendingTypes, computeVisibleCount, minMonth, maxMonth]);

  const activeAvailableTypes = useMemo(() => {
    const start = periodBounds?.[0] ?? minMonth;
    const end = periodBounds?.[1] ?? maxMonth;
    return computeAvailableTypes(start, end);
  }, [computeAvailableTypes, periodBounds, minMonth, maxMonth]);

  const availablePeriods = useMemo(
    () =>
      new Set(
        MAP_PERIODS.filter(
          ({ start, end }) =>
            computeVisibleCount(
              dateToDay(start),
              dateToDay(end),
              pendingTypes,
            ) > 0,
        ).map(({ key }) => key),
      ),
    [computeVisibleCount, pendingTypes],
  );

  const hasActiveFilters = pendingPeriod !== null || pendingTypes.size > 0;

  const handleResetFilters = () => {
    setPendingPeriod(null);
    setPendingTypes(new Set());
  };

  const activeSelectedTypeCount = Array.from(selectedTypes).filter((type) =>
    activeAvailableTypes.has(type),
  ).length;
  const activeFilterCount =
    (initialPeriodKey ? 1 : 0) + activeSelectedTypeCount;

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
              {visibleCount} {visibleCount === 1 ? t("work") : t("works")}
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
            {visibleCount} {visibleCount === 1 ? t("work") : t("works")}
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
