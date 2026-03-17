import { ArmyExperience } from "@/types/tunneller";
import { getArmyExperience } from "@/utils/helpers/preWarYears";

const mockExperience = (duration: string | null): ArmyExperience => ({
  unit: "101st Airborne",
  country: "USA",
  country_key: null,
  conflict: "WWII",
  duration,
});

describe("getArmyExperience function", () => {
  test("converts duration from months to years correctly for multiple experiences", () => {
    const experiences: ArmyExperience[] = [
      {
        unit: "101st Airborne",
        country: "USA",
        country_key: null,
        conflict: "WWII",
        duration: "12",
      },
      {
        unit: "5th Infantry",
        country: "USA",
        country_key: null,
        conflict: "Korean War",
        duration: "6",
      },
      {
        unit: "1st Infantry",
        country: "USA",
        country_key: null,
        conflict: "Vietnam War",
        duration: "24",
      },
    ];
    const result = getArmyExperience(experiences);
    expect(result[0].duration).toBe("1 year");
    expect(result[1].duration).toBe("6 months");
    expect(result[2].duration).toBe("2 years");
  });

  test("returns an empty array when experiences array is empty", () => {
    expect(getArmyExperience([])).toEqual([]);
  });

  test("handles null duration by returning null for the duration", () => {
    const result = getArmyExperience([mockExperience(null)]);
    expect(result[0].duration).toBeNull();
  });

  test('correctly converts single month duration to "1 month"', () => {
    const result = getArmyExperience([mockExperience("1")]);
    expect(result[0].duration).toBe("1 month");
  });

  test("propagates country_key in output", () => {
    const exp: ArmyExperience = {
      unit: "A",
      country: "France",
      country_key: "France",
      conflict: null,
      duration: null,
    };
    const result = getArmyExperience([exp]);
    expect(result[0].country_key).toBe("France");
  });

  describe("French locale", () => {
    test("converts 1 month to mois", () => {
      const result = getArmyExperience([mockExperience("1")], "fr");
      expect(result[0].duration).toBe("1 mois");
    });

    test("converts multiple months to mois", () => {
      const result = getArmyExperience([mockExperience("6")], "fr");
      expect(result[0].duration).toBe("6 mois");
    });

    test("converts 12 months to 1 an", () => {
      const result = getArmyExperience([mockExperience("12")], "fr");
      expect(result[0].duration).toBe("1 an");
    });

    test("converts 24 months to 2 ans", () => {
      const result = getArmyExperience([mockExperience("24")], "fr");
      expect(result[0].duration).toBe("2 ans");
    });
  });
});
