import { getNzResident, getParent } from "@/utils/helpers/origin";

describe("getParent function", () => {
  test("returns an object with name and origin when both are provided", () => {
    const name = "John";
    const origin = "Earth";
    const expectedResult = { name: "John", origin: "Earth" };
    const result = getParent(name, origin);
    expect(result).toEqual(expectedResult);
  });

  test("returns null when name is null", () => {
    const origin = "Earth";
    const result = getParent(null, origin);
    expect(result).toBeNull();
  });

  test("returns an object with name and null origin when origin is null", () => {
    const name = "John";
    const result = getParent(name, null);
    expect(result).toEqual({ name: "John", origin: null });
  });

  test("returns null when both name and origin are null", () => {
    const result = getParent(null, null);
    expect(result).toBeNull();
  });
});

describe("getNzResident", () => {
  test("calculates resident since year based on enlistment year and months", () => {
    const month = 24;
    const enlistment = "2023-04-01";
    const expectedResult = "2021";
    const result = getNzResident(month, enlistment, null);
    expect(result).toBe(expectedResult);
  });

  test("calculates resident since year based on posted year and months when enlistment is null", () => {
    const month = 36;
    const posted = "2023-04-01";
    const expectedResult = "2020";
    const result = getNzResident(month, null, posted);
    expect(result).toBe(expectedResult);
  });

  test("returns null when month is null", () => {
    const result = getNzResident(null, "2023-04-01", null);
    expect(result).toBeNull();
  });

  test("returns null when both enlistment and posted are null", () => {
    const month = 12;
    const result = getNzResident(month, null, null);
    expect(result).toBeNull();
  });

  test("handles case where month is under 12 months", () => {
    const month = 6;
    const enlistment = "2023-04-01";
    const expectedResult = "2022";
    const result = getNzResident(month, enlistment, null);
    expect(result).toBe(expectedResult);
  });

  test("handles edge case where month is exactly 12", () => {
    const month = 12;
    const enlistment = "2023-04-01";
    const expectedResult = "2022";
    const result = getNzResident(month, enlistment, null);
    expect(result).toBe(expectedResult);
  });

  test("remains stable for date-only strings regardless of local timezone", () => {
    const month = 1;
    const enlistment = "1917-01-01";
    expect(getNzResident(month, enlistment, null)).toBe("1916");
  });
});
