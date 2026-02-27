import { mockTunnellers } from "__tests__/unit/utils/mocks/mockTunnellers";

import { getUniqueDetachments } from "@/components/Roll/utils/detachmentUtils";

describe("getUniqueDetachments", () => {
  test("returns unique detachments sorted correctly", () => {
    const result = getUniqueDetachments(Object.entries(mockTunnellers));
    expect(result).toEqual([
      "Main Body",
      "2nd Reinforcements",
      "5th Reinforcements",
    ]);
  });

  test("handles empty list", () => {
    const result = getUniqueDetachments([]);
    expect(result).toEqual([]);
  });
});
