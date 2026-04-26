import {
  getWorkCategories,
  collectCategories,
  getVisibleFrontLines,
  getVisibleFrontLinesForPeriod,
  isWorkVisible,
  shouldPinFrontLinesToPeriod,
} from "@/components/WorksMap/utils/filterUtils";
import { dateToDay } from "@/components/WorksMap/utils/mapParams";
import { FrontLineData } from "@/utils/database/queries/frontLinesQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

const mockWork = (overrides: Partial<WorkData> = {}): WorkData =>
  ({
    work_id: 1,
    work_name: "Test Work",
    work_type_en: "Type",
    work_type_fr: "Type",
    work_category_1_en: "Dugout",
    work_category_1_fr: "Abri",
    work_category_2_en: "Trench",
    work_category_2_fr: "Tranchée",
    work_section: "A",
    work_date_start: "1917-01-01",
    work_date_end: "1917-06-01",
    work_latitude: 50.0,
    work_longitude: 2.0,
    ...overrides,
  }) as WorkData;

describe("getWorkCategories", () => {
  test("returns English categories for en locale", () => {
    const work = mockWork();
    expect(getWorkCategories(work, "en")).toEqual(["Dugout", "Trench"]);
  });

  test("returns French categories for fr locale", () => {
    const work = mockWork();
    expect(getWorkCategories(work, "fr")).toEqual(["Abri", "Tranchée"]);
  });

  test("returns null for missing categories", () => {
    const work = mockWork({
      work_category_1_en: undefined,
      work_category_2_en: undefined,
    });
    expect(getWorkCategories(work, "en")).toEqual([null, null]);
  });

  test("returns null for partially missing categories", () => {
    const work = mockWork({ work_category_2_en: undefined });
    expect(getWorkCategories(work, "en")).toEqual(["Dugout", null]);
  });
});

describe("collectCategories", () => {
  test("collects unique categories from multiple works", () => {
    const works = [
      mockWork(),
      mockWork({
        work_category_1_en: "Infrastructure",
        work_category_2_en: "Dugout",
      }),
    ];
    const result = collectCategories(works, "en");
    expect(result).toEqual(new Set(["Dugout", "Trench", "Infrastructure"]));
  });

  test("ignores null categories", () => {
    const works = [
      mockWork({
        work_category_1_en: "Dugout",
        work_category_2_en: undefined,
      }),
    ];
    const result = collectCategories(works, "en");
    expect(result).toEqual(new Set(["Dugout"]));
  });

  test("returns empty set for works with no categories", () => {
    const works = [
      mockWork({
        work_category_1_en: undefined,
        work_category_2_en: undefined,
      }),
    ];
    const result = collectCategories(works, "en");
    expect(result).toEqual(new Set());
  });
});

describe("isWorkVisible", () => {
  const dateRange: [number, number] = [1917 * 12, 1917 * 12 + 6];

  test("visible when date range overlaps and no type filter", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 2,
        1917 * 12 + 4,
        "Dugout",
        "Trench",
        dateRange,
        new Set(),
      ),
    ).toBe(true);
  });

  test("not visible when date range does not overlap", () => {
    expect(
      isWorkVisible(
        1918 * 12,
        1918 * 12 + 3,
        "Dugout",
        null,
        dateRange,
        new Set(),
      ),
    ).toBe(false);
  });

  test("visible when category matches selected type", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 2,
        1917 * 12 + 4,
        "Dugout",
        "Trench",
        dateRange,
        new Set(["Dugout"]),
      ),
    ).toBe(true);
  });

  test("visible when second category matches selected type", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 2,
        1917 * 12 + 4,
        "Dugout",
        "Trench",
        dateRange,
        new Set(["Trench"]),
      ),
    ).toBe(true);
  });

  test("not visible when no category matches selected type", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 2,
        1917 * 12 + 4,
        "Dugout",
        "Trench",
        dateRange,
        new Set(["Infrastructure"]),
      ),
    ).toBe(false);
  });

  test("handles swapped start/end dates", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 4,
        1917 * 12 + 2,
        "Dugout",
        null,
        dateRange,
        new Set(),
      ),
    ).toBe(true);
  });

  test("visible when start equals NaN", () => {
    expect(isWorkVisible(NaN, NaN, "Dugout", null, dateRange, new Set())).toBe(
      true,
    );
  });

  test("not visible when date matches but type does not", () => {
    expect(
      isWorkVisible(
        1917 * 12 + 2,
        1917 * 12 + 4,
        null,
        null,
        dateRange,
        new Set(["Dugout"]),
      ),
    ).toBe(false);
  });
});

const mockFrontLine = (overrides: Partial<FrontLineData>): FrontLineData => ({
  front_line_id: 1,
  front_line_date: "1917-01-01",
  front_line_side: "british",
  front_line_period_start: "1916-11-16",
  front_line_period_end: "1917-04-09",
  ...overrides,
});

describe("getVisibleFrontLines", () => {
  const periodRange: [number, number] = [
    dateToDay("1916-11-16"),
    dateToDay("1917-04-09"),
  ];

  test("returns empty sets when period is not active", () => {
    const frontLines = [mockFrontLine({ front_line_id: 1 })];
    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      periodRange,
      false,
      dateToDay,
    );
    expect(visibleIds.size).toBe(0);
    expect(latestIds.size).toBe(0);
  });

  test("returns the front line when period is active and dates overlap", () => {
    const frontLines = [mockFrontLine({ front_line_id: 1 })];
    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      periodRange,
      true,
      dateToDay,
    );
    expect(visibleIds).toEqual(new Set([1]));
    expect(latestIds).toEqual(new Set([1]));
  });

  test("excludes front lines whose period does not overlap the date range", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_period_start: "1918-01-01",
        front_line_period_end: "1918-06-01",
      }),
    ];
    const { visibleIds } = getVisibleFrontLines(
      frontLines,
      periodRange,
      true,
      dateToDay,
    );
    expect(visibleIds.size).toBe(0);
  });

  test("marks the older front line as non-latest when two british lines are visible", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_date: "1916-12-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 2,
        front_line_date: "1917-02-01",
        front_line_side: "british",
      }),
    ];
    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      periodRange,
      true,
      dateToDay,
    );
    expect(visibleIds).toEqual(new Set([1, 2]));
    expect(latestIds).toEqual(new Set([2]));
  });

  test("tracks latest independently per side", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_date: "1916-12-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 2,
        front_line_date: "1917-02-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 3,
        front_line_date: "1916-12-15",
        front_line_side: "german",
      }),
      mockFrontLine({
        front_line_id: 4,
        front_line_date: "1917-01-15",
        front_line_side: "german",
      }),
    ];
    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      periodRange,
      true,
      dateToDay,
    );
    expect(visibleIds).toEqual(new Set([1, 2, 3, 4]));
    // latest british = 2, latest german = 4
    expect(latestIds).toEqual(new Set([2, 4]));
  });

  test("excludes the next adjacent period even when the selected range reaches its boundary", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 9,
        front_line_date: "1918-03-21",
        front_line_side: "british",
        front_line_period_start: "1918-03-21",
        front_line_period_end: "1918-07-14",
      }),
      mockFrontLine({
        front_line_id: 10,
        front_line_date: "1918-03-21",
        front_line_side: "german",
        front_line_period_start: "1918-03-21",
        front_line_period_end: "1918-07-14",
      }),
      mockFrontLine({
        front_line_id: 11,
        front_line_date: "1918-07-15",
        front_line_side: "british",
        front_line_period_start: "1918-07-15",
        front_line_period_end: "1918-08-08",
      }),
      mockFrontLine({
        front_line_id: 12,
        front_line_date: "1918-07-15",
        front_line_side: "german",
        front_line_period_start: "1918-07-15",
        front_line_period_end: "1918-08-08",
      }),
    ];
    const driftedRange: [number, number] = [
      dateToDay("1918-03-21"),
      dateToDay("1918-07-15"),
    ];

    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      driftedRange,
      true,
      dateToDay,
    );

    expect(visibleIds).toEqual(new Set([9, 10]));
    expect(latestIds).toEqual(new Set([9, 10]));
  });
});

describe("shouldPinFrontLinesToPeriod", () => {
  const periodBounds: [number, number] = [
    dateToDay("1916-11-16"),
    dateToDay("1917-04-09"),
  ];

  test("returns true when the period has a single front-line date", () => {
    const frontLines = [
      mockFrontLine({ front_line_id: 1, front_line_side: "british" }),
      mockFrontLine({ front_line_id: 2, front_line_side: "german" }),
    ];

    expect(
      shouldPinFrontLinesToPeriod(frontLines, periodBounds, dateToDay),
    ).toBe(true);
  });

  test("returns false when the period has multiple front-line dates", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_date: "1916-12-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 2,
        front_line_date: "1916-12-01",
        front_line_side: "german",
      }),
      mockFrontLine({
        front_line_id: 3,
        front_line_date: "1917-02-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 4,
        front_line_date: "1917-02-01",
        front_line_side: "german",
      }),
    ];

    expect(
      shouldPinFrontLinesToPeriod(frontLines, periodBounds, dateToDay),
    ).toBe(false);
  });
});

describe("getVisibleFrontLinesForPeriod", () => {
  const periodBounds: [number, number] = [
    dateToDay("1916-11-16"),
    dateToDay("1917-04-09"),
  ];

  test("keeps the first front line visible before later front lines take over", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_date: "1916-12-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 2,
        front_line_date: "1916-12-01",
        front_line_side: "german",
      }),
      mockFrontLine({
        front_line_id: 3,
        front_line_date: "1917-02-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 4,
        front_line_date: "1917-02-01",
        front_line_side: "german",
      }),
    ];

    const { visibleIds, latestIds } = getVisibleFrontLinesForPeriod(
      frontLines,
      periodBounds,
      dateToDay("1917-01-10"),
      true,
      dateToDay,
    );

    expect(visibleIds).toEqual(new Set([1, 2]));
    expect(latestIds).toEqual(new Set([1, 2]));
  });

  test("includes later front lines once the slider reaches them", () => {
    const frontLines = [
      mockFrontLine({
        front_line_id: 1,
        front_line_date: "1916-12-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 2,
        front_line_date: "1916-12-01",
        front_line_side: "german",
      }),
      mockFrontLine({
        front_line_id: 3,
        front_line_date: "1917-02-01",
        front_line_side: "british",
      }),
      mockFrontLine({
        front_line_id: 4,
        front_line_date: "1917-02-01",
        front_line_side: "german",
      }),
    ];

    const { visibleIds, latestIds } = getVisibleFrontLinesForPeriod(
      frontLines,
      periodBounds,
      dateToDay("1917-02-10"),
      true,
      dateToDay,
    );

    expect(visibleIds).toEqual(new Set([1, 2, 3, 4]));
    expect(latestIds).toEqual(new Set([3, 4]));
  });
});
