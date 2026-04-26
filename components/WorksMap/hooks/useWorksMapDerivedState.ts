"use client";

import { useCallback, useMemo } from "react";

import { CaveData } from "@/utils/database/queries/cavesQuery";
import { FrontLineData } from "@/utils/database/queries/frontLinesQuery";
import { SubwayData } from "@/utils/database/queries/subwaysQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

import {
  getVisibleFrontLines,
  getVisibleFrontLinesForPeriod,
  getWorkCategories,
  isWorkVisible,
  shouldPinFrontLinesToPeriod,
} from "../utils/filterUtils";
import { dateToDay } from "../utils/mapParams";

type Params = {
  works: WorkData[];
  subways: SubwayData[];
  frontLines: FrontLineData[];
  locale: string;
  allMonths: { start: number; end: number }[];
  dateRange: [number, number];
  selectedTypes: Set<string>;
  slugToName: Map<string, string>;
  periodBounds: [number, number] | null;
  showFrontLines: boolean;
};

export function useWorksMapDerivedState({
  works,
  subways,
  frontLines,
  locale,
  allMonths,
  dateRange,
  selectedTypes,
  slugToName,
  periodBounds,
  showFrontLines,
}: Params) {
  const visibleFrontLineState = useMemo(() => {
    if (!periodBounds) {
      return getVisibleFrontLines(
        frontLines,
        dateRange,
        showFrontLines,
        dateToDay,
      );
    }

    if (shouldPinFrontLinesToPeriod(frontLines, periodBounds, dateToDay)) {
      return getVisibleFrontLinesForPeriod(
        frontLines,
        periodBounds,
        periodBounds[1],
        showFrontLines,
        dateToDay,
      );
    }

    return getVisibleFrontLinesForPeriod(
      frontLines,
      periodBounds,
      dateRange[1],
      showFrontLines,
      dateToDay,
    );
  }, [frontLines, periodBounds, dateRange, showFrontLines]);

  const isDisplayedWorkVisible = useCallback(
    (work: WorkData | null): boolean => {
      if (!work) return false;
      const idx = works.findIndex((w) => w.work_id === work.work_id);
      if (idx === -1) return false;
      const [c1, c2] = getWorkCategories(work, locale);
      return isWorkVisible(
        allMonths[idx].start,
        allMonths[idx].end,
        c1,
        c2,
        dateRange,
        selectedTypes,
      );
    },
    [works, locale, allMonths, dateRange, selectedTypes],
  );

  const isDisplayedSubwayVisible = useCallback(
    (subway: SubwayData | null): boolean => {
      if (!subway) return false;
      const filterActive = selectedTypes.size > 0;
      const subwayTypeSelected = selectedTypes.has(
        slugToName.get("subway") ?? "",
      );
      let visible = !filterActive || subwayTypeSelected;
      if (visible && subway.subway_date_start) {
        const start = dateToDay(subway.subway_date_start);
        const end = dateToDay(
          subway.subway_date_end ?? subway.subway_date_start,
        );
        visible = start <= dateRange[1] && end >= dateRange[0];
      }
      return visible;
    },
    [dateRange, selectedTypes, slugToName],
  );

  const isDisplayedCaveVisible = useCallback(
    (_cave: CaveData | null): boolean => {
      const filterActive = selectedTypes.size > 0;
      const subwayTypeSelected = selectedTypes.has(
        slugToName.get("subway") ?? "",
      );
      return !filterActive || subwayTypeSelected;
    },
    [selectedTypes, slugToName],
  );

  const computeVisibleCount = useCallback(
    (start: number, end: number, types: Set<string>): number =>
      works.filter((w, i) => {
        const [cat1, cat2] = getWorkCategories(w, locale);
        return isWorkVisible(
          allMonths[i].start,
          allMonths[i].end,
          cat1,
          cat2,
          [start, end],
          types,
        );
      }).length,
    [works, allMonths, locale],
  );

  const visibleCount = computeVisibleCount(
    dateRange[0],
    dateRange[1],
    selectedTypes,
  );

  const computeAvailableTypes = useCallback(
    (start: number, end: number): Set<string> => {
      const cats = new Set<string>();
      works.forEach((w, i) => {
        if (allMonths[i].start <= end && allMonths[i].end >= start) {
          const [c1, c2] = getWorkCategories(w, locale);
          if (c1) cats.add(c1);
          if (c2) cats.add(c2);
        }
      });
      return cats;
    },
    [works, allMonths, locale],
  );

  const computeTypeBounds = useCallback(
    (types: Set<string>): [number, number] | null => {
      if (types.size === 0) return null;

      const matchingRanges = works
        .map((work, index) => {
          const [cat1, cat2] = getWorkCategories(work, locale);
          const matches =
            (cat1 !== null && types.has(cat1)) ||
            (cat2 !== null && types.has(cat2));
          return matches ? allMonths[index] : null;
        })
        .filter((range): range is (typeof allMonths)[number] => range !== null);

      if (matchingRanges.length === 0) return null;

      return [
        Math.min(...matchingRanges.map((range) => range.start)),
        Math.max(...matchingRanges.map((range) => range.end)),
      ];
    },
    [works, allMonths, locale],
  );

  const typeBounds = useMemo<[number, number] | null>(
    () => computeTypeBounds(selectedTypes),
    [computeTypeBounds, selectedTypes],
  );
  const clampBounds = periodBounds ?? typeBounds;

  const subwayTypeSelected = selectedTypes.has(slugToName.get("subway") ?? "");

  const visibleSubwayIds = useMemo(() => {
    const ids = new Set<number>();
    subways.forEach((subway) => {
      if (isDisplayedSubwayVisible(subway)) {
        ids.add(subway.subway_id);
      }
    });
    return ids;
  }, [subways, isDisplayedSubwayVisible]);

  const cavesVisible = selectedTypes.size === 0 || subwayTypeSelected;

  return {
    visibleFrontLineState,
    isDisplayedWorkVisible,
    isDisplayedSubwayVisible,
    isDisplayedCaveVisible,
    visibleSubwayIds,
    cavesVisible,
    visibleCount,
    computeVisibleCount,
    computeAvailableTypes,
    computeTypeBounds,
    typeBounds,
    clampBounds,
  };
}
