"use client";

import { useCallback, useMemo, useState } from "react";

import { dateToDay } from "../../utils/mapParams";
import { MAP_PERIODS } from "../../utils/periods";

type Params = {
  initialPeriodKey: string | null;
  selectedTypes: Set<string>;
  minMonth: number;
  maxMonth: number;
  onApplyFilters: (
    periodKey: string | null,
    periodStart: string | null,
    periodEnd: string | null,
    types: Set<string>,
  ) => void;
  computeAvailableTypes: (start: number, end: number) => Set<string>;
  computeVisibleCount: (
    start: number,
    end: number,
    types: Set<string>,
  ) => number;
};

export function usePendingMapFilters({
  initialPeriodKey,
  selectedTypes,
  minMonth,
  maxMonth,
  onApplyFilters,
  computeAvailableTypes,
  computeVisibleCount,
}: Params) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState<string | null>(
    initialPeriodKey,
  );
  const [pendingTypes, setPendingTypes] = useState<Set<string>>(new Set());

  const openFiltersDialog = useCallback(() => {
    setPendingPeriod(initialPeriodKey);
    setPendingTypes(new Set(selectedTypes));
    setIsFiltersOpen(true);
  }, [initialPeriodKey, selectedTypes]);

  const commitPending = useCallback(
    (period: string | null, types: Set<string>) => {
      const matchedPeriod = period
        ? MAP_PERIODS.find((mapPeriod) => mapPeriod.key === period)
        : null;
      onApplyFilters(
        period,
        matchedPeriod?.start ?? null,
        matchedPeriod?.end ?? null,
        types,
      );
    },
    [onApplyFilters],
  );

  const handleDialogClose = useCallback(() => {
    setIsFiltersOpen(false);
    commitPending(pendingPeriod, pendingTypes);
  }, [commitPending, pendingPeriod, pendingTypes]);

  const handlePeriodClick = useCallback((key: string) => {
    setPendingPeriod((prev) => (prev === key ? null : key));
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setPendingTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const pendingAvailableTypes = useMemo(() => {
    const matchedPeriod = pendingPeriod
      ? MAP_PERIODS.find((mapPeriod) => mapPeriod.key === pendingPeriod)
      : null;
    return matchedPeriod
      ? computeAvailableTypes(
          dateToDay(matchedPeriod.start),
          dateToDay(matchedPeriod.end),
        )
      : computeAvailableTypes(minMonth, maxMonth);
  }, [pendingPeriod, computeAvailableTypes, minMonth, maxMonth]);

  const pendingVisibleCount = useMemo(() => {
    const matchedPeriod = pendingPeriod
      ? MAP_PERIODS.find((mapPeriod) => mapPeriod.key === pendingPeriod)
      : null;
    const start = matchedPeriod ? dateToDay(matchedPeriod.start) : minMonth;
    const end = matchedPeriod ? dateToDay(matchedPeriod.end) : maxMonth;
    return computeVisibleCount(start, end, pendingTypes);
  }, [pendingPeriod, pendingTypes, computeVisibleCount, minMonth, maxMonth]);

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

  const handleResetFilters = useCallback(() => {
    setPendingPeriod(null);
    setPendingTypes(new Set());
  }, []);

  return {
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
  };
}
