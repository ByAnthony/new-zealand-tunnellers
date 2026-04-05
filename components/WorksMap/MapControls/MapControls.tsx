"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";

import { Dialog } from "@/components/Dialog/Dialog";

import STYLES from "./MapControls.module.scss";
import { TypeFilter } from "../TypeFilter/TypeFilter";
import { WorksSlider } from "../WorksSlider/WorksSlider";

const PERIODS = [
  {
    key: "1916-03-16/1916-11-15",
    start: "1916-03-16",
    end: "1916-11-15",
    dates: "16/03/1916 — 15/11/1916",
    en: "Underground Warfare",
    fr: "Guerre souterraine",
  },
  {
    key: "1916-11-16/1917-04-09",
    start: "1916-11-16",
    end: "1917-04-09",
    dates: "16/11/1916 — 09/04/1917",
    en: "Battle of Arras Preparations",
    fr: "Préparatifs de la bataille d'Arras",
  },
  {
    key: "1917-04-10/1918-03-20",
    start: "1917-04-10",
    end: "1918-03-20",
    dates: "10/04/1917 — 20/03/1918",
    en: "East of Arras Trench Works",
    fr: "Travaux de tranchées à l'est d'Arras",
  },
  {
    key: "1918-03-21/1918-07-14",
    start: "1918-03-21",
    end: "1918-07-14",
    dates: "21/03/1918 — 14/07/1918",
    en: "German Spring Offensive",
    fr: "Offensive de printemps allemande",
  },
  {
    key: "1918-07-15/1918-09-26",
    start: "1918-07-15",
    end: "1918-09-26",
    dates: "15/07/1918 — 26/09/1918",
    en: "Hundred Days Offensive Preparations",
    fr: "Préparatifs de l'offensive des Cent Jours",
  },
  {
    key: "1918-09-27/1918-12-27",
    start: "1918-09-27",
    end: "1918-12-27",
    dates: "27/09/1918 — 27/12/1918",
    en: "Bridging Operations",
    fr: "Opérations de ponts",
  },
];

type Props = {
  visibleCount: number;
  locale: string;
  types: string[];
  selectedTypes: Set<string>;
  availableTypes: Set<string>;
  onToggleType: (_type: string) => void;
  typeColors: Record<string, string>;
  dateRange: [number, number];
  onDateRangeChange: (_value: [number, number]) => void;
  onDateRangeComplete: () => void;
  minMonth: number;
  maxMonth: number;
  onPeriodSelect: (_dateStart: string, _dateEnd: string) => void;
  onPeriodReset: () => void;
  onResetAllFilters: () => void;
  currentZoom: number | null;
  onZoom: (_dir: 1 | -1) => void;
  totalWorks: number;
};

export function MapControls({
  visibleCount,
  locale,
  types,
  selectedTypes,
  availableTypes,
  onToggleType,
  typeColors,
  dateRange,
  onDateRangeChange,
  onDateRangeComplete,
  minMonth,
  maxMonth,
  onPeriodSelect,
  onPeriodReset,
  onResetAllFilters,
  currentZoom,
  onZoom,
  totalWorks,
}: Props) {
  const t = useTranslations("maps");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFiltersOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filtersPanelRef.current &&
        !filtersPanelRef.current.contains(e.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFiltersOpen]);
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

  const hasActiveFilters = selectedPeriod !== null || selectedTypes.size > 0;

  const handleResetFilters = () => {
    setSelectedPeriod(null);
    onResetAllFilters();
  };

  const activeFilterCount = (selectedPeriod ? 1 : 0) + selectedTypes.size;

  const filtersToggleButton = (
    <button
      className={`${STYLES["period-toggle"]} ${isFiltersOpen ? STYLES["period-toggle--open"] : ""} ${activeFilterCount > 0 ? STYLES["period-toggle--active"] : ""}`}
      onClick={() => setIsFiltersOpen((v) => !v)}
      aria-label="Toggle filters"
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
    <div className={STYLES["filters-panel"]} ref={filtersPanelRef}>
      <div className={STYLES["filters-panel-header"]}>
        <button
          className={STYLES["filters-panel-reset"]}
          onClick={handleResetFilters}
          disabled={!hasActiveFilters}
        >
          {locale === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
        </button>
        <button
          className={STYLES["filters-panel-close"]}
          onClick={() => setIsFiltersOpen(false)}
          aria-label="Close filters"
        >
          ×
        </button>
      </div>
      <h3 className={STYLES["filters-panel-title"]}>
        {locale === "fr" ? "Périodes" : "Time periods"}
      </h3>
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
      <h3 className={STYLES["filters-panel-title"]}>
        {locale === "fr" ? "Types de travaux" : "Work types"}
      </h3>
      <div className={STYLES["filter-row"]}>
        <TypeFilter
          types={types}
          selectedTypes={selectedTypes}
          onToggle={onToggleType}
          colors={typeColors}
          availableTypes={availableTypes}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Dialog
          id="map-filters"
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          title={locale === "fr" ? "Filtres" : "Filters"}
          isFooterEnabled={true}
          hasActiveFilters={hasActiveFilters}
          handleResetFilters={handleResetFilters}
          totalFiltered={visibleCount}
          total={totalWorks}
        >
          <div className={STYLES["dialog-section"]}>
            <h3 className={STYLES["dialog-section-title"]}>
              {locale === "fr" ? "Périodes" : "Time periods"}
            </h3>
            <div className={STYLES["dialog-period-grid"]}>
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
          </div>
          <div className={STYLES["dialog-section"]}>
            <h3 className={STYLES["dialog-section-title"]}>
              {locale === "fr" ? "Types de travaux" : "Work types"}
            </h3>
            <div className={STYLES["dialog-chips"]}>
              <TypeFilter
                types={types}
                selectedTypes={selectedTypes}
                availableTypes={availableTypes}
                onToggle={onToggleType}
                colors={typeColors}
                isWrapped
              />
            </div>
          </div>
        </Dialog>
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
        {filtersToggleButton}
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
