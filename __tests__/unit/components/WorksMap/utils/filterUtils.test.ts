import {
  getWorkCategories,
  collectCategories,
  isWorkVisible,
} from "@/components/WorksMap/utils/filterUtils";
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
