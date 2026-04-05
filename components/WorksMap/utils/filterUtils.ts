import { WorkData } from "@/utils/database/queries/worksQuery";

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
