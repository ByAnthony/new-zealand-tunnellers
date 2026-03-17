import { getFrenchCountryWithPrep } from "@/utils/helpers/country";

describe("getFrenchCountryWithPrep", () => {
  test("uses en for feminine countries", () => {
    expect(getFrenchCountryWithPrep("France")).toBe("en France");
    expect(getFrenchCountryWithPrep("Nouvelle-Zélande")).toBe(
      "en Nouvelle-Zélande",
    );
    expect(getFrenchCountryWithPrep("Angleterre")).toBe("en Angleterre");
  });

  test("uses au for masculine countries", () => {
    expect(getFrenchCountryWithPrep("Canada")).toBe("au Canada");
    expect(getFrenchCountryWithPrep("Pays de Galles")).toBe(
      "au Pays de Galles",
    );
    expect(getFrenchCountryWithPrep("Royaume-Uni")).toBe("au Royaume-Uni");
    expect(getFrenchCountryWithPrep("Danemark")).toBe("au Danemark");
  });

  test("uses aux for plural countries", () => {
    expect(getFrenchCountryWithPrep("Açores")).toBe("aux Açores");
    expect(getFrenchCountryWithPrep("États-Unis d'Amérique")).toBe(
      "aux États-Unis d'Amérique",
    );
  });

  test("uses à l' for Île de Man", () => {
    expect(getFrenchCountryWithPrep("Île de Man")).toBe("à l'Île de Man");
  });

  test("falls back to en for unknown countries", () => {
    expect(getFrenchCountryWithPrep("Unknown")).toBe("en Unknown");
  });
});
