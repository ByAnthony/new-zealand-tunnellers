"use client";

import isEqual from "lodash/isEqual";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Tunneller } from "@/types/tunnellers";
import {
  type FilterLookups,
  type Filters,
  type RollSortOrder,
  filtersToSearchParams,
  searchParamsToFilters,
} from "@/utils/helpers/rollParams";

import { getUniqueCorps, getUniqueCorpsEn } from "../utils/corpsUtils";
import {
  getUniqueDetachments,
  getUniqueDetachmentsEn,
} from "../utils/detachmentUtils";
import {
  getSortedRanks,
  getUniqueRanks,
  getUniqueRanksEn,
} from "../utils/rankUtils";
import { getUniqueBirthYears, getUniqueDeathYears } from "../utils/yearsUtils";

type Params = {
  tunnellers: Record<string, Tunneller[]>;
  locale: string;
};

export function useRollState({ tunnellers, locale }: Params) {
  const searchParams = useSearchParams();
  const isFirstRenderRef = useRef(true);
  const previousSearchParamsRef = useRef(searchParams.toString());

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

  const parsedUrlState = useMemo(
    () => searchParamsToFilters(searchParams, filterLookups),
    [searchParams, filterLookups],
  );

  const [filters, setFilters] = useState<Filters>(parsedUrlState.filters);
  const [currentPage, setCurrentPage] = useState<number>(parsedUrlState.page);
  const [sortOrder, setSortOrder] = useState<RollSortOrder>(
    parsedUrlState.sortOrder,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const searchParamsString = searchParams.toString();
  const syncUrl = useCallback((qs: string) => {
    const currentQs = window.location.search.replace(/^\?/, "");
    if (qs === currentQs) return;
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, []);

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

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!isSliderDragging) return;
    const qs = filtersToSearchParams(
      filters,
      currentPage,
      sortOrder,
      filterLookups,
    );
    syncUrl(qs);
  }, [
    filters,
    currentPage,
    filterLookups,
    sortOrder,
    isSliderDragging,
    syncUrl,
  ]);

  useEffect(() => {
    if (isFirstRenderRef.current) return;
    if (isSliderDragging) return;
    const qs = filtersToSearchParams(
      filters,
      currentPage,
      sortOrder,
      filterLookups,
    );
    syncUrl(qs);
  }, [
    filters,
    currentPage,
    filterLookups,
    sortOrder,
    isSliderDragging,
    syncUrl,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("roll:scrollY");
    const y = raw ? Number(raw) : 0;
    if (Number.isFinite(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

  const hasAnyActiveFilter = useCallback((currentFilters: Filters): boolean => {
    const ranksActive = Object.values(currentFilters.ranks ?? {}).some(
      (arr) => arr.length,
    );
    const detachmentActive = (currentFilters.detachment ?? []).length > 0;
    const corpsActive = (currentFilters.corps ?? []).length > 0;
    const birthActive =
      (currentFilters.birthYear ?? []).length > 0 ||
      currentFilters.unknownBirthYear === "unknown";
    const deathActive =
      (currentFilters.deathYear ?? []).length > 0 ||
      currentFilters.unknownDeathYear === "unknown";

    return (
      ranksActive ||
      detachmentActive ||
      corpsActive ||
      birthActive ||
      deathActive
    );
  }, []);

  const activeFilterCount = [
    Object.values(filters.ranks ?? {}).some((arr) => arr.length),
    (filters.detachment ?? []).length > 0,
    (filters.corps ?? []).length > 0,
    (filters.birthYear ?? []).length < uniqueBirthYears.length ||
      filters.unknownBirthYear === "",
    (filters.deathYear ?? []).length < uniqueDeathYears.length ||
      filters.unknownDeathYear === "",
  ].filter(Boolean).length;

  const filteredGroups: [string, Tunneller[]][] = useMemo(() => {
    if (!hasAnyActiveFilter(filters)) return [];

    return tunnellersList
      .map<[string, Tunneller[]]>(([group, list]) => [
        group,
        list
          .filter(
            (tunneller) =>
              !filters.detachment?.length ||
              filters.detachment.includes(tunneller.detachmentId),
          )
          .filter((tunneller) => {
            if (!filters.corps?.length) return true;
            return filters.corps.includes(tunneller.corpsId);
          })
          .filter((tunneller) => {
            const currentRanks = filters.ranks;
            if (
              !currentRanks ||
              Object.values(currentRanks).every((arr) => arr.length === 0)
            ) {
              return true;
            }
            return Object.values(currentRanks).some((arr) =>
              arr.includes(tunneller.rankId),
            );
          })
          .filter((tunneller) => {
            const wantsUnknown = filters.unknownBirthYear === "unknown";
            const list = filters.birthYear ?? [];
            if (wantsUnknown && tunneller.birthYear === null) return true;
            if (list.length && tunneller.birthYear) {
              return list.includes(tunneller.birthYear);
            }
            return !wantsUnknown && list.length === 0;
          })
          .filter((tunneller) => {
            const wantsUnknown = filters.unknownDeathYear === "unknown";
            const list = filters.deathYear ?? [];
            if (wantsUnknown && tunneller.deathYear === null) return true;
            if (list.length && tunneller.deathYear) {
              return list.includes(tunneller.deathYear);
            }
            return !wantsUnknown && list.length === 0;
          }),
      ])
      .filter(([, list]) => list.length > 0);
  }, [filters, tunnellersList, hasAnyActiveFilter]);

  const totalFilteredTunnellers = useMemo(
    () => filteredGroups.reduce((acc, [, list]) => acc + list.length, 0),
    [filteredGroups],
  );

  const sortedFilteredGroups = useMemo<[string, Tunneller[]][]>(() => {
    const direction = sortOrder === "asc" ? 1 : -1;

    return [...filteredGroups]
      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB) * direction)
      .map<[string, Tunneller[]]>(([group, list]) => [
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

  const setPageToFirst = useCallback(() => setCurrentPage(1), []);

  const handleDetachmentFilter = useCallback(
    (detachmentId: number | null) => {
      setFilters((prev) => {
        const detachmentSet = new Set(prev.detachment ?? []);
        detachmentSet.has(detachmentId)
          ? detachmentSet.delete(detachmentId)
          : detachmentSet.add(detachmentId);
        return { ...prev, detachment: Array.from(detachmentSet) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleCorpsFilter = useCallback(
    (corpsId: number | null) => {
      setFilters((prev) => {
        const corpsSet = new Set(prev.corps ?? []);
        corpsSet.has(corpsId)
          ? corpsSet.delete(corpsId)
          : corpsSet.add(corpsId);
        return { ...prev, corps: Array.from(corpsSet) };
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
          (year) => year >= String(start) && year <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueBirthYears, setPageToFirst],
  );

  const handleUnknownBirthYear = useCallback(
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
          (year) => year >= String(start) && year <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueDeathYears, setPageToFirst],
  );

  const handleUnknownDeathYear = useCallback(
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
          const rankSet = new Set(nextRanks[category] ?? []);
          const allSelected = rankIds.every((id) => rankSet.has(id));
          if (allSelected) {
            rankIds.forEach((id) => rankSet.delete(id));
          } else {
            rankIds.forEach((id) => rankSet.add(id));
          }
          nextRanks[category] = Array.from(rankSet);
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

  const closeDialog = useCallback(() => setIsDialogOpen(false), []);
  const openDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleSliderDragStart = useCallback(
    () => setIsSliderDragging(true),
    [],
  );
  const handleSliderDragComplete = useCallback(
    () => setIsSliderDragging(false),
    [],
  );
  const handleSortToggle = useCallback(() => {
    setCurrentPage(1);
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  }, []);

  const rollFiltersProps = {
    uniqueDetachments,
    uniqueCorps,
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
    handleSliderDragStart,
    handleSliderDragComplete,
    handleRankFilter,
    handleUnknownBirthYear,
    handleUnknownDeathYear,
  };

  return {
    filters,
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
    totalTunnellers,
    handleResetFilters,
  };
}
