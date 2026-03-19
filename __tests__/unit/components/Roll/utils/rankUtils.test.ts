import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import {
  getSortedRanks,
  getUniqueRanks,
  rankCategoryTranslationKey,
} from "@/components/Roll/utils/rankUtils";

describe("getUniqueRanks", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueRanks(Object.entries(mockTunnellers));
    expect(result).toEqual([
      { id: 1, label: "Sapper" },
      { id: 2, label: "Driver" },
    ]);
  });

  test("handles empty list", () => {
    const result = getUniqueRanks([]);
    expect(result).toEqual([]);
  });
});

describe("getSortedRanks", () => {
  test("returns sorted ranks", () => {
    const result = getSortedRanks([
      { id: 1, label: "Sapper" },
      { id: 2, label: "Driver" },
    ]);
    expect(result).toEqual({
      "Other Ranks": [
        { id: 1, label: "Sapper" },
        { id: 2, label: "Driver" },
      ],
    });
  });

  test("handles empty list", () => {
    const result = getSortedRanks([]);
    expect(result).toEqual({});
  });

  test("sorts categories in the correct order when ranks span multiple categories", () => {
    const result = getSortedRanks([
      { id: 1, label: "Sapper" },
      { id: 3, label: "Major" },
    ]);
    expect(result).toEqual({
      Officers: [{ id: 3, label: "Major" }],
      "Other Ranks": [{ id: 1, label: "Sapper" }],
    });
  });

  test("returns sorted French ranks with fr locale", () => {
    const result = getSortedRanks(
      [
        { id: 1, label: "Sapeur" },
        { id: 2, label: "Conducteur" },
      ],
      "fr",
    );
    expect(result).toEqual({
      "Other Ranks": [
        { id: 1, label: "Sapeur" },
        { id: 2, label: "Conducteur" },
      ],
    });
  });

  test("sorts French ranks across categories with fr locale", () => {
    const result = getSortedRanks(
      [
        { id: 1, label: "Sapeur" },
        { id: 3, label: "Major" },
      ],
      "fr",
    );
    expect(result).toEqual({
      Officers: [{ id: 3, label: "Major" }],
      "Other Ranks": [{ id: 1, label: "Sapeur" }],
    });
  });

  test("drops unknown ranks not in any category", () => {
    const result = getSortedRanks([{ id: 99, label: "Unknown Rank" }]);
    expect(result).toEqual({});
  });
});

describe("rankCategoryTranslationKey", () => {
  test("maps Officers to rankOfficers", () => {
    expect(rankCategoryTranslationKey["Officers"]).toBe("rankOfficers");
  });

  test("maps Non-Commissioned Officers to rankNco", () => {
    expect(rankCategoryTranslationKey["Non-Commissioned Officers"]).toBe(
      "rankNco",
    );
  });

  test("maps Other Ranks to rankOtherRanks", () => {
    expect(rankCategoryTranslationKey["Other Ranks"]).toBe("rankOtherRanks");
  });
});
