import { formatPeriodRange } from "@/components/WorksMap/utils/mapParams";

describe("formatPeriodRange", () => {
  test("omits the first year when both dates are in the same year in English", () => {
    expect(formatPeriodRange("en", "1916-03-16", "1916-11-15")).toBe(
      "16 March — 15 November 1916",
    );
  });

  test("shows both years when the range spans multiple years in English", () => {
    expect(formatPeriodRange("en", "1916-11-16", "1917-04-09")).toBe(
      "16 November 1916 — 9 April 1917",
    );
  });

  test("formats the range in French", () => {
    expect(formatPeriodRange("fr", "1916-03-16", "1916-11-15")).toBe(
      "16 mars — 15 novembre 1916",
    );
  });
});
