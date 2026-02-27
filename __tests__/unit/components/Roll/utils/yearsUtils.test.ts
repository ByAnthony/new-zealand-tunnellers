import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import {
  getUniqueBirthYears,
  getUniqueDeathYears,
} from "@/components/Roll/utils/yearsUtils";

describe("getUniqueBirthYears", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueBirthYears(Object.entries(mockTunnellers));
    expect(result).toEqual(["1886", "1897"]);
  });

  test("handles empty list", () => {
    const result = getUniqueBirthYears([]);
    expect(result).toEqual([]);
  });
});

describe("getUniqueDeathYears", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueDeathYears(Object.entries(mockTunnellers));
    expect(result).toEqual(["1935", "1952"]);
  });

  test("handles empty list", () => {
    const result = getUniqueDeathYears([]);
    expect(result).toEqual([]);
  });
});
