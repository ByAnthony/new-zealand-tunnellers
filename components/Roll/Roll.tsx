"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";

import { useRollState } from "@/components/Roll/hooks/useRollState";
import { RollAlphabet } from "@/components/Roll/RollAlphabet/RollAlphabet";
import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";
import { RollNoResults } from "@/components/Roll/RollNoResults/RollNoResults";
import { Title } from "@/components/Title/Title";
import { Tunneller } from "@/types/tunnellers";
import { saveRollView } from "@/utils/helpers/tunnellersReturn";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Roll.module.scss";
import { Dialog } from "../Dialog/Dialog";

const RollOriginMap = dynamic(
  () =>
    import("@/components/Roll/RollOriginMap/RollOriginMap").then(
      (m) => m.RollOriginMap,
    ),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: "100vh" }} />,
  },
);

type Props = {
  tunnellers: Record<string, Tunneller[]>;
};

export function Roll({ tunnellers }: Props) {
  const t = useTranslations("roll");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { width } = useWindowDimensions();
  const {
    currentPage,
    setCurrentPage,
    sortOrder,
    isDialogOpen,
    closeDialog,
    openDialog,
    handleSortToggle,
    rollFiltersProps,
    activeFilterCount,
    filteredGroups,
    sortedFilteredGroups,
    totalFilteredTunnellers,
    getFilteredTunnellerCount,
    totalTunnellers,
    handleResetFilters,
    filters,
    defaultFilters,
    applyFilters,
  } = useRollState({ tunnellers, locale });

  const isDesktop = () => (width ? width > 896 : false);
  const desktopView = isDesktop();
  const isMapView = searchParams.get("view") === "map";

  useEffect(() => {
    saveRollView(isMapView ? "map" : "list");
  }, [isMapView]);

  const resultsText =
    totalFilteredTunnellers > 1
      ? t("resultsPlural", { count: totalFilteredTunnellers })
      : t("results", { count: totalFilteredTunnellers });
  const isAscending = sortOrder === "asc";
  const sortButtonText = isAscending ? t("sortDescending") : t("sortAscending");
  const openRollMap = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "map");
    router.push(`${url.pathname}${url.search}`);
  }, [router]);

  if (isMapView) {
    return (
      <RollOriginMap
        tunnellers={Object.fromEntries(sortedFilteredGroups)}
        rollFiltersProps={rollFiltersProps}
        filters={filters}
        defaultFilters={defaultFilters}
        applyFilters={applyFilters}
        getFilteredTunnellerCount={getFilteredTunnellerCount}
        activeFilterCount={activeFilterCount}
        totalTunnellers={totalTunnellers}
      />
    );
  }

  return (
    <>
      <Dialog
        id="filter-dialog"
        isFooterEnabled={true}
        isOpen={isDialogOpen}
        handleResetFilters={handleResetFilters}
        hasActiveFilters={activeFilterCount > 0}
        onClose={closeDialog}
        title={t("filters")}
        totalFiltered={totalFilteredTunnellers}
        total={totalTunnellers}
      >
        <RollFilter
          className={STYLES["filters-container"]}
          {...rollFiltersProps}
        />
      </Dialog>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <Title title={t("title")} />
        </div>
        {desktopView ? (
          <div className={STYLES["header-summary"]}>
            <div className={STYLES["header-actions"]}>
              <button
                className={STYLES["reset-button"]}
                onClick={handleResetFilters}
                disabled={activeFilterCount === 0}
              >
                {t("resetFilters")}
              </button>
            </div>
            <div className={STYLES["header-meta"]}>
              <p className={STYLES.results}>{resultsText}</p>
              <div className={STYLES["header-buttons"]}>
                <button
                  className={STYLES["map-button"]}
                  onClick={openRollMap}
                  aria-label={t("openRollMap")}
                >
                  <span className={STYLES["map-button-icon"]} aria-hidden />
                  {t("rollMap")}
                </button>
                <button
                  className={STYLES["sort-button"]}
                  onClick={handleSortToggle}
                  aria-label={sortButtonText}
                >
                  <span className={STYLES["sort-button-label"]}>
                    <span className={STYLES["sort-button-letters"]}>
                      <span className={STYLES["sort-button-top"]}>A</span>
                      <span className={STYLES["sort-button-bottom"]}>Z</span>
                    </span>
                    <span className={STYLES["sort-button-arrow"]}>
                      {isAscending ? "↓" : "↑"}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className={STYLES["roll-container"]}>
          <div className={STYLES.controls}>
            {!desktopView ? (
              <div className={STYLES["results-container"]}>
                <p className={STYLES.results}>{resultsText}</p>
                <div className={STYLES["mobile-actions"]}>
                  <button
                    className={STYLES["map-button"]}
                    onClick={openRollMap}
                    aria-label={t("openRollMap")}
                  >
                    <span className={STYLES["map-button-icon"]} aria-hidden />
                    {t("rollMap")}
                  </button>
                  <button
                    className={STYLES["sort-button"]}
                    onClick={handleSortToggle}
                    aria-label={sortButtonText}
                  >
                    <span className={STYLES["sort-button-label"]}>
                      <span className={STYLES["sort-button-letters"]}>
                        <span className={STYLES["sort-button-top"]}>A</span>
                        <span className={STYLES["sort-button-bottom"]}>Z</span>
                      </span>
                      <span className={STYLES["sort-button-arrow"]}>
                        {isAscending ? "↓" : "↑"}
                      </span>
                    </span>
                  </button>
                </div>
                <button
                  className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`}
                  onClick={openDialog}
                >
                  {t("filters")}
                  {activeFilterCount > 0 && (
                    <span className={STYLES["filter-button-badge"]}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            ) : null}
            {desktopView ? (
              <button
                className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`}
                onClick={openDialog}
              >
                {t("filters")}
                {activeFilterCount > 0 && (
                  <span className={STYLES["filter-button-badge"]}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            ) : null}
            {desktopView ? (
              <RollFilter
                className={STYLES["filters-container"]}
                {...rollFiltersProps}
              />
            ) : null}
          </div>

          {filteredGroups.length > 0 ? (
            <RollAlphabet
              tunnellers={sortedFilteredGroups}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          ) : (
            <RollNoResults handleResetFilters={handleResetFilters} />
          )}
        </div>
      </div>
    </>
  );
}
