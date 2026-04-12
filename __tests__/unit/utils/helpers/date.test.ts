import { getAge, getDate, getDayMonth, getYear } from "@/utils/helpers/date";

describe("getYear", () => {
  test.each([
    {
      date: "2022-01-01",
      expectedYear: "2022",
    },
    {
      date: "2022/12/11",
      expectedYear: "2022",
    },
  ])("should return the year from a date string", ({ date, expectedYear }) => {
    const result = getYear(date);
    expect(result).toEqual(expectedYear);
  });
});

describe("getDayMonth", () => {
  test.each([
    {
      date: "2022-01-01",
      expectedDayMonth: "1 January",
    },
    {
      date: "2022/12/11",
      expectedDayMonth: "11 December",
    },
  ])(
    "should return the day and month from a date string",
    ({ date, expectedDayMonth }) => {
      const result = getDayMonth(date);
      expect(result).toEqual(expectedDayMonth);
    },
  );

  test("is stable for date-only strings regardless of local timezone", () => {
    expect(getDayMonth("1917-01-01")).toBe("1 January");
  });
});

describe("getDate", () => {
  test.each([
    {
      date: "2022-01-01",
      expectedDateObj: { year: "2022", dayMonth: "1 January" },
    },
    {
      date: "2022/12/11",
      expectedDateObj: { year: "2022", dayMonth: "11 December" },
    },
  ])("should return Date object", ({ date, expectedDateObj }) => {
    const result = getDate(date);
    expect(result).toEqual(expectedDateObj);
  });
});

describe("getAge", () => {
  test("should return the age based on birthDate and currentDate", () => {
    const birthDate = "2000-01-01";
    const currentDate = "2022-01-01";
    const expectedAge = 22;
    const result = getAge(birthDate, currentDate);
    expect(result).toEqual(expectedAge);
  });

  test.each([
    { birthDate: "2000-01-01", currentDate: null },
    { birthDate: null, currentDate: "2022-01-01" },
  ])(
    "should return null if birthDate or currentDate is null",
    ({ birthDate, currentDate }) => {
      const result = getAge(birthDate, currentDate);
      expect(result).toBeNull();
    },
  );

  test("should decrease age by 1 if birth month and day is greater than current month and day", () => {
    const birthDate = "2000-12-31";
    const currentDate = "2022-01-01";
    const expectedAge = 21;
    const result = getAge(birthDate, currentDate);
    expect(result).toEqual(expectedAge);
  });

  test("should not drift across timezones for date-only strings", () => {
    expect(getAge("1900-01-01", "1917-01-01")).toBe(17);
  });
});
