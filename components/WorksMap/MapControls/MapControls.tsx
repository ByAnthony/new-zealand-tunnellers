"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import STYLES from "./MapControls.module.scss";
import { TypeFilter } from "../TypeFilter/TypeFilter";
import { WorksSlider } from "../WorksSlider/WorksSlider";

const PERIODS = [
  {
    key: "1916-03-16/1916-11-15",
    start: "1916-03-16",
    end: "1916-11-15",
    dates: "16/03/1916 — 15/11/1916",
    en: "War Underground",
    fr: "Guerre souterraine",
  },
  {
    key: "1916-11-16/1917-04-09",
    start: "1916-11-16",
    end: "1917-04-09",
    dates: "16/11/1916 — 09/04/1917",
    en: "Battle of Arras Preparation",
    fr: "Préparation de la bataille d'Arras",
  },
  {
    key: "1917-04-10/1918-03-20",
    start: "1917-04-10",
    end: "1918-03-20",
    dates: "10/04/1917 — 20/03/1918",
    en: "Trench Works",
    fr: "Travaux de tranchées",
  },
  {
    key: "1918-03-21/1918-08-07",
    start: "1918-03-21",
    end: "1918-08-07",
    dates: "21/03/1918 — 07/08/1918",
    en: "German Spring Offensive",
    fr: "Offensives de printemps allemandes",
  },
  {
    key: "1918-08-08/1918-11-10",
    start: "1918-08-08",
    end: "1918-11-10",
    dates: "08/08/1918 — 10/11/1918",
    en: "Hundred Days Offensive",
    fr: "Offensive des Cent-Jours",
  },
  {
    key: "1918-11-11/1918-12-27",
    start: "1918-11-11",
    end: "1918-12-27",
    dates: "11/11/1918 — 27/12/1918",
    en: "Armistice",
    fr: "Armistice",
  },
];

type Props = {
  visibleCount: number;
  locale: string;
  types: string[];
  selectedTypes: Set<string>;
  onToggleType: (_type: string) => void;
  typeColors: Record<string, string>;
  dateRange: [number, number];
  onDateRangeChange: (_value: [number, number]) => void;
  onDateRangeComplete: () => void;
  minMonth: number;
  maxMonth: number;
  onPeriodSelect: (_dateStart: string, _dateEnd: string) => void;
  onPeriodReset: () => void;
  currentZoom: number | null;
  onZoom: (_dir: 1 | -1) => void;
};

export function MapControls({
  visibleCount,
  locale,
  types,
  selectedTypes,
  onToggleType,
  typeColors,
  dateRange,
  onDateRangeChange,
  onDateRangeComplete,
  minMonth,
  maxMonth,
  onPeriodSelect,
  onPeriodReset,
  currentZoom,
  onZoom,
}: Props) {
  const t = useTranslations("maps");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
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

  const handlePeriodClick = (start: string, end: string, key: string) => {
    if (selectedPeriod === key) {
      setSelectedPeriod(null);
      onPeriodReset();
    } else {
      setSelectedPeriod(key);
      onPeriodSelect(start, end);
    }
  };

  const filtersToggleButton = (
    <button
      className={`${STYLES["period-toggle"]} ${isFiltersOpen ? STYLES["period-toggle--open"] : ""}`}
      onClick={() => setIsFiltersOpen((v) => !v)}
      aria-label="Toggle filters"
    >
      {locale === "fr" ? "Filtres" : "Filters"}
    </button>
  );

  const zoomInButton = (
    <button
      onClick={() => onZoom(1)}
      aria-label="Zoom in"
      className={STYLES["zoom-btn"]}
      disabled={currentZoom !== null && currentZoom >= 16}
    >
      +
    </button>
  );

  const zoomOutButton = (
    <button
      onClick={() => onZoom(-1)}
      aria-label="Zoom out"
      className={STYLES["zoom-btn"]}
      disabled={currentZoom !== null && currentZoom <= 6}
    >
      −
    </button>
  );

  const filtersPanel = isFiltersOpen && (
    <>
      <div className={STYLES["period-row"]}>
        {PERIODS.map(({ key, start, end, dates, en, fr }) => (
          <button
            key={key}
            className={`${STYLES["period-button"]} ${selectedPeriod === key ? STYLES["period-button--active"] : ""}`}
            onClick={() => handlePeriodClick(start, end, key)}
          >
            <span className={STYLES["period-button-dates"]}>{dates}</span>
            <span className={STYLES["period-button-title"]}>
              {locale === "fr" ? fr : en}
            </span>
          </button>
        ))}
      </div>
      <div className={STYLES["filter-row"]}>
        <TypeFilter
          types={types}
          selectedTypes={selectedTypes}
          onToggle={onToggleType}
          colors={typeColors}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {filtersPanel}
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
        />
      </>
    );
  }

  return (
    <>
      {filtersPanel}
      <div className={STYLES["controls-grid"]}>
        <button
          className={`${STYLES["period-toggle"]} ${isFiltersOpen ? STYLES["period-toggle--open"] : ""}`}
          onClick={() => setIsFiltersOpen((v) => !v)}
          aria-label="Toggle filters"
        >
          {locale === "fr" ? "Filtres" : "Filters"}
        </button>
        <div className={STYLES["slider-wrapper"]}>
          <WorksSlider
            dateRange={dateRange}
            onChange={onDateRangeChange}
            onChangeComplete={onDateRangeComplete}
            minMonth={minMonth}
            maxMonth={maxMonth}
          />
        </div>
        <button
          onClick={() => onZoom(1)}
          aria-label="Zoom in"
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
          aria-label="Zoom out"
          className={`${STYLES["zoom-btn"]} ${STYLES["zoom-out"]}`}
          disabled={currentZoom !== null && currentZoom <= 6}
        >
          −
        </button>
      </div>
    </>
  );
}
