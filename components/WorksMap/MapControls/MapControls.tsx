"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";

import { Dialog } from "@/components/Dialog/Dialog";

import STYLES from "./MapControls.module.scss";
import { TypeFilter } from "../TypeFilter/TypeFilter";
import { dateToDay, formatPeriodRange } from "../utils/mapParams";
import { WorksSlider } from "../WorksSlider/WorksSlider";

const PERIODS = [
  {
    key: "1916-03-16/1916-11-15",
    start: "1916-03-16",
    end: "1916-11-15",
    en: "Underground Warfare",
    fr: "Guerre souterraine",
  },
  {
    key: "1916-11-16/1917-04-09",
    start: "1916-11-16",
    end: "1917-04-09",
    en: "Preparations for the Battle of Arras",
    fr: "Préparatifs de la bataille d'Arras",
  },
  {
    key: "1917-04-10/1918-03-20",
    start: "1917-04-10",
    end: "1918-03-20",
    en: "East of Arras Trench Works",
    fr: "Travaux de tranchées à l'est d'Arras",
  },
  {
    key: "1918-03-21/1918-07-14",
    start: "1918-03-21",
    end: "1918-07-14",
    en: "1918 German Spring Offensive",
    fr: "Offensive allemande du printemps 1918",
  },
  {
    key: "1918-07-15/1918-08-21",
    start: "1918-07-15",
    end: "1918-08-21",
    en: "Preparations for the Allied Offensives",
    fr: "Préparatifs des offensives alliées",
  },
  {
    key: "1918-09-26/1918-12-27",
    start: "1918-09-26",
    end: "1918-12-27",
    en: "Bridging Operations",
    fr: "Opérations de ponts",
  },
];

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
  onApplyFilters,
  computeAvailableTypes,
  computeVisibleCount,
  currentZoom,
  onZoom,
  totalWorks,
  periodBounds,
}: Props) {
  const t = useTranslations("maps");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    const p = period ? PERIODS.find((x) => x.key === period) : null;
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
      ? PERIODS.find((x) => x.key === pendingPeriod)
      : null;
    return p
      ? computeAvailableTypes(dateToDay(p.start), dateToDay(p.end))
      : computeAvailableTypes(minMonth, maxMonth);
  }, [pendingPeriod, computeAvailableTypes, minMonth, maxMonth]);

  const pendingVisibleCount = useMemo(() => {
    const p = pendingPeriod
      ? PERIODS.find((x) => x.key === pendingPeriod)
      : null;
    const start = p ? dateToDay(p.start) : minMonth;
    const end = p ? dateToDay(p.end) : maxMonth;
    return computeVisibleCount(start, end, pendingTypes);
  }, [pendingPeriod, pendingTypes, computeVisibleCount, minMonth, maxMonth]);

  const availablePeriods = useMemo(
    () =>
      new Set(
        PERIODS.filter(
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

  const activeFilterCount = (initialPeriodKey ? 1 : 0) + selectedTypes.size;

  const filtersToggleButton = (
    <button
      className={`${STYLES["period-toggle"]} ${isFiltersOpen ? STYLES["period-toggle--open"] : ""} ${activeFilterCount > 0 ? STYLES["period-toggle--active"] : ""}`}
      onClick={() =>
        isFiltersOpen ? handleDialogClose() : openFiltersDialog()
      }
      aria-label={t("toggleFilters")}
    >
      {locale === "fr" ? "Filtres" : "Filters"}
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
      title={locale === "fr" ? "Filtres" : "Filters"}
      isFooterEnabled={true}
      hasActiveFilters={hasActiveFilters}
      handleResetFilters={handleResetFilters}
      totalFiltered={pendingVisibleCount}
      total={totalWorks}
    >
      <div className={STYLES["dialog-section"]}>
        <h3 className={STYLES["dialog-section-title"]}>
          {locale === "fr" ? "Périodes" : "Time periods"}
        </h3>
        <div className={STYLES["dialog-period-grid"]}>
          {PERIODS.map(({ key, start, end, en, fr }) => (
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
                {locale === "fr" ? fr : en}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={STYLES["dialog-section"]}>
        <h3 className={STYLES["dialog-section-title"]}>
          {locale === "fr" ? "Types de travaux" : "Work types"}
        </h3>
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
          clampMin={periodBounds?.[0]}
          clampMax={periodBounds?.[1]}
        />
      </>
    );
  }

  return (
    <>
      {filtersDialog}
      <div className={STYLES["controls-grid"]}>
        {filtersToggleButton}
        <div className={STYLES["slider-wrapper"]}>
          <WorksSlider
            dateRange={dateRange}
            onChange={onDateRangeChange}
            onChangeComplete={onDateRangeComplete}
            minMonth={minMonth}
            maxMonth={maxMonth}
            clampMin={periodBounds?.[0]}
            clampMax={periodBounds?.[1]}
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
    </>
  );
}
