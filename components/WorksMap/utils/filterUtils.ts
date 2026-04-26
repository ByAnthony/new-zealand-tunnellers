import { FrontLineData } from "@/utils/database/queries/frontLinesQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

function getFrontLinesWithinPeriod(
  frontLines: FrontLineData[],
  periodBounds: [number, number],
  dateToDay: (date: string) => number,
) {
  return frontLines.filter(
    (frontLine) =>
      dateToDay(frontLine.front_line_period_start) >= periodBounds[0] &&
      dateToDay(frontLine.front_line_period_end) <= periodBounds[1],
  );
}

export function getWorkCategories(
  work: WorkData,
  locale: string,
): [string | null, string | null] {
  const cat1 =
    (locale === "fr" ? work.work_category_1_fr : work.work_category_1_en) ??
    null;
  const cat2 =
    (locale === "fr" ? work.work_category_2_fr : work.work_category_2_en) ??
    null;
  return [cat1, cat2];
}

export function collectCategories(
  works: WorkData[],
  locale: string,
): Set<string> {
  const cats = new Set<string>();
  works.forEach((w) => {
    const [c1, c2] = getWorkCategories(w, locale);
    if (c1) cats.add(c1);
    if (c2) cats.add(c2);
  });
  return cats;
}

export function getVisibleFrontLines(
  frontLines: FrontLineData[],
  dateRange: [number, number],
  showFrontLines: boolean,
  dateToDay: (date: string) => number,
): { visibleIds: Set<number>; latestIds: Set<number> } {
  const visibleFrontLines = frontLines.filter(
    (fl) =>
      showFrontLines &&
      dateToDay(fl.front_line_period_start) >= dateRange[0] &&
      dateToDay(fl.front_line_period_end) <= dateRange[1],
  );
  const latestIdBySide = new Map<string, number>();
  visibleFrontLines.forEach((fl) => {
    const current = latestIdBySide.get(fl.front_line_side);
    if (
      current === undefined ||
      fl.front_line_date >
        frontLines.find((f) => f.front_line_id === current)!.front_line_date
    ) {
      latestIdBySide.set(fl.front_line_side, fl.front_line_id);
    }
  });
  return {
    visibleIds: new Set(visibleFrontLines.map((fl) => fl.front_line_id)),
    latestIds: new Set(latestIdBySide.values()),
  };
}

export function getVisibleFrontLinesForPeriod(
  frontLines: FrontLineData[],
  periodBounds: [number, number],
  rangeEnd: number,
  showFrontLines: boolean,
  dateToDay: (date: string) => number,
): { visibleIds: Set<number>; latestIds: Set<number> } {
  if (!showFrontLines) {
    return { visibleIds: new Set(), latestIds: new Set() };
  }

  const periodFrontLines = getFrontLinesWithinPeriod(
    frontLines,
    periodBounds,
    dateToDay,
  );

  if (periodFrontLines.length === 0) {
    return { visibleIds: new Set(), latestIds: new Set() };
  }

  const distinctDates = Array.from(
    new Set(periodFrontLines.map((frontLine) => frontLine.front_line_date)),
  ).sort();
  const earliestDate = distinctDates[0];
  const visibleFrontLines = periodFrontLines.filter((frontLine) => {
    const frontLineDay = dateToDay(frontLine.front_line_date);
    return (
      frontLine.front_line_date === earliestDate || frontLineDay <= rangeEnd
    );
  });

  const latestIdBySide = new Map<string, number>();
  visibleFrontLines.forEach((frontLine) => {
    const current = latestIdBySide.get(frontLine.front_line_side);
    if (
      current === undefined ||
      frontLine.front_line_date >
        visibleFrontLines.find((line) => line.front_line_id === current)!
          .front_line_date
    ) {
      latestIdBySide.set(frontLine.front_line_side, frontLine.front_line_id);
    }
  });

  return {
    visibleIds: new Set(
      visibleFrontLines.map((frontLine) => frontLine.front_line_id),
    ),
    latestIds: new Set(latestIdBySide.values()),
  };
}

export function shouldPinFrontLinesToPeriod(
  frontLines: FrontLineData[],
  periodBounds: [number, number] | null,
  dateToDay: (date: string) => number,
): boolean {
  if (!periodBounds) return false;

  const periodFrontLines = getFrontLinesWithinPeriod(
    frontLines,
    periodBounds,
    dateToDay,
  );

  return (
    new Set(periodFrontLines.map((frontLine) => frontLine.front_line_date))
      .size === 1
  );
}

export function isWorkVisible(
  start: number,
  end: number,
  cat1: string | null,
  cat2: string | null,
  dateRange: [number, number],
  selectedTypes: Set<string>,
): boolean {
  const s = Math.min(start, end);
  const e = Math.max(start, end);
  const dateVisible = isNaN(s) || (s <= dateRange[1] && e >= dateRange[0]);
  const typeVisible =
    selectedTypes.size === 0 ||
    (cat1 !== null && selectedTypes.has(cat1)) ||
    (cat2 !== null && selectedTypes.has(cat2));
  return dateVisible && typeVisible;
}
