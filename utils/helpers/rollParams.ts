import { type ReadonlyURLSearchParams } from "next/navigation";

import { FilterOption } from "@/types/tunnellers";

export type Filters = {
  detachment: (number | null)[];
  corps: (number | null)[];
  ranks: Record<string, (number | null)[]>;
  birthYear: string[];
  unknownBirthYear: string;
  deathYear: string[];
  unknownDeathYear: string;
};

export type FilterLookups = {
  detachments: FilterOption[];
  corps: FilterOption[];
  sortedRanks: Record<string, FilterOption[]>;
  birthYears: string[];
  deathYears: string[];
};

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idsToSlugs(ids: (number | null)[], options: FilterOption[]): string {
  return ids
    .map((id) => {
      const option = options.find((o) => o.id === id);
      return option ? slugify(option.label) : null;
    })
    .filter(Boolean)
    .join(",");
}

function slugsToIds(
  value: string | null,
  options: FilterOption[],
): (number | null)[] {
  if (!value) return [];
  return value
    .split(",")
    .map((slug) => {
      const option = options.find((o) => slugify(o.label) === slug);
      return option !== undefined ? option.id : undefined;
    })
    .filter((id): id is number | null => id !== undefined);
}

export function searchParamsToFilters(
  params: ReadonlyURLSearchParams,
  lookups: FilterLookups,
): { filters: Filters; page: number } {
  const pageRaw = Number(params.get("page"));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const birthMin = params.get("birth-min");
  const birthMax = params.get("birth-max");
  const birthYear =
    birthMin && birthMax
      ? lookups.birthYears.filter((y) => y >= birthMin && y <= birthMax)
      : lookups.birthYears;

  const deathMin = params.get("death-min");
  const deathMax = params.get("death-max");
  const deathYear =
    deathMin && deathMax
      ? lookups.deathYears.filter((y) => y >= deathMin && y <= deathMax)
      : lookups.deathYears;

  return {
    page,
    filters: {
      detachment: slugsToIds(params.get("detachment"), lookups.detachments),
      corps: slugsToIds(params.get("corps"), lookups.corps),
      ranks: Object.fromEntries(
        Object.entries(lookups.sortedRanks).map(([category, options]) => {
          const paramKey =
            category === "Officers"
              ? "officer"
              : category === "Non-Commissioned Officers"
                ? "nco"
                : "other-rank";
          return [category, slugsToIds(params.get(paramKey), options)];
        }),
      ),
      birthYear,
      unknownBirthYear: params.get("unknown-birth") === "0" ? "" : "unknown",
      deathYear,
      unknownDeathYear: params.get("unknown-death") === "0" ? "" : "unknown",
    },
  };
}

export function filtersToSearchParams(
  filters: Filters,
  page: number,
  lookups: FilterLookups,
): string {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));

  if (filters.detachment.length > 0) {
    const slugs = idsToSlugs(filters.detachment, lookups.detachments);
    if (slugs) params.set("detachment", slugs);
  }

  if (filters.corps.length > 0) {
    const slugs = idsToSlugs(filters.corps, lookups.corps);
    if (slugs) params.set("corps", slugs);
  }

  const rankParamKeys: Record<string, string> = {
    Officers: "officer",
    "Non-Commissioned Officers": "nco",
    "Other Ranks": "other-rank",
  };

  Object.entries(rankParamKeys).forEach(([category, paramKey]) => {
    const ids = filters.ranks[category] ?? [];
    if (ids.length > 0) {
      const options = lookups.sortedRanks[category] ?? [];
      const slugs = idsToSlugs(ids, options);
      if (slugs) params.set(paramKey, slugs);
    }
  });

  if (
    filters.birthYear.length < lookups.birthYears.length &&
    filters.birthYear.length > 0
  ) {
    params.set("birth-min", filters.birthYear[0]);
    params.set("birth-max", filters.birthYear[filters.birthYear.length - 1]);
  }

  if (filters.unknownBirthYear === "") params.set("unknown-birth", "0");

  if (
    filters.deathYear.length < lookups.deathYears.length &&
    filters.deathYear.length > 0
  ) {
    params.set("death-min", filters.deathYear[0]);
    params.set("death-max", filters.deathYear[filters.deathYear.length - 1]);
  }

  if (filters.unknownDeathYear === "") params.set("unknown-death", "0");

  return params.toString().replace(/%2C/gi, ",");
}
