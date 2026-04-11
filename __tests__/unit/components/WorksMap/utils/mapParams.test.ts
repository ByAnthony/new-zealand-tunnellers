import {
  dateToMonth,
  toSlug,
  monthToParam,
  paramToMonth,
} from "@/components/WorksMap/utils/mapParams";

describe("mapParams", () => {
  describe("dateToMonth", () => {
    test("converts date string to month number", () => {
      expect(dateToMonth("1917-03-15")).toBe(1917 * 12 + 2);
    });

    test("handles January", () => {
      expect(dateToMonth("1918-01-01")).toBe(1918 * 12 + 0);
    });

    test("handles December", () => {
      expect(dateToMonth("1918-12-31")).toBe(1918 * 12 + 11);
    });
  });

  describe("toSlug", () => {
    test("converts name to lowercase slug", () => {
      expect(toSlug("Machine-Gun Nest")).toBe("machine-gun-nest");
    });

    test("replaces multiple spaces with single hyphen", () => {
      expect(toSlug("First Aid  Post")).toBe("first-aid-post");
    });

    test("handles single word", () => {
      expect(toSlug("Dugout")).toBe("dugout");
    });
  });

  describe("monthToParam", () => {
    test("converts month number to YYYY-MM string", () => {
      expect(monthToParam(1917 * 12 + 2)).toBe("1917-03");
    });

    test("pads single-digit month", () => {
      expect(monthToParam(1918 * 12 + 0)).toBe("1918-01");
    });

    test("handles December", () => {
      expect(monthToParam(1918 * 12 + 11)).toBe("1918-12");
    });
  });

  describe("paramToMonth", () => {
    test("converts YYYY-MM string to month number", () => {
      expect(paramToMonth("1917-03")).toBe(1917 * 12 + 2);
    });

    test("returns null for invalid format", () => {
      expect(paramToMonth("invalid")).toBeNull();
    });

    test("returns null for partial format", () => {
      expect(paramToMonth("1917")).toBeNull();
    });

    test("roundtrips with monthToParam", () => {
      const month = 1917 * 12 + 8;
      expect(paramToMonth(monthToParam(month))).toBe(month);
    });
  });
});
