import {
  filtersToSearchParams,
  searchParamsToFilters,
  type FilterLookups,
  type Filters,
} from "@/utils/helpers/rollParams";

const lookups: FilterLookups = {
  detachments: [
    { id: 1, label: "Main Body" },
    { id: 2, label: "2nd Reinforcements" },
    { id: 3, label: "7th Reinforcements" },
    { id: null, label: "Tunnelling Corps" },
  ],
  corps: [
    { id: null, label: "Tunnelling Corps" },
    { id: 2, label: "Army Pay Corps" },
  ],
  sortedRanks: {
    Officers: [
      { id: 1, label: "Major" },
      { id: 2, label: "Captain" },
    ],
    "Non-Commissioned Officers": [{ id: 3, label: "Sergeant" }],
    "Other Ranks": [{ id: 4, label: "Sapper" }],
  },
  birthYears: ["1880", "1886", "1897", "1910", "1920"],
  deathYears: ["1930", "1935", "1952", "1960", "1970"],
};

const defaultFilters: Filters = {
  detachment: [],
  corps: [],
  ranks: { Officers: [], "Non-Commissioned Officers": [], "Other Ranks": [] },
  birthYear: lookups.birthYears,
  unknownBirthYear: "unknown",
  deathYear: lookups.deathYears,
  unknownDeathYear: "unknown",
};

const make = (qs: string) =>
  new URLSearchParams(qs) as unknown as Parameters<
    typeof searchParamsToFilters
  >[0];

describe("filtersToSearchParams", () => {
  test("returns empty string for default filters on page 1", () => {
    expect(filtersToSearchParams(defaultFilters, 1, lookups)).toBe("");
  });

  test("includes page when greater than 1", () => {
    expect(filtersToSearchParams(defaultFilters, 3, lookups)).toContain(
      "page=3",
    );
  });

  test("serialises detachment IDs as slugs", () => {
    const filters = { ...defaultFilters, detachment: [1, 2] };
    expect(filtersToSearchParams(filters, 1, lookups)).toContain(
      "detachment=main-body,2nd-reinforcements",
    );
  });

  test("serialises null ID as slug for Tunnelling Corps", () => {
    const filters = { ...defaultFilters, corps: [null] };
    expect(filtersToSearchParams(filters, 1, lookups)).toContain(
      "corps=tunnelling-corps",
    );
  });

  test("serialises mixed null and numeric corps IDs as slugs", () => {
    const filters = { ...defaultFilters, corps: [null, 2] };
    expect(filtersToSearchParams(filters, 1, lookups)).toContain(
      "corps=tunnelling-corps,army-pay-corps",
    );
  });

  test("serialises birth year range", () => {
    const filters = { ...defaultFilters, birthYear: ["1886", "1897"] };
    const qs = filtersToSearchParams(filters, 1, lookups);
    expect(qs).toContain("birth-min=1886");
    expect(qs).toContain("birth-max=1897");
  });

  test("does not include birth range when full default range", () => {
    const qs = filtersToSearchParams(defaultFilters, 1, lookups);
    expect(qs).not.toContain("birth-min");
  });

  test("sets unknown-birth=0 when unknowns excluded", () => {
    const filters = { ...defaultFilters, unknownBirthYear: "" };
    expect(filtersToSearchParams(filters, 1, lookups)).toContain(
      "unknown-birth=0",
    );
  });

  test("does not encode commas as %2C", () => {
    const filters = { ...defaultFilters, detachment: [1, 2] };
    const qs = filtersToSearchParams(filters, 1, lookups);
    expect(qs).not.toContain("%2C");
  });

  test("serialises rank IDs as slugs", () => {
    const filters = {
      ...defaultFilters,
      ranks: { ...defaultFilters.ranks, Officers: [1, 2] },
    };
    expect(filtersToSearchParams(filters, 1, lookups)).toContain(
      "officer=major,captain",
    );
  });
});

describe("searchParamsToFilters", () => {
  test("returns defaults and page 1 for empty params", () => {
    const { filters, page } = searchParamsToFilters(make(""), lookups);
    expect(page).toBe(1);
    expect(filters.detachment).toEqual([]);
    expect(filters.birthYear).toEqual(lookups.birthYears);
    expect(filters.unknownBirthYear).toBe("unknown");
  });

  test("parses page number", () => {
    const { page } = searchParamsToFilters(make("page=5"), lookups);
    expect(page).toBe(5);
  });

  test("defaults to page 1 for invalid page param", () => {
    const { page } = searchParamsToFilters(make("page=abc"), lookups);
    expect(page).toBe(1);
  });

  test("parses detachment slugs to IDs", () => {
    const { filters } = searchParamsToFilters(
      make("detachment=main-body,2nd-reinforcements"),
      lookups,
    );
    expect(filters.detachment).toEqual([1, 2]);
  });

  test("parses tunnelling-corps slug to null", () => {
    const { filters } = searchParamsToFilters(
      make("corps=tunnelling-corps"),
      lookups,
    );
    expect(filters.corps).toEqual([null]);
  });

  test("parses birth year range", () => {
    const { filters } = searchParamsToFilters(
      make("birth-min=1886&birth-max=1897"),
      lookups,
    );
    expect(filters.birthYear).toEqual(["1886", "1897"]);
  });

  test("sets unknownBirthYear to empty when unknown-birth=0", () => {
    const { filters } = searchParamsToFilters(make("unknown-birth=0"), lookups);
    expect(filters.unknownBirthYear).toBe("");
  });

  test("round-trips filters through serialize then parse", () => {
    const original: Filters = {
      detachment: [1, 2],
      corps: [null, 2],
      ranks: {
        Officers: [1],
        "Non-Commissioned Officers": [],
        "Other Ranks": [4],
      },
      birthYear: ["1886", "1897"],
      unknownBirthYear: "",
      deathYear: ["1935", "1952"],
      unknownDeathYear: "unknown",
    };
    const qs = filtersToSearchParams(original, 2, lookups);
    const { filters, page } = searchParamsToFilters(
      make(qs) as unknown as Parameters<typeof searchParamsToFilters>[0],
      lookups,
    );
    expect(page).toBe(2);
    expect(filters.detachment).toEqual([1, 2]);
    expect(filters.corps).toEqual([null, 2]);
    expect(filters.ranks["Officers"]).toEqual([1]);
    expect(filters.birthYear).toEqual(["1886", "1897"]);
    expect(filters.unknownBirthYear).toBe("");
  });
});
