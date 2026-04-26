import { MAP_PERIODS } from "@/components/WorksMap/utils/periods";

type MapPeriod = (typeof MAP_PERIODS)[number];
type MapPeriodKey = MapPeriod["key"];

export const PERIOD_CHAPTER_LINKS: Record<MapPeriodKey, string> = {
  "1916-03-16/1916-11-15": "beneath-artois-fields",
  "1916-11-16/1917-04-09": "tunnelling-under-arras",
  "1917-04-10/1918-03-20": "always-digging",
  "1918-03-21/1918-07-14": "always-digging",
  "1918-07-15/1918-08-21": "always-digging",
  "1918-09-26/1918-11-11": "bridging-at-the-end",
  "1918-11-12/1918-12-27": "after-the-armistice",
};

export function getChapterIdForPeriod(periodKey: string | null): string | null {
  if (!periodKey) return null;
  return PERIOD_CHAPTER_LINKS[periodKey as MapPeriodKey] ?? null;
}

export function getMapPeriodsForChapter(chapterId: string): MapPeriod[] {
  return MAP_PERIODS.filter(
    (period) => PERIOD_CHAPTER_LINKS[period.key] === chapterId,
  );
}
