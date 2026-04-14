"use client";

import isEqual from "lodash/isEqual";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RollAlphabet } from "@/components/Roll/RollAlphabet/RollAlphabet";
import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";
import { RollNoResults } from "@/components/Roll/RollNoResults/RollNoResults";
import { Title } from "@/components/Title/Title";
import { Tunneller } from "@/types/tunnellers";
import {
  type FilterLookups,
  type Filters,
  type RollSortOrder,
  filtersToSearchParams,
  searchParamsToFilters,
} from "@/utils/helpers/rollParams";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Roll.module.scss";
import { getUniqueCorps, getUniqueCorpsEn } from "./utils/corpsUtils";
import {
  getUniqueDetachments,
  getUniqueDetachmentsEn,
} from "./utils/detachmentUtils";
import {
  getSortedRanks,
  getUniqueRanks,
  getUniqueRanksEn,
} from "./utils/rankUtils";
import { getUniqueBirthYears, getUniqueDeathYears } from "./utils/yearsUtils";
import { Dialog } from "../Dialog/Dialog";

type Props = {
  tunnellers: Record<string, Tunneller[]>;
};

export function Roll({ tunnellers }: Props) {
  const t = useTranslations("roll");
  const locale = useLocale();
  const { width } = useWindowDimensions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFirstRenderRef = useRef(true);
  const previousSearchParamsRef = useRef(searchParams.toString());

  /** ---- Derived data ---- */
  const tunnellersList = useMemo(
    () => Object.entries(tunnellers),
    [tunnellers],
  );
  const uniqueDetachments = useMemo(
    () => getUniqueDetachments(tunnellersList),
    [tunnellersList],
  );
  const uniqueCorps = useMemo(
    () => getUniqueCorps(tunnellersList),
    [tunnellersList],
  );
  const uniqueRanks = useMemo(
    () => getUniqueRanks(tunnellersList),
    [tunnellersList],
  );
  const sortedRanks = useMemo(
    () => getSortedRanks(uniqueRanks, locale as "en" | "fr"),
    [uniqueRanks, locale],
  );
  const uniqueBirthYears = useMemo(
    () => getUniqueBirthYears(tunnellersList),
    [tunnellersList],
  );
  const uniqueDeathYears = useMemo(
    () => getUniqueDeathYears(tunnellersList),
    [tunnellersList],
  );
  const uniqueDetachmentsEn = useMemo(
    () => getUniqueDetachmentsEn(tunnellersList),
    [tunnellersList],
  );
  const uniqueCorpsEn = useMemo(
    () => getUniqueCorpsEn(tunnellersList),
    [tunnellersList],
  );
  const uniqueRanksEn = useMemo(
    () => getUniqueRanksEn(tunnellersList),
    [tunnellersList],
  );
  const sortedRanksEn = useMemo(
    () => getSortedRanks(uniqueRanksEn, "en"),
    [uniqueRanksEn],
  );

  /** ---- Defaults ---- */
  const defaultFilters: Filters = useMemo(
    () => ({
      detachment: [],
      corps: [],
      ranks: {
        Officers: [],
        "Non-Commissioned Officers": [],
        "Other Ranks": [],
      },
      birthYear: uniqueBirthYears,
      unknownBirthYear: "unknown",
      deathYear: uniqueDeathYears,
      unknownDeathYear: "unknown",
    }),
    [uniqueBirthYears, uniqueDeathYears],
  );

  /** ---- Filter lookups for URL slug conversion ---- */
  const filterLookups: FilterLookups = useMemo(
    () => ({
      detachments: uniqueDetachmentsEn,
      corps: uniqueCorpsEn,
      sortedRanks: sortedRanksEn,
      birthYears: uniqueBirthYears,
      deathYears: uniqueDeathYears,
    }),
    [
      uniqueDetachmentsEn,
      uniqueCorpsEn,
      sortedRanksEn,
      uniqueBirthYears,
      uniqueDeathYears,
    ],
  );

  /** ---- URL-derived state ---- */
  const parsedUrlState = useMemo(
    () => searchParamsToFilters(searchParams, filterLookups),
    [searchParams, filterLookups],
  );

  const [filters, setFilters] = useState<Filters>(parsedUrlState.filters);
  const [currentPage, setCurrentPage] = useState<number>(parsedUrlState.page);
  const [sortOrder, setSortOrder] = useState<RollSortOrder>(
    parsedUrlState.sortOrder,
  );
  const searchParamsString = searchParams.toString();

  /** ---- Re-sync local state when URL changes after mount ---- */
  useEffect(() => {
    if (previousSearchParamsRef.current === searchParamsString) return;
    previousSearchParamsRef.current = searchParamsString;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      if (!isEqual(filters, parsedUrlState.filters)) {
        setFilters(parsedUrlState.filters);
      }
      if (currentPage !== parsedUrlState.page) {
        setCurrentPage(parsedUrlState.page);
      }
      if (sortOrder !== parsedUrlState.sortOrder) {
        setSortOrder(parsedUrlState.sortOrder);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParamsString, parsedUrlState, filters, currentPage, sortOrder]);

  /** ---- Sync URL params when state changes ---- */
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const qs = filtersToSearchParams(
      filters,
      currentPage,
      sortOrder,
      filterLookups,
    );
    const currentQs = window.location.search.replace(/^\?/, "");
    if (qs === currentQs) return;
    router.replace(`?${qs}`, { scroll: false });
  }, [filters, currentPage, router, filterLookups, sortOrder]);

  /** ---- Restore scroll position on mount ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("roll:scrollY");
    const y = raw ? Number(raw) : 0;
    if (Number.isFinite(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

  /** ---- Helpers ---- */
  const hasAnyActiveFilter = (f: Filters): boolean => {
    const ranksActive = Object.values(f.ranks ?? {}).some((arr) => arr.length);
    const detachmentActive = (f.detachment ?? []).length > 0;
    const corpsActive = (f.corps ?? []).length > 0;
    const birthActive =
      (f.birthYear ?? []).length > 0 || f.unknownBirthYear === "unknown";
    const deathActive =
      (f.deathYear ?? []).length > 0 || f.unknownDeathYear === "unknown";
    return (
      ranksActive ||
      detachmentActive ||
      corpsActive ||
      birthActive ||
      deathActive
    );
  };

  const activeFilterCount = [
    Object.values(filters.ranks ?? {}).some((arr) => arr.length),
    (filters.detachment ?? []).length > 0,
    (filters.corps ?? []).length > 0,
    (filters.birthYear ?? []).length < uniqueBirthYears.length ||
      filters.unknownBirthYear === "",
    (filters.deathYear ?? []).length < uniqueDeathYears.length ||
      filters.unknownDeathYear === "",
  ].filter(Boolean).length;

  /** ---- Filtering ---- */
  const filteredGroups: [string, Tunneller[]][] = useMemo(() => {
    if (!hasAnyActiveFilter(filters)) return [];
    return tunnellersList
      .map<[string, Tunneller[]]>(([group, list]) => [
        group,
        list
          .filter(
            (t) =>
              !filters.detachment?.length ||
              filters.detachment.includes(t.detachmentId),
          )
          .filter((t) => {
            if (!filters.corps?.length) return true;
            return filters.corps.includes(t.corpsId);
          })
          .filter((t) => {
            const r = filters.ranks;
            if (!r || Object.values(r).every((arr) => arr.length === 0))
              return true;
            return Object.values(r).some((arr) => arr.includes(t.rankId));
          })
          .filter((t) => {
            const wantsUnknown = filters.unknownBirthYear === "unknown";
            const list = filters.birthYear ?? [];
            if (wantsUnknown && t.birthYear === null) return true;
            if (list.length && t.birthYear) return list.includes(t.birthYear);
            return !wantsUnknown && list.length === 0;
          })
          .filter((t) => {
            const wantsUnknown = filters.unknownDeathYear === "unknown";
            const list = filters.deathYear ?? [];
            if (wantsUnknown && t.deathYear === null) return true;
            if (list.length && t.deathYear) return list.includes(t.deathYear);
            return !wantsUnknown && list.length === 0;
          }),
      ])
      .filter(([, list]) => list.length > 0);
  }, [filters, tunnellersList]);

  const totalFilteredTunnellers = useMemo(
    () => filteredGroups.reduce((acc, [, list]) => acc + list.length, 0),
    [filteredGroups],
  );
  const sortedFilteredGroups = useMemo(() => {
    const direction = sortOrder === "asc" ? 1 : -1;

    return [...filteredGroups]
      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB) * direction)
      .map(([group, list]) => [
        group,
        [...list].sort((a, b) => {
          const surnameCompare =
            a.name.surname.localeCompare(b.name.surname) * direction;
          if (surnameCompare !== 0) return surnameCompare;
          return a.name.forename.localeCompare(b.name.forename) * direction;
        }),
      ]);
  }, [filteredGroups, sortOrder]);
  const totalTunnellers = useMemo(
    () => tunnellersList.reduce((acc, [, list]) => acc + list.length, 0),
    [tunnellersList],
  );

  const startBirthYear = filters.birthYear?.[0];
  const endBirthYear = filters.birthYear?.[filters.birthYear.length - 1];
  const startDeathYear = filters.deathYear?.[0];
  const endDeathYear = filters.deathYear?.[filters.deathYear.length - 1];

  /** ---- Handlers ---- */
  const setPageToFirst = useCallback(() => setCurrentPage(1), []);

  const handleDetachmentFilter = useCallback(
    (detachmentId: number | null) => {
      setFilters((prev) => {
        const det = new Set(prev.detachment ?? []);
        det.has(detachmentId)
          ? det.delete(detachmentId)
          : det.add(detachmentId);
        return { ...prev, detachment: Array.from(det) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleCorpsFilter = useCallback(
    (corpsId: number | null) => {
      setFilters((prev) => {
        const set = new Set(prev.corps ?? []);
        set.has(corpsId) ? set.delete(corpsId) : set.add(corpsId);
        return { ...prev, corps: Array.from(set) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleBirthSliderChange = useCallback(
    (value: number | number[]) => {
      if (!Array.isArray(value)) return;
      const [start, end] = value;
      setFilters((prev) => ({
        ...prev,
        birthYear: uniqueBirthYears.filter(
          (y) => y >= String(start) && y <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueBirthYears, setPageToFirst],
  );

  const handleUnknwonBirthYear = useCallback(
    (unknown: string) => {
      setFilters((prev) => ({
        ...prev,
        unknownBirthYear: unknown ? "unknown" : "",
      }));
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleDeathSliderChange = useCallback(
    (value: number | number[]) => {
      if (!Array.isArray(value)) return;
      const [start, end] = value;
      setFilters((prev) => ({
        ...prev,
        deathYear: uniqueDeathYears.filter(
          (y) => y >= String(start) && y <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueDeathYears, setPageToFirst],
  );

  const handleUnknwonDeathYear = useCallback(
    (unknown: string) => {
      setFilters((prev) => ({
        ...prev,
        unknownDeathYear: unknown ? "unknown" : "",
      }));
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleRankFilter = useCallback(
    (ranksFilter: Record<string, (number | null)[]>) => {
      setFilters((prev) => {
        const nextRanks: Record<string, (number | null)[]> = { ...prev.ranks };
        Object.entries(ranksFilter).forEach(([category, rankIds]) => {
          const set = new Set(nextRanks[category] ?? []);
          const allSelected = rankIds.every((id) => set.has(id));
          if (allSelected) {
            rankIds.forEach((id) => set.delete(id));
          } else {
            rankIds.forEach((id) => set.add(id));
          }
          nextRanks[category] = Array.from(set);
        });
        return { ...prev, ranks: nextRanks };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleResetFilters = useCallback(() => {
    if (!isEqual(filters, defaultFilters)) {
      setCurrentPage(1);
      setFilters(defaultFilters);
    }
  }, [filters, defaultFilters]);

  /** ---- Dialog state ---- */
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);
  const handleFilterButton = useCallback(() => setIsOpen(true), []);
  const handleSortToggle = useCallback(() => {
    setCurrentPage(1);
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  }, []);

  const rollFiltersProps = {
    className: STYLES["filters-container"],
    uniqueDetachments,
    uniquecorps: uniqueCorps,
    uniqueBirthYears,
    uniqueDeathYears,
    sortedRanks,
    filters,
    startBirthYear,
    endBirthYear,
    startDeathYear,
    endDeathYear,
    handleDetachmentFilter,
    handleCorpsFilter,
    handleBirthSliderChange,
    handleDeathSliderChange,
    handleRankFilter,
    handleUnknwonBirthYear,
    handleUnknwonDeathYear,
  };

  const isDesktop = () => (width ? width > 896 : false);
  const desktopView = isDesktop();
  const resultsText =
    totalFilteredTunnellers > 1
      ? t("resultsPlural", { count: totalFilteredTunnellers })
      : t("results", { count: totalFilteredTunnellers });
  const isAscending = sortOrder === "asc";
  const sortButtonText = isAscending ? t("sortDescending") : t("sortAscending");

  return (
    <>
      <Dialog
        id="filter-dialog"
        isFooterEnabled={true}
        isOpen={isOpen}
        handleResetFilters={handleResetFilters}
        hasActiveFilters={activeFilterCount > 0}
        onClose={onClose}
        title={t("filters")}
        totalFiltered={totalFilteredTunnellers}
        total={totalTunnellers}
      >
        <RollFilter {...rollFiltersProps} />
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
              <button
                className={STYLES["sort-button"]}
                onClick={handleSortToggle}
                aria-label={sortButtonText}
              >
                <span className={STYLES["sort-button-label"]}>
                  <span className={STYLES["sort-button-letters"]}>
                    <span className={STYLES["sort-button-top"]}>
                      {isAscending ? "Z" : "A"}
                    </span>
                    <span className={STYLES["sort-button-bottom"]}>
                      {isAscending ? "A" : "Z"}
                    </span>
                  </span>
                  <span className={STYLES["sort-button-arrow"]}>
                    {isAscending ? "↓" : "↑"}
                  </span>
                </span>
              </button>
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
                    className={STYLES["sort-button"]}
                    onClick={handleSortToggle}
                    aria-label={sortButtonText}
                  >
                    <span className={STYLES["sort-button-label"]}>
                      <span className={STYLES["sort-button-letters"]}>
                        <span className={STYLES["sort-button-top"]}>
                          {isAscending ? "Z" : "A"}
                        </span>
                        <span className={STYLES["sort-button-bottom"]}>
                          {isAscending ? "A" : "Z"}
                        </span>
                      </span>
                      <span className={STYLES["sort-button-arrow"]}>
                        {isAscending ? "↓" : "↑"}
                      </span>
                    </span>
                  </button>
                  <button
                    className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`}
                    onClick={handleFilterButton}
                  >
                    {t("filters")}
                    {activeFilterCount > 0 && (
                      <span className={STYLES["filter-button-badge"]}>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
            {desktopView ? (
              <button
                className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`}
                onClick={handleFilterButton}
              >
                {t("filters")}
                {activeFilterCount > 0 && (
                  <span className={STYLES["filter-button-badge"]}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            ) : null}
            {desktopView ? <RollFilter {...rollFiltersProps} /> : null}
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
