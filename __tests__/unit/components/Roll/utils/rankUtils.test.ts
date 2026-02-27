import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import {
  getSortedRanks,
  getUniqueRanks,
} from "@/components/Roll/utils/rankUtils";

describe("getUniqueDetachments", () => {
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
});
