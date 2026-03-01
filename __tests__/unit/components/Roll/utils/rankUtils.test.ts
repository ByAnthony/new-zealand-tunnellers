import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import {
  getSortedRanks,
  getUniqueRanks,
} from "@/components/Roll/utils/rankUtils";

describe("getUniqueRanks", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueRanks(Object.entries(mockTunnellers));
    expect(result).toEqual(["Sapper", "Driver"]);
  });

  test("handles empty list", () => {
    const result = getUniqueRanks([]);
    expect(result).toEqual([]);
  });
});

describe("getSortedRanks", () => {
  test("returns sorted ranks", () => {
    const result = getSortedRanks(["Sapper", "Driver"]);
    expect(result).toEqual({
      "Other Ranks": ["Sapper", "Driver"],
    });
  });

  test("handles empty list", () => {
    const result = getSortedRanks([]);
    expect(result).toEqual({});
  });

  test("sorts categories in the correct order when ranks span multiple categories", () => {
    const result = getSortedRanks(["Sapper", "Major"]);

    expect(result).toEqual({
      Officers: ["Major"],
      "Other Ranks": ["Sapper"],
    });
  });
});
